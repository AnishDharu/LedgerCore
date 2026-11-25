package com.ledgercore.audit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Spring Data JPA repository for AuditLog entities.
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /** Find all audit entries for a specific user, newest first. */
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Find all audit entries for a specific entity (e.g., all events on Account #7). */
    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
            String entityType, Long entityId);
}

