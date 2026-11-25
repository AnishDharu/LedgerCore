-- =============================================================================
-- V2: Create the accounts table
-- =============================================================================
-- Each customer can have one or more bank accounts (SAVINGS, CURRENT).
-- The balance column uses NUMERIC(19,4) for financial precision.
-- Account status controls whether operations are permitted:
--   ACTIVE  → normal operations allowed
--   FROZEN  → no debits or credits until unfrozen
--   CLOSED  → permanently closed, no operations
-- =============================================================================

CREATE TABLE accounts (
    id              BIGSERIAL       PRIMARY KEY,
    customer_id     BIGINT          NOT NULL REFERENCES customers(id),
    account_number  VARCHAR(20)     NOT NULL UNIQUE,
    account_type    VARCHAR(20)     NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    currency        VARCHAR(3)      NOT NULL DEFAULT 'INR',
    balance         NUMERIC(19,4)   NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_account_type   CHECK (account_type IN ('SAVINGS', 'CURRENT')),
    CONSTRAINT chk_account_status CHECK (status IN ('ACTIVE', 'FROZEN', 'CLOSED')),
    CONSTRAINT chk_balance_not_negative CHECK (balance >= 0)
);

CREATE INDEX idx_accounts_customer_id ON accounts(customer_id);

