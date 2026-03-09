package com.mediconnect.auth.dto;

import java.util.UUID;

public record RegisterResponse(UUID accountId, String email, String role) {}
