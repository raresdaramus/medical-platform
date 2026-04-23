-- Step 1: Drop old constraints first
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_status_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_consultation_type_check;
ALTER TABLE diagnoses     DROP CONSTRAINT IF EXISTS diagnoses_confidence_check;
ALTER TABLE referrals     DROP CONSTRAINT IF EXISTS referrals_referral_type_check;

-- Step 2: Migrate existing data
UPDATE consultations SET status = 'PENDING'      WHERE status = 'REQUESTED';
UPDATE consultations SET status = 'CONFIRMED'    WHERE status = 'SCHEDULED';
UPDATE consultations SET consultation_type = 'TELEMEDICINE' WHERE consultation_type = 'ONLINE';

-- Step 3: Add updated constraints and defaults
ALTER TABLE consultations ALTER COLUMN status SET DEFAULT 'PENDING';

ALTER TABLE consultations
    ADD CONSTRAINT consultations_status_check
    CHECK (status IN ('PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED'));

ALTER TABLE consultations
    ADD CONSTRAINT consultations_consultation_type_check
    CHECK (consultation_type IN ('IN_PERSON','TELEMEDICINE','ONLINE_ASYNC'));

ALTER TABLE referrals
    ADD CONSTRAINT referrals_referral_type_check
    CHECK (referral_type IN ('SPECIALIST','LABORATORY','IMAGING','HOSPITAL','OTHER','LAB_ANALYSIS'));
