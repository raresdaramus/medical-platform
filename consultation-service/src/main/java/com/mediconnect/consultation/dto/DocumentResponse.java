package com.mediconnect.consultation.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record DocumentResponse(
    UUID id,
    UUID consultationId,
    UUID uploadedBy,
    String uploaderRole,
    String fileName,
    Long fileSize,
    LocalDateTime uploadedAt
) {}
