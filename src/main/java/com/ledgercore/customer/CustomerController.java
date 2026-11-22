package com.ledgercore.customer;

import com.ledgercore.customer.dto.CreateCustomerRequest;
import com.ledgercore.customer.dto.CustomerResponse;
import com.ledgercore.security.AuthorizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API controller for customer operations.
 * Enforces role-based and ownership authorization on customer profiles.
 */
@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final AuthorizationService authorizationService;

    public CustomerController(CustomerService customerService, AuthorizationService authorizationService) {
        this.customerService = customerService;
        this.authorizationService = authorizationService;
    }

    /**
     * POST /api/customers
     * Administrative/system customer registration.
     */
    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(
            @Valid @RequestBody CreateCustomerRequest request) {

        CustomerResponse response = customerService.createCustomer(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/customers
     * List all registered customers.
     * Restricted to bank administrators only.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        List<CustomerResponse> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    /**
     * GET /api/customers/{id}
     * Get a specific customer by their ID.
     * Accessible only by the customer themselves or an administrator.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        authorizationService.requireCustomerAccess(id);
        CustomerResponse response = customerService.getCustomerById(id);
        return ResponseEntity.ok(response);
    }
}
