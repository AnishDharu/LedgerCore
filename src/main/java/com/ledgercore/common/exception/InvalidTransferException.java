package com.ledgercore.common.exception;

/**
 * Thrown when a transfer violates business rules
 * (e.g., source and target account are identical, currency mismatch, etc.).
 */
public class InvalidTransferException extends RuntimeException {

    public InvalidTransferException(String message) {
        super(message);
    }
}

