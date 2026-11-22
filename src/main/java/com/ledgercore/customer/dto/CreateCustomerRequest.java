package com.ledgercore.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * The data a client sends when registering a new customer.
 *
 * This is a DTO (Data Transfer Object) — it defines the shape of the
 * incoming JSON request. It is NOT the database entity.
 *
 * Why separate from the entity?
 * - The client should never send an "id" or "createdAt" — the server generates those.
 * - The client sends a plain password — the server hashes it before storing.
 * - Validation annotations here validate the incoming request, not the database row.
 *
 * Example JSON:
 * {
 *   "fullName": "Anish Dharu",
 *   "email": "anish@example.com",
 *   "phoneNumber": "9876543210",
 *   "password": "securePassword123"
 * }
 */
public class CreateCustomerRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Full name must be 120 characters or fewer")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    @Size(max = 15, message = "Phone number must be 15 characters or fewer")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    // ── Getters and setters ─────────────────────────────────────────────

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

