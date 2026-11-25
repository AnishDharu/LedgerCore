-- =============================================================================
-- V4: Create the ledger_entries table (double-entry bookkeeping)
-- =============================================================================
-- Every transfer creates exactly TWO ledger entries:
--   1. A DEBIT entry on the source account (money leaving)
--   2. A CREDIT entry on the target account (money arriving)
--
-- This is how real banks record transactions. The sum of all DEBITs
-- must always equal the sum of all CREDITs across the entire system.
-- If they don't match, something went wrong — that's what reconciliation checks.
--
-- balance_after: The account's balance immediately after this entry was applied.
--   This provides an audit trail and makes statement generation straightforward.
-- =============================================================================

CREATE TABLE ledger_entries (
    id              BIGSERIAL       PRIMARY KEY,
    transfer_id     BIGINT          NOT NULL REFERENCES transfers(id),
    account_id      BIGINT          NOT NULL REFERENCES accounts(id),
    entry_type      VARCHAR(10)     NOT NULL,
    amount          NUMERIC(19,4)   NOT NULL,
    balance_after   NUMERIC(19,4)   NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_entry_type           CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    CONSTRAINT chk_positive_entry_amount CHECK (amount > 0)
);

CREATE INDEX idx_ledger_transfer_id ON ledger_entries(transfer_id);
CREATE INDEX idx_ledger_account_id  ON ledger_entries(account_id);

