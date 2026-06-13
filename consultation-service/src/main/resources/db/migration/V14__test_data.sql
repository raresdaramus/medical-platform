-- ─────────────────────────────────────────────────────────────────────────────
-- V14: Realistic test data for statistics charts
-- 200+ consultations across 12 months with seasonal patterns
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TEMP TABLE _sched (
  base_date  DATE,
  disease_id UUID,
  n          INT,
  with_ref   BOOLEAN
);

INSERT INTO _sched (base_date, disease_id, n, with_ref) VALUES
  -- Jun 2025: GI season
  ('2025-06-05', 'b2000001-0000-0000-0000-000000000015', 6, false),
  ('2025-06-12', 'b2000001-0000-0000-0000-000000000007', 4, false),
  ('2025-06-20', 'b2000001-0000-0000-0000-000000000008', 3, true),
  ('2025-06-25', 'b2000001-0000-0000-0000-000000000006', 3, false),
  -- Jul 2025: peak GI
  ('2025-07-03', 'b2000001-0000-0000-0000-000000000015', 8, false),
  ('2025-07-10', 'b2000001-0000-0000-0000-000000000007', 5, true),
  ('2025-07-17', 'b2000001-0000-0000-0000-000000000013', 4, false),
  ('2025-07-24', 'b2000001-0000-0000-0000-000000000008', 3, false),
  -- Aug 2025
  ('2025-08-04', 'b2000001-0000-0000-0000-000000000015', 7, false),
  ('2025-08-11', 'b2000001-0000-0000-0000-000000000007', 5, true),
  ('2025-08-18', 'b2000001-0000-0000-0000-000000000013', 4, false),
  ('2025-08-25', 'b2000001-0000-0000-0000-000000000012', 3, false),
  -- Sep 2025: transition
  ('2025-09-03', 'b2000001-0000-0000-0000-000000000008', 5, true),
  ('2025-09-10', 'b2000001-0000-0000-0000-000000000006', 4, false),
  ('2025-09-17', 'b2000001-0000-0000-0000-000000000014', 4, true),
  ('2025-09-24', 'b2000001-0000-0000-0000-000000000011', 3, true),
  -- Oct 2025: early respiratory
  ('2025-10-06', 'b2000001-0000-0000-0000-000000000001', 5, false),
  ('2025-10-13', 'b2000001-0000-0000-0000-000000000002', 4, false),
  ('2025-10-20', 'b2000001-0000-0000-0000-000000000003', 3, false),
  ('2025-10-27', 'b2000001-0000-0000-0000-000000000009', 3, false),
  -- Nov 2025: flu season starts
  ('2025-11-03', 'b2000001-0000-0000-0000-000000000001', 8, false),
  ('2025-11-10', 'b2000001-0000-0000-0000-000000000002', 6, false),
  ('2025-11-17', 'b2000001-0000-0000-0000-000000000005', 4, false),
  ('2025-11-24', 'b2000001-0000-0000-0000-000000000009', 4, true),
  -- Dec 2025: peak winter
  ('2025-12-01', 'b2000001-0000-0000-0000-000000000001', 10, false),
  ('2025-12-08', 'b2000001-0000-0000-0000-000000000002',  8, false),
  ('2025-12-15', 'b2000001-0000-0000-0000-000000000009',  5, true),
  ('2025-12-22', 'b2000001-0000-0000-0000-000000000010',  4, true),
  ('2025-12-29', 'b2000001-0000-0000-0000-000000000005',  3, false),
  -- Jan 2026: peak flu
  ('2026-01-05', 'b2000001-0000-0000-0000-000000000001', 9, false),
  ('2026-01-12', 'b2000001-0000-0000-0000-000000000002', 7, false),
  ('2026-01-19', 'b2000001-0000-0000-0000-000000000009', 5, true),
  ('2026-01-26', 'b2000001-0000-0000-0000-000000000010', 4, true),
  -- Feb 2026
  ('2026-02-02', 'b2000001-0000-0000-0000-000000000001', 7, false),
  ('2026-02-09', 'b2000001-0000-0000-0000-000000000002', 6, false),
  ('2026-02-16', 'b2000001-0000-0000-0000-000000000005', 4, false),
  ('2026-02-23', 'b2000001-0000-0000-0000-000000000004', 4, false),
  -- Mar 2026: post-flu, spring starts
  ('2026-03-02', 'b2000001-0000-0000-0000-000000000002', 5, false),
  ('2026-03-09', 'b2000001-0000-0000-0000-000000000004', 6, false),
  ('2026-03-16', 'b2000001-0000-0000-0000-000000000003', 4, false),
  ('2026-03-23', 'b2000001-0000-0000-0000-000000000012', 4, false),
  -- Apr 2026: allergy peak
  ('2026-04-06', 'b2000001-0000-0000-0000-000000000012', 9, false),
  ('2026-04-13', 'b2000001-0000-0000-0000-000000000004', 5, false),
  ('2026-04-20', 'b2000001-0000-0000-0000-000000000003', 4, false),
  ('2026-04-27', 'b2000001-0000-0000-0000-000000000006', 3, false),
  -- May 2026
  ('2026-05-05', 'b2000001-0000-0000-0000-000000000012', 7, false),
  ('2026-05-12', 'b2000001-0000-0000-0000-000000000007', 4, true),
  ('2026-05-19', 'b2000001-0000-0000-0000-000000000014', 4, true),
  ('2026-05-24', 'b2000001-0000-0000-0000-000000000011', 3, true);

DO $$
DECLARE
  -- ── Disease IDs ────────────────────────────────────────────────────────────
  D_FLU    CONSTANT UUID := 'b2000001-0000-0000-0000-000000000001';
  D_COLD   CONSTANT UUID := 'b2000001-0000-0000-0000-000000000002';
  D_MIG    CONSTANT UUID := 'b2000001-0000-0000-0000-000000000003';
  D_SIN    CONSTANT UUID := 'b2000001-0000-0000-0000-000000000004';
  D_PHAR   CONSTANT UUID := 'b2000001-0000-0000-0000-000000000005';
  D_GAST   CONSTANT UUID := 'b2000001-0000-0000-0000-000000000006';
  D_UTI    CONSTANT UUID := 'b2000001-0000-0000-0000-000000000007';
  D_BACK   CONSTANT UUID := 'b2000001-0000-0000-0000-000000000008';
  D_BRON   CONSTANT UUID := 'b2000001-0000-0000-0000-000000000009';
  D_PNEU   CONSTANT UUID := 'b2000001-0000-0000-0000-000000000010';
  D_HYP    CONSTANT UUID := 'b2000001-0000-0000-0000-000000000011';
  D_ALL    CONSTANT UUID := 'b2000001-0000-0000-0000-000000000012';
  D_DERM   CONSTANT UUID := 'b2000001-0000-0000-0000-000000000013';
  D_ANX    CONSTANT UUID := 'b2000001-0000-0000-0000-000000000014';
  D_GE     CONSTANT UUID := 'b2000001-0000-0000-0000-000000000015';

  -- ── Symptom IDs ────────────────────────────────────────────────────────────
  S_FEVER   CONSTANT UUID := 'a1000001-0000-0000-0000-000000000001';
  S_CHILLS  CONSTANT UUID := 'a1000001-0000-0000-0000-000000000002';
  S_FATIGUE CONSTANT UUID := 'a1000001-0000-0000-0000-000000000003';
  S_DIZ     CONSTANT UUID := 'a1000001-0000-0000-0000-000000000004';
  S_NAUSEA  CONSTANT UUID := 'a1000001-0000-0000-0000-000000000005';
  S_HEAD    CONSTANT UUID := 'a1000001-0000-0000-0000-000000000010';
  S_BNOSE   CONSTANT UUID := 'a1000001-0000-0000-0000-000000000013';
  S_RNOSE   CONSTANT UUID := 'a1000001-0000-0000-0000-000000000014';
  S_SINUS   CONSTANT UUID := 'a1000001-0000-0000-0000-000000000015';
  S_THROAT  CONSTANT UUID := 'a1000001-0000-0000-0000-000000000020';
  S_COUGH   CONSTANT UUID := 'a1000001-0000-0000-0000-000000000025';
  S_CHEST   CONSTANT UUID := 'a1000001-0000-0000-0000-000000000030';
  S_DYSP    CONSTANT UUID := 'a1000001-0000-0000-0000-000000000032';
  S_ABDOM   CONSTANT UUID := 'a1000001-0000-0000-0000-000000000040';
  S_VOMIT   CONSTANT UUID := 'a1000001-0000-0000-0000-000000000041';
  S_LBACK   CONSTANT UUID := 'a1000001-0000-0000-0000-000000000050';
  S_RASH    CONSTANT UUID := 'a1000001-0000-0000-0000-000000000080';
  S_ITCH    CONSTANT UUID := 'a1000001-0000-0000-0000-000000000081';
  S_DYSUR   CONSTANT UUID := 'a1000001-0000-0000-0000-000000000090';
  S_MUSCLE  CONSTANT UUID := 'a1000001-0000-0000-0000-000000000102';

  -- ── Loop variables ─────────────────────────────────────────────────────────
  r        RECORD;
  v_cid    UUID;
  v_did    UUID;
  v_pid    UUID;
  v_doc    UUID;
  v_sched  TIMESTAMP;
  v_diag_id UUID;
  v_pres_id UUID;
  i        INT;

BEGIN

  FOR r IN SELECT * FROM _sched ORDER BY base_date LOOP
    FOR i IN 1 .. r.n LOOP

      v_cid   := gen_random_uuid();
      v_doc   := ('d0c00001-0000-0000-0000-' || lpad(((i % 3) + 1)::TEXT, 12, '0'))::UUID;
      v_pid   := ('b0000001-0000-0000-0000-' || lpad((((EXTRACT(EPOCH FROM r.base_date)::INT / 86400) * 7 + i) % 40 + 1)::TEXT, 12, '0'))::UUID;
      v_sched := (r.base_date + (i - 1) * INTERVAL '1 hour');

      -- ── Consultation ──────────────────────────────────────────────────────
      INSERT INTO consultations (id, doctor_id, patient_id, consultation_type, status,
        scheduled_at, started_at, completed_at, slot_duration_minutes, notes_doctor, created_at)
      VALUES (
        v_cid, v_doc, v_pid, 'IN_PERSON', 'COMPLETED',
        v_sched, v_sched + INTERVAL '5 minutes',
        v_sched + INTERVAL '35 minutes', 30,
        CASE r.disease_id
          WHEN D_FLU   THEN 'Pacient cu sindrom gripal tipic. Repaus la domiciliu recomandat.'
          WHEN D_COLD  THEN 'Simptomatologie specifică răcelii comune. Tratament simptomatic.'
          WHEN D_PNEU  THEN 'Pneumonie confirmată clinic. Antibiotic prescris, monitoring necesar.'
          WHEN D_BRON  THEN 'Bronșită acută virală. Expectorant și antitusiv recomandate.'
          WHEN D_PHAR  THEN 'Faringită acută. Gargarisme și antibiotic în caz de etiologie bacteriană.'
          WHEN D_SIN   THEN 'Sinuzită acută. Decongestionant nazal și antibiotic.'
          WHEN D_MIG   THEN 'Migrenă cu aură. Tratament specific prescris.'
          WHEN D_GAST  THEN 'Gastrită acută. Dietă blandă și inhibitor de pompă protonică.'
          WHEN D_UTI   THEN 'Infecție urinară joasă. Antibiotic prescris.'
          WHEN D_BACK  THEN 'Lombalgie acută. Antiinflamator și miorelaxant.'
          WHEN D_HYP   THEN 'Hipertensiune controlată parțial. Ajustare tratament.'
          WHEN D_ALL   THEN 'Alergie respiratorie sezonieră. Antihistaminic prescris.'
          WHEN D_DERM  THEN 'Dermatită de contact. Corticosteroizi topic.'
          WHEN D_ANX   THEN 'Anxietate generalizată. Psihoterapie recomandată.'
          WHEN D_GE    THEN 'Gastroenterită acută. Hidratare orală și probiotice.'
          ELSE 'Consultație completată.'
        END,
        r.base_date - INTERVAL '1 day'
      );

      -- ── Intake form with realistic vitals ─────────────────────────────────
      INSERT INTO patient_intake_forms (
        id, consultation_id, chief_complaint, symptom_duration,
        temperature, blood_pressure, blood_glucose,
        body_zone, pain_intensity, had_symptoms_before, submitted_at
      ) VALUES (
        gen_random_uuid(), v_cid,
        CASE r.disease_id
          WHEN D_FLU   THEN 'Febră mare, frisoane, dureri musculare și oboseală extremă'
          WHEN D_COLD  THEN 'Nas înfundat, secreții nazale și durere în gât'
          WHEN D_PNEU  THEN 'Tuse productivă, febră, dificultate la respirație'
          WHEN D_BRON  THEN 'Tuse persistentă cu expectorație, ușoară febră'
          WHEN D_PHAR  THEN 'Durere acută în gât, dificultate la înghițire'
          WHEN D_SIN   THEN 'Durere la nivelul sinusurilor, nas înfundat'
          WHEN D_MIG   THEN 'Cefalee pulsatilă unilaterală, sensibilitate la lumină'
          WHEN D_GAST  THEN 'Arsuri gastrice, durere epigastrică, greață'
          WHEN D_UTI   THEN 'Usturimi la urinare, urinare frecventă'
          WHEN D_BACK  THEN 'Durere lombară acută la mișcare'
          WHEN D_HYP   THEN 'Amețeală, cefalee occipitală'
          WHEN D_ALL   THEN 'Nas înfundat, strănuți frecvente, mâncărime nazală'
          WHEN D_DERM  THEN 'Erupție cutanată, mâncărime intensă'
          WHEN D_ANX   THEN 'Anxietate, insomnie, palpitații'
          WHEN D_GE    THEN 'Diaree, vărsături, crampe abdominale'
          ELSE 'Simptome nespecifice'
        END,
        CASE r.disease_id
          WHEN D_FLU  THEN '2-3 zile'  WHEN D_COLD THEN '3-5 zile'
          WHEN D_PNEU THEN '4-7 zile'  WHEN D_BRON THEN '5-7 zile'
          WHEN D_PHAR THEN '2-3 zile'  WHEN D_SIN  THEN '5-10 zile'
          WHEN D_MIG  THEN '4-72 ore'  WHEN D_GAST THEN '1-2 săptămâni'
          WHEN D_UTI  THEN '1-3 zile'  WHEN D_BACK THEN '2-5 zile'
          WHEN D_HYP  THEN 'Cronic'    WHEN D_ALL  THEN 'Sezonier'
          WHEN D_DERM THEN '3-7 zile'  WHEN D_ANX  THEN 'Luni'
          WHEN D_GE   THEN '1-2 zile'  ELSE '2-3 zile'
        END,
        CASE r.disease_id
          WHEN D_FLU   THEN ROUND((38.5 + random() * 1.3)::NUMERIC, 1)
          WHEN D_COLD  THEN ROUND((37.2 + random() * 0.8)::NUMERIC, 1)
          WHEN D_PNEU  THEN ROUND((38.8 + random() * 1.2)::NUMERIC, 1)
          WHEN D_BRON  THEN ROUND((37.6 + random() * 0.9)::NUMERIC, 1)
          WHEN D_PHAR  THEN ROUND((37.8 + random() * 0.7)::NUMERIC, 1)
          WHEN D_SIN   THEN ROUND((37.3 + random() * 0.8)::NUMERIC, 1)
          WHEN D_GE    THEN ROUND((37.8 + random() * 1.0)::NUMERIC, 1)
          WHEN D_UTI   THEN ROUND((37.4 + random() * 1.0)::NUMERIC, 1)
          ELSE              ROUND((36.7 + random() * 0.5)::NUMERIC, 1)
        END,
        CASE r.disease_id
          WHEN D_HYP  THEN (140 + (random()*20)::INT)::TEXT || '/' || (90 + (random()*15)::INT)::TEXT
          WHEN D_ANX  THEN (130 + (random()*15)::INT)::TEXT || '/' || (85 + (random()*10)::INT)::TEXT
          ELSE             (110 + (random()*20)::INT)::TEXT || '/' || (70 + (random()*15)::INT)::TEXT
        END,
        CASE r.disease_id
          WHEN D_HYP  THEN ROUND((100 + random() * 30)::NUMERIC, 1)
          WHEN D_GAST THEN ROUND(( 95 + random() * 25)::NUMERIC, 1)
          ELSE             ROUND(( 82 + random() * 18)::NUMERIC, 1)
        END,
        CASE r.disease_id
          WHEN D_FLU  THEN 'Respirator' WHEN D_COLD THEN 'Respirator'
          WHEN D_PNEU THEN 'Respirator' WHEN D_BRON THEN 'Respirator'
          WHEN D_PHAR THEN 'Respirator' WHEN D_SIN  THEN 'Respirator'
          WHEN D_ALL  THEN 'Respirator' WHEN D_MIG  THEN 'Neurologic'
          WHEN D_HYP  THEN 'Cardiovascular'
          WHEN D_ANX  THEN 'Psihiatric'
          WHEN D_GAST THEN 'Digestiv'  WHEN D_GE   THEN 'Digestiv'
          WHEN D_UTI  THEN 'Urinar'    WHEN D_BACK THEN 'Locomotor'
          WHEN D_DERM THEN 'Dermatologic'
          ELSE 'General'
        END,
        CASE (i % 3)
          WHEN 0 THEN 'Moderată' WHEN 1 THEN 'Ușoară' ELSE 'Severă'
        END,
        (i % 2 = 0),
        v_sched - INTERVAL '30 minutes'
      );

      -- ── Consultation symptoms (2-3 per case) ──────────────────────────────
      INSERT INTO consultation_symptoms (id, consultation_id, symptom_id, severity, onset_date, reported_by)
      VALUES (gen_random_uuid(), v_cid,
        CASE r.disease_id
          WHEN D_FLU  THEN S_FEVER  WHEN D_COLD THEN S_RNOSE
          WHEN D_PNEU THEN S_DYSP   WHEN D_BRON THEN S_COUGH
          WHEN D_PHAR THEN S_THROAT WHEN D_SIN  THEN S_SINUS
          WHEN D_MIG  THEN S_HEAD   WHEN D_GAST THEN S_ABDOM
          WHEN D_UTI  THEN S_DYSUR  WHEN D_BACK THEN S_LBACK
          WHEN D_HYP  THEN S_HEAD   WHEN D_ALL  THEN S_RNOSE
          WHEN D_DERM THEN S_RASH   WHEN D_ANX  THEN S_DIZ
          WHEN D_GE   THEN S_VOMIT  ELSE S_FATIGUE
        END,
        CASE (i % 3) WHEN 0 THEN 'MODERATE' WHEN 1 THEN 'MILD' ELSE 'SEVERE' END,
        r.base_date - 2,
        CASE (i % 2) WHEN 0 THEN 'PATIENT' ELSE 'DOCTOR' END
      );
      INSERT INTO consultation_symptoms (id, consultation_id, symptom_id, severity, onset_date, reported_by)
      VALUES (gen_random_uuid(), v_cid,
        CASE r.disease_id
          WHEN D_FLU  THEN S_MUSCLE WHEN D_COLD THEN S_BNOSE
          WHEN D_PNEU THEN S_FEVER  WHEN D_BRON THEN S_FEVER
          WHEN D_PHAR THEN S_FEVER  WHEN D_SIN  THEN S_BNOSE
          WHEN D_MIG  THEN S_NAUSEA WHEN D_GAST THEN S_NAUSEA
          WHEN D_UTI  THEN S_FEVER  WHEN D_BACK THEN S_FATIGUE
          WHEN D_HYP  THEN S_DIZ    WHEN D_ALL  THEN S_BNOSE
          WHEN D_DERM THEN S_ITCH   WHEN D_ANX  THEN S_FATIGUE
          WHEN D_GE   THEN S_ABDOM  ELSE S_HEAD
        END,
        CASE (i % 3) WHEN 0 THEN 'MILD' WHEN 1 THEN 'MODERATE' ELSE 'MILD' END,
        r.base_date - 1,
        'PATIENT'
      );
      IF i % 2 = 0 THEN
        INSERT INTO consultation_symptoms (id, consultation_id, symptom_id, severity, onset_date, reported_by)
        VALUES (gen_random_uuid(), v_cid,
          CASE r.disease_id
            WHEN D_FLU  THEN S_COUGH   WHEN D_COLD THEN S_COUGH
            WHEN D_PNEU THEN S_COUGH   WHEN D_BRON THEN S_CHEST
            WHEN D_PHAR THEN S_COUGH   WHEN D_SIN  THEN S_HEAD
            WHEN D_MIG  THEN S_FATIGUE WHEN D_GAST THEN S_VOMIT
            WHEN D_UTI  THEN S_ABDOM   WHEN D_BACK THEN S_LBACK
            WHEN D_HYP  THEN S_CHEST   WHEN D_ALL  THEN S_ITCH
            WHEN D_DERM THEN S_FATIGUE WHEN D_ANX  THEN S_NAUSEA
            WHEN D_GE   THEN S_FEVER   ELSE S_COUGH
          END,
          'MILD',
          r.base_date - 1,
          'PATIENT'
        );
      END IF;

      -- ── Diagnosis ─────────────────────────────────────────────────────────
      v_diag_id := gen_random_uuid();
      INSERT INTO diagnoses (id, consultation_id, disease_id, icd10_code, confidence, diagnosis_date, notes)
      VALUES (
        v_diag_id, v_cid, r.disease_id,
        CASE r.disease_id
          WHEN D_FLU  THEN 'J11'    WHEN D_COLD THEN 'J00'
          WHEN D_MIG  THEN 'G43'    WHEN D_SIN  THEN 'J32'
          WHEN D_PHAR THEN 'J02'    WHEN D_GAST THEN 'K29'
          WHEN D_UTI  THEN 'N39.0'  WHEN D_BACK THEN 'M54.5'
          WHEN D_BRON THEN 'J20'    WHEN D_PNEU THEN 'J18'
          WHEN D_HYP  THEN 'I10'    WHEN D_ALL  THEN 'J30'
          WHEN D_DERM THEN 'L30'    WHEN D_ANX  THEN 'F41'
          WHEN D_GE   THEN 'A09'    ELSE NULL
        END,
        CASE (i % 4) WHEN 0 THEN 'SUSPECTED' ELSE 'CONFIRMED' END,
        r.base_date,
        NULL
      );

      -- ── Prescription ──────────────────────────────────────────────────────
      v_pres_id := gen_random_uuid();
      INSERT INTO prescriptions (id, consultation_id, diagnosis_id, custom_instructions, valid_from, valid_until, issued_at)
      VALUES (
        v_pres_id, v_cid, v_diag_id,
        NULL,
        r.base_date,
        r.base_date + CASE r.disease_id
          WHEN D_FLU  THEN 7  WHEN D_COLD THEN 7   WHEN D_PNEU THEN 14
          WHEN D_BRON THEN 10 WHEN D_PHAR THEN 7   WHEN D_SIN  THEN 10
          WHEN D_MIG  THEN 3  WHEN D_GAST THEN 21  WHEN D_UTI  THEN 7
          WHEN D_BACK THEN 10 WHEN D_HYP  THEN 30  WHEN D_ALL  THEN 30
          WHEN D_DERM THEN 14 WHEN D_ANX  THEN 30  WHEN D_GE   THEN 5
          ELSE 7
        END,
        v_sched + INTERVAL '30 minutes'
      );

      INSERT INTO prescription_items (id, prescription_id, medication_name, dosage, frequency, duration_days, quantity)
      VALUES (gen_random_uuid(), v_pres_id,
        CASE r.disease_id
          WHEN D_FLU  THEN 'Paracetamol'    WHEN D_COLD THEN 'Paracetamol'
          WHEN D_PNEU THEN 'Amoxicillin'    WHEN D_BRON THEN 'Azithromycin'
          WHEN D_PHAR THEN 'Amoxicillin'    WHEN D_SIN  THEN 'Amoxicillin'
          WHEN D_MIG  THEN 'Ibuprofen'      WHEN D_GAST THEN 'Omeprazol'
          WHEN D_UTI  THEN 'Amoxicillin'    WHEN D_BACK THEN 'Ibuprofen'
          WHEN D_HYP  THEN 'Amlodipine'     WHEN D_ALL  THEN 'Loratadine'
          WHEN D_DERM THEN 'Hidrocortizon'  WHEN D_ANX  THEN 'Buspirone'
          WHEN D_GE   THEN 'Smecta'         ELSE 'Paracetamol'
        END,
        CASE r.disease_id
          WHEN D_FLU  THEN '500mg'  WHEN D_COLD THEN '500mg'
          WHEN D_PNEU THEN '500mg'  WHEN D_BRON THEN '500mg'
          WHEN D_PHAR THEN '500mg'  WHEN D_SIN  THEN '875mg'
          WHEN D_MIG  THEN '400mg'  WHEN D_GAST THEN '20mg'
          WHEN D_UTI  THEN '500mg'  WHEN D_BACK THEN '400mg'
          WHEN D_HYP  THEN '5mg'    WHEN D_ALL  THEN '10mg'
          WHEN D_DERM THEN '1%'     WHEN D_ANX  THEN '10mg'
          WHEN D_GE   THEN '1 plic' ELSE '500mg'
        END,
        CASE r.disease_id
          WHEN D_FLU  THEN 'la 6 ore'  WHEN D_COLD THEN 'la 6 ore'
          WHEN D_PNEU THEN 'la 8 ore'  WHEN D_BRON THEN 'o dată/zi'
          WHEN D_PHAR THEN 'la 8 ore'  WHEN D_SIN  THEN 'la 12 ore'
          WHEN D_MIG  THEN 'la 8 ore'  WHEN D_GAST THEN 'dimineața'
          WHEN D_UTI  THEN 'la 8 ore'  WHEN D_BACK THEN 'la 8 ore'
          WHEN D_HYP  THEN 'o dată/zi' WHEN D_ALL  THEN 'o dată/zi'
          WHEN D_DERM THEN 'de 2x/zi'  WHEN D_ANX  THEN 'o dată/zi'
          WHEN D_GE   THEN 'de 3x/zi'  ELSE 'la 8 ore'
        END,
        CASE r.disease_id
          WHEN D_HYP THEN 30 WHEN D_ALL THEN 30 WHEN D_ANX THEN 30
          WHEN D_GAST THEN 21 WHEN D_PNEU THEN 14 ELSE 7
        END,
        CASE r.disease_id
          WHEN D_HYP THEN 30 WHEN D_ALL THEN 30 WHEN D_ANX THEN 30
          WHEN D_GAST THEN 42 ELSE 21
        END
      );

      IF r.disease_id IN (D_FLU, D_COLD, D_PNEU, D_BRON, D_BACK, D_GAST, D_GE, D_MIG, D_UTI, D_ALL) THEN
        INSERT INTO prescription_items (id, prescription_id, medication_name, dosage, frequency, duration_days, quantity)
        VALUES (gen_random_uuid(), v_pres_id,
          CASE r.disease_id
            WHEN D_FLU  THEN 'Ibuprofen'       WHEN D_COLD THEN 'Ibuprofen'
            WHEN D_PNEU THEN 'Acetilcisteină'  WHEN D_BRON THEN 'Ambroxol'
            WHEN D_BACK THEN 'Mydocalm'        WHEN D_GAST THEN 'Metoclopramid'
            WHEN D_GE   THEN 'Hidralyte'       WHEN D_MIG  THEN 'Sumatriptan'
            WHEN D_UTI  THEN 'Urofuraginol'    WHEN D_ALL  THEN 'Nasonex spray'
            ELSE 'Vitamina C'
          END,
          CASE r.disease_id
            WHEN D_FLU  THEN '400mg'     WHEN D_COLD THEN '400mg'
            WHEN D_PNEU THEN '600mg'     WHEN D_BRON THEN '30mg'
            WHEN D_BACK THEN '150mg'     WHEN D_GAST THEN '10mg'
            WHEN D_GE   THEN '1 plic'    WHEN D_MIG  THEN '50mg'
            WHEN D_UTI  THEN '50mg'      WHEN D_ALL  THEN '50mcg/doz'
            ELSE '1000mg'
          END,
          CASE r.disease_id
            WHEN D_FLU  THEN 'la 8 ore'    WHEN D_COLD THEN 'la 8 ore'
            WHEN D_PNEU THEN 'de 3x/zi'    WHEN D_BRON THEN 'de 3x/zi'
            WHEN D_BACK THEN 'de 3x/zi'    WHEN D_GAST THEN 'înainte mese'
            WHEN D_GE   THEN 'după diaree' WHEN D_MIG  THEN 'la nevoie'
            WHEN D_UTI  THEN 'la 8 ore'    WHEN D_ALL  THEN 'o dată/zi'
            ELSE 'o dată/zi'
          END,
          7, 21
        );
      END IF;

      -- ── Referral ──────────────────────────────────────────────────────────
      IF r.with_ref OR r.disease_id IN (D_PNEU, D_HYP, D_ANX) THEN
        INSERT INTO referrals (id, consultation_id, referral_type, destination, reason, urgency, issued_at)
        VALUES (gen_random_uuid(), v_cid,
          CASE r.disease_id
            WHEN D_PNEU THEN 'IMAGING'
            WHEN D_HYP  THEN 'LAB_ANALYSIS'
            WHEN D_UTI  THEN 'LAB_ANALYSIS'
            WHEN D_ANX  THEN 'SPECIALIST'
            WHEN D_BACK THEN 'IMAGING'
            WHEN D_DERM THEN 'SPECIALIST'
            ELSE 'LAB_ANALYSIS'
          END,
          CASE r.disease_id
            WHEN D_PNEU THEN 'Radiologie - Rx torace'
            WHEN D_HYP  THEN 'Laborator - profil cardiovascular'
            WHEN D_UTI  THEN 'Laborator - urocultura'
            WHEN D_ANX  THEN 'Psihiatrie'
            WHEN D_BACK THEN 'Imagistică - RMN coloana lombară'
            WHEN D_DERM THEN 'Dermatologie'
            ELSE 'Laborator - analize generale'
          END,
          CASE r.disease_id
            WHEN D_PNEU THEN 'Suspiciune pneumonie. Confirmare radiologică necesară.'
            WHEN D_HYP  THEN 'Hipertensiune arterială. Evaluare factori de risc cardiovascular.'
            WHEN D_UTI  THEN 'ITU recidivantă. Urocultura pentru antibiogramă.'
            WHEN D_ANX  THEN 'Anxietate generalizată. Evaluare psihiatrică pentru tratament.'
            WHEN D_BACK THEN 'Lombalgie persistentă. Excludere hernie de disc.'
            ELSE 'Investigații paraclinice necesare pentru diagnostic de certitudine.'
          END,
          CASE r.disease_id
            WHEN D_PNEU THEN 'URGENT'
            WHEN D_HYP  THEN CASE WHEN i % 5 = 0 THEN 'URGENT' ELSE 'ROUTINE' END
            WHEN D_ANX  THEN 'ROUTINE'
            ELSE CASE WHEN i % 4 = 0 THEN 'URGENT' ELSE 'ROUTINE' END
          END,
          v_sched + INTERVAL '32 minutes'
        );
      END IF;

    END LOOP;
  END LOOP;

END $$;

DROP TABLE _sched;
