package com.ledgercore.common.exception;

/**
 * Thrown when an account does not have sufficient balance to perform a debit or transfer.
 * Handled by GlobalExceptionHandler to return HTTP 422 Unprocessable Entity or 400 Bad Request.
 */
public class InsufficientFundsException extends RuntimeException {

    public InsufficientFundsException(String message) {
        super(message);
    }
}

