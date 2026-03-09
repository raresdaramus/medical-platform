package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.ConsultationSymptom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface ConsultationSymptomRepository extends JpaRepository<ConsultationSymptom, UUID> {
    List<ConsultationSymptom> findByConsultationId(UUID consultationId);
}
