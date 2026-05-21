package com.mediconnect.consultation.dto;

public record AiSuggestionResponse(
        String name,
        String description,
        String confidence
) {}
