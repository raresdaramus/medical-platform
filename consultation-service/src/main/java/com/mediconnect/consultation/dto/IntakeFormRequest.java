package com.mediconnect.consultation.dto;
import java.util.List;
public record IntakeFormRequest(String chiefComplaint, String symptomDuration, String currentMedications, String allergies, String additionalNotes, List<SymptomEntry> symptoms) {}
