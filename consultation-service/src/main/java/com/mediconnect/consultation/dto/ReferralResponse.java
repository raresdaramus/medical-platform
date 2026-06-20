package com.mediconnect.consultation.dto;
import java.time.LocalDateTime;
import java.util.UUID;
public record ReferralResponse(UUID id, UUID consultationId, String referralType, String destination, String reason,
                               String urgency, UUID diagnosisId, Integer validityDays, String acuteChronic,
                               String investigations, String insuredCategory, String seriesNumber,
                               LocalDateTime issuedAt) {}
