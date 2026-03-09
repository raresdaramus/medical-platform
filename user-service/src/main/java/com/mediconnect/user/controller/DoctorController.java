package com.mediconnect.user.controller;

import com.mediconnect.user.client.AuthClient;
import com.mediconnect.user.dto.*;
import com.mediconnect.user.exception.UnauthorizedException;
import com.mediconnect.user.service.DoctorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class DoctorController {

    private final DoctorService doctorService;
    private final AuthClient authClient;

    public DoctorController(DoctorService doctorService, AuthClient authClient) {
        this.doctorService = doctorService;
        this.authClient = authClient;
    }

    @PostMapping("/doctors")
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(
            @RequestHeader("Authorization") String auth,
            @RequestBody CreateDoctorRequest request) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Only doctors can create doctor profiles");
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(doctorService.createDoctor(request, token.accountId())));
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> searchDoctors(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.searchDoctors(search)));
    }

    @GetMapping("/doctors/me")
    public ResponseEntity<ApiResponse<DoctorResponse>> getMyDoctor(
            @RequestHeader("Authorization") String auth) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getDoctorByAccountId(token.accountId())));
    }

    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctor(@PathVariable UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getDoctor(doctorId)));
    }

    @GetMapping("/doctors/{doctorId}/schedule")
    public ResponseEntity<ApiResponse<List<ScheduleEntryResponse>>> getSchedule(@PathVariable UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getSchedule(doctorId)));
    }

    @PostMapping("/doctors/{doctorId}/schedule")
    public ResponseEntity<ApiResponse<List<ScheduleEntryResponse>>> createSchedule(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID doctorId,
            @RequestBody List<ScheduleEntryRequest> entries) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Only doctors can manage schedules");
        return ResponseEntity.ok(ApiResponse.ok(doctorService.createSchedule(doctorId, token.accountId(), entries)));
    }
}
