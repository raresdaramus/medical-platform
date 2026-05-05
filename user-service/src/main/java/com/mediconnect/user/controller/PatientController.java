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

    // ─── Family Doctor Request endpoints ─────────────────────────────────────

    @PostMapping("/family-doctor-requests")
    public ResponseEntity<ApiResponse<FamilyDoctorRequestResponse>> sendFamilyDoctorRequest(
            @RequestHeader("Authorization") String auth,
            @RequestBody SendFamilyDoctorRequestRequest request) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"PATIENT".equals(token.role())) throw new UnauthorizedException("Only patients can send family doctor requests");
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(patientService.sendFamilyDoctorRequest(token.accountId(), request)));
    }

    @GetMapping("/family-doctor-requests/mine")
    public ResponseEntity<ApiResponse<List<FamilyDoctorRequestResponse>>> getMyRequests(
            @RequestHeader("Authorization") String auth) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"PATIENT".equals(token.role())) throw new UnauthorizedException("Only patients can view their requests");
        return ResponseEntity.ok(ApiResponse.ok(patientService.getMyRequests(token.accountId())));
    }

    @DeleteMapping("/family-doctor-requests/{requestId}")
    public ResponseEntity<ApiResponse<Void>> cancelFamilyDoctorRequest(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID requestId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"PATIENT".equals(token.role())) throw new UnauthorizedException("Only patients can cancel requests");
        patientService.cancelFamilyDoctorRequest(requestId, token.accountId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/family-doctor-requests/incoming")
    public ResponseEntity<ApiResponse<List<FamilyDoctorRequestResponse>>> getIncomingRequests(
            @RequestHeader("Authorization") String auth) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Only doctors can view incoming requests");
        return ResponseEntity.ok(ApiResponse.ok(patientService.getIncomingRequests(token.accountId())));
    }

    @PutMapping("/family-doctor-requests/{requestId}/respond")
    public ResponseEntity<ApiResponse<FamilyDoctorRequestResponse>> respondToRequest(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID requestId,
            @RequestBody RespondToFamilyDoctorRequestRequest request) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Only doctors can respond to requests");
        return ResponseEntity.ok(ApiResponse.ok(patientService.respondToRequest(requestId, request.accept(), token.accountId())));
    }
}
