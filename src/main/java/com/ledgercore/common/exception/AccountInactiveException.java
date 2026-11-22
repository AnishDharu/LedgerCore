package com.ledgercore.common.exception;

/**
 * Thrown when attempting an operation on an account that is not ACTIVE
 * (e.g. FROZEN or CLOSED).
 */
public class AccountInactiveException extends RuntimeException {

    public AccountInactiveException(String message) {
        super(message);
    }
}

