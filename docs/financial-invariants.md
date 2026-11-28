# LedgerCore — Financial Invariants

## 1. Monetary Precision

- Use Java BigDecimal for monetary calculations.
- Use PostgreSQL NUMERIC with an explicitly defined precision and scale.
- Define and validate the supported currency precision.
- Reject zero, negative, malformed, or unsupported amounts.
- Never use float or double for monetary arithmetic.

## 2. Double-Entry Ledger

- Every completed transfer must have balanced debit and credit postings.
- For a simple internal transfer, the sender is debited by the transfer amount and the recipient is credited by the same amount.
- Total debits must equal total credits for each completed transfer.
- Posted ledger entries must not be silently edited or deleted.
- Corrections must be represented by linked reversal entries.

## 3. Atomicity

- Transfer records, ledger postings, and any stored balance projections must be updated within one database transaction.
- Either all required financial changes commit, or none commit.
- An unexpected failure must not leave a partial transfer.

## 4. Balance Safety

- A transfer must not debit more than the permitted available balance.
- Balance checks and debit operations must be protected against concurrent requests.
- The database must be the final authority for concurrency-sensitive updates.
- Reconciliation must compare account balance projections with ledger-derived balances.

## 5. Idempotency

- Each logical transfer request must have an idempotency key.
- A repeated request with the same key and same request details must not execute the transfer again.
- Reusing a key with different request details must be rejected.
- Idempotency-key claims and transfer posting must be coordinated safely under concurrent requests.

## 6. Authorization

- Customers may initiate transfers only from accounts they own.
- Customers may view only resources they are authorized to access.
- Account status and permissions must be checked on the server.
- Administrative actions must be authorized and audited.

## 7. Account Eligibility

- Only eligible ACTIVE accounts may participate in new transfers.
- Frozen or closed accounts cannot participate in new transfers.
- Account closure requires a zero balance and no unresolved financial operations.
- Posted financial history must remain available after account closure.

## 8. Currency

- Version 1 supports one configured currency per transfer.
- Source and destination accounts must use the same supported currency.
- Currency conversion is out of scope.

## 9. Failure Handling

- Validation failures must not create financial postings.
- Failed database transactions must roll back their financial changes.
- Errors must not expose credentials, tokens, stack traces, or sensitive internal data.
- A transfer outcome must be distinguishable from an uncommitted or failed operation.

## 10. Verification

These invariants must be covered by automated tests, including:
- Successful transfers.
- Insufficient funds.
- Invalid amounts.
- Unauthorized account access.
- Database rollback during posting.
- Duplicate idempotency keys.
- Concurrent transfers against the same balance.
- Ledger balancing and reconciliation.
- Reversal operations.
