package com.ledgercore.account;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Account entities.
 */
public interface AccountRepository extends JpaRepository<Account, Long> {

    /** Find an account by its unique account number (e.g., "ACC-0000000001"). */
    Optional<Account> findByAccountNumber(String accountNumber);

    /** Find all accounts belonging to a specific customer. */
    List<Account> findByCustomerId(Long customerId);

    /** Check if an account number is already taken. */
    boolean existsByAccountNumber(String accountNumber);

    /**
     * Pessimistic write lock on an account by its ID.
     * Generates: SELECT * FROM accounts WHERE id = ? FOR UPDATE
     *
     * Prevents race conditions and concurrent overdrafts during transfers.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.id = :id")
    Optional<Account> findByIdWithLock(@Param("id") Long id);

    /**
     * Pessimistic write lock on an account by its account number.
     * Generates: SELECT * FROM accounts WHERE account_number = ? FOR UPDATE
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.accountNumber = :accountNumber")
    Optional<Account> findByAccountNumberWithLock(@Param("accountNumber") String accountNumber);
}
