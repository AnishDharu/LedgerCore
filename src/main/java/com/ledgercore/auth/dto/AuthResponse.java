package com.ledgercore.auth.dto;

import com.ledgercore.customer.CustomerRole;

/**
 * Authentication response containing JWT and user profile metadata.
 */
public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private Long customerId;
    private String fullName;
    private String email;
    private CustomerRole role;

    public AuthResponse(String token, Long customerId, String fullName, String email, CustomerRole role) {
        this.token = token;
        this.customerId = customerId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public CustomerRole getRole() {
        return role;
    }
}

