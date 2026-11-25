package com.ledgercore.ledger;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

/**
 * Spring Data JPA repository for LedgerEntry entities.
 */
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {

    /** Find all ledger entries for a specific account (the account's transaction history). */
    List<LedgerEntry> findByAccountIdOrderByCreatedAtDesc(Long accountId);

    /** Find the DEBIT and CREDIT entries for a specific transfer. */
    List<LedgerEntry> findByTransferId(Long transferId);

    /** Sum of all debit entries in the system. */
    @Query("SELECT COALESCE(SUM(l.amount), 0) FROM LedgerEntry l WHERE l.entryType = com.ledgercore.ledger.EntryType.DEBIT")
    BigDecimal sumAllDebits();

    /** Sum of all credit entries in the system. */
    @Query("SELECT COALESCE(SUM(l.amount), 0) FROM LedgerEntry l WHERE l.entryType = com.ledgercore.ledger.EntryType.CREDIT")
    BigDecimal sumAllCredits();
}
