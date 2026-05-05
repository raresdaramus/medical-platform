package com.mediconnect.consultation.controller;

import com.mediconnect.consultation.client.AuthClient;
import com.mediconnect.consultation.dto.*;
import com.mediconnect.consultation.exception.UnauthorizedException;
import com.mediconnect.consultation.service.ConsultationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

    private final ConsultationService consultationService;
    private final AuthClient authClient;

    public ConsultationController(ConsultationService consultationService, AuthClient authClient) {
        this.consultationService = consultationService;
        this.authClient = authClient;
    }

    @GetMapping("/doctor/{doctorId}/pending")
    public ResponseEntity<ApiResponse<List<ConsultationResponse>>> getPending(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID doctorId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Doctors only");
        return ResponseEntity.ok(ApiResponse.ok(consultationService.getPendingConsultations(doctorId)));
    }

    @GetMapping("/doctor/{doctorId}/all")
    public ResponseEntity<ApiResponse<List<ConsultationResponse>>> getAllDoctorConsultations(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID doctorId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Doctors only");
        return ResponseEntity.ok(ApiResponse.ok(consultationService.getAllDoctorConsultations(doctorId)));
    }

    @PutMapping("/{consultationId}/confirm")
    public ResponseEntity<ApiResponse<ConsultationResponse>> confirm(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Doctors only");
        return ResponseEntity.ok(ApiResponse.ok(consultationService.confirm(consultationId, token.accountId())));
    }

    @PutMapping("/{consultationId}/cancel")
    public ResponseEntity<ApiResponse<ConsultationResponse>> cancel(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        return ResponseEntity.ok(ApiResponse.ok(consultationService.cancel(consultationId, token.accountId(), token.role())));
    }

    @PostMapping("/{consultationId}/intake")
    public ResponseEntity<ApiResponse<Void>> submitIntake(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId,
            @RequestBody IntakeFormRequest request) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"PATIENT".equals(token.role()) && !"DOCTOR".equals(token.role())) throw new UnauthorizedException("Not authorized");
        consultationService.submitIntake(consultationId, token.accountId(), token.role(), request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/{consultationId}")
    public ResponseEntity<ApiResponse<FullConsultationResponse>> getConsultation(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        return ResponseEntity.ok(ApiResponse.ok(consultationService.getFullConsultation(consultationId, token.accountId(), token.role())));
    }

    @PutMapping("/{consultationId}/start")
    public ResponseEntity<ApiResponse<ConsultationResponse>> start(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Doctors only");
        return ResponseEntity.ok(ApiResponse.ok(consultationService.startConsultation(consultationId, token.accountId())));
    }

    @PostMapping("/{consultationId}/diagnosis")
    public ResponseEntity<ApiResponse<DiagnosisResponse>> addDiagnosis(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId,
            @RequestBody DiagnosisRequest request) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Doctors only");
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(consultationService.addDiagnosis(consultationId, token.accountId(), request)));
    }

    @PostMapping("/{consultationId}/prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> addPrescription(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId,
            @RequestBody PrescriptionRequest request) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Doctors only");
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(consultationService.addPrescription(consultationId, token.accountId(), request)));
    }

    @PostMapping("/{consultationId}/referral")
    public ResponseEntity<ApiResponse<ReferralResponse>> addReferral(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId,
            @RequestBody ReferralRequest request) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Doctors only");
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(consultationService.addReferral(consultationId, token.accountId(), request)));
    }

    @PutMapping("/{consultationId}/complete")
    public ResponseEntity<ApiResponse<ConsultationResponse>> complete(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId,
            @RequestBody CompleteConsultationRequest request) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Doctors only");
        return ResponseEntity.ok(ApiResponse.ok(consultationService.completeConsultation(consultationId, token.accountId(), request)));
    }

    @GetMapping("/doctor/{doctorId}/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<ConsultationResponse>>> getDoctorPatientConsultations(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID doctorId,
            @PathVariable UUID patientId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Doctors only");
        return ResponseEntity.ok(ApiResponse.ok(consultationService.getDoctorPatientConsultations(doctorId, patientId)));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<ConsultationResponse>>> getPatientConsultations(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID patientId) {
        authClient.validateToken(auth);
        return ResponseEntity.ok(ApiResponse.ok(consultationService.getPatientConsultations(patientId)));
    }

    @PutMapping("/{consultationId}/link-next/{nextConsultationId}")
    public ResponseEntity<ApiResponse<ConsultationResponse>> linkNext(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId,
            @PathVariable UUID nextConsultationId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Doctors only");
        return ResponseEntity.ok(ApiResponse.ok(consultationService.linkNextConsultation(consultationId, nextConsultationId, token.accountId())));
    }

    @DeleteMapping("/{consultationId}/link-next")
    public ResponseEntity<ApiResponse<ConsultationResponse>> unlinkNext(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Doctors only");
        return ResponseEntity.ok(ApiResponse.ok(consultationService.unlinkNextConsultation(consultationId, token.accountId())));
    }

    @GetMapping("/patients/{patientId}/record")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponse>>> getMedicalRecord(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID patientId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        return ResponseEntity.ok(ApiResponse.ok(consultationService.getMedicalRecord(patientId, token.accountId(), token.role())));
    }
}
