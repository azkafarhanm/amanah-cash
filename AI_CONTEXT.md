# Amanah Cash — Canonical Engineering Handoff

**Last updated:** 2026-07-20  
**Current delivery state:** Student Management implemented and verified

## Project Purpose

Amanah Cash is a mobile-first PWA for managing funds entrusted to Students. Platform Admin manages accounts, Student records, and assignments without routine financial-data access. Authenticated Operators may access only Students currently assigned to them. Future balances derive from immutable Transaction history and must never be stored independently. Approved documents in `docs/` remain authoritative.

## Completed Milestones

- Product architecture, ADRs, technical design, database foundation, and engineering rules.
- Next.js application foundation, Landing Page foundation, shared design tokens, reusable UI primitives, metadata, and local Geist font.
- Google-only Auth.js authentication with registered-active-user admission and database sessions.
- Centralized role and Student-ownership authorization with consistent route, API, and Server Action adapters.
- Authenticated App Shell with role-aware navigation, protected route groups, loading, empty, forbidden, not-found, and error states.
- Operator Management: list, search, pagination, create, detail, edit, activation/deactivation, assignment-safe logical deletion, last-login tracking, audit summaries, protected APIs, documentation, and tests.
- Student Management: admin list/create/detail/edit, Operator assignment and reassignment, active/inactive/archived status, notes, search, pagination, Operator-scoped list/detail, protected APIs, documentation, database constraints, and tests.
- Canonical handoff, changelog, README, and delivery roadmap synchronized with the implemented platform and the next Financial Transactions sprint.

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
- Student and Transaction are the future financial source entities. Identity, account lifecycle, and audit data remain separate from financial truth.

## Important Implementation Decisions

- Authentication is Google-only. Google proves identity; Amanah Cash owns admission, roles, activation, and authorization.
- Roles are exactly `PLATFORM_ADMIN` and `OPERATOR`.
- Only active, pre-provisioned, non-deleted users may authenticate.
- Platform Admin has no implicit access to balances, Transactions, reports, or other routine financial data.
- Operator email is normalized before persistence and remains immutable after creation. Logical deletion retains the unique historical identity.
- Deactivation and deletion revoke database sessions. Database triggers prevent either operation from orphaning Students.
- Every Student has one required `operatorId`. Only active, non-deleted Operators may be assigned.
- Student transfer is currently a direct ownership update. Transfer history is intentionally deferred.
- Student statuses are `ACTIVE`, `INACTIVE`, and `ARCHIVED`. Inactive is temporary operational exclusion; archived is historical organizational retention. Neither deletes the Student or future financial history.
- Student names remain normalized and unique case-insensitively under the approved database rule.
- Student and Operator search and pagination execute server-side with ten records per page.
- Operator list queries are scoped by the authorized Operator ID. Operator detail additionally uses the centralized masked ownership policy.
- Current Balance and financial summaries are explicit static placeholders. No Transaction or balance query has been introduced.
- Financial Transactions remain append-only. Balance will be derived from complete persisted history and never stored as an authoritative column or cache.
- `AI_CONTEXT.md` is the canonical engineering handoff. Every implementation sprint must also assess and synchronize `CHANGELOG.md`, README, and roadmap status before completion.

## Data Model Status

`User`: Google identity, exact role, active state, creation time, last login time, and logical deletion time. Operator lifecycle events are recorded in `operator_audit`.

`Student`: UUID, normalized unique name, optional notes, `ACTIVE`/`INACTIVE`/`ARCHIVED` status, creation and update times, and one required active Operator owner.

`Transaction`: UUID, required Student, `deposit` or `withdrawal`, positive whole-IDR amount, and creation time. Transaction application workflows are not implemented.

There is no Balance table or column, currency column, Transaction actor attribution, Transaction update timestamp, or Transaction soft deletion.

## Known Limitations

- Financial Transactions, deposits, withdrawals, and balance calculation are not implemented.
- Student balance and financial-summary values are placeholders only.
- Student ownership transfer history is not recorded; only current ownership is authoritative.
- Platform Admin bootstrap remains environment/deployment-specific and is not automated.
- A populated database predating mandatory ownership still requires an explicit Student-to-Operator mapping; the ownership migration intentionally refuses to invent one.
- Real Google login requires deployment-specific OAuth credentials and exact callback registration.
- SQLite is the approved current persistence target; production deployment topology remains deferred.
- No offline data mutation or synchronization exists. The service worker supports installable delivery only.
- No reporting, exports, categories, notifications, bulk operations, dashboard analytics, or distributed infrastructure exist.

## Outstanding Work

- Implement Financial Transactions without changing the established Student ownership boundary.
- Add Deposit and Withdrawal application workflows using positive whole-IDR integers.
- Enforce append-only Transaction behavior and idempotent retry by Transaction UUID.
- Implement per-Student financial write serialization and atomic non-negative Withdrawal validation.
- Derive Balance from complete Transaction history independently of progressive history pages.
- Add Operator-only owned-Student financial views; do not add a Platform Admin financial bypass.
- Add transaction-specific loading, empty, validation, failure, retry, and concurrency tests.
- Review production deployment, database topology, backups, OAuth configuration, dependency advisories, and Platform Admin bootstrap in their separately approved phases.

## Next Recommended Sprint

Implement **Financial Transactions** as the next bounded sprint.

The sprint should add Operator-owned Deposit and Withdrawal workflows, immutable Transaction history, exact whole-IDR arithmetic, atomic overdraft prevention, idempotent retries, and derived Balance. Every financial read and write must reuse current Student ownership authorization. Platform Admin must remain unable to access routine financial data. Student CRUD, ownership transfer history, reporting, and dashboard analytics should not be expanded during that sprint.

## Core Business Rules to Preserve

1. IDR is the only currency and amounts have no decimal part.
2. Transactions are append-only.
3. Balance is all Deposits minus all Withdrawals for one Student and is never stored independently.
4. A Withdrawal cannot make Balance negative.
5. Withdrawal validation and insertion occur in one atomic database transaction.
6. All financial writes for one Student share the per-Student serialization boundary.
7. A failed operation leaves no partial financial event.
8. Success is reported only after persistence commits.
9. Retry reuses the original Transaction UUID and cannot create a duplicate.
10. Progressive history loading never changes Balance calculation.
11. Authorization is server-enforced from the Amanah Cash role and current Student ownership.
12. Privacy outranks administrative visibility; Platform Admin has no financial-data bypass.

## AI Must Never

- Modify `docs/00-product-principles.md`; it is immutable.
- Duplicate authentication, role, or ownership authorization inside a feature.
- Invent an administrative financial bypass.
- Persist or cache authoritative Balance.
- Add Transaction mutation or soft deletion.
- Use floating-point money.
- Split Withdrawal checking and insertion across transaction boundaries.
- Put authoritative business logic in UI code.
- Add password authentication, public registration, offline financial sync, multiple currencies, reporting implementation, or distributed infrastructure without a separately approved sprint.
- Bypass tests, database constraints, review, documentation synchronization, or this canonical handoff update.

## Documentation Map

| Document | Authority |
|----------|-----------|
| `docs/00-product-principles.md` | Immutable principles |
| `docs/01-functional-requirements.md` | Capabilities and acceptance criteria |
| `docs/02-non-functional-requirements.md` | Correctness, reliability, and PWA constraints |
| `docs/03-business-rules.md` | Authoritative business rules |
| `docs/04-domain-model.md` | Entities and invariants |
| `docs/07-database-design.md` | Schema and financial integrity |
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

## Sprint Completion Rule

Every implementation sprint must update this file with completed milestones, current implementation and architecture status, outstanding work, the next recommended sprint, known limitations, and important implementation decisions. A sprint is not complete until the update is reviewed alongside code, tests, migrations, and feature documentation.

## Before Changing Anything

Read this file and the relevant approved documents, identify affected layers and invariants, inspect existing code and tests, preserve unrelated changes, reuse centralized authorization, and verify Prisma, TypeScript, ESLint, production build, all tests, documentation, and the complete diff.
