package com.ledgercore.customer.dto;

import com.ledgercore.customer.Customer;
import com.ledgercore.customer.CustomerRole;

import java.time.OffsetDateTime;

/**
 * The data the API returns when a client requests customer information.
 *
 * This is a DTO — it controls exactly what data is sent to the client.
 * Notice it does NOT include passwordHash — we never send the password
 * back to anyone, not even as a hash.
 *
 * Example JSON response:
 * {
 *   "id": 1,
 *   "fullName": "Anish Dharu",
 *   "email": "anish@example.com",
 *   "phoneNumber": "9876543210",
 *   "role": "CUSTOMER",
 *   "active": true,
 *   "createdAt": "2026-11-08T01:00:00+05:30"
 * }
 */
public class CustomerResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private CustomerRole role;
    private boolean active;
    private OffsetDateTime createdAt;

    /** Private constructor — use the static factory method instead. */
    private CustomerResponse() {
    }

    /**
     * Convert a Customer entity to a CustomerResponse DTO.
     * This is the only way to create a CustomerResponse, ensuring we
     * never accidentally expose sensitive fields like passwordHash.
     */
    public static CustomerResponse fromEntity(Customer customer) {
        CustomerResponse response = new CustomerResponse();
        response.id = customer.getId();
        response.fullName = customer.getFullName();
        response.email = customer.getEmail();
        response.phoneNumber = customer.getPhoneNumber();
        response.role = customer.getRole();
        response.active = customer.isActive();
        response.createdAt = customer.getCreatedAt();
        return response;
    }

    // ── Getters (no setters — response DTOs are read-only) ──────────────

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public CustomerRole getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}

