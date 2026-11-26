package com.ledgercore.account;

import com.ledgercore.account.dto.AccountResponse;
import com.ledgercore.account.dto.AmountRequest;
import com.ledgercore.account.dto.CreateAccountRequest;
import com.ledgercore.account.dto.UpdateStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API controller for account operations.
 */
@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * POST /api/accounts
     * Create a new bank account.
     */
    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody CreateAccountRequest request) {
        AccountResponse response = accountService.createAccount(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * POST /api/accounts/{id}/deposit
     * Deposit funds into an account.
     */
    @PostMapping("/{id}/deposit")
    public ResponseEntity<AccountResponse> deposit(
            @PathVariable Long id,
            @Valid @RequestBody AmountRequest request) {
        AccountResponse response = accountService.deposit(id, request.getAmount());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/accounts/{id}/withdraw
     * Withdraw funds from an account.
     */
    @PostMapping("/{id}/withdraw")
    public ResponseEntity<AccountResponse> withdraw(
            @PathVariable Long id,
            @Valid @RequestBody AmountRequest request) {
        AccountResponse response = accountService.withdraw(id, request.getAmount());
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/accounts/{id}/status
     * Change account status (ACTIVE, FROZEN, CLOSED).
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<AccountResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        AccountResponse response = accountService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/accounts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable Long id) {
        AccountResponse response = accountService.getAccountById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/accounts/number/{accountNumber}
     */
    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<AccountResponse> getAccountByNumber(
            @PathVariable String accountNumber) {
        AccountResponse response = accountService.getAccountByNumber(accountNumber);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/accounts/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<AccountResponse>> getAccountsByCustomer(
            @PathVariable Long customerId) {
        List<AccountResponse> accounts = accountService.getAccountsByCustomerId(customerId);
        return ResponseEntity.ok(accounts);
    }
}
