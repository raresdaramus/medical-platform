package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity @Table(name = "patient_intake_forms")
public class PatientIntakeForm {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "consultation_id", nullable = false) private UUID consultationId;
    @Column(name = "chief_complaint", nullable = false, columnDefinition = "TEXT") private String chiefComplaint;
    @Column(name = "symptom_duration", length = 100) private String symptomDuration;
    @Column(name = "current_medications", columnDefinition = "TEXT") private String currentMedications;
    @Column(columnDefinition = "TEXT") private String allergies;
    @Column(name = "additional_notes", columnDefinition = "TEXT") private String additionalNotes;
    @Column(name = "submitted_at") private LocalDateTime submittedAt = LocalDateTime.now();
    // Vitals
    @Column(name = "temperature", columnDefinition = "numeric(4,1)") private Double temperature;
    @Column(name = "blood_pressure", length = 20) private String bloodPressure;
    @Column(name = "blood_glucose", columnDefinition = "numeric(5,1)") private Double bloodGlucose;
    // Structured questionnaire
    @Column(name = "body_zone", length = 100) private String bodyZone;
    @Column(name = "body_zone_symptoms", columnDefinition = "TEXT") private String bodyZoneSymptoms;
    @Column(name = "symptom_onset", length = 50) private String symptomOnset;
    @Column(name = "pain_intensity", length = 30) private String painIntensity;
    @Column(name = "pain_type", length = 50) private String painType;
    @Column(name = "had_symptoms_before") private Boolean hadSymptomsBefore;
    @Column(name = "general_symptoms", columnDefinition = "TEXT") private String generalSymptoms;
    @Column(name = "medications_taken_text", columnDefinition = "TEXT") private String medicationsTakenText;
    @Column(name = "known_conditions", columnDefinition = "TEXT") private String knownConditions;

    public PatientIntakeForm() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public UUID getConsultationId() { return consultationId; } public void setConsultationId(UUID consultationId) { this.consultationId = consultationId; }
    public String getChiefComplaint() { return chiefComplaint; } public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }
    public String getSymptomDuration() { return symptomDuration; } public void setSymptomDuration(String symptomDuration) { this.symptomDuration = symptomDuration; }
    public String getCurrentMedications() { return currentMedications; } public void setCurrentMedications(String currentMedications) { this.currentMedications = currentMedications; }
    public String getAllergies() { return allergies; } public void setAllergies(String allergies) { this.allergies = allergies; }
    public String getAdditionalNotes() { return additionalNotes; } public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }
    public LocalDateTime getSubmittedAt() { return submittedAt; } public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public Double getTemperature() { return temperature; } public void setTemperature(Double temperature) { this.temperature = temperature; }
    public String getBloodPressure() { return bloodPressure; } public void setBloodPressure(String bloodPressure) { this.bloodPressure = bloodPressure; }
    public Double getBloodGlucose() { return bloodGlucose; } public void setBloodGlucose(Double bloodGlucose) { this.bloodGlucose = bloodGlucose; }
    public String getBodyZone() { return bodyZone; } public void setBodyZone(String bodyZone) { this.bodyZone = bodyZone; }
    public String getBodyZoneSymptoms() { return bodyZoneSymptoms; } public void setBodyZoneSymptoms(String bodyZoneSymptoms) { this.bodyZoneSymptoms = bodyZoneSymptoms; }
    public String getSymptomOnset() { return symptomOnset; } public void setSymptomOnset(String symptomOnset) { this.symptomOnset = symptomOnset; }
    public String getPainIntensity() { return painIntensity; } public void setPainIntensity(String painIntensity) { this.painIntensity = painIntensity; }
    public String getPainType() { return painType; } public void setPainType(String painType) { this.painType = painType; }
    public Boolean getHadSymptomsBefore() { return hadSymptomsBefore; } public void setHadSymptomsBefore(Boolean hadSymptomsBefore) { this.hadSymptomsBefore = hadSymptomsBefore; }
    public String getGeneralSymptoms() { return generalSymptoms; } public void setGeneralSymptoms(String generalSymptoms) { this.generalSymptoms = generalSymptoms; }
    public String getMedicationsTakenText() { return medicationsTakenText; } public void setMedicationsTakenText(String medicationsTakenText) { this.medicationsTakenText = medicationsTakenText; }
    public String getKnownConditions() { return knownConditions; } public void setKnownConditions(String knownConditions) { this.knownConditions = knownConditions; }
}
