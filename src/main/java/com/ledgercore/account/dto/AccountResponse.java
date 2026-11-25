package com.ledgercore.account.dto;

import com.ledgercore.account.Account;
import com.ledgercore.account.AccountStatus;
import com.ledgercore.account.AccountType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * The data the API returns when a client requests account information.
 *
 * Includes the customer ID but not the full customer object,
 * to avoid sending unnecessary nested data.
 *
 * Example JSON response:
 * {
 *   "id": 1,
 *   "customerId": 1,
 *   "accountNumber": "ACC-0000000001",
 *   "accountType": "SAVINGS",
 *   "status": "ACTIVE",
 *   "currency": "INR",
 *   "balance": 10000.00,
 *   "createdAt": "2026-11-08T01:00:00+05:30"
 * }
 */
public class AccountResponse {

    private Long id;
    private Long customerId;
    private String accountNumber;
    private AccountType accountType;
    private AccountStatus status;
    private String currency;
    private BigDecimal balance;
    private OffsetDateTime createdAt;

    private AccountResponse() {
    }

    /** Convert an Account entity to an AccountResponse DTO. */
    public static AccountResponse fromEntity(Account account) {
        AccountResponse response = new AccountResponse();
        response.id = account.getId();
        response.customerId = account.getCustomer().getId();
        response.accountNumber = account.getAccountNumber();
        response.accountType = account.getAccountType();
        response.status = account.getStatus();
        response.currency = account.getCurrency();
        response.balance = account.getBalance();
        response.createdAt = account.getCreatedAt();
        return response;
    }

    // ── Getters ─────────────────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public String getCurrency() {
        return currency;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}

