package com.mediconnect.consultation.dto;
import java.util.UUID;
public record ReferralRequest(String referralType, String destination, String reason, String urgency,
                              UUID diagnosisId, Integer validityDays, String acuteChronic,
                              String investigations, String insuredCategory) {}
