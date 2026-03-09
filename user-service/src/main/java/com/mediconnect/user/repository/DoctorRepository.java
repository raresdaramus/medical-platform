package com.mediconnect.user.repository;
import com.mediconnect.user.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Optional<Doctor> findByAccountId(UUID accountId);
    List<Doctor> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);
}
