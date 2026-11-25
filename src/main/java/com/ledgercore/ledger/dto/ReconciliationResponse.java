package com.ledgercore.ledger.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Result of system-wide double-entry accounting reconciliation.
 * Verifies that Total Debits == Total Credits across the entire bank.
 */
public class ReconciliationResponse {

    private boolean balanced;
    private BigDecimal totalDebits;
    private BigDecimal totalCredits;
    private BigDecimal discrepancy;
    private OffsetDateTime checkedAt;

    public ReconciliationResponse(BigDecimal totalDebits, BigDecimal totalCredits) {
        this.totalDebits = totalDebits;
        this.totalCredits = totalCredits;
        this.discrepancy = totalDebits.subtract(totalCredits).abs();
        this.balanced = this.discrepancy.compareTo(BigDecimal.ZERO) == 0;
        this.checkedAt = OffsetDateTime.now();
    }

    public boolean isBalanced() {
        return balanced;
    }

    public BigDecimal getTotalDebits() {
        return totalDebits;
    }

    public BigDecimal getTotalCredits() {
        return totalCredits;
    }

    public BigDecimal getDiscrepancy() {
        return discrepancy;
    }

    public OffsetDateTime getCheckedAt() {
        return checkedAt;
    }
}

