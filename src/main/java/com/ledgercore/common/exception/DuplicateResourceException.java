package com.ledgercore.common.exception;

/**
 * Thrown when trying to create a resource that already exists.
 *
 * For example:
 *   - A customer with this email already exists
 *
 * The GlobalExceptionHandler catches this and returns a 409 Conflict response.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}

