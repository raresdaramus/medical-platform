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
    private final SymptomRepository ontologySymptomRepository;
    private final PatientIntakeFormRepository intakeFormRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final DiseaseRepository diseaseRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final ReferralRepository referralRepository;
    private final MedicalRecordEntryRepository medicalRecordEntryRepository;
    private final ConsultationDocumentRepository documentRepository;
    private final SchedulingService schedulingService;
    private final UserClient userClient;
    private final GroqService groqService;
    private final PrescriptionPdfService prescriptionPdfService;
    private final ReferralPdfService referralPdfService;
    private final DocumentService documentService;

    public ConsultationService(ConsultationRepository consultationRepository,
                               ConsultationSymptomRepository symptomRepository,
                               SymptomRepository ontologySymptomRepository,
                               PatientIntakeFormRepository intakeFormRepository,
                               DiagnosisRepository diagnosisRepository,
                               DiseaseRepository diseaseRepository,
                               PrescriptionRepository prescriptionRepository,
                               PrescriptionItemRepository prescriptionItemRepository,
                               ReferralRepository referralRepository,
                               MedicalRecordEntryRepository medicalRecordEntryRepository,
                               ConsultationDocumentRepository documentRepository,
                               SchedulingService schedulingService,
                               UserClient userClient,
                               GroqService groqService,
                               PrescriptionPdfService prescriptionPdfService,
                               ReferralPdfService referralPdfService,
                               DocumentService documentService) {
        this.consultationRepository = consultationRepository;
        this.symptomRepository = symptomRepository;
        this.ontologySymptomRepository = ontologySymptomRepository;
        this.intakeFormRepository = intakeFormRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.diseaseRepository = diseaseRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.referralRepository = referralRepository;
        this.medicalRecordEntryRepository = medicalRecordEntryRepository;
        this.documentRepository = documentRepository;
        this.schedulingService = schedulingService;
        this.userClient = userClient;
        this.groqService = groqService;
        this.prescriptionPdfService = prescriptionPdfService;
        this.referralPdfService = referralPdfService;
        this.documentService = documentService;
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getPendingConsultations(UUID doctorId) {
        return consultationRepository.findByDoctorIdAndStatus(doctorId, "PENDING")
            .stream().map(c -> enrichedResponse(c, true, false)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getAllDoctorConsultations(UUID doctorId) {
        return consultationRepository.findByDoctorId(doctorId)
            .stream().map(c -> enrichedResponse(c, true, false)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getPatientConsultations(UUID patientId) {
        return consultationRepository.findByPatientId(patientId)
            .stream().map(c -> enrichedResponse(c, false, true)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getDoctorPatientConsultations(UUID doctorId, UUID patientId) {
        // Consultations store patientId as the patient's accountId, but callers pass
        // the patient profileId (from the doctor's patient list). Resolve it.
        UUID patientAccountId = patientId;
        try {
            patientAccountId = userClient.getPatientInfo(patientId).accountId();
        } catch (Exception ignored) {}
        return consultationRepository.findByDoctorIdAndPatientId(doctorId, patientAccountId)
            .stream().map(c -> enrichedResponse(c, false, false)).collect(Collectors.toList());
    }

    private ConsultationResponse enrichedResponse(Consultation c, boolean includePatientName, boolean includeDoctorName) {
        String patientName = null;
        String doctorName = null;
        if (includePatientName) {
            try {
                PatientInfoDto p = userClient.getPatientByAccountId(c.getPatientId());
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

    public ConsultationResponse confirm(UUID consultationId, UUID accountId) {
        Consultation c = getConsultationById(consultationId);
        UUID doctorProfileId = resolveDoctorProfileId(accountId);
        if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        c.setStatus("CONFIRMED");
        return schedulingService.toConsultationResponse(consultationRepository.save(c));
    }

    public ConsultationResponse cancel(UUID consultationId, UUID requesterId, String role) {
        Consultation c = getConsultationById(consultationId);
        if (!"DOCTOR".equals(role) && !"PATIENT".equals(role)) throw new UnauthorizedException("Invalid role");
        if ("DOCTOR".equals(role)) {
            UUID doctorProfileId = resolveDoctorProfileId(requesterId);
            if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        }
        c.setStatus("CANCELLED");
        return schedulingService.toConsultationResponse(consultationRepository.save(c));
    }

    public void submitIntake(UUID consultationId, UUID requesterId, String role, IntakeFormRequest req) {
        Consultation c = getConsultationById(consultationId);
        if ("DOCTOR".equals(role)) {
            UUID doctorProfileId = resolveDoctorProfileId(requesterId);
            if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized to submit intake for this consultation");
        } else {
            if (!c.getPatientId().equals(requesterId)) throw new UnauthorizedException("Not authorized to submit intake for this consultation");
        }
        final String reportedBy = "DOCTOR".equals(role) ? "DOCTOR" : "PATIENT";

        PatientIntakeForm form = new PatientIntakeForm();
        form.setConsultationId(consultationId);
        form.setChiefComplaint(req.chiefComplaint());
        form.setSymptomDuration(req.symptomDuration());
        form.setCurrentMedications(req.currentMedications());
        form.setAllergies(req.allergies());
        form.setAdditionalNotes(req.additionalNotes());
        form.setTemperature(req.temperature());
        form.setBloodPressure(req.bloodPressure());
        form.setBloodGlucose(req.bloodGlucose());
        form.setBodyZone(req.bodyZone());
        form.setBodyZoneSymptoms(req.bodyZoneSymptoms());
        form.setSymptomOnset(req.symptomOnset());
        form.setPainIntensity(req.painIntensity());
        form.setPainType(req.painType());
        form.setHadSymptomsBefore(req.hadSymptomsBefore());
        form.setGeneralSymptoms(req.generalSymptoms());
        form.setMedicationsTakenText(req.medicationsTakenText());
        form.setKnownConditions(req.knownConditions());
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
                cs.setReportedBy(reportedBy);
                symptomRepository.save(cs);
            }
        }

        String defaultSeverity = defaultSeverity(req.painIntensity());

        if (req.bodyZoneSymptoms() != null && !req.bodyZoneSymptoms().isBlank()) {
            for (String name : req.bodyZoneSymptoms().split(",")) {
                ontologySymptomRepository.findFirstByNameIgnoreCase(name.trim()).ifPresent(sym -> {
                    if (!symptomRepository.existsByConsultationIdAndSymptomId(consultationId, sym.getId())) {
                        ConsultationSymptom cs = new ConsultationSymptom();
                        cs.setConsultationId(consultationId);
                        cs.setSymptomId(sym.getId());
                        cs.setSeverity(defaultSeverity);
                        cs.setReportedBy(reportedBy);
                        symptomRepository.save(cs);
                    }
                });
            }
        }

        if (req.generalSymptoms() != null && !req.generalSymptoms().isBlank()) {
            for (String name : req.generalSymptoms().split(",")) {
                ontologySymptomRepository.findFirstByNameIgnoreCase(name.trim()).ifPresent(sym -> {
                    if (!symptomRepository.existsByConsultationIdAndSymptomId(consultationId, sym.getId())) {
                        ConsultationSymptom cs = new ConsultationSymptom();
                        cs.setConsultationId(consultationId);
                        cs.setSymptomId(sym.getId());
                        cs.setSeverity(defaultSeverity);
                        cs.setReportedBy(reportedBy);
                        symptomRepository.save(cs);
                    }
                });
            }
        }
    }

    public ConsultationResponse linkNextConsultation(UUID consultationId, UUID nextConsultationId, UUID accountId) {
        Consultation c = getConsultationById(consultationId);
        UUID doctorProfileId = resolveDoctorProfileId(accountId);
        if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        getConsultationById(nextConsultationId); // verify next exists
        c.setNextConsultationId(nextConsultationId);
        return schedulingService.toConsultationResponse(consultationRepository.save(c));
    }

    public ConsultationResponse unlinkNextConsultation(UUID consultationId, UUID accountId) {
        Consultation c = getConsultationById(consultationId);
        UUID doctorProfileId = resolveDoctorProfileId(accountId);
        if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        c.setNextConsultationId(null);
        return schedulingService.toConsultationResponse(consultationRepository.save(c));
    }

    private String defaultSeverity(String painIntensity) {
        if (painIntensity == null) return "MILD";
        return switch (painIntensity.trim()) {
            case "Severă" -> "SEVERE";
            case "Moderată" -> "MODERATE";
            default -> "MILD";
        };
    }

    @Transactional(readOnly = true)
    public FullConsultationResponse getFullConsultation(UUID consultationId, UUID requesterId, String role) {
        Consultation c = getConsultationById(consultationId);

        List<ConsultationSymptomDto> symptoms = symptomRepository.findByConsultationId(consultationId).stream()
            .map(s -> {
                String symptomName = s.getSymptomId() != null
                    ? ontologySymptomRepository.findById(s.getSymptomId()).map(sym -> sym.getName()).orElse(null)
                    : null;
                return new ConsultationSymptomDto(s.getId(), s.getSymptomId(), symptomName, s.getCustomSymptomText(), s.getSeverity(), s.getOnsetDate());
            })
            .collect(Collectors.toList());

        PatientIntakeFormDto intakeFormDto = intakeFormRepository.findByConsultationId(consultationId)
            .map(f -> new PatientIntakeFormDto(f.getId(), f.getChiefComplaint(), f.getSymptomDuration(),
                f.getCurrentMedications(), f.getAllergies(), f.getAdditionalNotes(), f.getSubmittedAt(), symptoms,
                f.getTemperature(), f.getBloodPressure(), f.getBloodGlucose(),
                f.getBodyZone(), f.getBodyZoneSymptoms(),
                f.getSymptomOnset(), f.getPainIntensity(), f.getPainType(), f.getHadSymptomsBefore(),
                f.getGeneralSymptoms(), f.getMedicationsTakenText(), f.getKnownConditions()))
            .orElse(null);

        List<DiagnosisResponse> diagnoses = diagnosisRepository.findByConsultationId(consultationId).stream()
            .map(d -> {
                Disease disease = d.getDiseaseId() != null
                    ? diseaseRepository.findById(d.getDiseaseId()).orElse(null)
                    : null;
                String diseaseName = disease != null ? disease.getName() : null;
                String diseaseNameRo = disease != null ? disease.getNameRo() : null;
                return new DiagnosisResponse(d.getId(), d.getConsultationId(), d.getDiseaseId(),
                    diseaseName, diseaseNameRo, d.getCustomDiagnosis(), d.getIcd10Code(),
                    parseConfidence(d.getConfidence()), d.getDiagnosisDate(), d.getNotes());
            })
            .collect(Collectors.toList());

        List<PrescriptionResponse> prescriptions = prescriptionRepository.findByConsultationId(consultationId).stream()
            .map(p -> {
                List<PrescriptionItemResponse> items = prescriptionItemRepository.findByPrescriptionId(p.getId()).stream()
                    .map(i -> new PrescriptionItemResponse(i.getId(), i.getMedicationId(), i.getMedicationName(), i.getDosage(), i.getFrequency(), i.getDurationDays(), i.getQuantity()))
                    .collect(Collectors.toList());
                return new PrescriptionResponse(p.getId(), p.getConsultationId(), p.getDiagnosisId(), p.getCustomInstructions(), p.getValidFrom(), p.getValidUntil(), p.getIssuedAt(), items);
            })
            .collect(Collectors.toList());

        List<ReferralResponse> referrals = referralRepository.findByConsultationId(consultationId).stream()
            .map(this::toReferralResponse)
            .collect(Collectors.toList());

        UUID previousConsultationId = consultationRepository.findByNextConsultationId(consultationId)
            .map(Consultation::getId).orElse(null);

        List<DocumentResponse> documents = documentRepository.findByConsultationIdOrderByUploadedAtAsc(consultationId)
            .stream().map(d -> new DocumentResponse(d.getId(), d.getConsultationId(), d.getUploadedBy(),
                d.getUploaderRole(), d.getFileName(), d.getFileSize(), d.getUploadedAt()))
            .collect(Collectors.toList());

        return new FullConsultationResponse(c.getId(), c.getDoctorId(), c.getPatientId(), c.getStatus(),
            c.getConsultationType(), c.getScheduledAt(), c.getStartedAt(), c.getCompletedAt(),
            c.getSlotDurationMinutes(), intakeFormDto, diagnoses, prescriptions, referrals, c.getNotesDoctor(),
            c.getNextConsultationId(), previousConsultationId, documents);
    }

    public ConsultationResponse startConsultation(UUID consultationId, UUID accountId) {
        Consultation c = getConsultationById(consultationId);
        UUID doctorProfileId = resolveDoctorProfileId(accountId);
        if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        c.setStatus("IN_PROGRESS");
        c.setStartedAt(LocalDateTime.now());
        return schedulingService.toConsultationResponse(consultationRepository.save(c));
    }

    public DiagnosisResponse addDiagnosis(UUID consultationId, UUID accountId, DiagnosisRequest req) {
        Consultation c = getConsultationById(consultationId);
        UUID doctorProfileId = resolveDoctorProfileId(accountId);
        if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setConsultationId(consultationId);
        diagnosis.setDiseaseId(req.diseaseId());
        diagnosis.setCustomDiagnosis(req.customDiagnosis());
        diagnosis.setIcd10Code(req.icd10Code());
        diagnosis.setConfidence(String.valueOf(req.confidence()));
        diagnosis.setDiagnosisDate(req.diagnosisDate());
        diagnosis.setNotes(req.notes());
        diagnosis = diagnosisRepository.save(diagnosis);
        Disease diseaseEntity = diagnosis.getDiseaseId() != null
            ? diseaseRepository.findById(diagnosis.getDiseaseId()).orElse(null)
            : null;
        String diseaseName = diseaseEntity != null ? diseaseEntity.getName() : null;
        String diseaseNameRo = diseaseEntity != null ? diseaseEntity.getNameRo() : null;
        return new DiagnosisResponse(diagnosis.getId(), diagnosis.getConsultationId(), diagnosis.getDiseaseId(),
            diseaseName, diseaseNameRo, diagnosis.getCustomDiagnosis(), diagnosis.getIcd10Code(),
            parseConfidence(diagnosis.getConfidence()), diagnosis.getDiagnosisDate(), diagnosis.getNotes());
    }

    public PrescriptionResponse addPrescription(UUID consultationId, UUID accountId, PrescriptionRequest req) {
        Consultation c = getConsultationById(consultationId);
        UUID doctorProfileId = resolveDoctorProfileId(accountId);
        if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        Prescription prescription = new Prescription();
        prescription.setConsultationId(consultationId);
        prescription.setDiagnosisId(req.diagnosisId());
        prescription.setTreatmentId(req.treatmentId());
        prescription.setCustomInstructions(req.customInstructions());
        prescription.setValidFrom(req.validFrom());
        prescription.setValidUntil(req.validUntil());
        prescription.setIssuedAt(LocalDateTime.now());
        prescription = prescriptionRepository.save(prescription);
        List<PrescriptionItemResponse> savedItems = new java.util.ArrayList<>();
        if (req.items() != null) {
            final UUID prescriptionId = prescription.getId();
            for (PrescriptionItemRequest item : req.items()) {
                PrescriptionItem pi = new PrescriptionItem();
                pi.setPrescriptionId(prescriptionId);
                pi.setMedicationId(item.medicationId());
                pi.setMedicationName(item.medicationName());
                pi.setDosage(item.dosage());
                pi.setFrequency(item.frequency());
                pi.setDurationDays(item.durationDays());
                pi.setQuantity(item.quantity());
                pi = prescriptionItemRepository.save(pi);
                savedItems.add(new PrescriptionItemResponse(pi.getId(), pi.getMedicationId(), pi.getMedicationName(), pi.getDosage(), pi.getFrequency(), pi.getDurationDays(), pi.getQuantity()));
            }
        }
        // Generate the standard prescription PDF and attach it to the consultation's documents.
        try {
            byte[] pdf = renderPrescriptionPdf(prescription, c);
            String fileName = "Reteta_" + prescription.getIssuedAt().toLocalDate() + ".pdf";
            documentService.storeGenerated(consultationId, accountId, "DOCTOR", fileName, pdf);
        } catch (Exception e) {
            // PDF generation must never block saving the prescription itself.
        }

        return new PrescriptionResponse(prescription.getId(), prescription.getConsultationId(),
            prescription.getDiagnosisId(), prescription.getCustomInstructions(),
            prescription.getValidFrom(), prescription.getValidUntil(), prescription.getIssuedAt(), savedItems);
    }

    public ReferralResponse addReferral(UUID consultationId, UUID accountId, ReferralRequest req) {
        Consultation c = getConsultationById(consultationId);
        UUID doctorProfileId = resolveDoctorProfileId(accountId);
        if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        Referral referral = new Referral();
        referral.setConsultationId(consultationId);
        referral.setReferralType(req.referralType());
        referral.setDestination(req.destination());
        referral.setReason(req.reason());
        referral.setUrgency(req.urgency() != null ? req.urgency() : "ROUTINE");
        referral.setDiagnosisId(req.diagnosisId());
        referral.setAcuteChronic(req.acuteChronic());
        // Validity is derived from the diagnosis type, not editable: acute → 30 days, chronic → 60 days.
        referral.setValidityDays(validityDaysFor(req.acuteChronic()));
        referral.setInvestigations(req.investigations());
        referral.setInsuredCategory(req.insuredCategory());
        referral.setSeriesNumber(generateReferralSeries());
        referral.setIssuedAt(LocalDateTime.now());
        referral = referralRepository.save(referral);

        // Generate the standard referral PDF and attach it to the consultation's documents.
        try {
            byte[] pdf = renderReferralPdf(referral, c);
            String fileName = "BiletTrimitere_" + referral.getIssuedAt().toLocalDate() + ".pdf";
            documentService.storeGenerated(consultationId, accountId, "DOCTOR", fileName, pdf);
        } catch (Exception e) {
            // PDF generation must never block saving the referral itself.
        }

        return toReferralResponse(referral);
    }

    private ReferralResponse toReferralResponse(Referral r) {
        return new ReferralResponse(r.getId(), r.getConsultationId(), r.getReferralType(),
            r.getDestination(), r.getReason(), r.getUrgency(), r.getDiagnosisId(), r.getValidityDays(),
            r.getAcuteChronic(), r.getInvestigations(), r.getInsuredCategory(), r.getSeriesNumber(), r.getIssuedAt());
    }

    /** Referral validity derived from the diagnosis type: acute → 30 days, chronic → 60 days. */
    private Integer validityDaysFor(String acuteChronic) {
        if ("ACUTE".equals(acuteChronic)) return 30;
        if ("CHRONIC".equals(acuteChronic)) return 60;
        return null;
    }

    /** Short human-readable referral series, e.g. "BT-A1B2C3D4". */
    private String generateReferralSeries() {
        return "BT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public ConsultationResponse completeConsultation(UUID consultationId, UUID accountId, CompleteConsultationRequest req) {
        Consultation c = getConsultationById(consultationId);
        UUID doctorProfileId = resolveDoctorProfileId(accountId);
        if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        c.setStatus("COMPLETED");
        c.setCompletedAt(LocalDateTime.now());
        c.setNotesDoctor(req.noteDoctor());

        if (req.followUpScheduledAt() != null) {
            Consultation followUp = new Consultation();
            followUp.setDoctorId(c.getDoctorId());
            followUp.setPatientId(c.getPatientId());
            followUp.setConsultationType("IN_PERSON");
            followUp.setScheduledAt(req.followUpScheduledAt());
            followUp.setSlotDurationMinutes(req.followUpDurationMinutes() != null
                ? req.followUpDurationMinutes() : c.getSlotDurationMinutes());
            followUp.setStatus("CONFIRMED");
            followUp.setCreatedAt(LocalDateTime.now());
            followUp = consultationRepository.save(followUp);
            c.setNextConsultationId(followUp.getId());
        }

        return schedulingService.toConsultationResponse(consultationRepository.save(c));
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getMedicalRecord(UUID patientId, UUID requesterId, String role) {
        // patientId is the patient's accountId. Only the patient themselves, or a
        // doctor who is their family doctor / holds an active permission, may view it.
        if ("PATIENT".equals(role)) {
            if (!patientId.equals(requesterId)) {
                throw new UnauthorizedException("Not authorized to view this medical record");
            }
        } else if ("DOCTOR".equals(role)) {
            if (!userClient.canDoctorAccessPatient(requesterId, patientId)) {
                throw new UnauthorizedException("Not authorized to view this patient's medical record");
            }
        } else {
            throw new UnauthorizedException("Not authorized to view this medical record");
        }

        List<Consultation> consultations = consultationRepository.findByPatientId(patientId);
        List<MedicalRecordResponse> result = new java.util.ArrayList<>();

        for (Consultation c : consultations) {
            String doctorName = null;
            try {
                PatientInfoDto doc = userClient.getDoctorInfo(c.getDoctorId());
                doctorName = doc.firstName() + " " + doc.lastName();
            } catch (Exception ignored) {}
            final String finalDoctorName = doctorName;

            intakeFormRepository.findByConsultationId(c.getId()).ifPresent(f ->
                result.add(new MedicalRecordResponse(f.getId(), patientId, c.getId(), "INTAKE",
                    f.getSubmittedAt(), f.getChiefComplaint(), finalDoctorName, c.getScheduledAt(), c.getStatus()))
            );

            diagnosisRepository.findByConsultationId(c.getId()).forEach(d -> {
                String summary = d.getCustomDiagnosis() != null ? d.getCustomDiagnosis() : d.getIcd10Code();
                LocalDateTime addedAt = d.getDiagnosisDate() != null ? d.getDiagnosisDate().atStartOfDay() : c.getScheduledAt();
                result.add(new MedicalRecordResponse(d.getId(), patientId, c.getId(), "DIAGNOSIS",
                    addedAt, summary, finalDoctorName, c.getScheduledAt(), c.getStatus()));
            });

            prescriptionRepository.findByConsultationId(c.getId()).forEach(p ->
                result.add(new MedicalRecordResponse(p.getId(), patientId, c.getId(), "PRESCRIPTION",
                    p.getIssuedAt(), p.getCustomInstructions(), finalDoctorName, c.getScheduledAt(), c.getStatus()))
            );

            referralRepository.findByConsultationId(c.getId()).forEach(r ->
                result.add(new MedicalRecordResponse(r.getId(), patientId, c.getId(), "REFERRAL",
                    r.getIssuedAt(), r.getReferralType() + " → " + r.getDestination(), finalDoctorName, c.getScheduledAt(), c.getStatus()))
            );
        }

        result.sort((a, b) -> {
            if (b.addedAt() == null) return -1;
            if (a.addedAt() == null) return 1;
            return b.addedAt().compareTo(a.addedAt());
        });
        return result;
    }

    private double parseConfidence(String s) {
        try { return s != null ? Double.parseDouble(s) : 0.0; } catch (Exception e) { return 0.0; }
    }

    private UUID resolveDoctorProfileId(UUID accountId) {
        try {
            PatientInfoDto doctor = userClient.getDoctorByAccountId(accountId);
            return doctor.id();
        } catch (Exception e) {
            throw new UnauthorizedException("Could not resolve doctor profile for account: " + accountId);
        }
    }

    @Transactional(readOnly = true)
    public List<AiSuggestionResponse> aiSuggest(UUID consultationId, String lang) {
        getConsultationById(consultationId);

        StringBuilder context = new StringBuilder();

        intakeFormRepository.findByConsultationId(consultationId).ifPresent(form -> {
            if (form.getChiefComplaint() != null)
                context.append("Chief complaint: ").append(form.getChiefComplaint()).append("\n");
            if (form.getSymptomOnset() != null)
                context.append("Symptom onset: ").append(form.getSymptomOnset()).append("\n");
            if (form.getPainIntensity() != null)
                context.append("Pain intensity: ").append(form.getPainIntensity()).append("\n");
            if (form.getPainType() != null)
                context.append("Pain type: ").append(form.getPainType()).append("\n");
            if (form.getBodyZone() != null)
                context.append("Body zone affected: ").append(form.getBodyZone()).append("\n");
            if (form.getTemperature() != null)
                context.append("Temperature: ").append(form.getTemperature()).append(" °C\n");
            if (form.getBloodPressure() != null)
                context.append("Blood pressure: ").append(form.getBloodPressure()).append("\n");
            if (form.getBloodGlucose() != null)
                context.append("Blood glucose: ").append(form.getBloodGlucose()).append(" mg/dL\n");
            if (form.getGeneralSymptoms() != null)
                context.append("General symptoms: ").append(form.getGeneralSymptoms()).append("\n");
            if (form.getKnownConditions() != null)
                context.append("Known conditions: ").append(form.getKnownConditions()).append("\n");
            if (form.getCurrentMedications() != null)
                context.append("Current medications: ").append(form.getCurrentMedications()).append("\n");
            if (form.getAllergies() != null)
                context.append("Allergies: ").append(form.getAllergies()).append("\n");
            if (form.getAdditionalNotes() != null)
                context.append("Additional notes: ").append(form.getAdditionalNotes()).append("\n");
        });

        List<ConsultationSymptom> symptoms = symptomRepository.findByConsultationId(consultationId);
        if (!symptoms.isEmpty()) {
            context.append("Specific symptoms:\n");
            for (ConsultationSymptom cs : symptoms) {
                if (cs.getSymptomId() != null) {
                    String name = ontologySymptomRepository.findById(cs.getSymptomId())
                            .map(com.mediconnect.consultation.entity.Symptom::getName)
                            .orElse(cs.getSymptomId().toString());
                    context.append("- ").append(name);
                } else if (cs.getCustomSymptomText() != null) {
                    context.append("- ").append(cs.getCustomSymptomText());
                }
                if (cs.getSeverity() != null) context.append(" (severity: ").append(cs.getSeverity()).append(")");
                context.append("\n");
            }
        }

        if (context.isEmpty()) {
            throw new ResourceNotFoundException("No patient data available for AI suggestion on consultation: " + consultationId);
        }

        return groqService.suggestDiagnoses(context.toString(), lang);
    }

    public void deleteDiagnosis(UUID diagnosisId, UUID accountId) {
        Diagnosis diagnosis = diagnosisRepository.findById(diagnosisId)
            .orElseThrow(() -> new ResourceNotFoundException("Diagnosis not found: " + diagnosisId));
        Consultation c = getConsultationById(diagnosis.getConsultationId());
        UUID doctorProfileId = resolveDoctorProfileId(accountId);
        if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        diagnosisRepository.delete(diagnosis);
    }

    public void deletePrescription(UUID prescriptionId, UUID accountId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
            .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + prescriptionId));
        Consultation c = getConsultationById(prescription.getConsultationId());
        UUID doctorProfileId = resolveDoctorProfileId(accountId);
        if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        prescriptionItemRepository.deleteAll(prescriptionItemRepository.findByPrescriptionId(prescriptionId));
        prescriptionRepository.delete(prescription);
    }

    @Transactional(readOnly = true)
    public byte[] generatePrescriptionPdf(UUID prescriptionId, UUID accountId, String role) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
            .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + prescriptionId));
        Consultation c = getConsultationById(prescription.getConsultationId());

        // Authorization: the consultation's doctor or the consultation's patient may download.
        if ("DOCTOR".equals(role)) {
            UUID doctorProfileId = resolveDoctorProfileId(accountId);
            if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        } else if ("PATIENT".equals(role)) {
            if (!c.getPatientId().equals(accountId)) throw new UnauthorizedException("Not authorized");
        } else {
            throw new UnauthorizedException("Not authorized");
        }

        return renderPrescriptionPdf(prescription, c);
    }

    private byte[] renderPrescriptionPdf(Prescription prescription, Consultation c) {
        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(prescription.getId());

        PatientDetailsDto patient = null;
        try { patient = userClient.getPatientDetailsByAccountId(c.getPatientId()); } catch (Exception ignored) {}

        DoctorDetailsDto doctor = null;
        try { doctor = userClient.getDoctorDetails(c.getDoctorId()); } catch (Exception ignored) {}

        String diagnosisText = resolveDiagnosisText(prescription);

        return prescriptionPdfService.generate(prescription, items, patient, doctor, diagnosisText);
    }

    @Transactional(readOnly = true)
    public byte[] generateReferralPdf(UUID referralId, UUID accountId, String role) {
        Referral referral = referralRepository.findById(referralId)
            .orElseThrow(() -> new ResourceNotFoundException("Referral not found: " + referralId));
        Consultation c = getConsultationById(referral.getConsultationId());

        if ("DOCTOR".equals(role)) {
            UUID doctorProfileId = resolveDoctorProfileId(accountId);
            if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        } else if ("PATIENT".equals(role)) {
            if (!c.getPatientId().equals(accountId)) throw new UnauthorizedException("Not authorized");
        } else {
            throw new UnauthorizedException("Not authorized");
        }

        return renderReferralPdf(referral, c);
    }

    private byte[] renderReferralPdf(Referral referral, Consultation c) {
        PatientDetailsDto patient = null;
        try { patient = userClient.getPatientDetailsByAccountId(c.getPatientId()); } catch (Exception ignored) {}

        DoctorDetailsDto doctor = null;
        try { doctor = userClient.getDoctorDetails(c.getDoctorId()); } catch (Exception ignored) {}

        String diagnosisText = resolveDiagnosisTextById(referral.getDiagnosisId());

        return referralPdfService.generate(referral, patient, doctor, diagnosisText);
    }

    private String resolveDiagnosisText(Prescription prescription) {
        return resolveDiagnosisTextById(prescription.getDiagnosisId());
    }

    private String resolveDiagnosisTextById(UUID diagnosisId) {
        if (diagnosisId == null) return null;
        return diagnosisRepository.findById(diagnosisId)
            .map(d -> {
                if (d.getDiseaseId() != null) {
                    Disease disease = diseaseRepository.findById(d.getDiseaseId()).orElse(null);
                    if (disease != null) {
                        String name = disease.getNameRo() != null && !disease.getNameRo().isBlank()
                            ? disease.getNameRo() : disease.getName();
                        if (d.getIcd10Code() != null && !d.getIcd10Code().isBlank()) {
                            return name + " (" + d.getIcd10Code() + ")";
                        }
                        return name;
                    }
                }
                if (d.getCustomDiagnosis() != null && !d.getCustomDiagnosis().isBlank()) return d.getCustomDiagnosis();
                return d.getIcd10Code();
            })
            .orElse(null);
    }

    public void deleteReferral(UUID referralId, UUID accountId) {
        Referral referral = referralRepository.findById(referralId)
            .orElseThrow(() -> new ResourceNotFoundException("Referral not found: " + referralId));
        Consultation c = getConsultationById(referral.getConsultationId());
        UUID doctorProfileId = resolveDoctorProfileId(accountId);
        if (!c.getDoctorId().equals(doctorProfileId)) throw new UnauthorizedException("Not authorized");
        referralRepository.delete(referral);
    }

    private Consultation getConsultationById(UUID id) {
        return consultationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Consultation not found: " + id));
    }
}
