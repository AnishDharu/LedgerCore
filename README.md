# LedgerCore

A banking-inspired full-stack portfolio project for learning Java, Spring Boot, PostgreSQL, and financial transaction design.

> Learning and portfolio simulation only. Do not connect to real customer funds or payment credentials.

## Requirements

- JDK 21
- IntelliJ IDEA
- Internet access for Maven to download dependencies

## Run

1. Extract this ZIP.
2. Open the `LedgerCore-starter` folder in IntelliJ IDEA.
3. Set Project SDK to Java 21.
4. Allow IntelliJ to import the Maven project.
5. Run `com.ledgercore.LedgerCoreApplication`.
6. Open http://localhost:8080/

## Initial structure

- `controller/` — web request handlers
- `src/main/resources/templates/` — Thymeleaf HTML pages
- `application.properties` — application configuration
- `src/test/` — automated tests

## Why this starter is intentionally small

The first milestone only includes the web layer, Thymeleaf, validation, and tests so the app can start before a database is configured. We will add PostgreSQL/JPA, Flyway, Spring Security, and Testcontainers in later steps and explain each dependency when we use it.

## Planned development

1. Confirm the application starts.
2. Configure PostgreSQL and database migrations.
3. Design customer and account data models.
4. Add authentication and authorization.
5. Implement transfer processing and a double-entry ledger.
6. Add integration tests, API documentation, and Docker setup.
