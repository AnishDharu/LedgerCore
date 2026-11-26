-- =============================================================================
-- V6: Enhance ledger_entries for all financial operations (Deposits & Withdrawals)
-- =============================================================================
-- Every financial operation that affects an account balance must be recorded
-- in the ledger so that the ledger explains 100% of all balance movements.
--
-- 1. transfer_id is made nullable (deposits and withdrawals do not have transfers).
-- 2. transaction_type is added (TRANSFER, DEPOSIT, WITHDRAWAL).
-- 3. description is added for human-readable audit notes.
-- =============================================================================

ALTER TABLE ledger_entries ALTER COLUMN transfer_id DROP NOT NULL;

ALTER TABLE ledger_entries ADD COLUMN transaction_type VARCHAR(20) NOT NULL DEFAULT 'TRANSFER';

ALTER TABLE ledger_entries ADD COLUMN description VARCHAR(255);

ALTER TABLE ledger_entries ADD CONSTRAINT chk_transaction_type
    CHECK (transaction_type IN ('TRANSFER', 'DEPOSIT', 'WITHDRAWAL'));

