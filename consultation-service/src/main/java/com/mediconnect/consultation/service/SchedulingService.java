package com.mediconnect.consultation.service;

import com.mediconnect.consultation.client.UserClient;
import com.mediconnect.consultation.dto.*;
import com.mediconnect.consultation.entity.Consultation;
import com.mediconnect.consultation.entity.MedicalRecordEntry;
import com.mediconnect.consultation.exception.ResourceNotFoundException;
import com.mediconnect.consultation.repository.ConsultationRepository;
import com.mediconnect.consultation.repository.MedicalRecordEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SchedulingService {

    private final ConsultationRepository consultationRepository;
    private final MedicalRecordEntryRepository medicalRecordEntryRepository;
    private final UserClient userClient;

    public SchedulingService(ConsultationRepository consultationRepository,
                             MedicalRecordEntryRepository medicalRecordEntryRepository,
                             UserClient userClient) {
        this.consultationRepository = consultationRepository;
        this.medicalRecordEntryRepository = medicalRecordEntryRepository;
        this.userClient = userClient;
    }

    public List<SlotResponse> getAvailableSlots(UUID doctorId, LocalDate date) {
        List<DoctorScheduleDto> schedules = userClient.getDoctorSchedule(doctorId);
        int dayOfWeek = date.getDayOfWeek().getValue() % 7; // Sunday=0, Monday=1...
        DoctorScheduleDto schedule = schedules.stream()
            .filter(s -> s.dayOfWeek() == dayOfWeek)
            .findFirst()
            .orElse(null);

        if (schedule == null) return List.of();

        List<LocalDateTime> bookedSlots = consultationRepository.findBookedSlotsForDay(doctorId, date)
            .stream().map(Consultation::getScheduledAt).collect(Collectors.toList());

        List<SlotResponse> slots = new ArrayList<>();
        LocalTime current = schedule.startTime();
        int slotMinutes = schedule.slotDurationMinutes() != null ? schedule.slotDurationMinutes() : 30;

        while (current.plusMinutes(slotMinutes).compareTo(schedule.endTime()) <= 0) {
            LocalDateTime slotDateTime = LocalDateTime.of(date, current);
            boolean taken = bookedSlots.contains(slotDateTime);
            slots.add(new SlotResponse(current.format(DateTimeFormatter.ofPattern("HH:mm")), !taken));
            current = current.plusMinutes(slotMinutes);
        }
        return slots;
    }

    @Transactional
    public ConsultationResponse bookConsultation(UUID patientId, CreateConsultationRequest req) {
        if (req.scheduledAt() != null) {
            List<Consultation> existing = consultationRepository.findByDoctorIdAndScheduledAtWithLock(
                req.doctorId(), req.scheduledAt());
            if (!existing.isEmpty()) {
                throw new IllegalStateException("This time slot is already booked");
            }
        }

        Consultation consultation = new Consultation();
        consultation.setDoctorId(req.doctorId());
        consultation.setPatientId(patientId);
        consultation.setConsultationType(req.consultationType() != null ? req.consultationType() : "IN_PERSON");
        consultation.setScheduledAt(req.scheduledAt());
        consultation.setSlotDurationMinutes(resolveSlotDuration(req));
        consultation.setStatus("PENDING");
        consultation.setCreatedAt(LocalDateTime.now());
        consultation = consultationRepository.save(consultation);

        MedicalRecordEntry entry = new MedicalRecordEntry();
        entry.setPatientId(patientId);
        entry.setConsultationId(consultation.getId());
        entry.setEntryType("CONSULTATION");
        entry.setAddedBy(patientId);
        entry.setAddedAt(LocalDateTime.now());
        entry.setIsVisibleToPatient(true);
        medicalRecordEntryRepository.save(entry);

        return toConsultationResponse(consultation);
    }

    // Authoritative slot duration: read it from the doctor's schedule for the booked
    // day rather than trusting the client. Falls back to the request value, then 30 min.
    private int resolveSlotDuration(CreateConsultationRequest req) {
        int fallback = req.slotDurationMinutes() != null ? req.slotDurationMinutes() : 30;
        if (req.scheduledAt() == null) return fallback;
        int dayOfWeek = req.scheduledAt().getDayOfWeek().getValue() % 7; // Sunday=0, Monday=1...
        return userClient.getDoctorSchedule(req.doctorId()).stream()
            .filter(s -> s.dayOfWeek() != null && s.dayOfWeek() == dayOfWeek)
            .map(DoctorScheduleDto::slotDurationMinutes)
            .filter(java.util.Objects::nonNull)
            .findFirst()
            .orElse(fallback);
    }

    public ConsultationResponse toConsultationResponse(Consultation c) {
        return new ConsultationResponse(c.getId(), c.getDoctorId(), c.getPatientId(), null, null, c.getStatus(),
            c.getConsultationType(), c.getScheduledAt(), c.getStartedAt(), c.getCompletedAt(),
            c.getSlotDurationMinutes(), c.getCreatedAt(), c.getNextConsultationId());
    }

    public ConsultationResponse toConsultationResponse(Consultation c, String patientName, String doctorName) {
        return new ConsultationResponse(c.getId(), c.getDoctorId(), c.getPatientId(), patientName, doctorName, c.getStatus(),
            c.getConsultationType(), c.getScheduledAt(), c.getStartedAt(), c.getCompletedAt(),
            c.getSlotDurationMinutes(), c.getCreatedAt(), c.getNextConsultationId());
    }
}
