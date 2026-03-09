CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20),
    description TEXT,
    body_system VARCHAR(100)
);

CREATE TABLE diseases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    icd10_code VARCHAR(10),
    description TEXT,
    category VARCHAR(100)
);

CREATE TABLE disease_symptom_links (
    disease_id UUID NOT NULL REFERENCES diseases(id),
    symptom_id UUID NOT NULL REFERENCES symptoms(id),
    probability DECIMAL(5,2),
    is_pathognomonic BOOLEAN DEFAULT false,
    PRIMARY KEY (disease_id, symptom_id)
);

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    active_substance VARCHAR(200),
    dosage_form VARCHAR(100),
    standard_dosage VARCHAR(100)
);

CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    disease_id UUID REFERENCES diseases(id)
);

CREATE TABLE treatment_medications (
    treatment_id UUID NOT NULL REFERENCES treatments(id),
    medication_id UUID NOT NULL REFERENCES medications(id),
    dosage VARCHAR(100),
    duration_days INT,
    PRIMARY KEY (treatment_id, medication_id)
);

CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    consultation_type VARCHAR(20) NOT NULL CHECK (consultation_type IN ('IN_PERSON','ONLINE_ASYNC')),
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED'
        CHECK (status IN ('REQUESTED','SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED')),
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    slot_duration_minutes INT DEFAULT 30,
    notes_doctor TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE consultation_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id),
    symptom_id UUID REFERENCES symptoms(id),
    custom_symptom_text TEXT,
    severity VARCHAR(10) CHECK (severity IN ('MILD','MODERATE','SEVERE')),
    onset_date DATE,
    reported_by VARCHAR(10) DEFAULT 'PATIENT'
);

CREATE TABLE patient_intake_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id),
    chief_complaint TEXT NOT NULL,
    symptom_duration VARCHAR(100),
    current_medications TEXT,
    allergies TEXT,
    additional_notes TEXT,
    submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id),
    disease_id UUID REFERENCES diseases(id),
    custom_diagnosis TEXT,
    icd10_code VARCHAR(10),
    confidence VARCHAR(20) CHECK (confidence IN ('CONFIRMED','SUSPECTED','RULE_OUT')),
    diagnosis_date DATE NOT NULL,
    notes TEXT
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id),
    diagnosis_id UUID REFERENCES diagnoses(id),
    treatment_id UUID REFERENCES treatments(id),
    custom_instructions TEXT,
    valid_from DATE NOT NULL,
    valid_until DATE,
    issued_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id),
    medication_id UUID NOT NULL REFERENCES medications(id),
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100),
    duration_days INT,
    quantity INT
);

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id),
    referral_type VARCHAR(20) CHECK (referral_type IN ('LAB_ANALYSIS','IMAGING','SPECIALIST')),
    destination VARCHAR(200),
    reason TEXT,
    urgency VARCHAR(20) DEFAULT 'ROUTINE',
    issued_at TIMESTAMP DEFAULT NOW(),
    result_consultation_id UUID REFERENCES consultations(id)
);

CREATE TABLE medical_record_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    consultation_id UUID NOT NULL REFERENCES consultations(id),
    entry_type VARCHAR(30) NOT NULL,
    added_at TIMESTAMP DEFAULT NOW(),
    added_by UUID NOT NULL,
    is_visible_to_patient BOOLEAN DEFAULT true
);

CREATE TABLE medical_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    consultation_id UUID REFERENCES consultations(id),
    file_type VARCHAR(20),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    uploaded_by UUID NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    description TEXT
);

-- Seed data using CTEs
WITH
s1 AS (INSERT INTO symptoms (name, code, description, body_system) VALUES ('Fever', 'SYM001', 'Elevated body temperature above 38 degrees Celsius', 'General') RETURNING id),
s2 AS (INSERT INTO symptoms (name, code, description, body_system) VALUES ('Cough', 'SYM002', 'Repetitive reflex to clear airways', 'Respiratory') RETURNING id),
s3 AS (INSERT INTO symptoms (name, code, description, body_system) VALUES ('Headache', 'SYM003', 'Pain in the head or upper neck', 'Neurological') RETURNING id),
s4 AS (INSERT INTO symptoms (name, code, description, body_system) VALUES ('Fatigue', 'SYM004', 'Extreme tiredness or exhaustion', 'General') RETURNING id),
s5 AS (INSERT INTO symptoms (name, code, description, body_system) VALUES ('Sore Throat', 'SYM005', 'Pain or irritation of the throat', 'Respiratory') RETURNING id),
s6 AS (INSERT INTO symptoms (name, code, description, body_system) VALUES ('Chest Pain', 'SYM006', 'Discomfort or pain in the chest area', 'Cardiovascular') RETURNING id),
s7 AS (INSERT INTO symptoms (name, code, description, body_system) VALUES ('Shortness of Breath', 'SYM007', 'Difficulty breathing or dyspnea', 'Respiratory') RETURNING id),
s8 AS (INSERT INTO symptoms (name, code, description, body_system) VALUES ('Nausea', 'SYM008', 'Feeling of sickness with urge to vomit', 'Gastrointestinal') RETURNING id),
s9 AS (INSERT INTO symptoms (name, code, description, body_system) VALUES ('Dizziness', 'SYM009', 'Sensation of spinning or lightheadedness', 'Neurological') RETURNING id),
s10 AS (INSERT INTO symptoms (name, code, description, body_system) VALUES ('Runny Nose', 'SYM010', 'Excess nasal discharge or rhinorrhea', 'Respiratory') RETURNING id),
d1 AS (INSERT INTO diseases (name, icd10_code, description, category) VALUES ('Common Cold', 'J00', 'Viral upper respiratory tract infection', 'Infectious') RETURNING id),
d2 AS (INSERT INTO diseases (name, icd10_code, description, category) VALUES ('Influenza', 'J11', 'Viral infection affecting the respiratory system', 'Infectious') RETURNING id),
d3 AS (INSERT INTO diseases (name, icd10_code, description, category) VALUES ('Pneumonia', 'J18', 'Infection that inflames air sacs in lungs', 'Infectious') RETURNING id),
d4 AS (INSERT INTO diseases (name, icd10_code, description, category) VALUES ('COVID-19', 'U07.1', 'Coronavirus disease 2019', 'Infectious') RETURNING id),
d5 AS (INSERT INTO diseases (name, icd10_code, description, category) VALUES ('Hypertension', 'I10', 'High blood pressure condition', 'Cardiovascular') RETURNING id),
m1 AS (INSERT INTO medications (name, active_substance, dosage_form, standard_dosage) VALUES ('Paracetamol', 'Acetaminophen', 'Tablet', '500-1000mg every 4-6 hours') RETURNING id),
m2 AS (INSERT INTO medications (name, active_substance, dosage_form, standard_dosage) VALUES ('Ibuprofen', 'Ibuprofen', 'Tablet', '400mg every 8 hours') RETURNING id),
m3 AS (INSERT INTO medications (name, active_substance, dosage_form, standard_dosage) VALUES ('Amoxicillin', 'Amoxicillin', 'Capsule', '500mg every 8 hours') RETURNING id),
m4 AS (INSERT INTO medications (name, active_substance, dosage_form, standard_dosage) VALUES ('Azithromycin', 'Azithromycin', 'Tablet', '500mg once daily for 3 days') RETURNING id),
m5 AS (INSERT INTO medications (name, active_substance, dosage_form, standard_dosage) VALUES ('Amlodipine', 'Amlodipine besylate', 'Tablet', '5-10mg once daily') RETURNING id),
t1 AS (INSERT INTO treatments (name, description, disease_id) SELECT 'Common Cold Treatment', 'Symptomatic relief for common cold', id FROM d1 RETURNING id),
t2 AS (INSERT INTO treatments (name, description, disease_id) SELECT 'Influenza Treatment', 'Symptomatic and antiviral treatment for flu', id FROM d2 RETURNING id),
t3 AS (INSERT INTO treatments (name, description, disease_id) SELECT 'Hypertension Management', 'Antihypertensive medication protocol', id FROM d5 RETURNING id)
INSERT INTO disease_symptom_links (disease_id, symptom_id, probability, is_pathognomonic)
SELECT d1.id, s10.id, 0.90, false FROM d1, s10 UNION ALL
SELECT d1.id, s5.id, 0.85, false FROM d1, s5 UNION ALL
SELECT d1.id, s2.id, 0.80, false FROM d1, s2 UNION ALL
SELECT d1.id, s3.id, 0.60, false FROM d1, s3 UNION ALL
SELECT d2.id, s1.id, 0.95, true FROM d2, s1 UNION ALL
SELECT d2.id, s4.id, 0.90, false FROM d2, s4 UNION ALL
SELECT d2.id, s2.id, 0.85, false FROM d2, s2 UNION ALL
SELECT d2.id, s3.id, 0.75, false FROM d2, s3 UNION ALL
SELECT d2.id, s5.id, 0.70, false FROM d2, s5 UNION ALL
SELECT d3.id, s1.id, 0.90, false FROM d3, s1 UNION ALL
SELECT d3.id, s7.id, 0.85, true FROM d3, s7 UNION ALL
SELECT d3.id, s6.id, 0.80, false FROM d3, s6 UNION ALL
SELECT d3.id, s2.id, 0.85, false FROM d3, s2 UNION ALL
SELECT d4.id, s1.id, 0.85, false FROM d4, s1 UNION ALL
SELECT d4.id, s2.id, 0.80, false FROM d4, s2 UNION ALL
SELECT d4.id, s4.id, 0.88, false FROM d4, s4 UNION ALL
SELECT d4.id, s7.id, 0.75, false FROM d4, s7 UNION ALL
SELECT d4.id, s9.id, 0.60, false FROM d4, s9 UNION ALL
SELECT d5.id, s3.id, 0.70, false FROM d5, s3 UNION ALL
SELECT d5.id, s9.id, 0.65, false FROM d5, s9 UNION ALL
SELECT d5.id, s6.id, 0.55, false FROM d5, s6;

INSERT INTO treatment_medications (treatment_id, medication_id, dosage, duration_days)
SELECT t.id, m.id, '500mg every 6 hours', 7
FROM treatments t, medications m
WHERE t.name = 'Common Cold Treatment' AND m.name = 'Paracetamol';

INSERT INTO treatment_medications (treatment_id, medication_id, dosage, duration_days)
SELECT t.id, m.id, '400mg every 8 hours', 5
FROM treatments t, medications m
WHERE t.name = 'Common Cold Treatment' AND m.name = 'Ibuprofen';

INSERT INTO treatment_medications (treatment_id, medication_id, dosage, duration_days)
SELECT t.id, m.id, '500mg every 8 hours', 7
FROM treatments t, medications m
WHERE t.name = 'Influenza Treatment' AND m.name = 'Paracetamol';

INSERT INTO treatment_medications (treatment_id, medication_id, dosage, duration_days)
SELECT t.id, m.id, '500mg once daily', 3
FROM treatments t, medications m
WHERE t.name = 'Influenza Treatment' AND m.name = 'Azithromycin';

INSERT INTO treatment_medications (treatment_id, medication_id, dosage, duration_days)
SELECT t.id, m.id, '5mg once daily', 30
FROM treatments t, medications m
WHERE t.name = 'Hypertension Management' AND m.name = 'Amlodipine';
