package com.mediconnect.user.dto;
import java.time.LocalDateTime;
import java.util.UUID;
public record DoctorResponse(UUID id, UUID accountId, String licenseNumber, String firstName, String lastName, String specialization, String clinicName, String phone, Boolean isAcceptingPatients, LocalDateTime createdAt) {}
