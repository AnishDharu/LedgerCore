package com.ledgercore.audit;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for inspecting audit logs.
 */
@RestController
@RequestMapping("/api/audit-logs")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    /** GET /api/audit-logs/user/{userId} */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLog>> getLogsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(auditService.getLogsByUserId(userId));
    }

    /** GET /api/audit-logs/entity/{entityType}/{entityId} */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLog>> getLogsByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(auditService.getLogsByEntity(entityType, entityId));
    }
}

