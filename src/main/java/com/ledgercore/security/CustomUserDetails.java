package com.ledgercore.security;

import com.ledgercore.customer.Customer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Custom UserDetails implementation wrapping the LedgerCore Customer entity.
 */
public class CustomUserDetails implements UserDetails {

    private final Long customerId;
    private final String email;
    private final String passwordHash;
    private final boolean active;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Customer customer) {
        this.customerId = customer.getId();
        this.email = customer.getEmail();
        this.passwordHash = customer.getPasswordHash();
        this.active = customer.isActive();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + customer.getRole().name()));
    }

    public Long getCustomerId() {
        return customerId;
    }

    public boolean isAdmin() {
        return authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    public boolean canAccessCustomerData(Long targetCustomerId) {
        return isAdmin() || (customerId != null && customerId.equals(targetCustomerId));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
