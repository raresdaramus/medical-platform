package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name = "disease_symptom_links")
public class DiseaseSymptomLink {
    @EmbeddedId private DiseaseSymptomId id;
    @Column(precision = 5, scale = 2) private BigDecimal probability;
    @Column(name = "is_pathognomonic") private Boolean isPathognomonic = false;
    public DiseaseSymptomLink() {}
    public DiseaseSymptomId getId() { return id; } public void setId(DiseaseSymptomId id) { this.id = id; }
    public BigDecimal getProbability() { return probability; } public void setProbability(BigDecimal probability) { this.probability = probability; }
    public Boolean getIsPathognomonic() { return isPathognomonic; } public void setIsPathognomonic(Boolean isPathognomonic) { this.isPathognomonic = isPathognomonic; }
}
