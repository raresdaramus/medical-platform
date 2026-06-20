package com.mediconnect.consultation.service;

import com.mediconnect.consultation.dto.*;
import com.mediconnect.consultation.entity.Disease;
import com.mediconnect.consultation.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class OntologyService {

    private final SymptomRepository symptomRepository;
    private final DiseaseRepository diseaseRepository;
    private final MedicationRepository medicationRepository;
    private final DiseaseSymptomLinkRepository diseaseSymptomLinkRepository;

    public OntologyService(SymptomRepository symptomRepository,
                           DiseaseRepository diseaseRepository,
                           MedicationRepository medicationRepository,
                           DiseaseSymptomLinkRepository diseaseSymptomLinkRepository) {
        this.symptomRepository = symptomRepository;
        this.diseaseRepository = diseaseRepository;
        this.medicationRepository = medicationRepository;
        this.diseaseSymptomLinkRepository = diseaseSymptomLinkRepository;
    }

    public List<SymptomResponse> searchSymptoms(String term) {
        return symptomRepository.findByNameContainingIgnoreCaseOrNameRoContainingIgnoreCase(term, term).stream()
            .map(s -> new SymptomResponse(s.getId(), s.getName(), s.getCode(), s.getBodySystem()))
            .collect(Collectors.toList());
    }

    public List<DiseaseSuggestion> suggestDiseases(List<UUID> symptomIds) {
        if (symptomIds == null || symptomIds.isEmpty()) return List.of();
        int totalSymptoms = symptomIds.size();
        List<Object[]> results = diseaseSymptomLinkRepository.findTopDiseasesBySymptoms(symptomIds);
        List<DiseaseSuggestion> suggestions = new ArrayList<>();
        for (Object[] row : results) {
            UUID diseaseId = (UUID) row[0];
            double rawScore = ((Number) row[1]).doubleValue();
            double normalizedScore = rawScore / totalSymptoms;
            diseaseRepository.findById(diseaseId).ifPresent(disease ->
                suggestions.add(new DiseaseSuggestion(diseaseId, disease.getName(), disease.getNameRo(), disease.getIcd10Code(), normalizedScore))
            );
            if (suggestions.size() >= 5) break;
        }
        return suggestions;
    }

    public List<DiseaseResponse> searchDiseases(String term) {
        return diseaseRepository.findByNameContainingIgnoreCaseOrNameRoContainingIgnoreCase(term, term).stream()
            .map(d -> new DiseaseResponse(d.getId(), d.getName(), d.getNameRo(), d.getIcd10Code(), d.getCategory()))
            .collect(Collectors.toList());
    }

    public List<MedicationResponse> searchMedications(String term) {
        return medicationRepository.findByNameStartingWithIgnoreCaseOrderByNameAsc(term).stream()
            .map(m -> new MedicationResponse(m.getId(), m.getName(), m.getActiveSubstance(), m.getDosageForm(), m.getStandardDosage()))
            .collect(Collectors.toList());
    }
}
