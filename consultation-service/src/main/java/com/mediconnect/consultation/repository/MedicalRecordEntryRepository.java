package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.MedicalRecordEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface MedicalRecordEntryRepository extends JpaRepository<MedicalRecordEntry, UUID> {
    List<MedicalRecordEntry> findByPatientIdOrderByAddedAtDesc(UUID patientId);
}
