package com.hospital.appointment.service;

import com.hospital.appointment.model.AuditLog;
import com.hospital.appointment.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuditService {
    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String actorId, String actorEmail, String action, String resourceType, String resourceId, String outcome, String details) {
        try {
            AuditLog log = new AuditLog(actorId, actorEmail, action, resourceType, resourceId, outcome, details);
            log.setTimestamp(Instant.now());
            auditLogRepository.save(log);
        } catch (Exception e) {
            logger.error("Failed to write audit log: {}", e.getMessage());
        }
    }
}
