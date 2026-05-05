package com.mediconnect.user.dto;

import java.util.UUID;

public record SendFamilyDoctorRequestRequest(UUID doctorId, String message) {}
