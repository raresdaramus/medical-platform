package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface SymptomRepository extends JpaRepository<Symptom, UUID> {
    List<Symptom> findByNameContainingIgnoreCase(String name);
}
