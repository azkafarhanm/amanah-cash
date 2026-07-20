# Amanah Cash — Development Roadmap

**Version:** 1.2
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-20

---

## 1. Purpose

This roadmap organizes implementation of the approved Amanah Cash MVP into sequential milestones. It does not add features or select application frameworks.

Roadmap milestones and delivery sprints are distinct planning units. The current **Sprint 1 — Project Bootstrap** prepares the approved Next.js development foundation only; it does not redefine Roadmap Milestone 1 or begin a later product or Landing Page milestone.

## 2. Delivery Rules

- Complete milestones in dependency order.
- Preserve exact whole-Rupiah arithmetic from the first financial implementation.
- Keep Balance derived from complete Transaction history.
- Test financial integrity before adding presentation refinements.
- Treat mobile as the primary verification viewport.
- Do not add offline behavior or other excluded scope during financial MVP milestones. Authentication and authorization proceed only through separately approved dedicated sprints.
- A milestone is complete only when its listed criteria are verified.

### 2.1 Current Sprint 1 Execution Boundary

The current **Sprint 1 — Project Bootstrap** is limited to Local Development project bootstrap using the approved local SQLite database. It must not install Auth.js; create an authentication Route Handler; create `User`, `Account`, `Session`, `VerificationToken`, or any authentication schema; deploy to Vercel; configure production hosting; introduce an external database; or make a production deployment decision. These constraints govern the current sprint without changing the completed scope or acceptance criteria of Roadmap Milestone 1.

## 3. Milestone Overview

| Milestone | Name | Primary Requirements |
|-----------|------|----------------------|
| 1 | Project Foundation | FR-3.4.1–3.4.3 |
| 2 | Student Management | FR-3.1.1–3.1.3 |
| 3 | Transaction Foundation and Deposit | FR-3.2.1 |
| 4 | Balance and Atomic Withdrawal | FR-3.2.2, FR-3.3.1 |
| 5 | Student Detail and Progressive History | FR-3.1.4, FR-3.2.3 |
| 6 | Validation and Interaction States | FR-3.1.1, FR-3.2.1–3.2.2 |
| 7 | Failure Handling and Safe Retry | FR-3.2.1–3.2.2; NFR-5.1–5.2 |
| 8 | Verification and Quality | All FR and NFR |
| 9 | Production Readiness | FR-3.4.1–3.4.3; NFR Sections 5–8 |

## 4. Milestone 1 — Project Foundation

### Goal

Establish the smallest runnable client, server, and relational database foundation for the approved layered architecture.

### Scope

- Presentation, Application, Domain, and Persistence boundaries.
- Single server deployable and single database connection.
- Initial Student and Transaction schema migrations.
- PWA manifest, service-worker registration, and standalone presentation shell.
- Three-screen navigation shell and mobile-first layout foundation.

### Deliverables

- Runnable application shell.
- Database schema with approved tables, keys, constraints, and indexes.
- Configuration boundary for database connection.
- Baseline automated test structure.
- 320px–480px layout and 44px touch-target primitives.

### Dependencies

- Approved Domain Model, Database Design, User Flows, Wireframes, and System Architecture.

### Completion Criteria

- Client communicates with the single server boundary.
- Server communicates with the single relational database.
- Schema creates only `students` and `transactions` product tables.
- No Balance persistence or excluded infrastructure exists.
- PWA metadata is valid and the application shell launches in supported browser context.

## 5. Milestone 2 — Student Management

### Goal

Enable the operator to create, list, and search Students.

### Scope

- StudentName normalization and validation.
- Case-insensitive uniqueness.
- Create Student overlay and outcomes.
- Alphabetical Student list.
- Partial case-insensitive search.
- First-time, empty-list, empty-search, loading, and failure states.

### Deliverables

- Create Student use case and persistence.
- Student list and search reads.
- Student List UI and Create Student overlay.
- Tests for valid, empty, too-long, normalized, and duplicate names.

### Dependencies

- Milestone 1 schema, layers, navigation shell, and test structure.

### Completion Criteria

- FR-3.1.1, FR-3.1.2, and FR-3.1.3 acceptance criteria pass.
- Concurrent duplicate creation is prevented by the database unique constraint.
- Search and uniqueness use the same normalized representation.
- No Student edit or delete operation exists.

## 6. Milestone 3 — Transaction Foundation and Deposit

### Goal

Persist traceable, append-only Deposit events using whole-Rupiah amounts.

### Scope

- TransactionId, TransactionType, and RupiahAmount domain types.
- Positive whole-Rupiah validation.
- Deposit application use case.
- SQLite `BEGIN IMMEDIATE` financial-write serialization.
- Deposit Transaction Entry mode and direction text.
- Append-only Persistence access and SQLite triggers against Transaction update and deletion.

### Deliverables

- Atomic Deposit persistence.
- Append-only Transaction access boundary.
- Deposit Transaction Entry UI.
- Tests for valid, zero, negative, decimal, non-numeric, and out-of-range Amounts.
- Tests proving a failed Deposit leaves no partial event.

### Dependencies

- Milestone 1 Transaction schema and Persistence boundary.
- Milestone 2 Student identity and retrieval.

### Completion Criteria

- FR-3.2.1 acceptance criteria pass.
- Deposit direction is explicit and Balance effect is positive.
- A Deposit is reported successful only after commit.
- Application paths cannot edit or delete a persisted Transaction.

## 7. Milestone 4 — Balance and Atomic Withdrawal

### Goal

Provide exact complete-history Balance calculation and concurrency-safe Withdrawal.

### Scope

- Exact integer Balance aggregation.
- Zero Balance for a Student with no Transactions.
- Withdrawal Transaction Entry mode and direction text.
- Locked full-history Balance check and Withdrawal insert in one transaction.
- Concurrent financial-write behavior.

### Deliverables

- Complete-history Balance query.
- Atomic Withdrawal application use case.
- Withdrawal UI including current Balance and insufficient-balance outcome.
- Concurrency tests for simultaneous Deposits and Withdrawals on one Student.
- Concurrency test confirming all writes preserve correct per-Student histories under SQLite's single-writer boundary.

### Dependencies

- Milestone 3 Transaction model, append-only persistence, and SQLite write-serialization protocol.

### Completion Criteria

- FR-3.2.2 and FR-3.3.1 acceptance criteria pass.
- No accepted sequence of concurrent requests produces a negative Balance.
- Balance equals all Deposits minus all Withdrawals.
- No Balance column, cache, or summary table exists.

## 8. Milestone 5 — Student Detail and Progressive History

### Goal

Present correct Student financial detail while loading Transaction history progressively.

### Scope

- Student Detail loading and error states.
- Correct full-history Balance presentation.
- Newest-first Transaction items with type, direction, Amount, and timestamp.
- Stable cursor-based older-history retrieval.
- Empty history, loading-older, end-of-history, and page-failure states.

### Deliverables

- Student Detail read use case.
- Progressive history query and continuation contract.
- Student Detail and Transaction History UI.
- Tests for deterministic ordering, equal timestamps, and appended events between page requests.
- Tests proving history pagination does not affect Balance.

### Dependencies

- Milestone 2 Student navigation.
- Milestone 4 authoritative Balance calculation.

### Completion Criteria

- FR-3.1.4 and FR-3.2.3 acceptance criteria pass.
- Older history can be loaded until complete.
- No provisional or page-derived Balance is displayed.
- No Transaction item offers edit or delete actions.

## 9. Milestone 6 — Validation and Interaction States

### Goal

Make all approved validation and interaction states consistent, fast, and mobile-first.

### Scope

- Client and server validation responsibility alignment.
- Approved inline error messages.
- Loading placeholders and disabled submission states.
- Input preservation after failure.
- Deposit and Withdrawal direction clarity.
- Browser Back and Cancel behavior.
- Touch targets and mobile keyboard behavior.

### Deliverables

- Shared validation outcome mapping across layers.
- Complete validation, loading, empty, and submitting states from the wireframes.
- Mobile viewport interaction verification.
- Tests for repeated confirmation prevention.

### Dependencies

- Milestones 2–5 completed use cases and screens.

### Completion Criteria

- All validation scenarios in Functional Requirements Section 6.1 behave as documented.
- Every interactive target is at least 44px by 44px.
- Forms preserve valid input after correctable failures.
- Core workflows match documented tap counts.

## 10. Milestone 7 — Failure Handling and Safe Retry

### Goal

Handle persistence, network, and unexpected failures without silent loss, partial writes, or duplicate Transactions.

### Scope

- Explicit server failure outcomes.
- Database rollback behavior.
- Student List, Student Detail, history-page, and Transaction failure UI.
- Stable Transaction UUID resolution and retry.
- Unknown commit-outcome handling.
- Explicit offline/network failure with no offline queue.

### Deliverables

- Consistent error classification and response mapping.
- Safe Retry behavior for reads and Transaction writes.
- Unknown-outcome resolution path.
- Failure-injection tests before insert, before commit, and after uncertain client response.
- Duplicate retry tests.

### Dependencies

- Milestone 3–5 persistence and read flows.
- Milestone 6 interaction-state behavior.

### Completion Criteria

- NFR-5.1 and NFR-5.2 pass.
- A failed operation leaves no partial financial event.
- Retry cannot create an unintended duplicate Transaction.
- No client state reports an unconfirmed Transaction as successful.
- Network failure never queues an offline Transaction.

## 11. Milestone 8 — Verification and Quality

### Goal

Verify all functional, financial, responsive, and traceability requirements as one MVP system.

### Scope

- Full automated test suite.
- Domain invariant tests.
- Persistence constraint and transaction tests.
- End-to-end core workflow tests.
- Mobile-primary and desktop-secondary verification.
- Accessibility checks for touch size, text readability, and error communication.

### Deliverables

- Requirement-to-test traceability matrix.
- Happy-path and error-path coverage for every FR.
- Financial edge-case and concurrency test results.
- PWA installability and standalone-launch verification.
- Verified empty, loading, failure, and retry states.

### Dependencies

- Milestones 1–7 complete.

### Completion Criteria

- Every FR acceptance criterion has a passing verification.
- NFR-3.1–3.3, NFR-5.1–5.2, NFR-6.1, and NFR-7.1–7.2 pass.
- Zero, negative, decimal, overflow, duplicate, concurrency, and retry cases pass.
- Balance is reproducible from persisted Transactions in every financial test.
- No skipped test hides a failed requirement.

## 12. Milestone 9 — Production Readiness

### Goal

Prepare the approved MVP for reliable deployment without expanding its scope.

This is the Deployment phase in which production hosting and database compatibility decisions are made. No production deployment decision is pulled forward into Sprint 1.

### Scope

- Production configuration and database migration execution.
- PWA asset and server deployment as one logical application.
- Database connectivity restricted to the server boundary.
- Production error diagnostics and operator-safe messages.
- Final requirement, documentation, and deployment review.
- Definition of the open NFR deployment measurement baseline.

### Deliverables

- Repeatable deployment procedure.
- Migration and rollback procedure.
- Production configuration checklist.
- Error-diagnostic verification.
- Agreed supported-browser, network-latency, and data-volume test baseline.
- Final MVP acceptance report.

### Dependencies

- Milestone 8 verification complete.
- Deployment environment selected.

### Completion Criteria

- Application and schema deploy consistently to the selected environment.
- Database is not directly exposed to the client.
- PWA installability, standalone mode, and online failure behavior are verified.
- Open NFR measurement baseline is resolved and tested.
- Documentation matches the delivered MVP.
- No excluded infrastructure or product capability is present.

## 13. Cross-Milestone Traceability

| Requirement | Primary Milestone | Verification Milestone |
|-------------|-------------------|------------------------|
| FR-3.1.1 Create Student | 2 | 8 |
| FR-3.1.2 View Student List | 2 | 8 |
| FR-3.1.3 Search Student | 2 | 8 |
| FR-3.1.4 View Student Detail | 5 | 8 |
| FR-3.2.1 Record Deposit | 3 | 8 |
| FR-3.2.2 Record Withdrawal | 4 | 8 |
| FR-3.2.3 View Transaction History | 5 | 8 |
| FR-3.3.1 Compute Balance | 4 | 8 |
| FR-3.4.1 PWA Installation | 1 and 9 | 8 and 9 |
| FR-3.4.2 Navigation | 1 and 6 | 8 |
| FR-3.4.3 Responsive Layout | 1 and 6 | 8 |
| NFR-3.1–3.3 Financial correctness | 3 and 4 | 8 |
| NFR-4.1 Progressive history | 5 | 8 |
| NFR-4.2 Interactive search | 2 | 8 |
| NFR-4.3 Workflow usability | 6 | 8 |
| NFR-5.1–5.2 Reliability | 7 | 8 |
| NFR-6.1 Traceability | 3–5 | 8 |
| NFR-7.1–7.2 PWA and responsive interaction | 1, 6, and 9 | 8 and 9 |

## 14. Explicitly Excluded Work

No milestone includes:

- Password authentication, public registration, password recovery, provider-assigned roles, Transaction actor attribution, and routine Platform Admin financial access.
- Offline data or Transaction synchronization.
- Transaction edit, deletion, notes, categories, reporting, or export.
- Student deletion or bulk operations.
- Multiple currencies.
- Microservices, event sourcing, CQRS, message queues, background workers, caches, read replicas, multiple databases, distributed transactions, service mesh, Kubernetes, or API gateway.

Any such work requires a separately approved change to product requirements and is not part of this roadmap.

## 15. Dedicated Authentication and Authorization Track

This approved track is separate from the numbered financial MVP milestones:

1. Review the physical identity, Google linkage, database-session, and Student-ownership schema.
2. Implement Platform Admin provisioning and deactivation.
3. Implement Auth.js Google login and registered-email admission.
4. Protect `/app` and implement logout/session expiry.
5. Enforce role and Student ownership on every server operation.
6. Implement assignment and transfer operations.
7. Verify security, privacy, denial paths, and accessibility.

Every implementation step requires an approved sprint contract. No step may introduce a placeholder route, unscoped financial query, or administrative financial bypass.
