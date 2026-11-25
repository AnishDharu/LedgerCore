package com.ledgercore.ledger.dto;

import com.ledgercore.ledger.EntryType;
import com.ledgercore.ledger.LedgerEntry;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO representing an entry in the double-entry accounting ledger.
 */
public class LedgerEntryResponse {

    private Long id;
    private Long transferId;
    private Long accountId;
    private String accountNumber;
    private EntryType entryType;
    private String transactionType;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String description;
    private OffsetDateTime createdAt;

    public static LedgerEntryResponse fromEntity(LedgerEntry entry) {
        LedgerEntryResponse res = new LedgerEntryResponse();
        res.id = entry.getId();
        res.transferId = entry.getTransfer() != null ? entry.getTransfer().getId() : null;
        res.accountId = entry.getAccount().getId();
        res.accountNumber = entry.getAccount().getAccountNumber();
        res.entryType = entry.getEntryType();
        res.transactionType = entry.getTransactionType();
        res.amount = entry.getAmount();
        res.balanceAfter = entry.getBalanceAfter();
        res.description = entry.getDescription();
        res.createdAt = entry.getCreatedAt();
        return res;
    }

    public Long getId() {
        return id;
    }

    public Long getTransferId() {
        return transferId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public EntryType getEntryType() {
        return entryType;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getBalanceAfter() {
        return balanceAfter;
    }

    public String getDescription() {
        return description;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
