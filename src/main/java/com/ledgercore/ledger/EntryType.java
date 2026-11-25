package com.ledgercore.ledger;

/**
 * The type of a ledger entry in double-entry bookkeeping.
 *
 * DEBIT  — money leaving an account (the source side of a transfer).
 * CREDIT — money entering an account (the target side of a transfer).
 *
 * Every transfer creates exactly one DEBIT and one CREDIT entry.
 * Across the entire system, total DEBITs must always equal total CREDITs.
 */
public enum EntryType {
    DEBIT,
    CREDIT
}

