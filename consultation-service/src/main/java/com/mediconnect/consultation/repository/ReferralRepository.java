package com.mediconnect.consultation.repository;
import com.mediconnect.consultation.entity.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface ReferralRepository extends JpaRepository<Referral, UUID> {
    List<Referral> findByConsultationId(UUID consultationId);
}
