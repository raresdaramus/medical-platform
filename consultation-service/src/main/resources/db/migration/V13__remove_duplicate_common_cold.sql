-- Remove duplicate 'Common Cold' (V1 auto-generated, no name_ro)
-- Keep 'Common cold' (b2000001-0000-0000-0000-000000000002) which has name_ro = 'Răceală comună'
DELETE FROM treatment_medications WHERE treatment_id IN (
    SELECT t.id FROM treatments t
    JOIN diseases d ON t.disease_id = d.id
    WHERE d.name = 'Common Cold' AND d.name_ro IS NULL
);
DELETE FROM treatments WHERE disease_id IN (
    SELECT id FROM diseases WHERE name = 'Common Cold' AND name_ro IS NULL
);
DELETE FROM disease_symptom_links WHERE disease_id IN (
    SELECT id FROM diseases WHERE name = 'Common Cold' AND name_ro IS NULL
);
DELETE FROM diseases WHERE name = 'Common Cold' AND name_ro IS NULL;
