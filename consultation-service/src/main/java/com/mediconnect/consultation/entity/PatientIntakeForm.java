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
    public PatientIntakeForm() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public UUID getConsultationId() { return consultationId; } public void setConsultationId(UUID consultationId) { this.consultationId = consultationId; }
    public String getChiefComplaint() { return chiefComplaint; } public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }
    public String getSymptomDuration() { return symptomDuration; } public void setSymptomDuration(String symptomDuration) { this.symptomDuration = symptomDuration; }
    public String getCurrentMedications() { return currentMedications; } public void setCurrentMedications(String currentMedications) { this.currentMedications = currentMedications; }
    public String getAllergies() { return allergies; } public void setAllergies(String allergies) { this.allergies = allergies; }
    public String getAdditionalNotes() { return additionalNotes; } public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }
    public LocalDateTime getSubmittedAt() { return submittedAt; } public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
