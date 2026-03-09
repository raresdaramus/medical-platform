package com.mediconnect.consultation.dto;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
public record PrescriptionRequest(UUID diagnosisId, UUID treatmentId, String customInstructions, LocalDate validFrom, LocalDate validUntil, List<PrescriptionItemRequest> items) {}
