package com.mediconnect.consultation.dto;
import java.time.LocalDateTime;
import java.util.UUID;
public record MedicalRecordResponse(UUID id, UUID patientId, UUID consultationId, String entryType, LocalDateTime addedAt) {}
