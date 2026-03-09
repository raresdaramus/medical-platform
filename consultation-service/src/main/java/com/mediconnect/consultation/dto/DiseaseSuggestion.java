package com.mediconnect.consultation.dto;
import java.util.UUID;
public record DiseaseSuggestion(UUID diseaseId, String diseaseName, String icd10Code, double score) {}
