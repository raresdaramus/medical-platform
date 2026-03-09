package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name = "treatments")
public class Treatment {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, length = 200) private String name;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "disease_id") private UUID diseaseId;
    public Treatment() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public UUID getDiseaseId() { return diseaseId; } public void setDiseaseId(UUID diseaseId) { this.diseaseId = diseaseId; }
}
