package com.mediconnect.consultation.dto;
import java.util.UUID;
public record PrescriptionItemRequest(UUID medicationId, String medicationName, String dosage, String frequency, Integer durationDays, Integer quantity) {}
