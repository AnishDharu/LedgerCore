package com.ledgercore.transfer.dto;

import com.ledgercore.transfer.Transfer;
import com.ledgercore.transfer.TransferStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO representing the completed or status of a transfer.
 */
public class TransferResponse {

    private Long id;
    private UUID idempotencyKey;
    private Long sourceAccountId;
    private String sourceAccountNumber;
    private Long targetAccountId;
    private String targetAccountNumber;
    private BigDecimal amount;
    private String currency;
    private TransferStatus status;
    private String description;
    private OffsetDateTime createdAt;

    public static TransferResponse fromEntity(Transfer transfer) {
        TransferResponse res = new TransferResponse();
        res.id = transfer.getId();
        res.idempotencyKey = transfer.getIdempotencyKey();
        res.sourceAccountId = transfer.getSourceAccount().getId();
        res.sourceAccountNumber = transfer.getSourceAccount().getAccountNumber();
        res.targetAccountId = transfer.getTargetAccount().getId();
        res.targetAccountNumber = transfer.getTargetAccount().getAccountNumber();
        res.amount = transfer.getAmount();
        res.currency = transfer.getCurrency();
        res.status = transfer.getStatus();
        res.description = transfer.getDescription();
        res.createdAt = transfer.getCreatedAt();
        return res;
    }

    public Long getId() {
        return id;
    }

    public UUID getIdempotencyKey() {
        return idempotencyKey;
    }

    public Long getSourceAccountId() {
        return sourceAccountId;
    }

    public String getSourceAccountNumber() {
        return sourceAccountNumber;
    }

    public Long getTargetAccountId() {
        return targetAccountId;
    }

    public String getTargetAccountNumber() {
        return targetAccountNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public TransferStatus getStatus() {
        return status;
    }

    public String getDescription() {
        return description;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}

