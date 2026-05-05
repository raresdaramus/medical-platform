package com.mediconnect.consultation.dto;
import java.time.LocalDateTime;
import java.util.UUID;
public record ConsultationResponse(UUID id, UUID doctorId, UUID patientId, String patientName, String doctorName, String status, String consultationType, LocalDateTime scheduledAt, LocalDateTime startedAt, LocalDateTime completedAt, LocalDateTime createdAt, UUID nextConsultationId) {}
