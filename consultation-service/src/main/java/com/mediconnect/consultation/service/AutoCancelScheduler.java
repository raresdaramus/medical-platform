package com.mediconnect.consultation.service;

import com.mediconnect.consultation.repository.ConsultationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class AutoCancelScheduler {

    private static final Logger log = LoggerFactory.getLogger(AutoCancelScheduler.class);

    private final ConsultationRepository consultationRepository;

    public AutoCancelScheduler(ConsultationRepository consultationRepository) {
        this.consultationRepository = consultationRepository;
    }

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void cancelOverdueConsultations() {
        var overdue = consultationRepository.findOverdueConsultations(LocalDateTime.now());
        if (overdue.isEmpty()) return;
        overdue.forEach(c -> c.setStatus("CANCELLED"));
        consultationRepository.saveAll(overdue);
        log.info("Auto-cancelled {} overdue consultation(s)", overdue.size());
    }
}
