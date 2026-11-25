package com.ledgercore.account;

/**
 * Represents the lifecycle state of a bank account.
 *
 * ACTIVE — normal operations (deposits, withdrawals, transfers) are allowed.
 * FROZEN — temporarily suspended. No debits or credits until an admin unfreezes it.
 *          Used for fraud investigation or compliance holds.
 * CLOSED — permanently deactivated. No operations allowed. Cannot be reopened.
 */
public enum AccountStatus {
    ACTIVE,
    FROZEN,
    CLOSED
}

