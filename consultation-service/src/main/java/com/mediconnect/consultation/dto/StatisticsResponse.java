package com.mediconnect.consultation.dto;

import java.util.List;

public record StatisticsResponse(
    List<DiseaseFrequency>     diseaseFrequency,
    List<MonthlyTrend>         monthlyTrends,
    List<MedDiseaseHeat>       medicationHeatmap,
    SankeyData                 sankey,
    List<ReferralUrgency>      referralUrgency,
    List<MedicationFrequency>  topMedications,
    List<SymptomLink>          symptomNetwork,
    List<VitalsPerDisease>     vitalsPerDisease
) {
    public record DiseaseFrequency(String name, String nameRo, String icd10Code, String category, long count) {}

    public record MonthlyTrend(String diseaseName, String diseaseNameRo, int year, int month, long count) {}

    public record MedDiseaseHeat(String diseaseName, String diseaseNameRo, String medicationName, long count) {}

    public record SankeyData(long total, long completed, long withDiagnosis, long withPrescription, long withReferral, long withFollowUp) {}

    public record ReferralUrgency(String urgency, int year, int month, long count) {}

    public record MedicationFrequency(String medicationName, long count) {}

    public record SymptomLink(
        String diseaseId, String diseaseName, String diseaseNameRo,
        String symptomId, String symptomName, String symptomNameRo,
        double probability, boolean isPathognomonic
    ) {}

    public record VitalsPerDisease(
        String diseaseName, String diseaseNameRo,
        double avgTemperature, double avgGlucose,
        double avgSystolic, double avgDiastolic,
        long count
    ) {}
}
