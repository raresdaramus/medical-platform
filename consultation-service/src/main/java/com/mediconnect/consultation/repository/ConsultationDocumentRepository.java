package com.mediconnect.consultation.repository;

import com.mediconnect.consultation.entity.ConsultationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ConsultationDocumentRepository extends JpaRepository<ConsultationDocument, UUID> {
    List<ConsultationDocument> findByConsultationIdOrderByUploadedAtAsc(UUID consultationId);
    long countByConsultationId(UUID consultationId);
}
