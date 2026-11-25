package com.ledgercore.audit;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * Records important actions performed in the system.
 *
 * Audit logs are write-once: they are created but never updated or deleted.
 * In a real bank, this data must be preserved for regulatory compliance.
 *
 * Examples:
 *   action=CUSTOMER_CREATED,   entity_type=CUSTOMER, entity_id=42
 *   action=TRANSFER_COMPLETED, entity_type=TRANSFER, entity_id=101
 *   action=ACCOUNT_FROZEN,     entity_type=ACCOUNT,  entity_id=7
 *
 * Maps to the "audit_logs" table created by V5__create_audit_logs_table.sql.
 */
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The ID of the user who performed the action. Null for system-initiated actions. */
    @Column(name = "user_id")
    private Long userId;

    /** What happened (e.g., "CUSTOMER_CREATED", "TRANSFER_COMPLETED"). */
    @Column(nullable = false, length = 50)
    private String action;

    /** Which type of entity was affected (e.g., "CUSTOMER", "ACCOUNT", "TRANSFER"). */
    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    /** The ID of the affected entity. */
    @Column(name = "entity_id")
    private Long entityId;

    /** Optional JSON or plain-text details about the action. */
    @Column(columnDefinition = "TEXT")
    private String details;

    /** The IP address of the user who performed the action. */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public AuditLog() {
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }

    // ── Getters and setters ─────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}

