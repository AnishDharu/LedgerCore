package com.ledgercore.ledger;

import com.ledgercore.account.Account;
import com.ledgercore.ledger.dto.LedgerEntryResponse;
import com.ledgercore.ledger.dto.ReconciliationResponse;
import com.ledgercore.transfer.Transfer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service for double-entry bookkeeping, cash movement recording, and financial reconciliation.
 */
@Service
public class LedgerService {

    private final LedgerEntryRepository ledgerEntryRepository;

    public LedgerService(LedgerEntryRepository ledgerEntryRepository) {
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    /**
     * Record two balanced entries for a transfer:
     * 1. DEBIT on source account
     * 2. CREDIT on target account
     */
    @Transactional
    public void recordTransferEntries(Transfer transfer, Account sourceAccount, Account targetAccount, BigDecimal amount) {
        // 1. Source Debit Entry
        LedgerEntry debitEntry = new LedgerEntry();
        debitEntry.setTransfer(transfer);
        debitEntry.setAccount(sourceAccount);
        debitEntry.setEntryType(EntryType.DEBIT);
        debitEntry.setTransactionType("TRANSFER");
        debitEntry.setAmount(amount);
        debitEntry.setBalanceAfter(sourceAccount.getBalance());
        debitEntry.setDescription("Transfer to " + targetAccount.getAccountNumber());
        ledgerEntryRepository.save(debitEntry);

        // 2. Target Credit Entry
        LedgerEntry creditEntry = new LedgerEntry();
        creditEntry.setTransfer(transfer);
        creditEntry.setAccount(targetAccount);
        creditEntry.setEntryType(EntryType.CREDIT);
        creditEntry.setTransactionType("TRANSFER");
        creditEntry.setAmount(amount);
        creditEntry.setBalanceAfter(targetAccount.getBalance());
        creditEntry.setDescription("Transfer from " + sourceAccount.getAccountNumber());
        ledgerEntryRepository.save(creditEntry);
    }

    /**
     * Record a deposit in the ledger.
     * Credit to the customer's account (asset increasing).
     */
    @Transactional
    public void recordDeposit(Account account, BigDecimal amount, String description) {
        LedgerEntry entry = new LedgerEntry();
        entry.setAccount(account);
        entry.setEntryType(EntryType.CREDIT);
        entry.setTransactionType("DEPOSIT");
        entry.setAmount(amount);
        entry.setBalanceAfter(account.getBalance());
        entry.setDescription(description != null ? description : "Cash Deposit");
        ledgerEntryRepository.save(entry);
    }

    /**
     * Record a withdrawal in the ledger.
     * Debit to the customer's account (asset decreasing).
     */
    @Transactional
    public void recordWithdrawal(Account account, BigDecimal amount, String description) {
        LedgerEntry entry = new LedgerEntry();
        entry.setAccount(account);
        entry.setEntryType(EntryType.DEBIT);
        entry.setTransactionType("WITHDRAWAL");
        entry.setAmount(amount);
        entry.setBalanceAfter(account.getBalance());
        entry.setDescription(description != null ? description : "Cash Withdrawal");
        ledgerEntryRepository.save(entry);
    }

    /**
     * Get transaction history (ledger statement) for an account.
     */
    @Transactional(readOnly = true)
    public List<LedgerEntryResponse> getAccountHistory(Long accountId) {
        return ledgerEntryRepository.findByAccountIdOrderByCreatedAtDesc(accountId).stream()
                .map(LedgerEntryResponse::fromEntity)
                .toList();
    }

    /**
     * Run double-entry reconciliation:
     * For pure internal transfers, Sum(Debits) == Sum(Credits).
     */
    @Transactional(readOnly = true)
    public ReconciliationResponse reconcile() {
        BigDecimal totalDebits = ledgerEntryRepository.sumAllDebits();
        BigDecimal totalCredits = ledgerEntryRepository.sumAllCredits();
        return new ReconciliationResponse(totalDebits, totalCredits);
    }
}
