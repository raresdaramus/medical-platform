package com.mediconnect.consultation.service;

import com.mediconnect.consultation.dto.StatisticsResponse;
import com.mediconnect.consultation.dto.StatisticsResponse.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class StatisticsService {

    @PersistenceContext
    private EntityManager em;

    public StatisticsResponse getStatistics() {
        return new StatisticsResponse(
            diseaseFrequency(),
            monthlyTrends(),
            medicationHeatmap(),
            sankeyData(),
            referralUrgency(),
            topMedications(),
            symptomNetwork(),
            vitalsPerDisease()
        );
    }

    // ── Disease frequency (treemap) ───────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<DiseaseFrequency> diseaseFrequency() {
        return em.createNativeQuery("""
            SELECT d.name, d.name_ro, d.icd10_code, d.category, COUNT(diag.id) AS cnt
            FROM diagnoses diag
            JOIN diseases d ON diag.disease_id = d.id
            GROUP BY d.id, d.name, d.name_ro, d.icd10_code, d.category
            ORDER BY cnt DESC
            """)
            .getResultList()
            .stream()
            .map(r -> {
                Object[] row = (Object[]) r;
                return new DiseaseFrequency(
                    str(row[0]), str(row[1]), str(row[2]), str(row[3]), num(row[4])
                );
            })
            .toList();
    }

    // ── Monthly trends (line chart, top 6 diseases) ───────────────────────────

    @SuppressWarnings("unchecked")
    private List<MonthlyTrend> monthlyTrends() {
        return em.createNativeQuery("""
            SELECT d.name, d.name_ro,
                   EXTRACT(YEAR  FROM diag.diagnosis_date)::int AS yr,
                   EXTRACT(MONTH FROM diag.diagnosis_date)::int AS mo,
                   COUNT(*) AS cnt
            FROM diagnoses diag
            JOIN diseases d ON diag.disease_id = d.id
            WHERE d.id IN (
                SELECT disease_id FROM diagnoses
                WHERE disease_id IS NOT NULL
                GROUP BY disease_id
                ORDER BY COUNT(*) DESC
                LIMIT 6
            )
            GROUP BY d.id, d.name, d.name_ro, yr, mo
            ORDER BY yr, mo
            """)
            .getResultList()
            .stream()
            .map(r -> {
                Object[] row = (Object[]) r;
                return new MonthlyTrend(str(row[0]), str(row[1]), ((Number) row[2]).intValue(), ((Number) row[3]).intValue(), num(row[4]));
            })
            .toList();
    }

    // ── Medication × Disease heatmap ──────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<MedDiseaseHeat> medicationHeatmap() {
        return em.createNativeQuery("""
            SELECT dis.name, dis.name_ro, pi.medication_name, COUNT(*) AS cnt
            FROM prescription_items pi
            JOIN prescriptions p   ON pi.prescription_id = p.id
            JOIN diagnoses     diag ON p.diagnosis_id    = diag.id
            JOIN diseases      dis  ON diag.disease_id   = dis.id
            WHERE pi.medication_name IS NOT NULL
            GROUP BY dis.id, dis.name, dis.name_ro, pi.medication_name
            ORDER BY cnt DESC
            LIMIT 120
            """)
            .getResultList()
            .stream()
            .map(r -> {
                Object[] row = (Object[]) r;
                return new MedDiseaseHeat(str(row[0]), str(row[1]), str(row[2]), num(row[3]));
            })
            .toList();
    }

    // ── Sankey (consultation outcomes) ────────────────────────────────────────

    private SankeyData sankeyData() {
        long total = ((Number) em.createNativeQuery(
            "SELECT COUNT(*) FROM consultations").getSingleResult()).longValue();

        long completed = ((Number) em.createNativeQuery(
            "SELECT COUNT(*) FROM consultations WHERE status = 'COMPLETED'").getSingleResult()).longValue();

        long withDiagnosis = ((Number) em.createNativeQuery("""
            SELECT COUNT(DISTINCT consultation_id) FROM diagnoses
            WHERE consultation_id IN (SELECT id FROM consultations WHERE status = 'COMPLETED')
            """).getSingleResult()).longValue();

        long withPrescription = ((Number) em.createNativeQuery("""
            SELECT COUNT(DISTINCT consultation_id) FROM prescriptions
            WHERE consultation_id IN (SELECT id FROM consultations WHERE status = 'COMPLETED')
            """).getSingleResult()).longValue();

        long withReferral = ((Number) em.createNativeQuery("""
            SELECT COUNT(DISTINCT consultation_id) FROM referrals
            WHERE consultation_id IN (SELECT id FROM consultations WHERE status = 'COMPLETED')
            """).getSingleResult()).longValue();

        long withFollowUp = ((Number) em.createNativeQuery("""
            SELECT COUNT(*) FROM consultations
            WHERE status = 'COMPLETED' AND next_consultation_id IS NOT NULL
            """).getSingleResult()).longValue();

        return new SankeyData(total, completed, withDiagnosis, withPrescription, withReferral, withFollowUp);
    }

    // ── Referral urgency by month ─────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<ReferralUrgency> referralUrgency() {
        return em.createNativeQuery("""
            SELECT urgency,
                   EXTRACT(YEAR  FROM issued_at)::int AS yr,
                   EXTRACT(MONTH FROM issued_at)::int AS mo,
                   COUNT(*) AS cnt
            FROM referrals
            GROUP BY urgency, yr, mo
            ORDER BY yr, mo
            """)
            .getResultList()
            .stream()
            .map(r -> {
                Object[] row = (Object[]) r;
                return new ReferralUrgency(str(row[0]), ((Number) row[1]).intValue(), ((Number) row[2]).intValue(), num(row[3]));
            })
            .toList();
    }

    // ── Top medications (Pareto) ──────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<MedicationFrequency> topMedications() {
        return em.createNativeQuery("""
            SELECT medication_name, COUNT(*) AS cnt
            FROM prescription_items
            WHERE medication_name IS NOT NULL
            GROUP BY medication_name
            ORDER BY cnt DESC
            LIMIT 15
            """)
            .getResultList()
            .stream()
            .map(r -> {
                Object[] row = (Object[]) r;
                return new MedicationFrequency(str(row[0]), num(row[1]));
            })
            .toList();
    }

    // ── Symptom-Disease network (from ontology) ───────────────────────────────

    @SuppressWarnings("unchecked")
    private List<SymptomLink> symptomNetwork() {
        return em.createNativeQuery("""
            SELECT d.id::text, d.name, d.name_ro,
                   s.id::text, s.name, s.name_ro,
                   dsl.probability, dsl.is_pathognomonic
            FROM disease_symptom_links dsl
            JOIN diseases d ON dsl.disease_id = d.id
            JOIN symptoms  s ON dsl.symptom_id  = s.id
            ORDER BY d.name, dsl.probability DESC
            """)
            .getResultList()
            .stream()
            .map(r -> {
                Object[] row = (Object[]) r;
                return new SymptomLink(
                    str(row[0]), str(row[1]), str(row[2]),
                    str(row[3]), str(row[4]), str(row[5]),
                    ((Number) row[6]).doubleValue(),
                    Boolean.TRUE.equals(row[7])
                );
            })
            .toList();
    }

    // ── Vitals per disease ────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<VitalsPerDisease> vitalsPerDisease() {
        return em.createNativeQuery("""
            SELECT dis.name, dis.name_ro,
                   ROUND(AVG(pif.temperature)::numeric, 1)   AS avg_temp,
                   ROUND(AVG(pif.blood_glucose)::numeric, 1) AS avg_glucose,
                   ROUND(AVG(CASE WHEN pif.blood_pressure IS NOT NULL AND pif.blood_pressure LIKE '%/%'
                                  THEN SPLIT_PART(pif.blood_pressure, '/', 1)::numeric END)::numeric, 0) AS avg_systolic,
                   ROUND(AVG(CASE WHEN pif.blood_pressure IS NOT NULL AND pif.blood_pressure LIKE '%/%'
                                  THEN SPLIT_PART(pif.blood_pressure, '/', 2)::numeric END)::numeric, 0) AS avg_diastolic,
                   COUNT(*) AS cnt
            FROM patient_intake_forms pif
            JOIN consultations c    ON pif.consultation_id = c.id
            JOIN diagnoses     diag ON diag.consultation_id = c.id
            JOIN diseases      dis  ON diag.disease_id      = dis.id
            WHERE pif.temperature IS NOT NULL OR pif.blood_glucose IS NOT NULL OR pif.blood_pressure IS NOT NULL
            GROUP BY dis.id, dis.name, dis.name_ro
            HAVING COUNT(*) >= 1
            ORDER BY cnt DESC
            """)
            .getResultList()
            .stream()
            .map(r -> {
                Object[] row = (Object[]) r;
                double temp     = row[2] != null ? ((Number) row[2]).doubleValue() : 0;
                double gluc     = row[3] != null ? ((Number) row[3]).doubleValue() : 0;
                double systolic = row[4] != null ? ((Number) row[4]).doubleValue() : 0;
                double diastolic= row[5] != null ? ((Number) row[5]).doubleValue() : 0;
                return new VitalsPerDisease(str(row[0]), str(row[1]), temp, gluc, systolic, diastolic, num(row[6]));
            })
            .toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static String str(Object o) { return o != null ? o.toString() : null; }
    private static long   num(Object o) { return o != null ? ((Number) o).longValue() : 0L; }
}
