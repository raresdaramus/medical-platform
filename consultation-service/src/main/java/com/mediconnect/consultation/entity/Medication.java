package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name = "medications")
public class Medication {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, length = 200) private String name;
    @Column(name = "active_substance", length = 200) private String activeSubstance;
    @Column(name = "dosage_form", length = 100) private String dosageForm;
    @Column(name = "standard_dosage", length = 100) private String standardDosage;
    public Medication() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getActiveSubstance() { return activeSubstance; } public void setActiveSubstance(String activeSubstance) { this.activeSubstance = activeSubstance; }
    public String getDosageForm() { return dosageForm; } public void setDosageForm(String dosageForm) { this.dosageForm = dosageForm; }
    public String getStandardDosage() { return standardDosage; } public void setStandardDosage(String standardDosage) { this.standardDosage = standardDosage; }
}
