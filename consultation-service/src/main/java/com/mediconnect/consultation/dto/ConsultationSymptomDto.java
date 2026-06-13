package com.mediconnect.consultation.dto;
import java.time.LocalDate;
import java.util.UUID;
public record ConsultationSymptomDto(UUID id, UUID symptomId, String symptomName, String customText, String severity, LocalDate onsetDate) {}
