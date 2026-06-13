package com.mediconnect.consultation.dto;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
public record FullConsultationResponse(UUID id, UUID doctorId, UUID patientId, String status, String consultationType, LocalDateTime scheduledAt, LocalDateTime startedAt, LocalDateTime completedAt, Integer slotDurationMinutes, PatientIntakeFormDto intake, List<DiagnosisResponse> diagnoses, List<PrescriptionResponse> prescriptions, List<ReferralResponse> referrals, String noteDoctor, UUID nextConsultationId, UUID previousConsultationId, List<DocumentResponse> documents) {}
