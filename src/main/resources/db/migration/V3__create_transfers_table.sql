-- =============================================================================
-- V3: Create the transfers table
-- =============================================================================
-- Each row represents a money transfer between two accounts.
--
-- idempotency_key: A UUID the client sends to prevent duplicate transfers.
--   If the same key is sent twice, the second request is safely ignored.
--
-- status flow: PENDING → COMPLETED or FAILED
--
-- Constraints ensure:
--   - You cannot transfer to the same account.
--   - The amount must be positive.
-- =============================================================================

CREATE TABLE transfers (
    id                  BIGSERIAL       PRIMARY KEY,
    idempotency_key     UUID            NOT NULL UNIQUE,
    source_account_id   BIGINT          NOT NULL REFERENCES accounts(id),
    target_account_id   BIGINT          NOT NULL REFERENCES accounts(id),
    amount              NUMERIC(19,4)   NOT NULL,
    currency            VARCHAR(3)      NOT NULL DEFAULT 'INR',
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    description         VARCHAR(255),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_different_accounts CHECK (source_account_id <> target_account_id),
    CONSTRAINT chk_positive_amount    CHECK (amount > 0),
    CONSTRAINT chk_transfer_status    CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED'))
);

CREATE INDEX idx_transfers_source ON transfers(source_account_id);
CREATE INDEX idx_transfers_target ON transfers(target_account_id);
CREATE INDEX idx_transfers_idempotency ON transfers(idempotency_key);

