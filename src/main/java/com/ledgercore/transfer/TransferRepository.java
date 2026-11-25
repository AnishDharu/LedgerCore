package com.ledgercore.transfer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for Transfer entities.
 */
public interface TransferRepository extends JpaRepository<Transfer, Long> {

    /** Find a transfer by its idempotency key (to detect duplicate requests). */
    Optional<Transfer> findByIdempotencyKey(UUID idempotencyKey);

    /** Find all transfers sent FROM a specific account. */
    List<Transfer> findBySourceAccountId(Long sourceAccountId);

    /** Find all transfers sent TO a specific account. */
    List<Transfer> findByTargetAccountId(Long targetAccountId);
}

