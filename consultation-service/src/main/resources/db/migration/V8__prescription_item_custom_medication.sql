-- Allow custom medications (not linked to ontology) in prescription items
ALTER TABLE prescription_items ALTER COLUMN medication_id DROP NOT NULL;
ALTER TABLE prescription_items ALTER COLUMN dosage      DROP NOT NULL;
ALTER TABLE prescription_items ADD COLUMN medication_name VARCHAR(200);
