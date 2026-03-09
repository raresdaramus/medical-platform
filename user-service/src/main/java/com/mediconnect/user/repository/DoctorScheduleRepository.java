package com.mediconnect.user.repository;
import com.mediconnect.user.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, UUID> {
    List<DoctorSchedule> findByDoctorIdAndIsActiveTrue(UUID doctorId);
    List<DoctorSchedule> findByDoctorIdAndDayOfWeekAndIsActiveTrue(UUID doctorId, Integer dayOfWeek);
    void deleteByDoctorIdAndIsActiveTrue(UUID doctorId);
}
