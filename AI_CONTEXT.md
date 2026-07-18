# Amanah Cash — AI Context

## Project Purpose

Amanah Cash is a mobile-first PWA for managing funds entrusted to Students. A single Operator creates Students, records Deposits and Withdrawals, and views Balances derived from immutable Transaction history. Approved documents in `docs/` remain authoritative.

## Current Implementation State

Milestone 1 — Project Foundation is implemented. The repository retains the runnable three-screen PWA shell, Node.js server boundary, SQLite connection, initial Student and Transaction migrations, and foundation tests. The Next.js foundation now includes approved shared design tokens and reusable UI primitives without implementing product UI or changing persistence. Student management and financial use cases remain unimplemented until their roadmap milestones.

**Sprint 1 — Project Bootstrap** is complete. It was a separate implementation cycle for the approved Next.js foundation; it did not reopen or rename Development Roadmap Milestone 1 or begin a Landing Page implementation milestone.

**Sprint 2 — Shared Design System Foundation** is complete. It added only approved reusable UI primitives and did not create a Landing Page layout or page-specific component.

## Current Handover

- **Current milestone:** Development Roadmap Milestone 1 — Project Foundation remains implemented; no Landing Page implementation milestone has begun.
- **Current sprint:** Sprint 2 — Shared Design System Foundation is implemented and validated.
- **Active branch:** `feat/landing-page`.
- **Work completed:** Retained the validated Sprint 1 bootstrap and integrated the approved token hierarchy into Tailwind/global CSS. Added typed, composable `Container`, `Section`, `Button`, `Heading`, `Card`, and text-only `Logo` primitives under `src/components/ui`; `/` remains intentionally empty. Production build, TypeScript, lint, CSS parsing, and the existing 16-test suite pass.
- **Current architecture decisions:** Use CSS custom properties as the canonical approved token layer and CSS Modules for primitive styles; expose component APIs through `src/components/ui/index.ts`; keep components Server Component-compatible; keep the text-only Logo unlinked until Product Identity routing and brand assets are approved; keep the existing Node.js/SQLite foundation, authentication, Prisma, API Routes, Landing Page sections, and production deployment unchanged or deferred.
- **Current blockers:** The installed Next.js dependency tree reports two moderate PostCSS advisories for which npm offers only an unsafe breaking downgrade; this does not block local bootstrap validation but requires upstream monitoring before release.
- **Next recommended task:** Define and approve Sprint 3 for the remaining Landing Page Implementation Plan Milestone 1 delivery foundation; do not create the Landing Page shell or page-specific components without explicit sprint approval.

## MVP Scope

Included:

- Create, list, search, and view Students.
- Record Deposits and Withdrawals in whole IDR.
- View correct Balance and progressively loaded Transaction history.
- PWA installation and mobile-first responsive operation.
- Explicit validation, loading, empty, failure, and retry states.

Excluded:

- Authentication, accounts, multiple users, roles, and actor attribution from current MVP behavior and its foundation.
- Offline data or Transaction synchronization.
- Transaction or Student editing and deletion.
- Notes, categories, reports, exports, notifications, and bulk operations.
- Multiple currencies and distributed infrastructure.

## Deferred Architecture Decisions

- Auth.js with the Database Session Strategy is the approved long-term authentication solution, but authentication is deferred to a dedicated Authentication Sprint outside the MVP foundation.
- Sprint 1 must not install Auth.js or create `User`, `Account`, `Session`, `VerificationToken`, or any authentication schema.
- Sprint 1 targets Local Development only and uses the approved local SQLite database.
- Vercel deployment is not part of Sprint 1. The production deployment strategy is deferred to the Deployment phase; Sprint 1 must not introduce an external database or change the approved persistence architecture.

## Domain Terminology

- **Operator:** sole MVP user; no identity is persisted.
- **Student:** aggregate root whose entrusted funds are tracked.
- **Deposit:** money entrusted to the Student; increases Balance.
- **Withdrawal:** money returned by the Student; decreases Balance.
- **Transaction:** immutable Deposit or Withdrawal event.
- **Balance:** all Deposits minus all Withdrawals for one Student.
- **RupiahAmount:** positive whole Indonesian Rupiah value.

Keep Deposit and Withdrawal terminology exactly as approved. UI text must state money direction.

## Core Business Rules

1. IDR is the only currency; Amounts have no decimal part.
2. Student names are normalized and unique case-insensitively.
3. Transactions are append-only.
4. Balance derives from complete persisted Transaction history and is never stored independently.
5. A Withdrawal cannot make Balance negative.
6. Withdrawal validation and insertion are one atomic database transaction.
7. All financial writes for one Student share the per-Student serialization boundary.
8. A failed operation leaves no partial financial event.
9. Success is reported only after commit.
10. Retry reuses the original Transaction UUID and must not create a duplicate.
11. Progressive history loading never changes Balance calculation.
12. Auditability means financial-event traceability, not actor attribution.

## Architecture Summary

```text
PWA Presentation
       ↓
Server Application
       ↓
Domain
       ↓
Persistence
       ↓
Single Relational Database
```

- Presentation owns screens and interaction state, not business rules.
- Application coordinates approved use cases and outcomes.
- Domain owns terminology and invariants.
- Persistence owns queries, locks, atomic writes, and history access.
- Database stores only Students and Transactions as product entities.
- The service worker supports PWA delivery, not offline data behavior.

## Data Model

Student: UUID `id`, normalized unique `name`, and `created_at`.

Transaction: UUID `id`, `student_id`, `deposit` or `withdrawal` type, positive signed 64-bit integer `amount`, and `created_at`.

There is no Balance column or table, currency column, actor column, update timestamp, or soft-delete field.

## Important Constraints

- Keep Presentation, Application, Domain, and Persistence responsibilities separate.
- Revalidate all client input on the server.
- Enforce database constraints even when client validation exists.
- Use exact integer arithmetic for money.
- Lock the Student row before every financial write.
- For Withdrawal, calculate full-history Balance after locking and before insert.
- Restrict application access to append/read Transactions.
- Use stable `(created_at, id)` cursor ordering for history.
- Render Balance independently from loaded history pages.
- Preserve form input on correctable error.
- Do not show success before persistence confirmation or queue offline writes.
- Keep 320px–480px mobile viewports primary and touch targets at least 44px.

## AI Must Never

- Modify `docs/00-product-principles.md`; it is immutable.
- Invent features, fields, screens, entities, business rules, or infrastructure.
- Persist or cache authoritative Balance.
- Add Transaction mutation or soft deletion.
- Put authoritative business logic in UI code.
- Use floating-point money.
- Split Withdrawal checking and insertion across transaction boundaries.
- Add authentication outside a separately approved Authentication Sprint, or add offline sync, multi-currency, reporting, or distributed infrastructure.
- Bypass tests, database constraints, review, or documentation synchronization.

## AI Should Always Preserve

- Transaction history as the single financial source of truth.
- Whole-IDR arithmetic and append-only financial events.
- Student aggregate and per-Student financial serialization.
- Non-negative Balance and duplicate-free Retry.
- Explicit validation and failure outcomes.
- Progressive history independent from Balance.
- Three primary screens and minimal mobile-first interaction.
- Approved requirement traceability and simple architecture boundaries.

## Documentation Map

| Document | Authority |
|----------|-----------|
| `docs/00-product-principles.md` | Immutable principles |
| `docs/01-functional-requirements.md` | Capabilities and acceptance criteria |
| `docs/02-non-functional-requirements.md` | Correctness, reliability, and PWA constraints |
| `docs/03-business-rules.md` | Authoritative business rules |
| `docs/04-domain-model.md` | Entities and invariants |
| `docs/05-user-flow.md` | Operator flows and states |
| `docs/06-wireframe.md` | Mobile-first UI specification |
| `docs/07-database-design.md` | Schema and financial integrity |
| `docs/08-system-architecture.md` | Architecture responsibilities |
| `docs/09-development-roadmap.md` | Delivery milestones |
| `docs/10-engineering-rules.md` | Engineering standards |
| `docs/11-development-workflow.md` | Implementation workflow |

## Before Changing Anything

Read the relevant approved documents, identify requirement IDs and affected layers, inspect existing code and tests, preserve unrelated user changes, and verify implementation, tests, documentation, and the complete diff.
