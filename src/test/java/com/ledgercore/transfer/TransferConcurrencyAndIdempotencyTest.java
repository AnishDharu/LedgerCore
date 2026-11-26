package com.ledgercore.transfer;

import com.ledgercore.account.Account;
import com.ledgercore.account.AccountRepository;
import com.ledgercore.account.AccountType;
import com.ledgercore.customer.Customer;
import com.ledgercore.customer.CustomerRepository;
import com.ledgercore.customer.CustomerRole;
import com.ledgercore.ledger.LedgerEntryRepository;
import com.ledgercore.security.CustomUserDetails;
import com.ledgercore.transfer.dto.ExecuteTransferRequest;
import com.ledgercore.transfer.dto.TransferResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class TransferConcurrencyAndIdempotencyTest {

    @Autowired
    private TransferService transferService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransferRepository transferRepository;

    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;

    private Account senderAccount;
    private Account receiverAccount;
    private Customer sender;

    @BeforeEach
    void setUp() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);

        sender = new Customer();
        sender.setFullName("Concurrent Sender");
        sender.setEmail("sender-" + uniqueSuffix + "@example.com");
        sender.setPasswordHash("hashed");
        sender.setRole(CustomerRole.CUSTOMER);
        sender = customerRepository.save(sender);

        Customer receiver = new Customer();
        receiver.setFullName("Concurrent Receiver");
        receiver.setEmail("receiver-" + uniqueSuffix + "@example.com");
        receiver.setPasswordHash("hashed");
        receiver.setRole(CustomerRole.CUSTOMER);
        receiver = customerRepository.save(receiver);

        senderAccount = new Account();
        senderAccount.setCustomer(sender);
        senderAccount.setAccountNumber("ACC-SND-" + uniqueSuffix);
        senderAccount.setAccountType(AccountType.SAVINGS);
        senderAccount.credit(new BigDecimal("10000.0000"));
        senderAccount = accountRepository.save(senderAccount);

        receiverAccount = new Account();
        receiverAccount.setCustomer(receiver);
        receiverAccount.setAccountNumber("ACC-RCV-" + uniqueSuffix);
        receiverAccount.setAccountType(AccountType.CURRENT);
        receiverAccount = accountRepository.save(receiverAccount);

        // Set security context for current thread
        CustomUserDetails userDetails = new CustomUserDetails(sender);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities())
        );
    }

    @Test
    @DisplayName("Simultaneous concurrent requests with identical Idempotency-Key must execute exactly once without double-spend")
    void testConcurrentDuplicateIdempotencyRequests() throws Exception {
        final UUID sharedIdempotencyKey = UUID.randomUUID();
        final BigDecimal transferAmount = new BigDecimal("1000.0000");

        final int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        List<Future<TransferResponse>> futures = Collections.synchronizedList(new ArrayList<>());
        final CustomUserDetails userDetails = new CustomUserDetails(sender);

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                // Set security context for worker thread
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities())
                );

                startLatch.await(); // Ensure all threads fire at the exact same millisecond
                try {
                    ExecuteTransferRequest req = new ExecuteTransferRequest();
                    req.setSourceAccountId(senderAccount.getId());
                    req.setTargetAccountId(receiverAccount.getId());
                    req.setAmount(transferAmount);
                    req.setDescription("Concurrent race test");

                    return transferService.executeTransfer(sharedIdempotencyKey, req);
                } finally {
                    finishLatch.countDown();
                }
            }));
        }

        // Fire all threads simultaneously
        startLatch.countDown();
        finishLatch.await();
        executor.shutdown();

        // 1. Verify all threads obtained a valid TransferResponse
        Long expectedTransferId = null;
        for (Future<TransferResponse> future : futures) {
            TransferResponse response = future.get();
            assertNotNull(response);
            assertEquals(TransferStatus.COMPLETED, response.getStatus());
            assertEquals(transferAmount.setScale(4), response.getAmount().setScale(4));

            if (expectedTransferId == null) {
                expectedTransferId = response.getId();
            } else {
                assertEquals(expectedTransferId, response.getId(),
                        "All concurrent requests must return the identical transfer entity");
            }
        }

        // 2. Verify account balances were modified EXACTLY ONCE (no double spend)
        Account updatedSender = accountRepository.findById(senderAccount.getId()).orElseThrow();
        Account updatedReceiver = accountRepository.findById(receiverAccount.getId()).orElseThrow();

        assertEquals(new BigDecimal("9000.0000"), updatedSender.getBalance().setScale(4),
                "Sender balance should only be debited once (10000 - 1000 = 9000)");
        assertEquals(new BigDecimal("1000.0000"), updatedReceiver.getBalance().setScale(4),
                "Receiver balance should only be credited once (0 + 1000 = 1000)");

        // 3. Verify exactly two ledger entries exist for this transfer (1 Dr, 1 Cr)
        var ledgerEntries = ledgerEntryRepository.findByTransferId(expectedTransferId);
        assertEquals(2, ledgerEntries.size(), "Exactly 2 ledger entries (Dr and Cr) must exist");
    }
}

