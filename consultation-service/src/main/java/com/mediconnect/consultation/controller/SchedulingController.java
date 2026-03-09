package com.mediconnect.consultation.controller;

import com.mediconnect.consultation.client.AuthClient;
import com.mediconnect.consultation.dto.*;
import com.mediconnect.consultation.exception.UnauthorizedException;
import com.mediconnect.consultation.service.SchedulingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
public class SchedulingController {

    private final SchedulingService schedulingService;
    private final AuthClient authClient;

    public SchedulingController(SchedulingService schedulingService, AuthClient authClient) {
        this.schedulingService = schedulingService;
        this.authClient = authClient;
    }

    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlots(
            @RequestParam UUID doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(schedulingService.getAvailableSlots(doctorId, date)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConsultationResponse>> bookConsultation(
            @RequestHeader("Authorization") String auth,
            @RequestBody CreateConsultationRequest request) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"PATIENT".equals(token.role())) throw new UnauthorizedException("Only patients can book consultations");
        // Get patient's patient-profile ID — we use accountId as patientId proxy here,
        // actual patientId from user-service would be needed in production. Using accountId for now.
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(schedulingService.bookConsultation(token.accountId(), request)));
    }
}
