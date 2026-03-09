package com.mediconnect.user.dto;
import java.time.LocalDateTime;
import java.util.UUID;
public record PermissionRequest(UUID granteeId, String granteeType, String permissionType, LocalDateTime expiresAt) {}
