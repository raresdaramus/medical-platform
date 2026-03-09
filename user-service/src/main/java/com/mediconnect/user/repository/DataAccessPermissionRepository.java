package com.mediconnect.user.repository;
import com.mediconnect.user.entity.DataAccessPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface DataAccessPermissionRepository extends JpaRepository<DataAccessPermission, UUID> {
    List<DataAccessPermission> findByPatientIdAndIsActiveTrue(UUID patientId);
}
