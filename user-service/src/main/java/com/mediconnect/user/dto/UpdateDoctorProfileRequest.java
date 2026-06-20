package com.mediconnect.user.dto;

/**
 * Editable fields of a doctor's own profile, including the clinic / CNAS
 * administrative data needed on referral (bilet de trimitere) documents.
 */
public record UpdateDoctorProfileRequest(String clinicName, String phone,
                                         String cui, String clinicAddress, String cas,
                                         String cnasContractNumber, String providerType) {}
