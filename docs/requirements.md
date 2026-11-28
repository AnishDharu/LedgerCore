# LedgerCore — Project Requirements

## 1. Project Overview

LedgerCore is a full-stack, banking-inspired application built to demonstrate Java, Spring Boot, relational database design, secure web development, and financial transaction processing.

The application is a simulation for educational and portfolio use. It does not connect to real banks or process real money.

## 2. Project Objectives

- Build a secure web application using Java and Spring Boot.
- Implement internal transfers between simulated bank accounts.
- Maintain a double-entry financial ledger.
- Preserve financial history and support reconciliation.
- Demonstrate transaction integrity, concurrency control, and automated testing.
- Provide a usable web interface and documented APIs.

## 3. Version 1 Features

1. Customer registration and login.
2. Account creation and account status management.
3. Account balance and transaction history.
4. Transfers between LedgerCore accounts.
5. Double-entry ledger records for financial movements.
6. Duplicate-request protection.
7. Authorization and account ownership checks.
8. Administrative account management and audit history.
9. Automated tests and reconciliation checks.

## 4. Out of Scope

- Real deposits, withdrawals, or bank integrations.
- Real payment cards or payment network connectivity.
- Actual loan approvals or credit decisions.
- Production banking certification or regulatory compliance claims.

## 5. Success Criteria

- A customer cannot access another customer's account without authorization.
- Transfers cannot exceed the permitted available balance.
- A transfer's financial postings succeed together or are rolled back together.
- Retrying a transfer with the same idempotency key does not execute it again.
- Each completed transfer has balanced ledger postings.
- Financial history is not silently overwritten or deleted.
- Automated tests cover successful transfers and important failure scenarios.
