package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
public interface SymptomRepository extends JpaRepository<Symptom, UUID> {
    List<Symptom> findByNameContainingIgnoreCaseOrNameRoContainingIgnoreCase(String name, String nameRo);
    Optional<Symptom> findFirstByNameIgnoreCase(String name);
}
