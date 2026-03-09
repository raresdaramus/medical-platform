package com.mediconnect.user.repository;
import com.mediconnect.user.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByAccountId(UUID accountId);
    boolean existsByAccountId(UUID accountId);
}
