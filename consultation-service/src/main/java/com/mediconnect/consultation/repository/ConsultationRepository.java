package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.Consultation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
public interface ConsultationRepository extends JpaRepository<Consultation, UUID> {
    List<Consultation> findByDoctorIdAndStatus(UUID doctorId, String status);
    @Query("SELECT c FROM Consultation c WHERE c.doctorId = :doctorId AND CAST(c.scheduledAt AS date) = :date AND c.status IN ('PENDING', 'CONFIRMED')")
    List<Consultation> findBookedSlotsForDay(@Param("doctorId") UUID doctorId, @Param("date") LocalDate date);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Consultation c WHERE c.doctorId = :doctorId AND c.scheduledAt = :scheduledAt AND c.status IN ('PENDING','CONFIRMED')")
    List<Consultation> findByDoctorIdAndScheduledAtWithLock(@Param("doctorId") UUID doctorId, @Param("scheduledAt") LocalDateTime scheduledAt);
    List<Consultation> findByPatientId(UUID patientId);
    List<Consultation> findByDoctorId(UUID doctorId);
    List<Consultation> findByDoctorIdAndPatientId(UUID doctorId, UUID patientId);
    java.util.Optional<Consultation> findByNextConsultationId(UUID nextConsultationId);

    @Query("SELECT c FROM Consultation c WHERE c.status IN ('PENDING', 'CONFIRMED') AND c.scheduledAt IS NOT NULL AND c.scheduledAt < :now")
    List<Consultation> findOverdueConsultations(@Param("now") LocalDateTime now);
}
