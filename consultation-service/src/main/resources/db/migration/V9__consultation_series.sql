ALTER TABLE consultations ADD COLUMN next_consultation_id UUID REFERENCES consultations(id);
