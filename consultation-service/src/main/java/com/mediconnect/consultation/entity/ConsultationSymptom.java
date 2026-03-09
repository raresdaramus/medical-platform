package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
@Entity @Table(name = "consultation_symptoms")
public class ConsultationSymptom {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "consultation_id", nullable = false) private UUID consultationId;
    @Column(name = "symptom_id") private UUID symptomId;
    @Column(name = "custom_symptom_text", columnDefinition = "TEXT") private String customSymptomText;
    @Column(length = 10) private String severity;
    @Column(name = "onset_date") private LocalDate onsetDate;
    @Column(name = "reported_by", length = 10) private String reportedBy = "PATIENT";
    public ConsultationSymptom() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public UUID getConsultationId() { return consultationId; } public void setConsultationId(UUID consultationId) { this.consultationId = consultationId; }
    public UUID getSymptomId() { return symptomId; } public void setSymptomId(UUID symptomId) { this.symptomId = symptomId; }
    public String getCustomSymptomText() { return customSymptomText; } public void setCustomSymptomText(String customSymptomText) { this.customSymptomText = customSymptomText; }
    public String getSeverity() { return severity; } public void setSeverity(String severity) { this.severity = severity; }
    public LocalDate getOnsetDate() { return onsetDate; } public void setOnsetDate(LocalDate onsetDate) { this.onsetDate = onsetDate; }
    public String getReportedBy() { return reportedBy; } public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }
}
