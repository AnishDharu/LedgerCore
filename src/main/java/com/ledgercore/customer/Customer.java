package com.ledgercore.customer;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * Represents a registered user of the banking platform.
 *
 * A customer can be either a regular banking user (CUSTOMER role)
 * or a bank administrator (ADMIN role).
 *
 * Maps to the "customers" table created by V1__create_customers_table.sql.
 */
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    /**
     * The role determines what this user can do.
     * Stored as a string in the database (e.g., "CUSTOMER", "ADMIN").
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CustomerRole role = CustomerRole.CUSTOMER;

    /**
     * Soft-delete flag. When false, the customer cannot log in or perform
     * any operations, but their data is preserved for audit purposes.
     */
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /** JPA requires a no-arg constructor. */
    public Customer() {
    }

    /**
     * Called automatically by JPA before the first INSERT.
     * Sets the timestamps so we don't have to set them manually every time.
     */
    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    /**
     * Called automatically by JPA before every UPDATE.
     * Keeps the updated_at column current.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    // ── Getters and setters ─────────────────────────────────────────────

    public Long getId() {
        return id;
    }
    // No setId() — the database generates the ID.

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public CustomerRole getRole() {
        return role;
    }

    public void setRole(CustomerRole role) {
        this.role = role;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    // No setCreatedAt() — set once by @PrePersist, never changed.

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
    // No setUpdatedAt() — managed automatically by @PrePersist / @PreUpdate.
}

