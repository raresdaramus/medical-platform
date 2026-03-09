package com.mediconnect.auth.dto;

import java.util.UUID;

public record LoginResponse(String accessToken, String refreshToken, String role, UUID accountId) {}
