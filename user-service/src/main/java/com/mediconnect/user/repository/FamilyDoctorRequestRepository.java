package com.mediconnect.user.repository;

import com.mediconnect.user.entity.FamilyDoctorRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FamilyDoctorRequestRepository extends JpaRepository<FamilyDoctorRequest, UUID> {
    List<FamilyDoctorRequest> findByDoctorIdAndStatus(UUID doctorId, String status);
    List<FamilyDoctorRequest> findByPatientIdOrderByRequestedAtDesc(UUID patientId);
    Optional<FamilyDoctorRequest> findByPatientIdAndDoctorIdAndStatus(UUID patientId, UUID doctorId, String status);
}
