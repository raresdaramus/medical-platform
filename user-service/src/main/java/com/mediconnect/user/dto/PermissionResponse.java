package com.mediconnect.user.dto;
import java.time.LocalDateTime;
import java.util.UUID;
public record PermissionResponse(UUID id, UUID patientId, UUID granteeId, String granteeName, String granteeType, String permissionType, LocalDateTime grantedAt, LocalDateTime expiresAt, Boolean isActive) {}
