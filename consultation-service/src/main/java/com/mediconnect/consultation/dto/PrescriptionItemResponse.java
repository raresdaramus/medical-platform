package com.mediconnect.consultation.dto;
import java.util.UUID;
public record PrescriptionItemResponse(UUID id, UUID medicationId, String dosage, String frequency, Integer durationDays, Integer quantity) {}
