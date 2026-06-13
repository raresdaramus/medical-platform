package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.Disease;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface DiseaseRepository extends JpaRepository<Disease, UUID> {
    List<Disease> findByNameContainingIgnoreCaseOrNameRoContainingIgnoreCase(String name, String nameRo);
}
