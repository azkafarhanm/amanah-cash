# Amanah Cash — Engineering Rules

**Version:** 1.0
**Status:** Draft
**Owner:** Project Owner
**Last Updated:** 2026-07-17

---

## 1. Purpose

This document defines engineering standards for contributors implementing the approved Amanah Cash MVP. Product behavior is defined by the approved product and design documentation; engineering work must preserve it.

## 2. Project Philosophy

- Correct financial behavior is more important than implementation convenience.
- Transaction history is the single source of financial truth.
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

Do not introduce distributed infrastructure, offline synchronization, authentication, reporting, or other excluded scope.

## 4. Domain-First Development

- Name code after approved domain terms: Student, Transaction, Deposit, Withdrawal, RupiahAmount, and Balance.
- Implement invariants in the Domain layer before connecting presentation behavior.
- Keep application orchestration separate from domain decisions.
- Keep database details behind the Persistence layer.
- Treat Student as the aggregate root for financial writes.
- Serialize Deposit and Withdrawal writes per Student.

Business rules must be visible in Domain code or explicit persistence constraints. Hidden business rules are prohibited.

## 5. Financial Integrity

### 5.1 Append-Only Transactions

- A persisted Transaction must not be edited or deleted through application behavior.
- Application database access must not permit Transaction update, deletion, or truncation.
- Do not add soft deletion, correction mutation, or an alternate financial-history path.
- A Transaction write must either commit completely or leave no financial event.

### 5.2 Derived Balance

- Balance must always equal all Deposits minus all Withdrawals for one Student.
- Balance must be calculated from complete persisted Transaction history.
- Balance must not be stored in a column, cache, summary table, client state treated as authoritative, or other independent financial representation.
- Progressive history pages must never become the input to Balance calculation.
- Use exact whole-Rupiah integer arithmetic; do not use floating-point money.

### 5.3 Atomic Financial Writes

- Every Deposit and Withdrawal must use the approved per-Student lock protocol.
- Withdrawal Balance validation and insertion must occur in one database transaction.
- Application-side checks may assist the UI but are not the integrity boundary.
- A Transaction is successful only after commit succeeds.
- Unknown commit outcomes must be resolved through the original Transaction UUID before retry.

## 6. Layer Responsibilities

| Layer | Owns | Must not own |
|-------|------|--------------|
| Presentation | Screens, input feedback, loading, empty, error, navigation, submission state | Business rules, authoritative Balance, database access |
| Application | Use-case orchestration, request outcomes, transaction coordination | UI layout, database-specific queries, new business policy |
| Domain | Terms, invariants, Balance formula, Transaction direction, aggregate rules | Transport, framework, database product, screen state |
| Persistence | Tables, queries, constraints, locks, atomic writes, history cursor | Product presentation or independent business behavior |
| Database | Durable Students and Transactions, integrity constraints, atomic commit | Stored Balance, UI state, actor identity, offline state |

Business logic inside UI components is prohibited. UI code may validate input format for feedback but must defer authoritative decisions to the server and Domain layer.

## 7. Validation Responsibilities

- Client: immediate format feedback and repeated-submit prevention.
- Server/Application: request shape and explicit outcome mapping.
- Domain: authoritative StudentName, RupiahAmount, Transaction direction, and Balance invariants.
- Persistence/Database: uniqueness, referential integrity, allowed type, positive Amount, atomicity, and append-only protection.

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

- Use approved domain names without synonyms.
- Use `Student` for the aggregate root and `Transaction` for a financial event.
- Use `deposit` and `withdrawal` for persisted Transaction types.
- Name Balance values as derived or calculated when ambiguity is possible.
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

- Domain tests for normalization, whole-Rupiah Amounts, Transaction direction, and Balance formula.
- Persistence tests for constraints, append-only access, rollback, locking, and retry UUID behavior.
- Concurrency tests for simultaneous financial writes to one Student.
- Tests proving different Students do not share a financial lock boundary.
- Application tests for explicit validation and failure outcomes.
- Presentation tests for loading, empty, validation, failure, retry, and progressive-history states.
- End-to-end tests for Create Student, Deposit, Withdrawal, Balance, search, and history.
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
- Persisted or cached authoritative Balance.
- Editing, deleting, or soft-deleting financial history.
- Floating-point monetary calculations.
- Non-atomic Withdrawal validation and insertion.
- Silent failure or optimistic success before commit.
- Premature optimization without an observed requirement.
- Over-engineering or abstractions for hypothetical reuse.
- Features, fields, flows, or infrastructure outside approved MVP scope.
- Bypassing database constraints because equivalent client validation exists.

## 14. Review Questions

Before considering work complete, verify:

1. Which approved requirement authorizes the change?
2. Does the change preserve append-only history and derived Balance?
3. Is business logic in the correct layer?
4. Are validation and failure outcomes explicit at every boundary?
5. Are concurrency and retry behavior safe?
6. Is the implementation simpler than available alternatives with the same correctness?
7. Are tests and documentation synchronized?
