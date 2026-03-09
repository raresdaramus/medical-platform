package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.Diagnosis;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface DiagnosisRepository extends JpaRepository<Diagnosis, UUID> {
    List<Diagnosis> findByConsultationId(UUID consultationId);
}
