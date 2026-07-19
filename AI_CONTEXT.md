# Amanah Cash — AI Context

## Project Purpose

Amanah Cash is a mobile-first PWA for managing funds entrusted to Students. A single Operator creates Students, records Deposits and Withdrawals, and views Balances derived from immutable Transaction history. Approved documents in `docs/` remain authoritative.

## Current Implementation State

Milestone 1 — Project Foundation is implemented. The repository retains the runnable three-screen PWA shell, Node.js server boundary, SQLite connection, initial Student and Transaction migrations, and foundation tests. The Next.js foundation now includes approved shared design tokens, reusable UI primitives, the structural Landing Page shell, exact approved metadata, the approved local Geist font contract, and the first Milestone 2 Footer identity content without product UI or persistence changes. Student management and financial use cases remain unimplemented until their roadmap milestones.

**Sprint 1 — Project Bootstrap** is complete. It was a separate implementation cycle for the approved Next.js foundation; it did not reopen or rename Development Roadmap Milestone 1 or begin a Landing Page implementation milestone.

**Sprint 2 — Shared Design System Foundation** is complete. It added only approved reusable UI primitives and did not create a Landing Page layout or page-specific component.

**Sprint 3 — Landing Foundation** is complete. It established only the public `/` shell, skip link, semantic landmark slots, and `PageContainer`; no Landing Page section, navigation, authentication route, or product action was implemented.

**Sprint 4 — Metadata & Compliance** is complete. It finalized exact Landing Page metadata, verified the approved Geist font system and fallback, closed remaining token compliance gaps, and officially completed Landing Page Implementation Plan Milestone 1 without beginning Milestone 2.

**Sprint 5 — Footer Identity Foundation** is complete. It begins Landing Page Implementation Plan Milestone 2 with only the static Footer identity, approved descriptor, server-rendered current year, and tokenized responsive structure; Footer navigation, Header, Hero, and all other Landing Page sections remain unimplemented.

## Current Handover

- **Current milestone:** Development Roadmap Milestone 1 — Project Foundation remains implemented. Landing Page Implementation Plan Milestone 1 is complete, and Milestone 2 is in progress.
- **Current sprint:** Sprint 5 — Footer Identity Foundation is implemented and validated.
- **Active branch:** `feat/landing-page`.
- **Work completed:** Retained the Sprint 1–4 foundations and replaced the empty Footer slot with a Server Component containing exact approved identity text, descriptor, and server-rendered current year. It reuses `PageContainer`, approved Footer tokens, and responsive token breakpoints without adding navigation or links. Production rendering, build, TypeScript, lint, and the full 25-test suite pass.
- **Current architecture decisions:** `/` is the public Landing Page, `/login` is reserved for the future authentication entry, and `/app` is reserved for the future authenticated application. Use the `geist` package through `next/font/local`, keep the existing `--font-geist-sans` CSS variable contract with `font.family.sans` fallback, and retain CSS custom properties as the canonical token layer. Keep the Sprint 5 Footer identity non-interactive and server-rendered; defer Footer navigation, Header, Hero, authentication, Prisma, API Routes, remaining Landing Page sections, and production deployment.
- **Current blockers:** The installed Next.js dependency tree reports two moderate PostCSS advisories for which npm offers only an unsafe breaking downgrade; this does not block local bootstrap validation but requires upstream monitoring before release.
- **Next recommended task:** Resolve the pending Header Product Identity and primary product-entry destinations before defining the next small Milestone 2 implementation sprint; do not implement Header, Hero, Footer navigation, or screenshots without their required approvals.

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
