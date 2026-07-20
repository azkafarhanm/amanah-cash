# Amanah Cash — Engineering Rules

**Version:** 1.3
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-20

---

## 1. Purpose

This document defines engineering standards for contributors implementing the approved Amanah Cash MVP. Product behavior is defined by the approved product and design documentation; engineering work must preserve it.

## 2. Project Philosophy

- Correct financial behavior is more important than implementation convenience.
- Transaction state, persisted Student Balance, and immutable FinancialAuditEvent must remain atomically consistent and reconcilable.
- Simplicity is a constraint, not an optional preference.
- Mobile operation is primary; desktop is secondary.
- Explicit outcomes are preferred over hidden behavior.
- Every implementation decision must be traceable to an approved requirement or architecture decision.

## 3. Simplicity First

- Build one PWA client, one server deployable, and one relational database.
- Use the fewest layers, modules, dependencies, and abstractions needed to preserve approved boundaries.
- Implement current MVP requirements, not hypothetical future requirements.
- Prefer direct, readable code over generic frameworks created inside the project.
- Add a dependency only when it has a clear current responsibility and a lower maintenance cost than a local implementation.

Do not introduce distributed infrastructure, offline synchronization, or other excluded scope during financial MVP work. Auth.js with Google and Database Sessions may be implemented only in a separately approved Authentication Sprint.

Sprint 1 is a Local Development bootstrap only. Use the approved local SQLite database; do not deploy to Vercel, configure production persistence hosting and operations, introduce an external database, or modify the persistence architecture. Production deployment decisions belong to the Deployment phase.

## 4. Domain-First Development

- Name code after approved domain terms: Student, Transaction, Deposit, Withdrawal, Correction, RupiahAmount, Balance, and FinancialAuditEvent.
- Implement invariants in the Domain layer before connecting presentation behavior.
- Keep application orchestration separate from domain decisions.
- Keep database details behind the Persistence layer.
- Treat Student as the aggregate root for financial writes.
- Serialize every financial lifecycle write per Student.

Business rules must be visible in Domain code or explicit persistence constraints. Hidden business rules are prohibited.

## 5. Financial Integrity

### 5.1 Controlled Transaction Lifecycle

- Create, edit, soft delete, and restore must use the approved Student aggregate command boundary.
- Transaction `studentId`, identity, creation actor, and creation time are immutable.
- Edit requires active state, expected revision, reason, and before/after audit.
- Delete is soft; hard delete/truncation is prohibited.
- A deleted Transaction must be restored before edit.
- Every mutation must either commit Transaction, Balance/version, and audit completely or leave all unchanged.

### 5.2 Persisted and Reconcilable Balance

- Persisted Student Balance must equal all non-deleted Deposit, Withdrawal, and signed Correction effects.
- Balance must not be edited directly or trusted from client state.
- Every Balance delta is calculated by the Domain and applied inside the Transaction lifecycle database transaction.
- Reconciliation may aggregate active effects, but mismatch must be reported as an integrity incident and never repaired silently.
- Progressive history pages must never become the input to Balance presentation.
- Use exact whole-Rupiah integer arithmetic; do not use floating-point money.

### 5.3 Atomic Financial Writes

- Every create/edit/delete/restore must use the approved SQLite `BEGIN IMMEDIATE` serialization protocol in Database Design Section 8.
- Ownership/status recheck, lifecycle validation, Transaction mutation, Balance/version update, and audit append occur in one database transaction.
- Application-side checks may assist the UI but are not the integrity boundary.
- A Transaction is successful only after commit succeeds.
- Unknown commit outcomes must be resolved through the original command ID before retry.

### 5.4 Immutable Financial Audit

- Append `CREATE`, `EDIT`, `DELETE`, `RESTORE`, and `OWNERSHIP_TRANSFER` evidence according to ADR-004.
- Never expose an audit update/delete product operation.
- Derive actor and Balance transition on the server; never trust client audit fields.
- Audit append failure rolls back the corresponding mutation.

## 6. Layer Responsibilities

| Layer | Owns | Must not own |
|-------|------|--------------|
| Presentation | Screens, input feedback, loading, empty, error, navigation, submission state | Business rules, authoritative Balance, database access |
| Application | Use-case orchestration, request outcomes, transaction coordination | UI layout, database-specific queries, new business policy |
| Domain | Terms, effects, lifecycle, Balance delta, revision, audit requirements, aggregate rules | Transport, framework, database product, screen state |
| Persistence | Tables, queries, constraints, locks, atomic writes, history cursor | Product presentation or independent business behavior |
| Database | Durable Students/Balance/version, Transactions, FinancialAuditEvents, constraints, atomic commit | UI state, client authority, offline state |

Authentication and authorization add these mandatory boundaries:

- authenticate through Auth.js and Google only;
- validate the database session and active Amanah Cash user on the server;
- derive role and Student ownership from Amanah Cash, never Google claims;
- scope every Operator read and write to currently assigned Students in Application/Persistence;
- deny by default when identity, role, active status, or ownership is missing;
- never use client filtering as authorization; and
- never grant Platform Admin an implicit financial-data bypass.

Business logic inside UI components is prohibited. UI code may validate input format for feedback but must defer authoritative decisions to the server and Domain layer.

## 7. Validation Responsibilities

- Client: immediate format feedback and repeated-submit prevention.
- Server/Application: request shape and explicit outcome mapping.
- Domain: authoritative StudentName, RupiahAmount, Transaction effect/lifecycle, Balance delta, revision, and audit invariants.
- Persistence/Database: uniqueness, referential integrity, allowed type/direction, positive Amount, lifecycle shape, version conflict, atomicity, soft-delete retention, and immutable audit protection.

Never trust client validation as sufficient. Convert database constraint conflicts into approved domain or validation outcomes.

## 8. Error Handling

- Never fail silently.
- Return explicit success or failure for every operation.
- Preserve valid user input after correctable failure.
- Roll back the complete write after any pre-commit error.
- Do not expose database internals to the operator.
- Keep existing Balance and loaded history visible when only an older-history request fails.
- Do not report an unconfirmed Transaction as successful.
- Do not queue a Transaction while offline.
- Offer Retry only when the retry path is safe.

## 9. Naming Conventions

- Follow the authoritative cross-layer terminology contract in Domain Model Section 4.7.
- Use approved domain names without synonyms.
- Use `Student` for the aggregate root and `Transaction` for a financial event.
- Use `deposit`, `withdrawal`, and `correction` for persisted Transaction types.
- Name Balance values as persisted, proposed, before, after, delta, or reconciled as applicable.
- Use `amount` for positive whole-Rupiah Transaction input.
- Use `created_at` for persistence timestamps and `student_id` for the Transaction foreign key.
- Use names that describe responsibility, not framework mechanics.
- Use consistent language within each codebase layer.

## 10. File Organization

- Organize application code by the approved Presentation, Application, Domain, and Persistence responsibilities.
- Keep dependency direction toward Domain rules and away from Presentation details.
- Co-locate tests with, or clearly mirror, the responsibility they verify.
- Keep schema migrations ordered and reviewable.
- Avoid catch-all utility, service, manager, or helper modules with mixed responsibilities.
- Do not duplicate business rules across unrelated files.
- Keep configuration outside source code where it varies by deployment environment.

Framework-specific folder names may be used after technology selection, but they must preserve these responsibility boundaries.

## 11. Testing Expectations

Every behavior change requires verification proportional to its risk.

Minimum expectations:

- Domain tests for normalization, whole-Rupiah Amounts, Transaction effects, lifecycle deltas, non-negative Balance, revision, and audit requirements.
- Persistence tests for constraints, edit/soft-delete/restore, immutable audit, rollback, locking, command idempotency, and reconciliation behavior.
- Concurrency tests for simultaneous financial writes to one Student.
- Concurrency tests proving SQLite serialization preserves correct independent histories for different Students.
- Application tests for explicit validation and failure outcomes.
- Presentation tests for loading, empty, validation, failure, retry, and progressive-history states.
- End-to-end tests for Create Student, Deposit, Withdrawal, Correction, Transaction lifecycle, Balance, audit, search, and history.
- Mobile-primary manual verification at 320px–480px and desktop-secondary verification.

Tests must include happy paths and relevant failure paths. Do not disable, skip, or weaken a test to make a change pass.

## 12. Documentation Policy

- Product behavior changes require prior approval and synchronized documentation before implementation.
- Update every document identified by the traceability and synchronization rules.
- Keep requirement IDs in plans, pull requests, and relevant tests.
- Update `CHANGELOG.md` for user-visible or release-level changes.
- Update `AI_CONTEXT.md` when approved project scope, rules, architecture, or project state changes.
- Do not duplicate authoritative rules in new documents without a clear purpose and source reference.
- Documentation-only changes still require review and consistency checks.

## 13. Prohibited Practices

The following are prohibited:

- Hidden business rules.
- Business logic inside UI components.
- Direct or client-authoritative Balance mutation outside the Transaction Engine.
- Hard-deleting Transaction or FinancialAuditEvent history.
- Editing a deleted Transaction without restore or mutating immutable Transaction identity/Student/creation fields.
- Floating-point monetary calculations.
- Non-atomic Transaction, Balance/version, and audit mutation.
- Silent failure or optimistic success before commit.
- Premature optimization without an observed requirement.
- Over-engineering or abstractions for hypothetical reuse.
- Features, fields, flows, or infrastructure outside approved MVP scope.
- Bypassing database constraints because equivalent client validation exists.
- Unscoped Student or Transaction access after authorization is introduced.
- Financial data in authentication sessions, cookies, logs, analytics, or administrative screens.
- Password authentication, public registration, or password recovery.

## 14. Review Questions

Before considering work complete, verify:

1. Which approved requirement authorizes the change?
2. Does the change preserve persisted-Balance reconciliation, non-negative state, soft-delete retention, and immutable audit?
3. Is business logic in the correct layer?
4. Are validation and failure outcomes explicit at every boundary?
5. Are concurrency and retry behavior safe?
6. Is the implementation simpler than available alternatives with the same correctness?
7. Are tests and documentation synchronized?
8. Does every protected operation enforce role and current Student ownership on the server?
9. Does the change preserve administrative and financial-data separation?
