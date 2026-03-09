package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface MedicationRepository extends JpaRepository<Medication, UUID> {
    List<Medication> findByNameContainingIgnoreCase(String name);
}
