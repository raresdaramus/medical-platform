package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name = "symptoms")
public class Symptom {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, length = 200) private String name;
    @Column(length = 20) private String code;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "body_system", length = 100) private String bodySystem;
    public Symptom() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getCode() { return code; } public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getBodySystem() { return bodySystem; } public void setBodySystem(String bodySystem) { this.bodySystem = bodySystem; }
}
