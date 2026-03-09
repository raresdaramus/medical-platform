package com.mediconnect.auth.repository;

import com.mediconnect.auth.entity.GdprConsent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface GdprConsentRepository extends JpaRepository<GdprConsent, UUID> {
    List<GdprConsent> findByAccountId(UUID accountId);
}
