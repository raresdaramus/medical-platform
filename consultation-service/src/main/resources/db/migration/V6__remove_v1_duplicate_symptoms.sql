-- V1 seeded 10 English symptoms with random UUIDs (codes SYM001-SYM010).
-- V4 inserted the same symptoms in Romanian with fixed a1000001-... UUIDs.
-- V5 renamed V4 rows back to English, leaving duplicate names in the table.
-- This migration redirects all references to the V5 (a1000001-...) rows
-- and removes the duplicate V1 rows.

-- Remap disease_symptom_links
UPDATE disease_symptom_links SET symptom_id = 'a1000001-0000-0000-0000-000000000001'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM001');
UPDATE disease_symptom_links SET symptom_id = 'a1000001-0000-0000-0000-000000000025'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM002');
UPDATE disease_symptom_links SET symptom_id = 'a1000001-0000-0000-0000-000000000010'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM003');
UPDATE disease_symptom_links SET symptom_id = 'a1000001-0000-0000-0000-000000000003'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM004');
UPDATE disease_symptom_links SET symptom_id = 'a1000001-0000-0000-0000-000000000020'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM005');
UPDATE disease_symptom_links SET symptom_id = 'a1000001-0000-0000-0000-000000000030'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM006');
UPDATE disease_symptom_links SET symptom_id = 'a1000001-0000-0000-0000-000000000032'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM007');
UPDATE disease_symptom_links SET symptom_id = 'a1000001-0000-0000-0000-000000000005'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM008');
UPDATE disease_symptom_links SET symptom_id = 'a1000001-0000-0000-0000-000000000004'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM009');
UPDATE disease_symptom_links SET symptom_id = 'a1000001-0000-0000-0000-000000000014'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM010');

-- Remap consultation_symptoms that might reference V1 rows
UPDATE consultation_symptoms SET symptom_id = 'a1000001-0000-0000-0000-000000000001'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM001');
UPDATE consultation_symptoms SET symptom_id = 'a1000001-0000-0000-0000-000000000025'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM002');
UPDATE consultation_symptoms SET symptom_id = 'a1000001-0000-0000-0000-000000000010'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM003');
UPDATE consultation_symptoms SET symptom_id = 'a1000001-0000-0000-0000-000000000003'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM004');
UPDATE consultation_symptoms SET symptom_id = 'a1000001-0000-0000-0000-000000000020'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM005');
UPDATE consultation_symptoms SET symptom_id = 'a1000001-0000-0000-0000-000000000030'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM006');
UPDATE consultation_symptoms SET symptom_id = 'a1000001-0000-0000-0000-000000000032'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM007');
UPDATE consultation_symptoms SET symptom_id = 'a1000001-0000-0000-0000-000000000005'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM008');
UPDATE consultation_symptoms SET symptom_id = 'a1000001-0000-0000-0000-000000000004'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM009');
UPDATE consultation_symptoms SET symptom_id = 'a1000001-0000-0000-0000-000000000014'
    WHERE symptom_id IN (SELECT id FROM symptoms WHERE code = 'SYM010');

-- Delete the duplicate V1 seed rows
DELETE FROM symptoms WHERE code IN ('SYM001','SYM002','SYM003','SYM004','SYM005',
                                    'SYM006','SYM007','SYM008','SYM009','SYM010');
