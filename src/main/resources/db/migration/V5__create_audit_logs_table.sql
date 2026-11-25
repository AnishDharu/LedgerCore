-- =============================================================================
-- V5: Create the audit_logs table
-- =============================================================================
-- Records every important action in the system for compliance and debugging.
-- Examples:
--   action=CUSTOMER_CREATED,  entity_type=CUSTOMER, entity_id=42
--   action=TRANSFER_COMPLETED, entity_type=TRANSFER, entity_id=101
--   action=ACCOUNT_FROZEN,    entity_type=ACCOUNT,  entity_id=7
--
-- In a real bank, audit logs are write-once — they are never updated or deleted.
-- =============================================================================

CREATE TABLE audit_logs (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT,
    action          VARCHAR(50)     NOT NULL,
    entity_type     VARCHAR(50)     NOT NULL,
    entity_id       BIGINT,
    details         TEXT,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_entity  ON audit_logs(entity_type, entity_id);

