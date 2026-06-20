package com.mediconnect.consultation.dto;
import java.util.UUID;
public record DoctorDetailsDto(UUID id, UUID accountId, String licenseNumber, String firstName, String lastName,
                               String specialization, String clinicName, String phone,
                               String cui, String clinicAddress, String cas, String cnasContractNumber,
                               String providerType) {}
