# LedgerCore — User Roles and Permissions

## 1. CUSTOMER

A customer can:
- View accounts they own.
- View balances and transaction history for their own accounts.
- Initiate transfers from eligible accounts they own.
- Transfer funds to eligible LedgerCore accounts.
- View the status and details of their own transfers.

A customer cannot:
- View another customer's private account information.
- Transfer funds from an account they do not own.
- Change their role or administrative permissions.
- Modify or delete financial ledger entries.
- Bypass account status or balance restrictions.

## 2. ADMIN

An administrator can:
- View customer and account information required for administration.
- Change account status, subject to business rules.
- Review transaction records and audit events.
- Investigate failed transfers and reconciliation discrepancies.

An administrator cannot:
- Silently change account balances.
- Delete or rewrite posted ledger entries.
- Bypass financial transaction integrity rules.
- Perform unrestricted customer impersonation.

Administrative actions must be authorized and audited.

## 3. SYSTEM

The system represents trusted application logic rather than a human user.

It is responsible for:
- Validating transfer requests.
- Enforcing account ownership, status, and balance rules.
- Posting balanced debit and credit ledger entries.
- Preventing duplicate execution of transfer requests.
- Recording transaction outcomes and audit events.
- Supporting reconciliation.

## 4. Security Principles

- Deny access by default unless explicitly authorized.
- Verify resource ownership on the server for every customer operation.
- Never trust a customer ID or account ID supplied by the browser without authorization checks.
- Store passwords using an appropriate password-hashing algorithm.
- Do not expose credentials, authentication tokens, or sensitive data in logs.
- Treat administrator actions as privileged operations that require audit records.
