CREATE TABLE consultation_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL,
    uploader_role VARCHAR(10) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_consultation_documents_consultation ON consultation_documents(consultation_id);
