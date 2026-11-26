package com.ledgercore.account;

import com.ledgercore.account.dto.AccountResponse;
import com.ledgercore.account.dto.CreateAccountRequest;
import com.ledgercore.audit.AuditService;
import com.ledgercore.common.exception.AccountInactiveException;
import com.ledgercore.common.exception.InsufficientFundsException;
import com.ledgercore.common.exception.ResourceNotFoundException;
import com.ledgercore.customer.Customer;
import com.ledgercore.customer.CustomerRepository;
import com.ledgercore.ledger.LedgerService;
import com.ledgercore.security.AuthorizationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Business logic for account operations: creation, deposit, withdrawal, status management.
 * Enforces ownership authorization and financial ledger recording for all balance changes.
 */
@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final AuditService auditService;
    private final LedgerService ledgerService;
    private final AuthorizationService authorizationService;

    public AccountService(AccountRepository accountRepository,
                          CustomerRepository customerRepository,
                          AuditService auditService,
                          LedgerService ledgerService,
                          AuthorizationService authorizationService) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.auditService = auditService;
        this.ledgerService = ledgerService;
        this.authorizationService = authorizationService;
    }

    /**
     * Create a new bank account for an existing customer.
     * Enforces customer ownership: a user can only open accounts for themselves (or ADMIN).
     */
    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        authorizationService.requireCustomerAccess(request.getCustomerId());

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer with ID " + request.getCustomerId() + " not found"));

        AccountType accountType;
        try {
            accountType = AccountType.valueOf(request.getAccountType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid account type: " + request.getAccountType()
                            + ". Allowed values: SAVINGS, CURRENT");
        }

        String accountNumber = generateAccountNumber();

        Account account = new Account();
        account.setCustomer(customer);
        account.setAccountNumber(accountNumber);
        account.setAccountType(accountType);

        Account savedAccount = accountRepository.save(account);

        auditService.log(
                customer.getId(),
                "ACCOUNT_CREATED",
                "ACCOUNT",
                savedAccount.getId(),
                "Created " + accountType + " account " + accountNumber,
                null
        );

        return AccountResponse.fromEntity(savedAccount);
    }

    /**
     * Deposit funds into an account.
     * Enforces ownership authorization and records the entry in the ledger.
     */
    @Transactional
    public AccountResponse deposit(Long accountId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }

        Account account = accountRepository.findByIdWithLock(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account with ID " + accountId + " not found"));

        // Enforce account ownership authorization
        authorizationService.requireAccountAccess(account);

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountInactiveException("Cannot deposit to account " + account.getAccountNumber()
                    + " with status: " + account.getStatus());
        }

        account.credit(amount);
        Account updated = accountRepository.save(account);

        // Record in financial ledger so ledger explains 100% of balance movements
        ledgerService.recordDeposit(updated, amount, "Simulated Deposit");

        auditService.log(
                account.getCustomer().getId(),
                "ACCOUNT_DEPOSIT",
                "ACCOUNT",
                account.getId(),
                "Deposited " + amount + " " + account.getCurrency() + ". New balance: " + account.getBalance(),
                null
        );

        return AccountResponse.fromEntity(updated);
    }

    /**
     * Withdraw funds from an account.
     * Enforces ownership authorization and records the entry in the ledger.
     */
    @Transactional
    public AccountResponse withdraw(Long accountId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }

        Account account = accountRepository.findByIdWithLock(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account with ID " + accountId + " not found"));

        // Enforce account ownership authorization
        authorizationService.requireAccountAccess(account);

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountInactiveException("Cannot withdraw from account " + account.getAccountNumber()
                    + " with status: " + account.getStatus());
        }

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Insufficient balance in account " + account.getAccountNumber()
                    + ". Current balance: " + account.getBalance() + ", Requested: " + amount);
        }

        account.debit(amount);
        Account updated = accountRepository.save(account);

        // Record in financial ledger
        ledgerService.recordWithdrawal(updated, amount, "Simulated Withdrawal");

        auditService.log(
                account.getCustomer().getId(),
                "ACCOUNT_WITHDRAWAL",
                "ACCOUNT",
                account.getId(),
                "Withdrew " + amount + " " + account.getCurrency() + ". New balance: " + account.getBalance(),
                null
        );

        return AccountResponse.fromEntity(updated);
    }

    /**
     * Update account status (e.g., FREEZE, UNFREEZE, CLOSE).
     * Protected at controller/security level to ADMIN only.
     */
    @Transactional
    public AccountResponse updateStatus(Long accountId, String statusString) {
        AccountStatus newStatus;
        try {
            newStatus = AccountStatus.valueOf(statusString.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + statusString + ". Allowed: ACTIVE, FROZEN, CLOSED");
        }

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account with ID " + accountId + " not found"));

        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new IllegalStateException("Cannot change status of a permanently CLOSED account");
        }

        AccountStatus oldStatus = account.getStatus();
        account.setStatus(newStatus);
        Account updated = accountRepository.save(account);

        auditService.log(
                null,
                "ACCOUNT_STATUS_CHANGED",
                "ACCOUNT",
                account.getId(),
                "Changed status from " + oldStatus + " to " + newStatus + " for account " + account.getAccountNumber(),
                null
        );

        return AccountResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account with ID " + id + " not found"));
        authorizationService.requireAccountAccess(account);
        return AccountResponse.fromEntity(account);
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountByNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account with number " + accountNumber + " not found"));
        authorizationService.requireAccountAccess(account);
        return AccountResponse.fromEntity(account);
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccountsByCustomerId(Long customerId) {
        authorizationService.requireCustomerAccess(customerId);

        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer with ID " + customerId + " not found");
        }

        return accountRepository.findByCustomerId(customerId).stream()
                .map(AccountResponse::fromEntity)
                .toList();
    }

    private String generateAccountNumber() {
        String accountNumber;
        do {
            long number = ThreadLocalRandom.current().nextLong(1_000_000_000L, 10_000_000_000L);
            accountNumber = "ACC-" + number;
        } while (accountRepository.existsByAccountNumber(accountNumber));

        return accountNumber;
    }
}
