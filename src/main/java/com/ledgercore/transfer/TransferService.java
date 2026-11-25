package com.ledgercore.transfer;

import com.ledgercore.account.Account;
import com.ledgercore.account.AccountRepository;
import com.ledgercore.account.AccountStatus;
import com.ledgercore.audit.AuditService;
import com.ledgercore.common.exception.AccountInactiveException;
import com.ledgercore.common.exception.InsufficientFundsException;
import com.ledgercore.common.exception.InvalidTransferException;
import com.ledgercore.common.exception.ResourceNotFoundException;
import com.ledgercore.ledger.LedgerService;
import com.ledgercore.security.AuthorizationService;
import com.ledgercore.security.CustomUserDetails;
import com.ledgercore.transfer.dto.ExecuteTransferRequest;
import com.ledgercore.transfer.dto.TransferResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Core engine for money transfers with concurrency protection,
 * idempotency race condition handling, and double-entry ledger integration.
 */
@Service
public class TransferService {

    private static final Logger log = LoggerFactory.getLogger(TransferService.class);

    private final TransferRepository transferRepository;
    private final AccountRepository accountRepository;
    private final LedgerService ledgerService;
    private final AuditService auditService;
    private final AuthorizationService authorizationService;

    public TransferService(TransferRepository transferRepository,
                           AccountRepository accountRepository,
                           LedgerService ledgerService,
                           AuditService auditService,
                           AuthorizationService authorizationService) {
        this.transferRepository = transferRepository;
        this.accountRepository = accountRepository;
        this.ledgerService = ledgerService;
        this.auditService = auditService;
        this.authorizationService = authorizationService;
    }

    /**
     * Executes a fund transfer atomically.
     * Enforces source account ownership, ordered pessimistic locking, idempotency,
     * and double-entry ledger recording.
     */
    @Transactional
    public TransferResponse executeTransfer(UUID idempotencyKey, ExecuteTransferRequest request) {
        if (idempotencyKey == null) {
            throw new InvalidTransferException("Idempotency-Key header is required for transfers");
        }

        // 1. First-pass Idempotency Check: if this UUID was already processed, return existing result safely
        Optional<Transfer> existingTransfer = transferRepository.findByIdempotencyKey(idempotencyKey);
        if (existingTransfer.isPresent()) {
            log.info("Idempotent replay detected for key: {}", idempotencyKey);
            Transfer t = existingTransfer.get();
            verifyTransferAccess(t);
            return TransferResponse.fromEntity(t);
        }

        Long sourceId = request.getSourceAccountId();
        Long targetId = request.getTargetAccountId();
        BigDecimal amount = request.getAmount();

        // 2. Business Rule: Cannot transfer to the same account
        if (sourceId.equals(targetId)) {
            throw new InvalidTransferException("Source and target accounts must be different");
        }

        // 3. Concurrency Protection & Deadlock Avoidance:
        // Always acquire locks in ascending order of Account ID.
        Long firstId = Math.min(sourceId, targetId);
        Long secondId = Math.max(sourceId, targetId);

        Account firstLocked = accountRepository.findByIdWithLock(firstId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + firstId));
        Account secondLocked = accountRepository.findByIdWithLock(secondId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + secondId));

        Account sourceAccount = sourceId.equals(firstId) ? firstLocked : secondLocked;
        Account targetAccount = targetId.equals(firstId) ? firstLocked : secondLocked;

        // 4. Critical Security Check: Enforce Source Account Ownership
        // Only the customer who owns the source account (or an ADMIN) can transfer funds out!
        authorizationService.requireAccountAccess(sourceAccount);

        // 5. Validate Account Statuses
        if (sourceAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountInactiveException("Source account " + sourceAccount.getAccountNumber()
                    + " is not ACTIVE (current status: " + sourceAccount.getStatus() + ")");
        }
        if (targetAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountInactiveException("Target account " + targetAccount.getAccountNumber()
                    + " is not ACTIVE (current status: " + targetAccount.getStatus() + ")");
        }

        // 6. Validate Currency
        if (!sourceAccount.getCurrency().equalsIgnoreCase(targetAccount.getCurrency())) {
            throw new InvalidTransferException("Cross-currency transfers are not supported. Source: "
                    + sourceAccount.getCurrency() + ", Target: " + targetAccount.getCurrency());
        }

        // 7. Validate Sufficient Balance
        if (sourceAccount.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException(String.format(
                    "Insufficient funds in account %s. Available: %s, Requested: %s",
                    sourceAccount.getAccountNumber(), sourceAccount.getBalance(), amount));
        }

        // 8. Re-check Idempotency Key under transaction boundary to guard against concurrent thread races
        Optional<Transfer> doubleCheck = transferRepository.findByIdempotencyKey(idempotencyKey);
        if (doubleCheck.isPresent()) {
            return TransferResponse.fromEntity(doubleCheck.get());
        }

        // 9. Perform the Debit and Credit
        sourceAccount.debit(amount);
        targetAccount.credit(amount);

        // 10. Persist Transfer Record with race-condition handling
        Transfer transfer = new Transfer();
        transfer.setIdempotencyKey(idempotencyKey);
        transfer.setSourceAccount(sourceAccount);
        transfer.setTargetAccount(targetAccount);
        transfer.setAmount(amount);
        transfer.setCurrency(sourceAccount.getCurrency());
        transfer.setDescription(request.getDescription());
        transfer.setStatus(TransferStatus.COMPLETED);

        Transfer savedTransfer;
        try {
            savedTransfer = transferRepository.saveAndFlush(transfer);
        } catch (DataIntegrityViolationException ex) {
            // Concurrent race condition: another thread won the race with the exact same idempotency key
            log.warn("Concurrent duplicate idempotency key detected during flush: {}", idempotencyKey);
            return transferRepository.findByIdempotencyKey(idempotencyKey)
                    .map(TransferResponse::fromEntity)
                    .orElseThrow(() -> ex);
        }

        // 11. Record Double-Entry Ledger Entries (Dr source, Cr target)
        ledgerService.recordTransferEntries(savedTransfer, sourceAccount, targetAccount, amount);

        // 12. Record Audit Trail
        auditService.log(
                sourceAccount.getCustomer().getId(),
                "TRANSFER_COMPLETED",
                "TRANSFER",
                savedTransfer.getId(),
                String.format("Transferred %s %s from %s to %s",
                        amount, sourceAccount.getCurrency(),
                        sourceAccount.getAccountNumber(), targetAccount.getAccountNumber()),
                null
        );

        return TransferResponse.fromEntity(savedTransfer);
    }

    @Transactional(readOnly = true)
    public TransferResponse getTransferById(Long id) {
        Transfer transfer = transferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with ID: " + id));
        verifyTransferAccess(transfer);
        return TransferResponse.fromEntity(transfer);
    }

    @Transactional(readOnly = true)
    public TransferResponse getTransferByIdempotencyKey(UUID idempotencyKey) {
        Transfer transfer = transferRepository.findByIdempotencyKey(idempotencyKey)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with idempotency key: " + idempotencyKey));
        verifyTransferAccess(transfer);
        return TransferResponse.fromEntity(transfer);
    }

    @Transactional(readOnly = true)
    public List<TransferResponse> getTransfersForAccount(Long accountId) {
        // Enforce account ownership: only account owner or admin can view transfer history
        authorizationService.requireAccountAccessById(accountId);

        List<Transfer> outgoing = transferRepository.findBySourceAccountId(accountId);
        List<Transfer> incoming = transferRepository.findByTargetAccountId(accountId);

        return java.util.stream.Stream.concat(outgoing.stream(), incoming.stream())
                .distinct()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(TransferResponse::fromEntity)
                .toList();
    }

    private void verifyTransferAccess(Transfer transfer) {
        CustomUserDetails user = authorizationService.getCurrentUser();
        if (user.isAdmin()) {
            return;
        }
        Long userCustomerId = user.getCustomerId();
        Long sourceCustomerId = transfer.getSourceAccount().getCustomer().getId();
        Long targetCustomerId = transfer.getTargetAccount().getCustomer().getId();

        if (!userCustomerId.equals(sourceCustomerId) && !userCustomerId.equals(targetCustomerId)) {
            throw new AccessDeniedException("Access denied: You are neither the sender nor receiver of this transfer");
        }
    }
}
