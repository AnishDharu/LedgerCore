# LedgerCore — Architecture and API Conventions

## 1. Architecture Style

LedgerCore will begin as a layered Spring Boot application (modular monolith).

The initial layers are:

- Controller: receives HTTP requests and produces responses.
- Service: enforces business rules and coordinates operations.
- Repository: provides database access.
- Entity: models persistent domain data.
- DTO: defines request and response data contracts.
- Exception: defines application errors and consistent error responses.
- Config: holds application configuration.
- Enums: holds fixed domain states and classifications.

## 2. Request Flow

HTTP request -> Controller -> Service -> Repository -> Database

The result returns through the application layers to the client.

Controllers must not implement financial business rules. Repositories must not make authorization or transfer-policy decisions.

## 3. Planned Package Structure

com.ledgercore
- config
- controller
- dto
- entity
- enums
- exception
- repository
- service

The package structure will evolve only when there is a clear need.

## 4. API Naming Conventions

- Base path: /api/v1
- Use nouns for resource names.
- Use HTTP methods to express operations.
- Use path variables for resource identifiers.
- Use JSON for REST request and response bodies.
- Validate requests on the server.
- Do not expose JPA entities directly as API responses.
- Derive the authenticated customer identity from the security context.

## 5. Planned Endpoints

- GET /api/v1/accounts
- GET /api/v1/accounts/{id}
- POST /api/v1/accounts
- GET /api/v1/accounts/{id}/transactions
- POST /api/v1/transfers
- GET /api/v1/transfers/{id}
- GET /api/v1/admin/accounts
- PATCH /api/v1/admin/accounts/{id}/status

These endpoints are a design plan and must be implemented with authorization and validation.

## 6. HTTP Status Codes

- 200: successful request
- 201: resource created
- 400: invalid request
- 401: missing or invalid authentication
- 403: insufficient permission
- 404: resource not found or intentionally concealed
- 409: business or state conflict
- 500: unexpected server error

Error responses must not expose stack traces, credentials, or sensitive internal information.

## 7. Financial Processing

Financial operations must be executed through service-layer methods with explicit transaction boundaries.

Transfer processing must preserve atomicity, balanced ledger entries, authorization, idempotency, and concurrency safety.

Financial history must not be silently overwritten or deleted.
