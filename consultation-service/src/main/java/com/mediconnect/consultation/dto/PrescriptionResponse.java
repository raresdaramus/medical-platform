package com.mediconnect.consultation.dto;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
public record PrescriptionResponse(UUID id, UUID consultationId, UUID diagnosisId, String customInstructions, LocalDate validFrom, LocalDate validUntil, LocalDateTime issuedAt) {}
