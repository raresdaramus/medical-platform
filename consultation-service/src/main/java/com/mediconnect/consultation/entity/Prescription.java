package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity @Table(name = "prescriptions")
public class Prescription {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "consultation_id", nullable = false) private UUID consultationId;
    @Column(name = "diagnosis_id") private UUID diagnosisId;
    @Column(name = "treatment_id") private UUID treatmentId;
    @Column(name = "custom_instructions", columnDefinition = "TEXT") private String customInstructions;
    @Column(name = "valid_from", nullable = false) private LocalDate validFrom;
    @Column(name = "valid_until") private LocalDate validUntil;
    @Column(name = "issued_at") private LocalDateTime issuedAt = LocalDateTime.now();
    public Prescription() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public UUID getConsultationId() { return consultationId; } public void setConsultationId(UUID consultationId) { this.consultationId = consultationId; }
    public UUID getDiagnosisId() { return diagnosisId; } public void setDiagnosisId(UUID diagnosisId) { this.diagnosisId = diagnosisId; }
    public UUID getTreatmentId() { return treatmentId; } public void setTreatmentId(UUID treatmentId) { this.treatmentId = treatmentId; }
    public String getCustomInstructions() { return customInstructions; } public void setCustomInstructions(String customInstructions) { this.customInstructions = customInstructions; }
    public LocalDate getValidFrom() { return validFrom; } public void setValidFrom(LocalDate validFrom) { this.validFrom = validFrom; }
    public LocalDate getValidUntil() { return validUntil; } public void setValidUntil(LocalDate validUntil) { this.validUntil = validUntil; }
    public LocalDateTime getIssuedAt() { return issuedAt; } public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }
}
