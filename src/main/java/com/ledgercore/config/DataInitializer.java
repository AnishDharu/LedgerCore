package com.ledgercore.config;

import com.ledgercore.customer.Customer;
import com.ledgercore.customer.CustomerRepository;
import com.ledgercore.customer.CustomerRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initializes default system data on startup.
 * Admin credentials are read from configuration/environment variables, never hardcoded in plaintext.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ledgercore.admin.email}")
    private String adminEmail;

    @Value("${ledgercore.admin.password}")
    private String adminPassword;

    public DataInitializer(CustomerRepository customerRepository, PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!customerRepository.existsByEmail(adminEmail)) {
            Customer admin = new Customer();
            admin.setFullName("Bank Administrator");
            admin.setEmail(adminEmail);
            admin.setPhoneNumber("0000000000");
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRole(CustomerRole.ADMIN);
            admin.setActive(true);

            customerRepository.save(admin);
            log.info("Initialized default administrator account: {}", adminEmail);
        }
    }
}
