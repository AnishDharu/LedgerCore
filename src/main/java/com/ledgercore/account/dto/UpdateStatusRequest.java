package com.ledgercore.account.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload to change account status (ACTIVE, FROZEN, CLOSED).
 */
public class UpdateStatusRequest {

    @NotBlank(message = "Status is required (ACTIVE, FROZEN, CLOSED)")
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

