package com.ledgercore.auth;

import com.ledgercore.audit.AuditService;
import com.ledgercore.auth.dto.AuthResponse;
import com.ledgercore.auth.dto.LoginRequest;
import com.ledgercore.common.exception.DuplicateResourceException;
import com.ledgercore.common.exception.ResourceNotFoundException;
import com.ledgercore.customer.Customer;
import com.ledgercore.customer.CustomerRepository;
import com.ledgercore.customer.CustomerRole;
import com.ledgercore.customer.dto.CreateCustomerRequest;
import com.ledgercore.security.CustomUserDetails;
import com.ledgercore.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Service for user registration and authentication with JWT issuance.
 */
@Service
public class AuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    public AuthService(CustomerRepository customerRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       AuditService auditService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.auditService = auditService;
    }

    /**
     * Register a new customer and return a signed JWT.
     */
    @Transactional
    public AuthResponse register(CreateCustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email " + request.getEmail() + " is already registered");
        }

        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setEmail(request.getEmail());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        customer.setRole(CustomerRole.CUSTOMER);

        Customer saved = customerRepository.save(customer);

        auditService.log(
                saved.getId(),
                "CUSTOMER_REGISTERED",
                "CUSTOMER",
                saved.getId(),
                "Customer registered with email: " + saved.getEmail(),
                null
        );

        CustomUserDetails userDetails = new CustomUserDetails(saved);
        String token = jwtService.generateToken(
                Map.of("customerId", saved.getId(), "role", saved.getRole().name()),
                userDetails
        );

        return new AuthResponse(token, saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole());
    }

    /**
     * Authenticate email/password credentials and return a signed JWT.
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + request.getEmail()));

        CustomUserDetails userDetails = new CustomUserDetails(customer);
        String token = jwtService.generateToken(
                Map.of("customerId", customer.getId(), "role", customer.getRole().name()),
                userDetails
        );

        auditService.log(
                customer.getId(),
                "CUSTOMER_LOGIN",
                "CUSTOMER",
                customer.getId(),
                "Successful login for " + customer.getEmail(),
                null
        );

        return new AuthResponse(token, customer.getId(), customer.getFullName(), customer.getEmail(), customer.getRole());
    }
}

