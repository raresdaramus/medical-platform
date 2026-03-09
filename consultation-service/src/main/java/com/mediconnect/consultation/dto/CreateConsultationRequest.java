package com.mediconnect.consultation.dto;
import java.time.LocalDateTime;
import java.util.UUID;
public record CreateConsultationRequest(UUID doctorId, LocalDateTime scheduledAt, String consultationType, Integer slotDurationMinutes) {}
