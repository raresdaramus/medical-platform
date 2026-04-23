package com.mediconnect.consultation.dto;
import java.time.LocalDate;
import java.util.UUID;
public record ConsultationSymptomDto(UUID id, UUID symptomId, String symptomName, String customSymptomText, String severity, LocalDate onsetDate) {}
