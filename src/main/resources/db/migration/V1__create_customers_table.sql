-- =============================================================================
-- V1: Create the customers table
-- =============================================================================
-- Each row represents a registered user of the banking platform.
-- Passwords are stored as BCrypt hashes, never as plain text.
-- The 'role' column controls access: CUSTOMER vs ADMIN.
-- =============================================================================

CREATE TABLE customers (
    id              BIGSERIAL       PRIMARY KEY,
    full_name       VARCHAR(120)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    phone_number    VARCHAR(15),
    password_hash   VARCHAR(255)    NOT NULL,
    role            VARCHAR(20)     NOT NULL DEFAULT 'CUSTOMER',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

