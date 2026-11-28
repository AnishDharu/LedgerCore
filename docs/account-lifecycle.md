# LedgerCore — Account Lifecycle

## 1. Account Statuses

- ACTIVE: Account may participate in permitted transfers.
- FROZEN: Incoming and outgoing transfers are blocked.
- CLOSED: Account cannot participate in new transfers.

## 2. Account Creation

1. An authenticated customer requests account creation.
2. The server identifies the customer from the authenticated session.
3. The server creates the account with a unique account identifier and ACTIVE status.
4. The initial balance is zero unless an explicitly defined, balanced funding operation is introduced later.
5. The customer can view the new account.

Customers cannot choose their own account owner or assign themselves administrative privileges.

## 3. Account Freezing

1. An authorized administrator requests an account freeze.
2. The server validates the administrator's permission.
3. The account status is updated and the action is audited.
4. New transfers involving the frozen account are rejected.

The transfer service must recheck account status during transaction processing.

## 4. Account Closure

1. An authorized operation requests closure.
2. The server verifies that the balance is zero.
3. The server verifies that no unresolved financial operation prevents closure.
4. The account is marked CLOSED.
5. Historical ledger entries and transaction records are retained.

Closed accounts are not deleted to erase financial history.

## 5. Status Transition Rules

- ACTIVE -> FROZEN: permitted for an authorized administrator.
- FROZEN -> ACTIVE: permitted for an authorized administrator.
- ACTIVE -> CLOSED: permitted only when closure requirements are satisfied.
- FROZEN -> CLOSED: permitted only when closure requirements are satisfied.
- CLOSED -> ACTIVE: not permitted in version 1.
