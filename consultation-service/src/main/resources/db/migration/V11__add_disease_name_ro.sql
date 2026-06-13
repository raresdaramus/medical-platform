-- Add Romanian name column to diseases for bilingual support

ALTER TABLE diseases ADD COLUMN name_ro VARCHAR(200);

UPDATE diseases SET name_ro = 'Gripă'                  WHERE id = 'b2000001-0000-0000-0000-000000000001';
UPDATE diseases SET name_ro = 'Răceală comună'          WHERE id = 'b2000001-0000-0000-0000-000000000002';
UPDATE diseases SET name_ro = 'Migrenă'                WHERE id = 'b2000001-0000-0000-0000-000000000003';
UPDATE diseases SET name_ro = 'Sinuzită'               WHERE id = 'b2000001-0000-0000-0000-000000000004';
UPDATE diseases SET name_ro = 'Faringită'              WHERE id = 'b2000001-0000-0000-0000-000000000005';
UPDATE diseases SET name_ro = 'Gastrită'               WHERE id = 'b2000001-0000-0000-0000-000000000006';
UPDATE diseases SET name_ro = 'Infecție urinară'       WHERE id = 'b2000001-0000-0000-0000-000000000007';
UPDATE diseases SET name_ro = 'Lombalgie'              WHERE id = 'b2000001-0000-0000-0000-000000000008';
UPDATE diseases SET name_ro = 'Bronșită acută'         WHERE id = 'b2000001-0000-0000-0000-000000000009';
UPDATE diseases SET name_ro = 'Pneumonie'              WHERE id = 'b2000001-0000-0000-0000-000000000010';
UPDATE diseases SET name_ro = 'Hipertensiune arterială' WHERE id = 'b2000001-0000-0000-0000-000000000011';
UPDATE diseases SET name_ro = 'Alergie respiratorie'   WHERE id = 'b2000001-0000-0000-0000-000000000012';
UPDATE diseases SET name_ro = 'Dermatită'              WHERE id = 'b2000001-0000-0000-0000-000000000013';
UPDATE diseases SET name_ro = 'Anxietate'              WHERE id = 'b2000001-0000-0000-0000-000000000014';
UPDATE diseases SET name_ro = 'Gastroenterită'         WHERE id = 'b2000001-0000-0000-0000-000000000015';
