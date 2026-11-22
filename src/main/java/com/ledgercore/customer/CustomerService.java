package com.ledgercore.customer;

import com.ledgercore.audit.AuditService;
import com.ledgercore.common.exception.DuplicateResourceException;
import com.ledgercore.common.exception.ResourceNotFoundException;
import com.ledgercore.customer.dto.CreateCustomerRequest;
import com.ledgercore.customer.dto.CustomerResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for customer operations.
 */
@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(CustomerRepository customerRepository,
                           AuditService auditService,
                           PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new customer.
     */
    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "A customer with email " + request.getEmail() + " already exists");
        }

        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setEmail(request.getEmail());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        Customer savedCustomer = customerRepository.save(customer);

        auditService.log(
                savedCustomer.getId(),
                "CUSTOMER_CREATED",
                "CUSTOMER",
                savedCustomer.getId(),
                "Registered customer: " + savedCustomer.getEmail(),
                null
        );

        return CustomerResponse.fromEntity(savedCustomer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer with ID " + id + " not found"));

        return CustomerResponse.fromEntity(customer);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(CustomerResponse::fromEntity)
                .toList();
    }
}
