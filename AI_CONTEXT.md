# Amanah Cash — Canonical Engineering Handoff

**Last updated:** 2026-07-22
**Current delivery state:** Reporting Foundation complete; READY WITH MINOR LIMITATIONS; exports, reconciliation/audit presentation, and deployment remain

## Project Purpose

Amanah Cash is a mobile-first PWA for recording financial events after they occur; it does not connect to banks or payment gateways. Platform Admin manages accounts, Student records, and assignments without routine financial-data access. Authenticated Operators may access only currently assigned Students. The approved target atomically couples controlled Transaction lifecycle, persisted Student Balance, and immutable financial audit. Approved documents in `docs/` remain authoritative.

## Completed Milestones

- Product architecture, ADRs, technical design, database foundation, and engineering rules.
- Next.js application foundation, Landing Page foundation, shared design tokens, reusable UI primitives, metadata, and local Geist font.
- Google-only Auth.js authentication with registered-active-user admission and database sessions.
- Centralized role and Student-ownership authorization with consistent route, API, and Server Action adapters.
- Authenticated App Shell with role-aware navigation, protected route groups, loading, empty, forbidden, not-found, and error states.
- Operator Management: list, search, pagination, create, detail, edit, activation/deactivation, assignment-safe logical deletion, last-login tracking, audit summaries, protected APIs, documentation, and tests.
- Student Management: admin list/create/detail/edit, Operator assignment and reassignment, active/inactive/archived status, notes, search, pagination, Operator-scoped list/detail, protected APIs, documentation, database constraints, and tests.
- Transaction Foundation architecture finalized in ADR-004 and the Transaction Foundation TDS, covering Deposit, Withdrawal, Correction, edit, soft delete, restore, persisted Balance, audit, failure/security/reporting implications, sequence diagrams, and future extension boundaries.
- Transaction Engine implemented with Prisma persistence, fail-closed migration, protected Operator APIs, SQLite `BEGIN IMMEDIATE` serialization, Balance/version guards, command idempotency, immutable audit, lifecycle rollback, and comprehensive tests.
- Transaction UI implemented on Operator Student Detail with committed Balance overview, newest-first filtered cursor history, Deposit/Withdrawal/Correction forms, edit, soft delete, restore, safe retry identity, mobile responsiveness, and accessible dialogs.
- UX Polish implemented with one reusable planned-feature placeholder, complete sidebar route outcomes, richer dashboard previews, contextual empty/search states, ownership-scoped Operator list balances, responsive table cards, differentiated error states, and layout-stable skeletons.
- MVP Quality Assurance completed across authentication, administration, Student ownership, every Transaction lifecycle mutation, long-chain Balance reconciliation, authorization routes, UI states, database integrity, and performance smoke checks. Five confirmed defects were fixed with regression coverage; see `docs/41-mvp-quality-assurance-report.md`.
- Dashboard and Analytics Foundation implemented as a read-only presentation layer: privacy-safe Admin aggregates and activity, ownership-scoped Operator counts/managed Balance/daily activity, reusable dashboard cards, responsive skeletons, meaningful empty states, fixed bounded queries, and isolation tests. No schema, authorization, ownership, or financial-write behavior changed.
- Reporting Foundation implemented and UX-polished as a read-only presentation layer: privacy-safe Admin activity reports, ownership-scoped Operator financial history and Student timelines, reusable filters/summaries/tables, Asia/Jakarta periods, sorting, database pagination, persisted exact-revision Balance evidence, distinct first-use/search/filter empty states, explanatory zero summaries, pending/disabled filter feedback, semantic responsive tables, and an export adapter contract. No Dashboard, schema, authorization, ownership, or financial-write behavior changed.
- Canonical handoff, changelog, README, requirements, rules, domain, database target, architecture, roadmap, and affected design documentation synchronized without implementation changes.

## Current Implementation Status

The application has three complete business modules—Operator Management, Student Management, and the Transaction Engine—plus its complete Operator-facing Transaction UI.

Platform Admin can manage Operator accounts at `/admin/operators` and Students at `/admin/students`. New Operators are inactive until explicitly activated. An Operator cannot be deactivated or logically deleted while Students remain assigned. Operator deletion preserves the Google identity and audit history.

Every Student has exactly one active Operator. Platform Admin can create and edit Students and change their Operator. Reassignment requires a reason and atomically changes the current `operatorId` plus appends a privacy-minimized immutable `OWNERSHIP_TRANSFER` audit event. All existing ownership authorization immediately follows the new owner. Operators can list and view only their own Students at `/operator/students`; cross-Operator detail access is masked through the existing owner policy.

Operator Student Detail now reads persisted Balance and ownership-scoped Transaction history and exposes every approved lifecycle workflow without manual API calls. Student Balance is still updated only through the serialized engine. Platform Admin receives no financial presentation or read bypass.

Every current sidebar route now resolves to either an implemented module or `FeaturePlaceholder`; roadmap features never fall through to generic 404. Operator Student lists show ownership-scoped persisted Balance and transaction-count context. Admin Student lists intentionally omit Balance. Empty data, no search results, loading, validation, unauthorized, forbidden, missing-resource, planned-feature, and unexpected-error states have separate presentation contracts.

`/admin` is now an administrative dashboard containing only Operator/Student counts, current assignments, Operator audit summaries, and privacy-minimized ownership changes. `/operator` is an operational dashboard whose every Student and Transaction query is scoped by the authenticated Operator ID. It sums persisted owned Student balances and never reconstructs Balance from history.

`/admin/reports` now provides paginated Operator lifecycle, initial assignment, and privacy-minimized ownership reports without financial fields. `/operator/reports` provides ownership-scoped active Transaction reports and `/operator/reports/students/[id]` provides read-only Student timelines. Report summaries group persisted active Transactions and reuse the centralized `effect` function; they never reconstruct Student Balance. Exact persisted audit `balanceAfter` is shown only when a visible Transaction revision has matching authorized evidence.

Latest verification:

- Prisma format, validation, and client generation: passed.
- TypeScript: passed.
- ESLint: passed.
- Production build: passed.
- Automated tests: 109 passed, 0 failed.
- Isolated development-auth HTTP workflow: passed for both roles, logout/session enforcement, ownership masking, admin lifecycle, Student lifecycle, malformed request handling, and the complete financial chain.
- Database reconciliation: persisted and independently aggregated Balance both `2100`; financial version `7`; four retained Transactions; seven lifecycle audit events; zero foreign-key or orphan violations.
- Release recommendation: **READY WITH MINOR LIMITATIONS**. Deployment-environment, live Google OAuth registration, physical-device/PWA, and production-volume qualification remain Milestone 9 gates.

## Current Architecture Status

```text
Next.js App Router presentation
        ↓
Central authentication and authorization boundaries
        ↓
Feature domain services (Operators / Students / Transactions)
        ↓
Prisma models plus serialized SQLite financial-write adapter
        ↓
SQLite relational database and invariant triggers
```

- `src/auth/` owns Google identity admission and database-session behavior.
- `src/authorization/` is the sole role and Student-ownership policy layer. Feature code must reuse `admin`, `operator`, and `owner` policies rather than recreate role checks.
- `src/operators/` owns Operator validation and lifecycle behavior.
- `src/students/` owns Student validation, assignment, visibility scope, search, and pagination behavior.
- `src/transactions/` owns exact-IDR validation, lifecycle effects, idempotency, serialization, Balance/version changes, and immutable financial audit.
- `src/transactions/read-service.ts` owns the read-only ownership-scoped Balance/history projection and stable cursor contract.
- `src/components/transactions/` owns financial presentation, filters, dialogs, accessibility, and API invocation without authoritative business logic.
- `src/components/ui/feature-placeholder.tsx` is the only planned-feature placeholder primitive; implemented dashboards no longer use it.
- `src/dashboard/` owns the fixed-query, read-only Admin and Operator dashboard projections.
- `src/components/dashboard/` owns reusable statistic, trend, summary, activity, quick-action, grid, and skeleton presentation components.
- `src/reports/` owns report filter normalization, export-neutral Admin/Operator read projections, result contracts, and the future export adapter boundary.
- `src/components/reports/` owns report filters, summaries, semantic responsive tables, pagination, loading, error, and empty presentation.
- `src/app/(app)/(admin)/` contains protected Platform Admin pages and Server Actions.
- `src/app/(app)/(operator)/` contains protected Operator pages.
- `src/app/api/admin/` and `src/app/api/operator/` expose role-appropriate JSON boundaries.
- `src/components/app-shell/` remains the only authenticated application chrome.
- `src/components/ui/` remains the shared design-system primitive layer.
- The implemented financial model uses Student persisted Balance/version, Student-owned Transactions, and immutable FinancialAuditEvents. Identity, account lifecycle, and authentication/session data remain separate from financial data.

## Important Implementation Decisions

- Production authentication is Google-only. Explicit development authentication is isolated to non-production and does not alter production admission or database sessions.
- Roles are exactly `PLATFORM_ADMIN` and `OPERATOR`.
- Only active, pre-provisioned, non-deleted users may authenticate.
- Platform Admin has no implicit access to balances, Transactions, reports, or other routine financial data.
- Operator email is normalized before persistence and remains immutable after creation. Logical deletion retains the unique historical identity.
- Deactivation and deletion revoke database sessions. Database triggers prevent either operation from orphaning Students.
- Every Student has one required `operatorId`. Only active, non-deleted Operators may be assigned.
- Student transfer requires a reason and commits the owner update plus privacy-minimized immutable `OWNERSHIP_TRANSFER` audit atomically. No Balance, Transaction snapshot, or financial delta is exposed to Platform Admin.
- Student statuses are `ACTIVE`, `INACTIVE`, and `ARCHIVED`. Inactive and archived Students remain visible to their owner but are financially read-only.
- Student names remain normalized and unique case-insensitively under the approved database rule.
- Student and Operator search and pagination execute server-side with ten records per page.
- Operator list queries are scoped by the authorized Operator ID. Operator detail additionally uses the centralized masked ownership policy.
- Financial presentation is implemented for owned Operator Student detail and list summaries; authoritative Balance is persisted and changed only by the Transaction Engine.
- Dashboard presentation is read-only. Admin projections never select financial detail; Operator projections require the server-derived current Operator ID, aggregate persisted owned balances, and bound recent activity to six rows.
- Reporting presentation is read-only. Operational rows default to non-deleted Transactions, all financial reads follow current Student ownership, Jakarta business periods use `occurredAt`, summaries reuse centralized Transaction effect semantics, and database pagination precedes rendering. Admin reports contain administrative facts only.
- Student owns every Transaction; Transaction has no Operator owner. Current `operatorId` scopes the entire financial record and transfer changes visibility without rewriting Transactions.
- Implemented Transaction types are `DEPOSIT`, `WITHDRAWAL`, and `CORRECTION`. Correction has explicit increase/decrease direction and required reason.
- Transactions support controlled edit, soft delete, and restore. Transaction identity, Student, creation actor, and creation time remain immutable; database triggers prohibit hard delete.
- `Student.balance` is persisted, non-negative, and changed only by the Transaction Engine. Every mutation updates Transaction state, Balance/version, and immutable audit atomically.
- `CREATE`, `EDIT`, `DELETE`, `RESTORE`, and privacy-minimized `OWNERSHIP_TRANSFER` are audited. Financial audit follows Student ownership; Platform Admin sees no Balance/Transaction payload through transfer audit.
- Financial mutations are allowed only for an `ACTIVE` Student owned by the current active Operator. Inactive and archived Students are financially read-only.
- Every mutation uses a unique command ID and expected revision where applicable; retry cannot apply a Balance delta twice.
- `AI_CONTEXT.md` is the canonical engineering handoff. Every implementation sprint must also assess and synchronize `CHANGELOG.md`, README, and roadmap status before completion.

## Data Model Status

`User`: Google identity, exact role, active state, creation time, last login time, and logical deletion time. Operator lifecycle events are recorded in `operator_audit`.

`Student` (implemented): UUID, normalized unique name, optional notes, `ACTIVE`/`INACTIVE`/`ARCHIVED` status, creation/update times, one required active Operator owner, persisted non-negative whole-IDR `balance`, and monotonic `financialVersion`.

`Transaction` (implemented): Student-owned `DEPOSIT`/`WITHDRAWAL`/`CORRECTION`, amount, bounded Notes, Correction direction/reason, business occurrence time, creation/latest actor metadata, revision, and soft-delete metadata. `FinancialAuditEvent` is immutable evidence with unique command identity, actor/scope, deterministic snapshots, Balance transitions, schema version, and correlation identity. No currency column exists because IDR is fixed.

## Known Limitations

- Financial-audit history and explicit reconciliation tooling are not implemented; the UI reads current Balance and operational Transaction history only.
- Transaction migration intentionally refuses databases containing legacy financial rows because trustworthy actor/command/audit provenance cannot be inferred.
- Student create/edit Server Action validation redirects do not restore submitted invalid values; the form reloads default or persisted values.
- Platform Admin bootstrap remains environment/deployment-specific and is not automated.
- A populated database predating mandatory ownership still requires an explicit Student-to-Operator mapping; the ownership migration intentionally refuses to invent one.
- Real Google login requires deployment-specific OAuth credentials and exact callback registration.
- SQLite is the approved current persistence target; production deployment topology remains deferred.
- No offline data mutation or synchronization exists. The service worker supports installable delivery only.
- No exports, categories, attachments, schedules, monthly allowance, approvals, notifications, bulk operations, advanced analytics, or distributed infrastructure exist.
- Centralized cross-Student transactions and settings remain roadmap modules represented by explicit placeholders rather than 404 pages. Reporting routes are implemented.

## Outstanding Work

- Implement Operator-only financial-audit history without a Platform Admin financial bypass.
- Add explicit reconciliation verification that detects but never silently repairs Balance mismatches.
- Review production deployment, database topology, backups, OAuth configuration, dependency advisories, and Platform Admin bootstrap in their separately approved phases.

## Next Recommended Sprint

Implement **Reconciliation and Financial Audit Reads** as the next bounded sprint.

The sprint should add ownership-scoped audit-history and reconciliation contracts without automatic repair or Platform Admin financial access. Export, advanced analytics, and future extension implementation remain outside that bounded sprint.

## Core Business Rules to Preserve

1. IDR is the only currency and amounts have no decimal part.
2. MVP types are Deposit, Withdrawal, and reasoned directional Correction; unknown types fail closed.
3. Student owns Transactions; current Student ownership controls the complete financial record.
4. Persisted Student Balance equals all non-deleted Transaction effects and is never changed independently.
5. No financial mutation may produce a negative Balance.
6. Create/edit/soft-delete/restore, Balance/version, command idempotency, and immutable audit commit or roll back together.
7. Edit cannot change Transaction identity, Student, creation actor, or creation time; hard delete is prohibited.
8. Financial writes for one Student share a serialization boundary and recheck ownership/status inside it.
9. Every lifecycle command is auditable; audit failure rolls back the mutation.
10. Success is reported only after commit; retry reuses command ID and cannot apply a delta twice.
11. Progressive history loading never changes persisted Balance; reconciliation mismatch is an integrity incident.
12. Authorization is server-enforced from current ownership, and Platform Admin has no financial-data bypass.

## AI Must Never

- Modify locked product principles without an explicit Project Owner decision and synchronized ADR/traceability update.
- Duplicate authentication, role, or ownership authorization inside a feature.
- Invent an administrative financial bypass.
- Change Student Balance outside the approved atomic Transaction Engine.
- Hard-delete Transaction or FinancialAuditEvent history, or mutate immutable Transaction identity/ownership/creation fields.
- Use floating-point money.
- Split Transaction lifecycle, Balance/version, idempotency, or audit writes across transaction boundaries.
- Put authoritative business logic in UI code.
- Add password authentication, public registration, offline financial sync, multiple currencies, reporting implementation, or distributed infrastructure without a separately approved sprint.
- Bypass tests, database constraints, review, documentation synchronization, or this canonical handoff update.

## Documentation Map

| Document | Authority |
|----------|-----------|
| `docs/00-product-principles.md` | Locked product principles |
| `docs/01-functional-requirements.md` | Capabilities and acceptance criteria |
| `docs/02-non-functional-requirements.md` | Correctness, reliability, and PWA constraints |
| `docs/03-business-rules.md` | Authoritative business rules |
| `docs/04-domain-model.md` | Entities and invariants |
| `docs/07-database-design.md` | Implemented foundation plus approved Transaction Engine target schema/integrity contract |
| `docs/08-system-architecture.md` | Architecture responsibilities |
| `docs/09-development-roadmap.md` | Delivery milestones |
| `docs/10-engineering-rules.md` | Engineering standards |
| `docs/26-adr-authentication.md` | Authentication decision |
| `docs/27-adr-authorization-and-roles.md` | Roles and ownership decision |
| `docs/28-adr-financial-data-privacy.md` | Platform Admin privacy boundary |
| `docs/31-authentication-implementation.md` | Implemented authentication |
| `docs/32-authorization-implementation.md` | Implemented authorization |
| `docs/33-application-shell-architecture.md` | Implemented App Shell |
| `docs/34-operator-management-implementation.md` | Implemented Operator Management |
| `docs/35-student-management-implementation.md` | Implemented Student Management |
| `docs/36-adr-transaction-balance-and-audit.md` | Accepted Transaction, persisted Balance, audit, lifecycle, concurrency, and ownership decisions |
| `docs/37-technical-design-transaction-foundation.md` | Implementation-ready Transaction Engine architecture and extension boundaries |
| `docs/38-transaction-engine-implementation.md` | Implemented persistence, write protocol, protected APIs, migration policy, errors, and tests |
| `docs/39-transaction-ui-implementation.md` | Implemented financial overview, history, filters, forms, lifecycle dialogs, accessibility, and UI tests |
| `docs/40-ux-polish-and-placeholder-strategy.md` | Implemented placeholder architecture, state taxonomy, navigation outcomes, mobile behavior, and accessibility |
| `docs/41-mvp-quality-assurance-report.md` | Executed QA matrix, confirmed defects and regressions, known limitations, and release recommendation |
| `docs/42-dashboard-implementation.md` | Dashboard read model, reusable cards, performance, authorization/privacy boundaries, and verification |

## Sprint Completion Rule

Every implementation sprint must update this file with completed milestones, current implementation and architecture status, outstanding work, the next recommended sprint, known limitations, and important implementation decisions. A sprint is not complete until the update is reviewed alongside code, tests, migrations, and feature documentation.

## Before Changing Anything

Read this file and the relevant approved documents, identify affected layers and invariants, inspect existing code and tests, preserve unrelated changes, reuse centralized authorization, and verify Prisma, TypeScript, ESLint, production build, all tests, documentation, and the complete diff.
