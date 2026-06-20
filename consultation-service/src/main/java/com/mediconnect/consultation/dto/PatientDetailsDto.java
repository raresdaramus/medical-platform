package com.mediconnect.consultation.dto;
import java.time.LocalDate;
import java.util.UUID;
public record PatientDetailsDto(UUID id, UUID accountId, String cnp, String firstName, String lastName,
                                LocalDate dateOfBirth, String gender, String phone, String address, String bloodType) {}
