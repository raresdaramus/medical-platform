package com.mediconnect.consultation.dto;
import java.util.UUID;
public record SymptomResponse(UUID id, String name, String code, String bodySystem) {}
