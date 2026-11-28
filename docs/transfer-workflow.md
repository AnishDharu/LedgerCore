# LedgerCore — Transfer Workflow

## 1. Request

A customer submits:
- Source account identifier
- Recipient account identifier
- Positive transfer amount
- Idempotency key

The authenticated customer identity is determined by the server, not trusted from the request body.

## 2. Validation

The server verifies that:
- The customer is authenticated.
- The customer owns the source account.
- Both accounts exist and are eligible for transfers.
- The source and destination are different accounts.
- The amount is positive and uses the supported currency precision.
- The source account has sufficient available funds.
- The idempotency key has not been used for a different request.

## 3. Processing

Within one database transaction:
1. Claim or verify the idempotency key.
2. Lock or conditionally update the relevant account records in a consistent order.
3. Recheck account status and available funds.
4. Create the transfer record.
5. Record a debit ledger entry for the sender.
6. Record a credit ledger entry for the recipient.
7. Update any stored account balances if balances are maintained as a projection.
8. Commit all financial changes together.

If a financial posting fails, the transaction is rolled back.

## 4. Successful Result

Return a transfer reference, status, amount, currency, and timestamp. The customer can view the resulting transaction history.

## 5. Failure Handling

Examples include:
- Invalid amount
- Unauthorized source account
- Unknown recipient
- Frozen or closed account
- Insufficient funds
- Duplicate idempotency key with different request details
- Concurrent balance conflict
- Unexpected database failure

Failed transfers must not leave partial debit or credit postings.

## 6. Reversals

A posted transfer is not silently deleted or edited. A reversal is represented by a new, linked financial operation with its own balanced ledger entries and authorization checks.
