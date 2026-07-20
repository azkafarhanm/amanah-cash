# Amanah Cash — Canonical Engineering Handoff

**Last updated:** 2026-07-20  
**Current delivery state:** Transaction Foundation architecture approved; Transaction Engine implementation not started

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
- Canonical handoff, changelog, README, requirements, rules, domain, database target, architecture, roadmap, and affected design documentation synchronized without implementation changes.

## Current Implementation Status

The application has two complete production business modules.

Platform Admin can manage Operator accounts at `/admin/operators` and Students at `/admin/students`. New Operators are inactive until explicitly activated. An Operator cannot be deactivated or logically deleted while Students remain assigned. Operator deletion preserves the Google identity and audit history.

Every Student has exactly one active Operator. Platform Admin can create and edit Students and change their Operator. Reassignment changes the current `operatorId`, so all existing ownership authorization immediately follows the new owner. Operators can list and view only their own Students at `/operator/students`; cross-Operator detail access is masked through the existing owner policy.

Student lists contain a literal balance placeholder and Student detail contains a static future-financial-summary placeholder. There is no balance calculation or Transaction access in either administrative module.

Latest verification:

- Prisma format, validation, and client generation: passed.
- TypeScript: passed.
- ESLint: passed.
- Production build: passed.
- Automated tests: 74 passed, 0 failed.

## Current Architecture Status

```text
Next.js App Router presentation
        ↓
Central authentication and authorization boundaries
        ↓
Feature domain services (Operators / Students)
        ↓
Prisma repository adapters
        ↓
SQLite relational database and invariant triggers
```

- `src/auth/` owns Google identity admission and database-session behavior.
- `src/authorization/` is the sole role and Student-ownership policy layer. Feature code must reuse `admin`, `operator`, and `owner` policies rather than recreate role checks.
- `src/operators/` owns Operator validation and lifecycle behavior.
- `src/students/` owns Student validation, assignment, visibility scope, search, and pagination behavior.
- `src/app/(app)/(admin)/` contains protected Platform Admin pages and Server Actions.
- `src/app/(app)/(operator)/` contains protected Operator pages.
- `src/app/api/admin/` and `src/app/api/operator/` expose role-appropriate JSON boundaries.
- `src/components/app-shell/` remains the only authenticated application chrome.
- `src/components/ui/` remains the shared design-system primitive layer.
- The approved financial target uses Student persisted Balance/version, Student-owned Transactions, and immutable FinancialAuditEvents. Identity, account lifecycle, and authentication/session data remain separate from financial data.

## Important Implementation Decisions

- Authentication is Google-only. Google proves identity; Amanah Cash owns admission, roles, activation, and authorization.
- Roles are exactly `PLATFORM_ADMIN` and `OPERATOR`.
- Only active, pre-provisioned, non-deleted users may authenticate.
- Platform Admin has no implicit access to balances, Transactions, reports, or other routine financial data.
- Operator email is normalized before persistence and remains immutable after creation. Logical deletion retains the unique historical identity.
- Deactivation and deletion revoke database sessions. Database triggers prevent either operation from orphaning Students.
- Every Student has one required `operatorId`. Only active, non-deleted Operators may be assigned.
- Student transfer is currently a direct ownership update. Transfer history is intentionally deferred.
- Student statuses are `ACTIVE`, `INACTIVE`, and `ARCHIVED`. They are management labels and filters only in the current module; they do not independently change visibility or authorization. Neither deletes the Student or future financial history.
- Student names remain normalized and unique case-insensitively under the approved database rule.
- Student and Operator search and pagination execute server-side with ten records per page.
- Operator list queries are scoped by the authorized Operator ID. Operator detail additionally uses the centralized masked ownership policy.
- Current Balance and financial summaries are explicit static placeholders. No Transaction or balance query has been introduced.
- Student owns every Transaction; Transaction has no Operator owner. Current `operatorId` scopes the entire financial record and transfer changes visibility without rewriting Transactions.
- Target Transaction types are `DEPOSIT`, `WITHDRAWAL`, and `CORRECTION`. Correction has explicit increase/decrease direction and required reason.
- Target Transactions support controlled edit, soft delete, and restore. Transaction identity, Student, creation actor, and creation time remain immutable; hard delete is prohibited.
- Target `Student.balance` is persisted, non-negative, and changed only by the Transaction Engine. Every mutation updates Transaction state, Balance/version, and immutable audit atomically.
- `CREATE`, `EDIT`, `DELETE`, `RESTORE`, and privacy-minimized `OWNERSHIP_TRANSFER` are audited. Financial audit follows Student ownership; Platform Admin sees no Balance/Transaction payload through transfer audit.
- Financial mutations are allowed only for an `ACTIVE` Student owned by the current active Operator. Inactive and archived Students are financially read-only.
- Every mutation uses a unique command ID and expected revision where applicable; retry cannot apply a Balance delta twice.
- `AI_CONTEXT.md` is the canonical engineering handoff. Every implementation sprint must also assess and synchronize `CHANGELOG.md`, README, and roadmap status before completion.

## Data Model Status

`User`: Google identity, exact role, active state, creation time, last login time, and logical deletion time. Operator lifecycle events are recorded in `operator_audit`.

`Student` (implemented): UUID, normalized unique name, optional notes, `ACTIVE`/`INACTIVE`/`ARCHIVED` status, creation/update times, and one required active Operator owner. Target Transaction Engine adds persisted non-negative whole-IDR `balance` and monotonic `financialVersion`.

`Transaction` (current schema only): UUID, required Student, `deposit` or `withdrawal`, positive whole-IDR amount, and creation time. No Transaction application workflow exists.

`Transaction` (approved target): Student-owned `DEPOSIT`/`WITHDRAWAL`/`CORRECTION`, amount, Correction direction/reason, business occurrence time, creation/latest actor metadata, revision, and soft-delete metadata. `FinancialAuditEvent` is the immutable target evidence entity. No target currency column exists because IDR is fixed.

## Known Limitations

- Transaction Engine, persisted Balance, financial audit, Deposit, Withdrawal, Correction, edit, soft delete, and restore are architecture only and not implemented.
- Student balance and financial-summary values are placeholders only.
- Student ownership transfer audit is approved but not implemented; only current ownership is currently persisted.
- Student create/edit Server Action validation redirects do not restore submitted invalid values; the form reloads default or persisted values.
- Platform Admin bootstrap remains environment/deployment-specific and is not automated.
- A populated database predating mandatory ownership still requires an explicit Student-to-Operator mapping; the ownership migration intentionally refuses to invent one.
- Real Google login requires deployment-specific OAuth credentials and exact callback registration.
- SQLite is the approved current persistence target; production deployment topology remains deferred.
- No offline data mutation or synchronization exists. The service worker supports installable delivery only.
- No reporting, exports, categories, attachments, schedules, monthly allowance, approvals, notifications, bulk operations, dashboard analytics, or distributed infrastructure exist.

## Outstanding Work

- Plan and implement the physical Transaction Engine schema/migration under the Database Design implementation gate, including existing-row/backfill, trigger replacement, rollback, and reconciliation verification.
- Implement Deposit, Withdrawal, Correction, edit, soft delete, restore, persisted Balance/version, financial audit, command idempotency, and expected-revision conflicts exactly as ADR-004/TDS specify.
- Reuse current ownership authorization and recheck active Operator/current ownership/ACTIVE Student status inside every financial write transaction.
- Add domain, persistence, concurrency, rollback, audit, reconciliation, security, and idempotency tests before presentation integration.
- Add Operator-only financial reads later without a Platform Admin financial bypass.
- Review production deployment, database topology, backups, OAuth configuration, dependency advisories, and Platform Admin bootstrap in their separately approved phases.

## Next Recommended Sprint

Implement the **Transaction Engine** as the next bounded sprint.

The sprint should implement the reviewed physical schema/migration plus Domain/Application/Persistence contracts for the complete lifecycle. It must not reopen type/effect, Balance, audit, ownership, status, security, retry, concurrency, rollback, or extension decisions. UI, API expansion, Reports, Export, Dashboard, analytics, and future extension implementation remain outside that bounded engine sprint unless separately planned.

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

## Sprint Completion Rule

Every implementation sprint must update this file with completed milestones, current implementation and architecture status, outstanding work, the next recommended sprint, known limitations, and important implementation decisions. A sprint is not complete until the update is reviewed alongside code, tests, migrations, and feature documentation.

## Before Changing Anything

Read this file and the relevant approved documents, identify affected layers and invariants, inspect existing code and tests, preserve unrelated changes, reuse centralized authorization, and verify Prisma, TypeScript, ESLint, production build, all tests, documentation, and the complete diff.
