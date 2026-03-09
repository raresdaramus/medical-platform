package com.mediconnect.user.controller;

import com.mediconnect.user.client.AuthClient;
import com.mediconnect.user.dto.*;
import com.mediconnect.user.exception.UnauthorizedException;
import com.mediconnect.user.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class PatientController {

    private final PatientService patientService;
    private final AuthClient authClient;

    public PatientController(PatientService patientService, AuthClient authClient) {
        this.patientService = patientService;
        this.authClient = authClient;
    }

    @PostMapping("/patients")
    public ResponseEntity<ApiResponse<PatientResponse>> createPatient(
            @RequestHeader("Authorization") String auth,
            @RequestBody CreatePatientRequest request) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"PATIENT".equals(token.role())) throw new UnauthorizedException("Only patients can create patient profiles");
        PatientResponse response = patientService.createPatient(request, token.accountId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @GetMapping("/patients/me")
    public ResponseEntity<ApiResponse<PatientResponse>> getMyPatient(
            @RequestHeader("Authorization") String auth) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        return ResponseEntity.ok(ApiResponse.ok(patientService.getPatientByAccountId(token.accountId())));
    }

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getPatient(patientId)));
    }

    @PostMapping("/assignments")
    public ResponseEntity<ApiResponse<AssignmentResponse>> assignDoctor(
            @RequestHeader("Authorization") String auth,
            @RequestBody AssignDoctorRequest request) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"PATIENT".equals(token.role())) throw new UnauthorizedException("Only patients can assign doctors");
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(patientService.assignDoctor(token.accountId(), request)));
    }

    @GetMapping("/patients/{patientId}/doctor")
    public ResponseEntity<ApiResponse<DoctorResponse>> getAssignedDoctor(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getAssignedDoctor(patientId)));
    }

    @GetMapping("/patients/{patientId}/permissions")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getPermissions(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getPermissions(patientId)));
    }

    @PostMapping("/patients/{patientId}/permissions")
    public ResponseEntity<ApiResponse<PermissionResponse>> grantPermission(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID patientId,
            @RequestBody PermissionRequest request) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"PATIENT".equals(token.role())) throw new UnauthorizedException("Only patients can grant permissions");
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(patientService.grantPermission(patientId, token.accountId(), request)));
    }

    @DeleteMapping("/patients/{patientId}/permissions/{permissionId}")
    public ResponseEntity<ApiResponse<Void>> revokePermission(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID patientId,
            @PathVariable UUID permissionId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"PATIENT".equals(token.role())) throw new UnauthorizedException("Only patients can revoke permissions");
        patientService.revokePermission(patientId, permissionId, token.accountId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
