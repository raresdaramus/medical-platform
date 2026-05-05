package com.mediconnect.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record FamilyDoctorRequestResponse(
    UUID id,
    UUID patientId,
    String patientName,
    UUID doctorId,
    String doctorName,
    String status,
    String message,
    LocalDateTime requestedAt,
    LocalDateTime respondedAt
) {}
