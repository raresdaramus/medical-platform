package com.mediconnect.consultation.dto;
import java.time.LocalDateTime;
public record CompleteConsultationRequest(
    String noteDoctor,
    LocalDateTime followUpScheduledAt,
    Integer followUpDurationMinutes
) {}
