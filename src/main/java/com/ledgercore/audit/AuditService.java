package com.ledgercore.audit;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service to record and query immutable audit log entries.
 */
@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Record an audit log entry.
     * Uses Propagation.REQUIRES_NEW or standard transaction to commit alongside
     * the active transaction or as an independent record.
     */
    @Transactional
    public AuditLog log(Long userId, String action, String entityType, Long entityId, String details, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setIpAddress(ipAddress);
        return auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getLogsByUserId(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getLogsByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }
}

