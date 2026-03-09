package com.mediconnect.user.dto;
import java.util.UUID;
public record ValidateTokenResponse(UUID accountId, String role, boolean valid) {}
