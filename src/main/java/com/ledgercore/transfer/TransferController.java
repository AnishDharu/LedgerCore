package com.ledgercore.transfer;

import com.ledgercore.transfer.dto.ExecuteTransferRequest;
import com.ledgercore.transfer.dto.TransferResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST API for executing and querying money transfers.
 */
@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    /**
     * POST /api/transfers
     *
     * Executes an atomic money transfer between two bank accounts.
     * Clients should supply an Idempotency-Key header to safely allow retries.
     * If omitted, a random UUID will be generated for the request.
     */
    @PostMapping
    public ResponseEntity<TransferResponse> executeTransfer(
            @RequestHeader(value = "Idempotency-Key", required = false) UUID idempotencyKey,
            @Valid @RequestBody ExecuteTransferRequest request) {

        UUID effectiveKey = (idempotencyKey != null) ? idempotencyKey : UUID.randomUUID();
        TransferResponse response = transferService.executeTransfer(effectiveKey, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/transfers/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TransferResponse> getTransferById(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.getTransferById(id));
    }

    /**
     * GET /api/transfers/account/{accountId}
     */
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransferResponse>> getTransfersForAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(transferService.getTransfersForAccount(accountId));
    }

    /**
     * GET /api/transfers/idempotency/{key}
     */
    @GetMapping("/idempotency/{key}")
    public ResponseEntity<TransferResponse> getTransferByIdempotencyKey(@PathVariable UUID key) {
        return ResponseEntity.ok(transferService.getTransferByIdempotencyKey(key));
    }
}

