package com.ledgercore.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * The data a client sends when creating a new bank account.
 *
 * The client specifies which customer owns the account and what type it is.
 * The server generates the account number, sets the initial balance to zero,
 * and assigns the status as ACTIVE.
 *
 * Example JSON:
 * {
 *   "customerId": 1,
 *   "accountType": "SAVINGS"
 * }
 */
public class CreateAccountRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Account type is required (SAVINGS or CURRENT)")
    private String accountType;

    // ── Getters and setters ─────────────────────────────────────────────

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }
}

