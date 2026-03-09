package com.mediconnect.user.dto;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
public record PatientResponse(UUID id, UUID accountId, String cnp, String firstName, String lastName, LocalDate dateOfBirth, String gender, String phone, String address, String bloodType, LocalDateTime createdAt) {}
