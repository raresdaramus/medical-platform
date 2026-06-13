package com.mediconnect.user.dto;

import java.time.LocalDateTime;

public record PermittedPatientResponse(
    PatientResponse patient,
    String permissionType,
    LocalDateTime expiresAt
) {}
