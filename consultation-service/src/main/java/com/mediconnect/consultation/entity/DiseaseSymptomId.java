package com.mediconnect.consultation.entity;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;
@Embeddable
public class DiseaseSymptomId implements Serializable {
    private UUID diseaseId;
    private UUID symptomId;
    public DiseaseSymptomId() {}
    public DiseaseSymptomId(UUID diseaseId, UUID symptomId) { this.diseaseId = diseaseId; this.symptomId = symptomId; }
    public UUID getDiseaseId() { return diseaseId; } public void setDiseaseId(UUID diseaseId) { this.diseaseId = diseaseId; }
    public UUID getSymptomId() { return symptomId; } public void setSymptomId(UUID symptomId) { this.symptomId = symptomId; }
    @Override public boolean equals(Object o) { if (this == o) return true; if (!(o instanceof DiseaseSymptomId)) return false; DiseaseSymptomId that = (DiseaseSymptomId) o; return Objects.equals(diseaseId, that.diseaseId) && Objects.equals(symptomId, that.symptomId); }
    @Override public int hashCode() { return Objects.hash(diseaseId, symptomId); }
}
