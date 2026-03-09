package com.mediconnect.auth.dto;

import java.util.List;

public record RegisterRequest(
    String email,
    String password,
    String role,
    List<GdprConsentRequest> gdprConsents
) {}
