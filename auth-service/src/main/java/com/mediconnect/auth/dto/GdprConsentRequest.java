package com.mediconnect.auth.dto;

public record GdprConsentRequest(String consentType, boolean granted) {}
