package com.mediconnect.consultation.dto;
import java.util.UUID;
public record MedicationResponse(UUID id, String name, String activeSubstance, String dosageForm, String standardDosage) {}
