package com.mediconnect.user.controller;

import com.mediconnect.user.dto.*;
import com.mediconnect.user.service.DoctorService;
import com.mediconnect.user.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/internal")
public class InternalController {

    private final PatientService patientService;
    private final DoctorService doctorService;

    public InternalController(PatientService patientService, DoctorService doctorService) {
        this.patientService = patientService;
        this.doctorService = doctorService;
    }

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getPatient(patientId)));
    }

    @GetMapping("/patients/by-account/{accountId}")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientByAccount(@PathVariable UUID accountId) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getPatientByAccountId(accountId)));
    }

    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctor(@PathVariable UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getDoctor(doctorId)));
    }

    @GetMapping("/doctors/by-account/{accountId}")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorByAccount(@PathVariable UUID accountId) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getDoctorByAccountId(accountId)));
    }

    @GetMapping("/doctors/{doctorId}/schedule")
    public ResponseEntity<ApiResponse<List<ScheduleEntryResponse>>> getSchedule(@PathVariable UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getSchedule(doctorId)));
    }
}
