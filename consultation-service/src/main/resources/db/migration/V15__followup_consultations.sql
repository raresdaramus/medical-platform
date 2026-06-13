-- ─────────────────────────────────────────────────────────────────────────────
-- V15: Add follow-up consultations for chronic diseases
-- Links originals via next_consultation_id so Sankey shows follow-up count
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  orig        RECORD;
  v_fid       UUID;
  v_diag_id   UUID;
  v_pres_id   UUID;
  v_follow_at TIMESTAMP;
BEGIN
  -- For each completed chronic-disease consultation (no follow-up yet), create one
  FOR orig IN
    SELECT DISTINCT ON (c.patient_id, diag.disease_id)
           c.id, c.doctor_id, c.patient_id, c.scheduled_at, diag.disease_id
    FROM   consultations c
    JOIN   diagnoses     diag ON diag.consultation_id = c.id
    WHERE  c.status               = 'COMPLETED'
      AND  c.next_consultation_id IS NULL
      AND  diag.disease_id IN (
             'b2000001-0000-0000-0000-000000000011', -- Hypertension
             'b2000001-0000-0000-0000-000000000014', -- Anxiety
             'b2000001-0000-0000-0000-000000000006', -- Gastritis
             'b2000001-0000-0000-0000-000000000008', -- Low back pain
             'b2000001-0000-0000-0000-000000000003', -- Migraine
             'b2000001-0000-0000-0000-000000000012'  -- Allergy
           )
    ORDER  BY c.patient_id, diag.disease_id, c.scheduled_at DESC
  LOOP
    v_fid       := gen_random_uuid();
    v_follow_at := orig.scheduled_at + INTERVAL '3 weeks';

    -- ── Follow-up consultation ────────────────────────────────────────────────
    INSERT INTO consultations (
      id, doctor_id, patient_id, consultation_type, status,
      scheduled_at, started_at, completed_at,
      slot_duration_minutes, notes_doctor, created_at
    ) VALUES (
      v_fid, orig.doctor_id, orig.patient_id, 'IN_PERSON', 'COMPLETED',
      v_follow_at,
      v_follow_at + INTERVAL '5 minutes',
      v_follow_at + INTERVAL '30 minutes',
      30,
      CASE orig.disease_id
        WHEN 'b2000001-0000-0000-0000-000000000011'
          THEN 'Control tensiune. Valorile TA îmbunătățite sub tratament. Continuare schemă actuală.'
        WHEN 'b2000001-0000-0000-0000-000000000014'
          THEN 'Reevaluare anxietate. Pacient cu ameliorare parțială. Continuare terapie.'
        WHEN 'b2000001-0000-0000-0000-000000000006'
          THEN 'Control gastrită. Simptome ameliorate sub IPP. Continuare tratament 2 săptămâni.'
        WHEN 'b2000001-0000-0000-0000-000000000008'
          THEN 'Reevaluare lombalgie. Durere redusă după fizioterapie. Continuare exerciții.'
        WHEN 'b2000001-0000-0000-0000-000000000003'
          THEN 'Control migrenă. Frecvența atacurilor redusă. Tratament profilactic eficient.'
        ELSE 'Control periodic. Evoluție favorabilă sub tratament.'
      END,
      v_follow_at - INTERVAL '1 day'
    );

    -- Link original → follow-up
    UPDATE consultations SET next_consultation_id = v_fid WHERE id = orig.id;

    -- ── Intake form ───────────────────────────────────────────────────────────
    INSERT INTO patient_intake_forms (
      id, consultation_id, chief_complaint, symptom_duration,
      temperature, blood_pressure, blood_glucose,
      body_zone, pain_intensity, had_symptoms_before, submitted_at
    ) VALUES (
      gen_random_uuid(), v_fid,
      'Control periodic - urmărire tratament',
      'Cronic - sub tratament',
      ROUND((36.5 + random() * 0.6)::NUMERIC, 1),
      CASE orig.disease_id
        WHEN 'b2000001-0000-0000-0000-000000000011'
          THEN (130 + (random()*15)::INT)::TEXT || '/' || (82 + (random()*10)::INT)::TEXT
        ELSE (112 + (random()*15)::INT)::TEXT || '/' || (72 + (random()*10)::INT)::TEXT
      END,
      ROUND((82 + random() * 18)::NUMERIC, 1),
      CASE orig.disease_id
        WHEN 'b2000001-0000-0000-0000-000000000011' THEN 'Cardiovascular'
        WHEN 'b2000001-0000-0000-0000-000000000014' THEN 'Psihiatric'
        WHEN 'b2000001-0000-0000-0000-000000000006' THEN 'Digestiv'
        WHEN 'b2000001-0000-0000-0000-000000000008' THEN 'Locomotor'
        WHEN 'b2000001-0000-0000-0000-000000000003' THEN 'Neurologic'
        ELSE 'General'
      END,
      CASE WHEN random() < 0.5 THEN 'Ușoară' ELSE 'Absentă' END,
      true,
      v_follow_at - INTERVAL '30 minutes'
    );

    -- ── Diagnosis ─────────────────────────────────────────────────────────────
    v_diag_id := gen_random_uuid();
    INSERT INTO diagnoses (id, consultation_id, disease_id, icd10_code, confidence, diagnosis_date, notes)
    VALUES (
      v_diag_id, v_fid, orig.disease_id,
      CASE orig.disease_id
        WHEN 'b2000001-0000-0000-0000-000000000011' THEN 'I10'
        WHEN 'b2000001-0000-0000-0000-000000000014' THEN 'F41'
        WHEN 'b2000001-0000-0000-0000-000000000006' THEN 'K29'
        WHEN 'b2000001-0000-0000-0000-000000000008' THEN 'M54.5'
        WHEN 'b2000001-0000-0000-0000-000000000003' THEN 'G43'
        WHEN 'b2000001-0000-0000-0000-000000000012' THEN 'J30'
        ELSE NULL
      END,
      'CONFIRMED',
      v_follow_at::DATE,
      'Control periodic. Menținere tratament.'
    );

    -- ── Prescription (continuare tratament cronic) ────────────────────────────
    v_pres_id := gen_random_uuid();
    INSERT INTO prescriptions (id, consultation_id, diagnosis_id, custom_instructions, valid_from, valid_until, issued_at)
    VALUES (
      v_pres_id, v_fid, v_diag_id,
      'Continuare tratament. Revenire la 4 săptămâni dacă simptomele persistă.',
      v_follow_at::DATE,
      v_follow_at::DATE + 30,
      v_follow_at + INTERVAL '28 minutes'
    );

    INSERT INTO prescription_items (id, prescription_id, medication_name, dosage, frequency, duration_days, quantity)
    VALUES (
      gen_random_uuid(), v_pres_id,
      CASE orig.disease_id
        WHEN 'b2000001-0000-0000-0000-000000000011' THEN 'Amlodipine'
        WHEN 'b2000001-0000-0000-0000-000000000014' THEN 'Buspirone'
        WHEN 'b2000001-0000-0000-0000-000000000006' THEN 'Omeprazol'
        WHEN 'b2000001-0000-0000-0000-000000000008' THEN 'Ibuprofen'
        WHEN 'b2000001-0000-0000-0000-000000000003' THEN 'Ibuprofen'
        ELSE 'Loratadine'
      END,
      CASE orig.disease_id
        WHEN 'b2000001-0000-0000-0000-000000000011' THEN '5mg'
        WHEN 'b2000001-0000-0000-0000-000000000014' THEN '10mg'
        WHEN 'b2000001-0000-0000-0000-000000000006' THEN '20mg'
        ELSE '400mg'
      END,
      CASE orig.disease_id
        WHEN 'b2000001-0000-0000-0000-000000000011' THEN 'o dată/zi'
        WHEN 'b2000001-0000-0000-0000-000000000014' THEN 'o dată/zi'
        WHEN 'b2000001-0000-0000-0000-000000000006' THEN 'dimineața'
        ELSE 'la nevoie'
      END,
      30, 30
    );

  END LOOP;
END $$;
