-- Remove duplicate disease rows that have no Romanian name (kept the V5 rows which have name_ro)
DELETE FROM treatment_medications WHERE treatment_id IN (
    SELECT id FROM treatments WHERE disease_id IN (
        '5bff5f99-c3eb-427d-a75f-fa9a3f5900ea',
        '0fd5f1ec-3f13-4482-b34b-acd752e2265b'
    )
);
DELETE FROM treatments WHERE disease_id IN (
    '5bff5f99-c3eb-427d-a75f-fa9a3f5900ea',
    '0fd5f1ec-3f13-4482-b34b-acd752e2265b'
);
DELETE FROM disease_symptom_links WHERE disease_id IN (
    '5bff5f99-c3eb-427d-a75f-fa9a3f5900ea',
    '0fd5f1ec-3f13-4482-b34b-acd752e2265b'
);
DELETE FROM diseases WHERE id IN (
    '5bff5f99-c3eb-427d-a75f-fa9a3f5900ea', -- Hypertension (duplicate, no name_ro)
    '0fd5f1ec-3f13-4482-b34b-acd752e2265b'  -- Pneumonia (duplicate, no name_ro)
);
