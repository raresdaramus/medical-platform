package com.mediconnect.consultation.dto;
import java.util.UUID;
public record PrescriptionItemRequest(UUID medicationId, String dosage, String frequency, Integer durationDays, Integer quantity) {}
