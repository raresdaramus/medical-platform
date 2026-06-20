-- Clinic / CNAS administrative data for the referral (bilet de trimitere) form.
-- All columns are nullable so existing doctors are unaffected; each doctor can
-- fill them in later from the clinic profile page.
ALTER TABLE doctors ADD COLUMN cui VARCHAR(20);
ALTER TABLE doctors ADD COLUMN clinic_address VARCHAR(300);
ALTER TABLE doctors ADD COLUMN cas VARCHAR(100);
ALTER TABLE doctors ADD COLUMN cnas_contract_number VARCHAR(50);
-- Provider type: MF (medic de familie), AMB_SPEC (ambulatoriu de specialitate), OTHER.
ALTER TABLE doctors ADD COLUMN provider_type VARCHAR(20);
