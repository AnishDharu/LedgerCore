package com.ledgercore.common.exception;

/**
 * Thrown when a requested resource does not exist.
 *
 * For example:
 *   - Customer with ID 999 not found
 *   - Account with number "ACC-0000000001" not found
 *
 * The GlobalExceptionHandler catches this and returns a 404 response.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}

