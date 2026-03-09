package com.mediconnect.auth.dto;

import java.util.UUID;

public record ValidateResponse(UUID accountId, String role, boolean valid) {}
