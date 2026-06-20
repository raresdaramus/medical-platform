-- Additional fields for the Romanian referral (bilet de trimitere) PDF.
-- All nullable so existing referrals remain valid.
ALTER TABLE referrals ADD COLUMN diagnosis_id UUID;
ALTER TABLE referrals ADD COLUMN validity_days INT;
-- ACUTE (A/S, 30 days) or CHRONIC (C, 90 days).
ALTER TABLE referrals ADD COLUMN acute_chronic VARCHAR(10);
-- Recommended paraclinical investigations (free text / CNAS codes).
ALTER TABLE referrals ADD COLUMN investigations TEXT;
-- Patient insured category (Salariat, Pensionar, Copil, etc.).
ALTER TABLE referrals ADD COLUMN insured_category VARCHAR(60);
ALTER TABLE referrals ADD COLUMN series_number VARCHAR(40);
