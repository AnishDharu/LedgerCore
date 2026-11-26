package com.ledgercore.security;

import com.ledgercore.account.Account;
import com.ledgercore.account.AccountRepository;
import com.ledgercore.common.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Service to enforce fine-grained object-level and resource-ownership authorization.
 * Prevents horizontal privilege escalation (e.g., Customer A accessing Customer B's accounts).
 */
@Service
public class AuthorizationService {

    private final AccountRepository accountRepository;

    public AuthorizationService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * Retrieves the currently authenticated CustomUserDetails from SecurityContext.
     */
    public CustomUserDetails getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new AccessDeniedException("User is not authenticated");
        }
        return userDetails;
    }

    /**
     * Verifies that the authenticated user owns the given customerId, or is an ADMIN.
     */
    public void requireCustomerAccess(Long customerId) {
        CustomUserDetails currentUser = getCurrentUser();
        if (!currentUser.canAccessCustomerData(customerId)) {
            throw new AccessDeniedException("Access denied: You are not authorized to access customer ID " + customerId);
        }
    }

    /**
     * Verifies that the authenticated user owns the given account, or is an ADMIN.
     */
    public void requireAccountAccess(Account account) {
        CustomUserDetails currentUser = getCurrentUser();
        Long ownerId = account.getCustomer().getId();
        if (!currentUser.canAccessCustomerData(ownerId)) {
            throw new AccessDeniedException("Access denied: You do not own account " + account.getAccountNumber());
        }
    }

    /**
     * Verifies that the authenticated user owns the account with the given ID, or is an ADMIN.
     */
    public Account requireAccountAccessById(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account with ID " + accountId + " not found"));
        requireAccountAccess(account);
        return account;
    }
}

