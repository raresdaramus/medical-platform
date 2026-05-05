package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name = "prescription_items")
public class PrescriptionItem {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "prescription_id", nullable = false) private UUID prescriptionId;
    @Column(name = "medication_id") private UUID medicationId;
    @Column(name = "medication_name", length = 200) private String medicationName;
    @Column(length = 100) private String dosage;
    @Column(length = 100) private String frequency;
    @Column(name = "duration_days") private Integer durationDays;
    private Integer quantity;
    public PrescriptionItem() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public UUID getPrescriptionId() { return prescriptionId; } public void setPrescriptionId(UUID prescriptionId) { this.prescriptionId = prescriptionId; }
    public UUID getMedicationId() { return medicationId; } public void setMedicationId(UUID medicationId) { this.medicationId = medicationId; }
    public String getMedicationName() { return medicationName; } public void setMedicationName(String medicationName) { this.medicationName = medicationName; }
    public String getDosage() { return dosage; } public void setDosage(String dosage) { this.dosage = dosage; }
    public String getFrequency() { return frequency; } public void setFrequency(String frequency) { this.frequency = frequency; }
    public Integer getDurationDays() { return durationDays; } public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
    public Integer getQuantity() { return quantity; } public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
