package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity @Table(name = "medical_record_entries")
public class MedicalRecordEntry {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "patient_id", nullable = false) private UUID patientId;
    @Column(name = "consultation_id", nullable = false) private UUID consultationId;
    @Column(name = "entry_type", nullable = false, length = 30) private String entryType;
    @Column(name = "added_at") private LocalDateTime addedAt = LocalDateTime.now();
    @Column(name = "added_by", nullable = false) private UUID addedBy;
    @Column(name = "is_visible_to_patient") private Boolean isVisibleToPatient = true;
    public MedicalRecordEntry() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; } public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getConsultationId() { return consultationId; } public void setConsultationId(UUID consultationId) { this.consultationId = consultationId; }
    public String getEntryType() { return entryType; } public void setEntryType(String entryType) { this.entryType = entryType; }
    public LocalDateTime getAddedAt() { return addedAt; } public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
    public UUID getAddedBy() { return addedBy; } public void setAddedBy(UUID addedBy) { this.addedBy = addedBy; }
    public Boolean getIsVisibleToPatient() { return isVisibleToPatient; } public void setIsVisibleToPatient(Boolean isVisibleToPatient) { this.isVisibleToPatient = isVisibleToPatient; }
}
