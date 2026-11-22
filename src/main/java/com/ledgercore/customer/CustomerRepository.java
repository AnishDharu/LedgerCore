package com.ledgercore.customer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Spring Data JPA repository for Customer entities.
 *
 * You don't need to write SQL queries — Spring generates them from method names.
 * For example, findByEmail(String email) becomes:
 *   SELECT * FROM customers WHERE email = ?
 */
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * Find a customer by their email address.
     * Returns Optional.empty() if no customer has that email.
     * Used during login and duplicate-email checks.
     */
    Optional<Customer> findByEmail(String email);

    /**
     * Check if a customer with this email already exists.
     * More efficient than findByEmail() when you only need a yes/no answer.
     */
    boolean existsByEmail(String email);
}

