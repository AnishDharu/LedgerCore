package com.ledgercore.ledger;

import com.ledgercore.ledger.dto.LedgerEntryResponse;
import com.ledgercore.ledger.dto.ReconciliationResponse;
import com.ledgercore.security.AuthorizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for viewing double-entry ledger records and financial reconciliation.
 * Enforces ownership authorization on account statements.
 */
@RestController
@RequestMapping("/api/ledger")
public class LedgerController {

    private final LedgerService ledgerService;
    private final AuthorizationService authorizationService;

    public LedgerController(LedgerService ledgerService, AuthorizationService authorizationService) {
        this.ledgerService = ledgerService;
        this.authorizationService = authorizationService;
    }

    /**
     * GET /api/ledger/account/{accountId}
     * Returns the complete ledger history for an account.
     * Enforces ownership authorization: only the account owner or ADMIN can view it.
     */
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<LedgerEntryResponse>> getAccountLedger(@PathVariable Long accountId) {
        authorizationService.requireAccountAccessById(accountId);
        return ResponseEntity.ok(ledgerService.getAccountHistory(accountId));
    }

    /**
     * GET /api/ledger/reconcile
     * Runs double-entry accounting reconciliation across all accounts.
     * Accessible by ADMIN only (configured in SecurityConfig).
     */
    @GetMapping("/reconcile")
    public ResponseEntity<ReconciliationResponse> reconcile() {
        return ResponseEntity.ok(ledgerService.reconcile());
    }
}
