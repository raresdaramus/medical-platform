package com.mediconnect.consultation.dto;
import java.time.LocalDate;
import java.util.UUID;
public record DiagnosisResponse(UUID id, UUID consultationId, UUID diseaseId, String customDiagnosis, String icd10Code, String confidence, LocalDate diagnosisDate, String notes) {}
