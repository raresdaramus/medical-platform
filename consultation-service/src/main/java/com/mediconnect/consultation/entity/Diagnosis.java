package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
@Entity @Table(name = "diagnoses")
public class Diagnosis {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "consultation_id", nullable = false) private UUID consultationId;
    @Column(name = "disease_id") private UUID diseaseId;
    @Column(name = "custom_diagnosis", columnDefinition = "TEXT") private String customDiagnosis;
    @Column(name = "icd10_code", length = 10) private String icd10Code;
    @Column(length = 20) private String confidence;
    @Column(name = "diagnosis_date", nullable = false) private LocalDate diagnosisDate;
    @Column(columnDefinition = "TEXT") private String notes;
    public Diagnosis() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public UUID getConsultationId() { return consultationId; } public void setConsultationId(UUID consultationId) { this.consultationId = consultationId; }
    public UUID getDiseaseId() { return diseaseId; } public void setDiseaseId(UUID diseaseId) { this.diseaseId = diseaseId; }
    public String getCustomDiagnosis() { return customDiagnosis; } public void setCustomDiagnosis(String customDiagnosis) { this.customDiagnosis = customDiagnosis; }
    public String getIcd10Code() { return icd10Code; } public void setIcd10Code(String icd10Code) { this.icd10Code = icd10Code; }
    public String getConfidence() { return confidence; } public void setConfidence(String confidence) { this.confidence = confidence; }
    public LocalDate getDiagnosisDate() { return diagnosisDate; } public void setDiagnosisDate(LocalDate diagnosisDate) { this.diagnosisDate = diagnosisDate; }
    public String getNotes() { return notes; } public void setNotes(String notes) { this.notes = notes; }
}
