package com.mediconnect.consultation.dto;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
public record PatientIntakeFormDto(UUID id, String chiefComplaint, String symptomDuration, String currentMedications, String allergies, String additionalNotes, LocalDateTime submittedAt, List<ConsultationSymptomDto> symptoms) {}
