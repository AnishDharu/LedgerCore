package com.ledgercore.transfer;

/**
 * The lifecycle status of a money transfer.
 *
 * PENDING   — transfer has been created but not yet processed.
 * COMPLETED — money has been successfully moved between accounts.
 * FAILED    — transfer was rejected (insufficient funds, frozen account, etc.).
 */
public enum TransferStatus {
    PENDING,
    COMPLETED,
    FAILED
}

