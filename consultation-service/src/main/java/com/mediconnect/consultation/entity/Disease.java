package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name = "diseases")
public class Disease {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, length = 200) private String name;
    @Column(name = "icd10_code", length = 10) private String icd10Code;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(length = 100) private String category;
    @Column(name = "name_ro", length = 200) private String nameRo;
    public Disease() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getNameRo() { return nameRo; } public void setNameRo(String nameRo) { this.nameRo = nameRo; }
    public String getIcd10Code() { return icd10Code; } public void setIcd10Code(String icd10Code) { this.icd10Code = icd10Code; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; } public void setCategory(String category) { this.category = category; }
}
