package com.ledgercore.customer;

/**
 * The roles a customer can have in the system.
 *
 * CUSTOMER — a regular banking user who can view accounts, make transfers, etc.
 * ADMIN    — a bank administrator who can manage customers, freeze accounts, etc.
 */
public enum CustomerRole {
    CUSTOMER,
    ADMIN
}

