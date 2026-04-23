package com.mediconnect.user.repository;
import com.mediconnect.user.entity.PatientDoctorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
public interface PatientDoctorAssignmentRepository extends JpaRepository<PatientDoctorAssignment, UUID> {
    Optional<PatientDoctorAssignment> findByPatientIdAndIsActiveTrue(UUID patientId);
    Optional<PatientDoctorAssignment> findByPatientIdAndDoctorId(UUID patientId, UUID doctorId);
    List<PatientDoctorAssignment> findByDoctorIdAndIsActiveTrue(UUID doctorId);
}
