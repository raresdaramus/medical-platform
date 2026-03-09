package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface TreatmentRepository extends JpaRepository<Treatment, UUID> {}
