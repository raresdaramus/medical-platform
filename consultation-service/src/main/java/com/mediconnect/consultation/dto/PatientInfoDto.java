package com.mediconnect.consultation.dto;
import java.util.UUID;
public record PatientInfoDto(UUID id, UUID accountId, String firstName, String lastName) {}
