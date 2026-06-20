package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity @Table(name = "referrals")
public class Referral {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "consultation_id", nullable = false) private UUID consultationId;
    @Column(name = "referral_type", length = 20) private String referralType;
    @Column(length = 200) private String destination;
    @Column(columnDefinition = "TEXT") private String reason;
    @Column(length = 20) private String urgency = "ROUTINE";
    @Column(name = "diagnosis_id") private UUID diagnosisId;
    @Column(name = "validity_days") private Integer validityDays;
    @Column(name = "acute_chronic", length = 10) private String acuteChronic;
    @Column(columnDefinition = "TEXT") private String investigations;
    @Column(name = "insured_category", length = 60) private String insuredCategory;
    @Column(name = "series_number", length = 40) private String seriesNumber;
    @Column(name = "issued_at") private LocalDateTime issuedAt = LocalDateTime.now();
    @Column(name = "result_consultation_id") private UUID resultConsultationId;
    public Referral() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public UUID getConsultationId() { return consultationId; } public void setConsultationId(UUID consultationId) { this.consultationId = consultationId; }
    public String getReferralType() { return referralType; } public void setReferralType(String referralType) { this.referralType = referralType; }
    public String getDestination() { return destination; } public void setDestination(String destination) { this.destination = destination; }
    public String getReason() { return reason; } public void setReason(String reason) { this.reason = reason; }
    public String getUrgency() { return urgency; } public void setUrgency(String urgency) { this.urgency = urgency; }
    public UUID getDiagnosisId() { return diagnosisId; } public void setDiagnosisId(UUID diagnosisId) { this.diagnosisId = diagnosisId; }
    public Integer getValidityDays() { return validityDays; } public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }
    public String getAcuteChronic() { return acuteChronic; } public void setAcuteChronic(String acuteChronic) { this.acuteChronic = acuteChronic; }
    public String getInvestigations() { return investigations; } public void setInvestigations(String investigations) { this.investigations = investigations; }
    public String getInsuredCategory() { return insuredCategory; } public void setInsuredCategory(String insuredCategory) { this.insuredCategory = insuredCategory; }
    public String getSeriesNumber() { return seriesNumber; } public void setSeriesNumber(String seriesNumber) { this.seriesNumber = seriesNumber; }
    public LocalDateTime getIssuedAt() { return issuedAt; } public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }
    public UUID getResultConsultationId() { return resultConsultationId; } public void setResultConsultationId(UUID resultConsultationId) { this.resultConsultationId = resultConsultationId; }
}
