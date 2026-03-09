package com.mediconnect.user.dto;
import java.time.LocalDateTime;
import java.util.UUID;
public record AssignmentResponse(UUID id, UUID patientId, UUID doctorId, LocalDateTime assignedAt, Boolean isActive, LocalDateTime consentGivenAt) {}
