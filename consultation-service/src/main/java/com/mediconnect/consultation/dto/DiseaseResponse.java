package com.mediconnect.consultation.dto;
import java.util.UUID;
public record DiseaseResponse(UUID id, String name, String icd10Code, String category) {}
