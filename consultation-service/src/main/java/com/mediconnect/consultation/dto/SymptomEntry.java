package com.mediconnect.consultation.dto;
import java.time.LocalDate;
import java.util.UUID;
public record SymptomEntry(UUID symptomId, String customText, String severity, LocalDate onsetDate) {}
