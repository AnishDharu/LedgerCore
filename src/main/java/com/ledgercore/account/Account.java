package com.ledgercore.account;

import com.ledgercore.customer.Customer;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Represents a bank account belonging to a customer.
 *
 * Each customer can have multiple accounts (e.g., one SAVINGS, one CURRENT).
 * The balance is managed through explicit debit() and credit() methods
 * rather than a public setter, because balance changes must always go
 * through controlled business logic.
 *
 * Maps to the "accounts" table created by V2__create_accounts_table.sql.
 */
@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The customer who owns this account.
     * LAZY loading means the Customer object is only fetched from the database
     * when we actually access it, improving performance.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "account_number", nullable = false, unique = true, length = 20)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 20)
    private AccountType accountType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountStatus status = AccountStatus.ACTIVE;

    @Column(nullable = false, length = 3)
    private String currency = "INR";

    /**
     * The current balance of this account.
     * NUMERIC(19,4) gives us up to 15 digits before the decimal and 4 after.
     * No public setter — use debit() and credit() instead.
     */
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /** JPA requires a no-arg constructor. */
    public Account() {
    }

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

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    // ── Balance operations ──────────────────────────────────────────────
    // These are the ONLY way to change the balance. No setBalance() exists.
    // This is a deliberate design decision for financial safety.

    /**
     * Subtract money from this account (for outgoing transfers).
     *
     * @param amount the positive amount to debit
     * @throws IllegalArgumentException if amount is not positive
     * @throws IllegalStateException    if insufficient funds
     */
    public void debit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive");
        }
        if (balance.compareTo(amount) < 0) {
            throw new IllegalStateException(
                    "Insufficient funds: balance=" + balance + ", debit=" + amount);
        }
        balance = balance.subtract(amount);
    }

    /**
     * Add money to this account (for incoming transfers or deposits).
     *
     * @param amount the positive amount to credit
     * @throws IllegalArgumentException if amount is not positive
     */
    public void credit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive");
        }
        balance = balance.add(amount);
    }

    // ── Getters and setters ─────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public void setStatus(AccountStatus status) {
        this.status = status;
    }

    public String getCurrency() {
        return currency;
    }
    // No setCurrency() — currency is set at account creation and never changes.

    public BigDecimal getBalance() {
        return balance;
    }
    // No setBalance() — use debit() and credit() instead.

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}

