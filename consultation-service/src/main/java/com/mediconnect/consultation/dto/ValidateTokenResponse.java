package com.mediconnect.consultation.dto;
import java.util.UUID;
public record ValidateTokenResponse(UUID accountId, String role, boolean valid) {}
