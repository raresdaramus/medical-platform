package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    List<Prescription> findByConsultationId(UUID consultationId);
}
