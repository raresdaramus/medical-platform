package com.mediconnect.consultation.dto;
import java.time.LocalDate;
import java.util.UUID;
public record DiagnosisResponse(UUID id, UUID consultationId, UUID diseaseId, String diseaseName, String diseaseNameRo, String customDiagnosis, String icd10Code, double confidence, LocalDate diagnosisDate, String notes) {}
