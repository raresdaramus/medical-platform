package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.PatientIntakeForm;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
public interface PatientIntakeFormRepository extends JpaRepository<PatientIntakeForm, UUID> {
    Optional<PatientIntakeForm> findByConsultationId(UUID consultationId);
}
