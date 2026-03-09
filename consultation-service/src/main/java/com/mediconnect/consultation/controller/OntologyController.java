package com.mediconnect.consultation.controller;

import com.mediconnect.consultation.dto.*;
import com.mediconnect.consultation.service.OntologyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/consultations")
public class OntologyController {

    private final OntologyService ontologyService;

    public OntologyController(OntologyService ontologyService) {
        this.ontologyService = ontologyService;
    }

    @GetMapping("/symptoms")
    public ResponseEntity<ApiResponse<List<SymptomResponse>>> searchSymptoms(@RequestParam(defaultValue = "") String search) {
        return ResponseEntity.ok(ApiResponse.ok(ontologyService.searchSymptoms(search)));
    }

    @GetMapping("/symptoms/suggest")
    public ResponseEntity<ApiResponse<List<DiseaseSuggestion>>> suggestDiseases(@RequestParam String symptomIds) {
        List<UUID> ids = Arrays.stream(symptomIds.split(","))
            .map(String::trim).filter(s -> !s.isEmpty()).map(UUID::fromString).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(ontologyService.suggestDiseases(ids)));
    }

    @GetMapping("/diseases")
    public ResponseEntity<ApiResponse<List<DiseaseResponse>>> searchDiseases(@RequestParam(defaultValue = "") String search) {
        return ResponseEntity.ok(ApiResponse.ok(ontologyService.searchDiseases(search)));
    }

    @GetMapping("/medications")
    public ResponseEntity<ApiResponse<List<MedicationResponse>>> searchMedications(@RequestParam(defaultValue = "") String search) {
        return ResponseEntity.ok(ApiResponse.ok(ontologyService.searchMedications(search)));
    }
}
