# Amanah Cash — Development Roadmap

**Version:** 1.14
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-23

---

## 1. Purpose

This roadmap organizes implementation of the approved Amanah Cash MVP into sequential milestones. It does not add features or select application frameworks.

Roadmap milestones and delivery sprints are distinct planning units. Project Foundation, Student Management, the authentication/authorization/App Shell/Operator Management track, the Transaction Engine, Transaction UI, UX Polish, MVP QA, Dashboard Foundation, Reporting Foundation, and the separately approved Export Foundation sprint are complete. The next recommended product sprint is Reconciliation and Financial Audit Reads.

## 2. Delivery Rules

- Complete milestones in dependency order.
- Preserve exact whole-Rupiah arithmetic from the first financial implementation.
- Keep persisted Student Balance atomically synchronized and reconcilable with non-deleted Transaction effects.
- Test financial integrity before adding presentation refinements.
- Treat mobile as the primary verification viewport.
- Do not add offline behavior or other excluded scope during financial MVP milestones. Reuse the implemented authentication and centralized authorization layers.
- A milestone is complete only when its listed criteria are verified.
- Every implementation sprint must synchronize `AI_CONTEXT.md`, `CHANGELOG.md`, and any affected README or roadmap status.

### 2.1 Current Delivery Status

- Milestone 1 — Project Foundation: complete.
- Milestone 2 — Student Management: complete under the approved multi-user ownership architecture.
- Dedicated authentication and authorization track: complete through provisioning, login, session enforcement, role/ownership enforcement, assignment, and transfer behavior.
- Application Shell and Operator Management: complete.
- Transaction Engine and Operator Transaction UI: complete at domain, persistence, protected API, read projection, presentation, audit, rollback, accessibility, and test levels.
- UX Polish and Placeholder Consistency sprint: complete; every sidebar destination resolves, planned modules use one placeholder primitive, data states are contextual, and mobile list tables use labeled record cards.
- MVP Quality Assurance and Business Workflow Validation: complete with five defects fixed, regression coverage added, and a `READY WITH MINOR LIMITATIONS` recommendation documented in `docs/41-mvp-quality-assurance-report.md`.
- Dashboard and Analytics Foundation: complete as a read-only presentation layer with privacy-safe Admin aggregates, ownership-scoped Operator metrics, reusable cards, bounded activity reads, responsive loading/empty states, and regression coverage. No authorization, ownership, schema, or financial-write behavior changed.
- Reporting Foundation: complete and production-polished with privacy-safe Admin activity reports, ownership-scoped Operator financial history, composable Jakarta-period filters with grouped dates and pending/disabled feedback, distinct no-assignment/search/filter states, explanatory zero summaries, accessible responsive tables with live results and pointer/keyboard feedback, Student detail timelines, and an export adapter contract. No export or financial write was introduced.
- Export Foundation: complete with a Reporting Read Service-only coordinator, presentation-neutral documents, an extensible format registry, authorized complete-filtered-result CSV, Excel, and paginated PDF downloads, centralized default 10,000-row and optional byte guard rails, controlled oversized errors, and privacy-safe Jakarta filenames. No query/calculation, authorization, ownership, schema, Dashboard, Transaction Engine, or Export Contract behavior changed.
- Export Production Hardening: partial. Safe synchronous guard rails are complete, but buffering, deployment capacity measurement, deadline/concurrency control, cross-page snapshot semantics, streaming, and any separately approved asynchronous path remain outstanding; see `docs/45-export-production-readiness-review.md`.
- Milestone 4 is partial: Balance/history reads are complete; reconciliation and audit-history reads remain outstanding. Milestones 5–7 are complete; Milestone 8 is complete for repository/application verification but retains physical-device and deployment-environment gates; Milestone 9 remains outstanding.
- Production hosting, external database selection, and deployment topology remain deferred to Milestone 9.

## 3. Milestone Overview

| Milestone | Name | Status | Primary Requirements |
|-----------|------|--------|----------------------|
| 1 | Project Foundation | Complete | FR-3.4.1–3.4.3 |
| 2 | Student Management | Complete | FR-3.1.1–3.1.3, FR-3.1.5 |
| 3 | Transaction Engine | Complete | FR-3.2.1–FR-3.2.7, FR-3.3.1–FR-3.3.2 |
| 4 | Reconciliation and Financial Reads | Partial — Balance/history complete | FR-3.1.4, FR-3.2.3, FR-3.3.1–FR-3.3.2 |
| 5 | Financial Presentation and Progressive History | Complete | FR-3.1.4, FR-3.2.3–FR-3.2.7 |
| 6 | Validation and Interaction States | Complete for financial flows | FR-3.2.1–FR-3.2.7 |
| 7 | Failure Handling and Safe Retry | Complete | FR-3.2.1–FR-3.2.7; NFR-5.1–5.2 |
| 8 | Verification and Quality | Complete — environment gates remain in Milestone 9 | All FR and NFR |
| 9 | Production Readiness | Outstanding | FR-3.4.1–3.4.3; NFR Sections 5–8 |

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
- Schema contains the approved Student, Transaction, identity/session, and Operator-audit tables without Balance persistence.
- No Balance persistence or excluded infrastructure exists.
- PWA metadata is valid and the application shell launches in supported browser context.

## 5. Milestone 2 — Student Management

### Goal

Enable Platform Admin to manage Students and assignments while Operators view only their assigned Students.

### Scope

- StudentName normalization and validation.
- Case-insensitive uniqueness.
- Platform Admin create and edit Student outcomes.
- Required active-Operator assignment and reassignment.
- Active, inactive, and archived Student status plus optional notes.
- Operator-owned Student list and detail access.
- Server-side paginated Student list.
- Partial case-insensitive search.
- First-time, empty-list, empty-search, loading, and failure states.

### Deliverables

- Create Student use case and persistence.
- Student list and search reads.
- Admin and Operator Student list/detail UI plus Admin create/edit UI.
- Tests for validation, active Operator assignment, ownership transfer, visibility, search, and pagination.

### Dependencies

- Milestone 1 schema, layers, navigation shell, and test structure.

### Completion Criteria

- Student Management tests and authorization isolation tests pass.
- Concurrent duplicate creation is prevented by the database unique constraint.
- Search and uniqueness use the same normalized representation.
- Student edit and ownership reassignment exist; Student deletion and financial workflows do not.

## 6. Milestone 3 — Transaction Engine

### Goal

Implement the complete ownership-scoped Transaction lifecycle, persisted Balance, and immutable financial audit as one atomic engine.

### Scope

- Deposit, Withdrawal, and Correction types/effects.
- Transaction create, edit, soft delete, and restore lifecycle.
- Persisted Student Balance and financial version.
- Immutable `CREATE`, `EDIT`, `DELETE`, `RESTORE`, and privacy-minimized `OWNERSHIP_TRANSFER` audit.
- Positive whole-Rupiah, Correction direction/reason, lifecycle, and non-negative Balance validation.
- SQLite `BEGIN IMMEDIATE` financial-write serialization.
- Expected Transaction revision and unique command-ID idempotency.
- Transaction, Balance/version, and audit atomic rollback.
- Physical migration/backfill and reconciliation verification designed under the approved implementation gate.

### Deliverables

- Transaction Engine domain/application/persistence boundaries.
- Reviewed physical schema and reversible migration for Balance/version, lifecycle metadata, and financial audit.
- Atomic lifecycle commands without UI scope.
- Tests for every effect/delta, status/ownership failure, revision conflict, soft-delete/restore state, command replay, concurrency, rollback, audit, overflow, and reconciliation invariant.

### Dependencies

- ADR-004 and Transaction Foundation TDS.
- Milestone 1 Transaction schema and Persistence boundary, which require reviewed evolution.
- Milestone 2 Student identity and retrieval.

### Completion Criteria

- FR-3.2.1–FR-3.2.7 and FR-3.3.1–FR-3.3.2 engine acceptance criteria pass at service/persistence level.
- Every successful mutation commits Transaction state, non-negative Balance/version, and immutable audit together.
- No hard-delete path exists.
- Ownership and ACTIVE Student status are rechecked inside the write transaction.
- Repeated command IDs cannot apply a Balance delta twice.

## 7. Milestone 4 — Reconciliation and Financial Reads

### Goal

Expose correct ownership-scoped financial reads and prove persisted Balance reconciliation.

### Scope

- Persisted Balance read independent of history pagination.
- Reconciliation aggregation across non-deleted Deposit, Withdrawal, and Correction effects.
- Active, deleted/restored, and audit-history read contracts.
- Stable newest-first business-time history and cursor pagination.
- Ownership-transfer visibility behavior.

### Deliverables

- Ownership-scoped Balance/Transaction/audit read services.
- Explicit reconciliation command/report for verification use, without automatic repair.
- Progressive history query and continuation contract.
- Tests for filtering, ordering, deletion state, transfer visibility, and reconciliation mismatch detection.

### Dependencies

- Milestone 3 Transaction Engine, audit, persisted Balance, and serialization protocol.

### Completion Criteria

- FR-3.2.3 and FR-3.3.1–FR-3.3.2 read/reconciliation criteria pass.
- Persisted Balance equals non-deleted Transaction effects.
- Mismatch is surfaced as an integrity incident and never repaired silently.
- Platform Admin has no routine financial read or audit bypass.

## 8. Milestone 5 — Financial Presentation and Progressive History

### Goal

Present correct Student financial detail while loading Transaction history progressively.

### Scope

- Student Detail loading and error states.
- Correct persisted Balance presentation.
- Newest-first Transaction items with type, effect, Amount, business time, revision, and lifecycle state.
- Deposit, Withdrawal, Correction, edit, soft-delete, restore, and audit interactions defined from approved requirements.
- Stable cursor-based older-history retrieval.
- Empty history, loading-older, end-of-history, and page-failure states.

### Deliverables

- Student Detail read use case.
- Progressive history query and continuation contract.
- Student Detail and Transaction History UI.
- Tests for deterministic ordering, equal timestamps, and appended events between page requests.
- Tests proving history pagination does not affect persisted Balance.

### Dependencies

- Milestone 2 Student navigation.
- Milestone 4 authoritative Balance/read contracts.

### Completion Criteria

- FR-3.1.4 and FR-3.2.3 acceptance criteria pass.
- Older history can be loaded until complete.
- No provisional or page-derived Balance is displayed.
- Transaction lifecycle actions are available only when ownership, Student status, Transaction state, and revision permit them.

## 9. Milestone 6 — Validation and Interaction States

### Goal

Make all approved validation and interaction states consistent, fast, and mobile-first.

### Scope

- Client and server validation responsibility alignment.
- Approved inline error messages.
- Loading placeholders and disabled submission states.
- Input preservation after failure.
- Deposit, Withdrawal, and directional Correction effect clarity.
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
- Unique lifecycle command ID resolution and retry, with a stable Transaction UUID for create commands.
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
- Export workload qualification using realistic row widths and 30,000-/100,000-row cases.
- Measured tuning of the implemented synchronous row/byte limits plus deadline/concurrency policy.
- A decision on backpressure-aware CSV streaming and cross-page consistency; any asynchronous export infrastructure requires separate architecture approval.

### Deliverables

- Repeatable deployment procedure.
- Migration and rollback procedure.
- Production configuration checklist.
- Error-diagnostic verification.
- Agreed supported-browser, network-latency, and data-volume test baseline.
- Recorded export page/query count, duration, time-to-first-byte, peak heap, output size, database load, and timeout behavior at the selected limits.
- Verification that configured export limits fit the selected deployment resource envelope.
- Final MVP acceptance report.

### Dependencies

- Milestone 8 verification complete.
- Deployment environment selected.

### Completion Criteria

- Application and schema deploy consistently to the selected environment.
- Database is not directly exposed to the client.
- PWA installability, standalone mode, and online failure behavior are verified.
- Open NFR measurement baseline is resolved and tested.
- CSV export limits are enforced from measured deployment capacity, or large-volume export remains explicitly unsupported.
- The supported CSV volume completes within the agreed resource envelope without weakening Reporting, authorization, ownership, or Admin privacy boundaries.
- Documentation matches the delivered MVP.
- No excluded infrastructure or product capability is present.

## 13. Cross-Milestone Traceability

| Requirement | Primary Milestone | Verification Milestone |
|-------------|-------------------|------------------------|
| FR-3.1.1 Create Student | 2 | 8 |
| FR-3.1.2 View Student List | 2 | 8 |
| FR-3.1.3 Search Student | 2 | 8 |
| FR-3.1.4 View Student Detail | 5 | 8 |
| FR-3.1.5 Edit and Transfer Student | 2 | 8 |
| FR-3.2.1 Record Deposit | 3 | 8 |
| FR-3.2.2 Record Withdrawal | 3 | 8 |
| FR-3.2.3 View Transaction History | 4 and 5 | 8 |
| FR-3.2.4 Record Correction | 3 | 8 |
| FR-3.2.5 Edit Transaction | 3 and 5 | 8 |
| FR-3.2.6 Soft Delete Transaction | 3 and 5 | 8 |
| FR-3.2.7 Restore Transaction | 3 and 5 | 8 |
| FR-3.3.1 Maintain Balance | 3 and 4 | 8 |
| FR-3.3.2 Record Financial Audit | 3 and 4 | 8 |
| FR-3.4.1 PWA Installation | 1 and 9 | 8 and 9 |
| FR-3.4.2 Navigation | 1 and 6 | 8 |
| FR-3.4.3 Responsive Layout | 1 and 6 | 8 |
| NFR-3.1–3.4 Financial correctness | 3 and 4 | 8 |
| NFR-4.1 Progressive history | 5 | 8 |
| NFR-4.2 Interactive search | 2 | 8 |
| NFR-4.3 Workflow usability | 6 | 8 |
| NFR-5.1–5.2 Reliability | 7 | 8 |
| NFR-6.1–6.2 Traceability | 3–5 | 8 |
| NFR-7.1–7.2 PWA and responsive interaction | 1, 6, and 9 | 8 and 9 |

## 14. Explicitly Excluded Work

No milestone includes:

- Password authentication, public registration, password recovery, provider-assigned roles, and routine Platform Admin financial access.
- Offline data or Transaction synchronization.
- Hard Transaction deletion.
- Transaction transfer, scheduled Transactions, monthly allowance, categories, attachments, approval workflow, advanced Excel/PDF presentation, and advanced historical analytics implementation. Their extension boundaries are reserved by the Transaction Foundation TDS and Export Foundation. Implemented Dashboard, Reporting, CSV, Excel, and PDF Export Foundations remain read-only projections.
- Student deletion or bulk operations.
- Multiple currencies.
- Microservices, event sourcing, CQRS, message queues, background workers, caches, read replicas, multiple databases, distributed transactions, service mesh, Kubernetes, or API gateway.

Any such work requires a separately approved change to product requirements and is not part of this roadmap.

## 15. Dedicated Authentication and Authorization Track

This approved track is separate from the numbered financial MVP milestones and is now implemented:

1. Review the physical identity, Google linkage, database-session, and Student-ownership schema.
2. Implement Platform Admin provisioning and deactivation.
3. Implement Auth.js Google login and registered-email admission.
4. Protect `/app` and implement logout/session expiry.
5. Enforce role and Student ownership on every server operation.
6. Implement assignment and transfer operations.
7. Verify security, privacy, denial paths, and accessibility.

All seven steps are complete. Future financial work must reuse these boundaries. No step may introduce an unscoped financial query or administrative financial bypass.
