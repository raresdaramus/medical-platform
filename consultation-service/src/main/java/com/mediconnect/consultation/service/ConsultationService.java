package com.mediconnect.consultation.service;

import com.mediconnect.consultation.client.UserClient;
import com.mediconnect.consultation.dto.*;
import com.mediconnect.consultation.entity.*;
import com.mediconnect.consultation.exception.ResourceNotFoundException;
import com.mediconnect.consultation.exception.UnauthorizedException;
import com.mediconnect.consultation.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final ConsultationSymptomRepository symptomRepository;
    private final PatientIntakeFormRepository intakeFormRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final ReferralRepository referralRepository;
    private final MedicalRecordEntryRepository medicalRecordEntryRepository;
    private final SchedulingService schedulingService;
    private final UserClient userClient;

    public ConsultationService(ConsultationRepository consultationRepository,
                               ConsultationSymptomRepository symptomRepository,
                               PatientIntakeFormRepository intakeFormRepository,
                               DiagnosisRepository diagnosisRepository,
                               PrescriptionRepository prescriptionRepository,
                               PrescriptionItemRepository prescriptionItemRepository,
                               ReferralRepository referralRepository,
                               MedicalRecordEntryRepository medicalRecordEntryRepository,
                               SchedulingService schedulingService,
                               UserClient userClient) {
        this.consultationRepository = consultationRepository;
        this.symptomRepository = symptomRepository;
        this.intakeFormRepository = intakeFormRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.referralRepository = referralRepository;
        this.medicalRecordEntryRepository = medicalRecordEntryRepository;
        this.schedulingService = schedulingService;
        this.userClient = userClient;
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getPendingConsultations(UUID doctorId) {
        return consultationRepository.findByDoctorIdAndStatus(doctorId, "PENDING")
            .stream().map(c -> enrichedResponse(c, true, false)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getPatientConsultations(UUID patientId) {
        return consultationRepository.findByPatientId(patientId)
            .stream().map(c -> enrichedResponse(c, false, true)).collect(Collectors.toList());
    }

    private ConsultationResponse enrichedResponse(Consultation c, boolean includePatientName, boolean includeDoctorName) {
        String patientName = null;
        String doctorName = null;
        if (includePatientName) {
            try {
                PatientInfoDto p = userClient.getPatientInfo(c.getPatientId());
                patientName = p.firstName() + " " + p.lastName();
            } catch (Exception ignored) {}
        }
        if (includeDoctorName) {
            try {
                PatientInfoDto d = userClient.getDoctorInfo(c.getDoctorId());
                doctorName = d.firstName() + " " + d.lastName();
            } catch (Exception ignored) {}
        }
        return schedulingService.toConsultationResponse(c, patientName, doctorName);
    }

    public ConsultationResponse confirm(UUID consultationId, UUID doctorId) {
        Consultation c = getConsultationById(consultationId);
        if (!c.getDoctorId().equals(doctorId)) throw new UnauthorizedException("Not authorized");
        c.setStatus("CONFIRMED");
        return schedulingService.toConsultationResponse(consultationRepository.save(c));
    }

    public ConsultationResponse cancel(UUID consultationId, UUID requesterId, String role) {
        Consultation c = getConsultationById(consultationId);
        if (!"DOCTOR".equals(role) && !"PATIENT".equals(role)) throw new UnauthorizedException("Invalid role");
        if ("DOCTOR".equals(role) && !c.getDoctorId().equals(requesterId)) throw new UnauthorizedException("Not authorized");
        c.setStatus("CANCELLED");
        return schedulingService.toConsultationResponse(consultationRepository.save(c));
    }

    public void submitIntake(UUID consultationId, UUID patientId, IntakeFormRequest req) {
        Consultation c = getConsultationById(consultationId);
        if (!c.getPatientId().equals(patientId)) throw new UnauthorizedException("Not authorized to submit intake for this consultation");

        PatientIntakeForm form = new PatientIntakeForm();
        form.setConsultationId(consultationId);
        form.setChiefComplaint(req.chiefComplaint());
        form.setSymptomDuration(req.symptomDuration());
        form.setCurrentMedications(req.currentMedications());
        form.setAllergies(req.allergies());
        form.setAdditionalNotes(req.additionalNotes());
        form.setSubmittedAt(LocalDateTime.now());
        intakeFormRepository.save(form);

        if (req.symptoms() != null) {
            for (SymptomEntry entry : req.symptoms()) {
                ConsultationSymptom cs = new ConsultationSymptom();
                cs.setConsultationId(consultationId);
                cs.setSymptomId(entry.symptomId());
                cs.setCustomSymptomText(entry.customText());
                cs.setSeverity(entry.severity());
                cs.setOnsetDate(entry.onsetDate());
                cs.setReportedBy("PATIENT");
                symptomRepository.save(cs);
            }
        }
    }

    @Transactional(readOnly = true)
    public FullConsultationResponse getFullConsultation(UUID consultationId, UUID requesterId, String role) {
        Consultation c = getConsultationById(consultationId);

        List<ConsultationSymptomDto> symptoms = symptomRepository.findByConsultationId(consultationId).stream()
            .map(s -> new ConsultationSymptomDto(s.getId(), s.getSymptomId(), s.getCustomSymptomText(), s.getSeverity(), s.getOnsetDate()))
            .collect(Collectors.toList());

        PatientIntakeFormDto intakeFormDto = intakeFormRepository.findByConsultationId(consultationId)
            .map(f -> new PatientIntakeFormDto(f.getId(), f.getChiefComplaint(), f.getSymptomDuration(),
                f.getCurrentMedications(), f.getAllergies(), f.getAdditionalNotes(), f.getSubmittedAt(), symptoms))
            .orElse(null);

        List<DiagnosisResponse> diagnoses = diagnosisRepository.findByConsultationId(consultationId).stream()
            .map(d -> new DiagnosisResponse(d.getId(), d.getConsultationId(), d.getDiseaseId(), d.getCustomDiagnosis(), d.getConfidence(), d.getDiagnosisDate(), d.getNotes()))
            .collect(Collectors.toList());

        List<PrescriptionResponse> prescriptions = prescriptionRepository.findByConsultationId(consultationId).stream()
            .map(p -> new PrescriptionResponse(p.getId(), p.getConsultationId(), p.getDiagnosisId(), p.getCustomInstructions(), p.getValidFrom(), p.getValidUntil(), p.getIssuedAt()))
            .collect(Collectors.toList());

        List<ReferralResponse> referrals = referralRepository.findByConsultationId(consultationId).stream()
            .map(r -> new ReferralResponse(r.getId(), r.getConsultationId(), r.getReferralType(), r.getDestination(), r.getUrgency(), r.getIssuedAt()))
            .collect(Collectors.toList());

        return new FullConsultationResponse(c.getId(), c.getDoctorId(), c.getPatientId(), c.getStatus(),
            c.getConsultationType(), c.getScheduledAt(), c.getStartedAt(), c.getCompletedAt(),
            intakeFormDto, diagnoses, prescriptions, referrals);
    }

    public ConsultationResponse startConsultation(UUID consultationId, UUID doctorId) {
        Consultation c = getConsultationById(consultationId);
        if (!c.getDoctorId().equals(doctorId)) throw new UnauthorizedException("Not authorized");
        c.setStatus("IN_PROGRESS");
        c.setStartedAt(LocalDateTime.now());
        return schedulingService.toConsultationResponse(consultationRepository.save(c));
    }

    public DiagnosisResponse addDiagnosis(UUID consultationId, UUID doctorId, DiagnosisRequest req) {
        Consultation c = getConsultationById(consultationId);
        if (!c.getDoctorId().equals(doctorId)) throw new UnauthorizedException("Not authorized");
        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setConsultationId(consultationId);
        diagnosis.setDiseaseId(req.diseaseId());
        diagnosis.setCustomDiagnosis(req.customDiagnosis());
        diagnosis.setIcd10Code(req.icd10Code());
        diagnosis.setConfidence(req.confidence());
        diagnosis.setDiagnosisDate(req.diagnosisDate());
        diagnosis.setNotes(req.notes());
        diagnosis = diagnosisRepository.save(diagnosis);
        return new DiagnosisResponse(diagnosis.getId(), diagnosis.getConsultationId(), diagnosis.getDiseaseId(),
            diagnosis.getCustomDiagnosis(), diagnosis.getConfidence(), diagnosis.getDiagnosisDate(), diagnosis.getNotes());
    }

    public PrescriptionResponse addPrescription(UUID consultationId, UUID doctorId, PrescriptionRequest req) {
        Consultation c = getConsultationById(consultationId);
        if (!c.getDoctorId().equals(doctorId)) throw new UnauthorizedException("Not authorized");
        Prescription prescription = new Prescription();
        prescription.setConsultationId(consultationId);
        prescription.setDiagnosisId(req.diagnosisId());
        prescription.setTreatmentId(req.treatmentId());
        prescription.setCustomInstructions(req.customInstructions());
        prescription.setValidFrom(req.validFrom());
        prescription.setValidUntil(req.validUntil());
        prescription.setIssuedAt(LocalDateTime.now());
        prescription = prescriptionRepository.save(prescription);
        if (req.items() != null) {
            final UUID prescriptionId = prescription.getId();
            for (PrescriptionItemRequest item : req.items()) {
                PrescriptionItem pi = new PrescriptionItem();
                pi.setPrescriptionId(prescriptionId);
                pi.setMedicationId(item.medicationId());
                pi.setDosage(item.dosage());
                pi.setFrequency(item.frequency());
                pi.setDurationDays(item.durationDays());
                pi.setQuantity(item.quantity());
                prescriptionItemRepository.save(pi);
            }
        }
        return new PrescriptionResponse(prescription.getId(), prescription.getConsultationId(),
            prescription.getDiagnosisId(), prescription.getCustomInstructions(),
            prescription.getValidFrom(), prescription.getValidUntil(), prescription.getIssuedAt());
    }

    public ReferralResponse addReferral(UUID consultationId, UUID doctorId, ReferralRequest req) {
        Consultation c = getConsultationById(consultationId);
        if (!c.getDoctorId().equals(doctorId)) throw new UnauthorizedException("Not authorized");
        Referral referral = new Referral();
        referral.setConsultationId(consultationId);
        referral.setReferralType(req.referralType());
        referral.setDestination(req.destination());
        referral.setReason(req.reason());
        referral.setUrgency(req.urgency() != null ? req.urgency() : "ROUTINE");
        referral.setIssuedAt(LocalDateTime.now());
        referral = referralRepository.save(referral);
        return new ReferralResponse(referral.getId(), referral.getConsultationId(), referral.getReferralType(),
            referral.getDestination(), referral.getUrgency(), referral.getIssuedAt());
    }

    public ConsultationResponse completeConsultation(UUID consultationId, UUID doctorId, CompleteConsultationRequest req) {
        Consultation c = getConsultationById(consultationId);
        if (!c.getDoctorId().equals(doctorId)) throw new UnauthorizedException("Not authorized");
        c.setStatus("COMPLETED");
        c.setCompletedAt(LocalDateTime.now());
        c.setNotesDoctor(req.noteDoctor());
        return schedulingService.toConsultationResponse(consultationRepository.save(c));
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getMedicalRecord(UUID patientId, UUID requesterId, String role) {
        return medicalRecordEntryRepository.findByPatientIdOrderByAddedAtDesc(patientId).stream()
            .map(e -> new MedicalRecordResponse(e.getId(), e.getPatientId(), e.getConsultationId(), e.getEntryType(), e.getAddedAt()))
            .collect(Collectors.toList());
    }

    private Consultation getConsultationById(UUID id) {
        return consultationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Consultation not found: " + id));
    }
}
