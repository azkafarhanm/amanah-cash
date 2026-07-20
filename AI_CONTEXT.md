# Amanah Cash — AI Context

## Project Purpose

Amanah Cash is a mobile-first PWA for managing funds entrusted to Students. Authenticated Operators manage only assigned Students; Platform Admin manages the platform without routine financial-data access. Balances derive from immutable Transaction history. Approved documents in `docs/` remain authoritative.

## Current Implementation State

Milestone 1 — Project Foundation is implemented. The repository retains the runnable three-screen PWA shell, Node.js server boundary, SQLite connection, initial Student and Transaction migrations, and foundation tests. The Next.js foundation now includes approved shared design tokens, reusable UI primitives, the structural Landing Page shell, exact approved metadata, the approved local Geist font contract, and the first Milestone 2 Footer identity, Hero content, and Header Product Identity foundations without product UI or persistence changes. Student management and financial use cases remain unimplemented until their roadmap milestones.

**Sprint 1 — Project Bootstrap** is complete. It was a separate implementation cycle for the approved Next.js foundation; it did not reopen or rename Development Roadmap Milestone 1 or begin a Landing Page implementation milestone.

**Sprint 2 — Shared Design System Foundation** is complete. It added only approved reusable UI primitives and did not create a Landing Page layout or page-specific component.

**Sprint 3 — Landing Foundation** is complete. It established only the public `/` shell, skip link, semantic landmark slots, and `PageContainer`; no Landing Page section, navigation, authentication route, or product action was implemented.

**Sprint 4 — Metadata & Compliance** is complete. It finalized exact Landing Page metadata, verified the approved Geist font system and fallback, closed remaining token compliance gaps, and officially completed Landing Page Implementation Plan Milestone 1 without beginning Milestone 2.

**Sprint 5 — Footer Identity Foundation** is complete. It established the static Footer identity, approved descriptor, server-rendered current year, and tokenized responsive structure. Footer navigation remains unimplemented.

**Sprint 6 — Hero Content Foundation** is complete. It established the approved Hero heading, subheading, supporting copy, responsive typography, and page-level `h1`. Hero actions, screenshot, decoration, and motion remain unimplemented.

**Sprint 7 — Header Product Identity Foundation** is complete. It replaces the empty Header slot with only the approved `Amanah Cash` identity link to `/`, exact accessible name, and tokenized keyboard focus; CTA, navigation, authentication routes, and future Header composition remain unimplemented.

## Current Handover

- **Current milestone:** Development Roadmap Milestone 1 — Project Foundation remains implemented. Landing Page Implementation Plan Milestone 1 is complete, and Milestone 2 is in progress.
- **Current sprint:** Authentication Persistence Layer is implemented; Auth.js integration and all authentication behavior remain unimplemented.
- **Active branch:** `feat/landing-page`.
- **Work completed:** Added the approved Prisma identity model, Auth.js-compatible User/Account/Session persistence, required active-Operator Student ownership, reversible migration, and persistence tests. No Auth.js configuration, provider, callback, session behavior, route, authorization middleware, API, or UI was added.
- **Current architecture decisions:** Auth.js uses Google only and Database Sessions. Platform Admin pre-provisions Operator Full Name, Google Email, and `OPERATOR` role; unregistered/inactive Google emails are denied. Roles are `PLATFORM_ADMIN` and `OPERATOR`; initial Platform Admin bootstrap logic remains deferred. `/` is public, `/login` owns authentication, and successful login leads to protected `/app`. Every Student belongs to exactly one active Operator. Operators access only assigned Student financial data. Platform Admin manages Operators, assignments, transfers, settings, and maintenance but has no routine financial-data access. Desktop Header Navigation remains deferred until its fragment targets exist.
- **Current blockers:** A populated legacy database requires an approved explicit Student-to-Operator mapping before the ownership migration can run; the migration intentionally fails atomically rather than inventing ownership. The installed dependency tree reports moderate upstream advisories requiring review before release.
- **Next recommended task:** Implement the separately scoped Auth.js integration against the approved persistence model. Do not render the primary CTA before `/login` is functional.

## MVP Scope

Included:

- Create, list, search, and view Students.
- Record Deposits and Withdrawals in whole IDR.
- View correct Balance and progressively loaded Transaction history.
- PWA installation and mobile-first responsive operation.
- Explicit validation, loading, empty, failure, and retry states.
- Google-only authentication remains unimplemented; its pre-provisioned User, two-role, database-session, provider-Account, and Student-ownership persistence is implemented.

Excluded:

- Password login, public registration, Sign Up, Forgot Password, password reset, provider-assigned roles, and Transaction actor attribution.
- Offline data or Transaction synchronization.
- Transaction or Student editing and deletion.
- Notes, categories, report implementation, exports, notifications, and bulk operations. Operator-scoped reporting permission is approved for a future separately scoped feature.
- Multiple currencies and distributed infrastructure.

## Authentication and Authorization Decisions

- Auth.js, Google-only authentication, and Database Sessions are locked decisions; only their persistence model is currently implemented.
- Platform Admin provisions and deactivates users and assigns/transfers Students. Google verifies identity only; Amanah Cash owns roles and authorization.
- Roles are exactly `PLATFORM_ADMIN` and `OPERATOR`.
- Every Student belongs to exactly one Operator; transfer changes current responsibility without changing immutable Transaction history.
- The physical auth/session/ownership schema and Prisma package versions are implemented. Auth.js package selection, runtime session behavior, cookies, secrets, and bootstrap logic remain future sprint work.
- Sprint 1 targets Local Development only and uses the approved local SQLite database.
- Vercel deployment is not part of Sprint 1. The production deployment strategy is deferred to the Deployment phase; Sprint 1 must not introduce an external database or change the approved persistence architecture.

## Domain Terminology

- **Platform Admin:** manages users, assignments, configuration, and maintenance without routine financial-data access.
- **Operator:** manages financial data only for assigned Students.
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
13. Only active, pre-provisioned Google emails may authenticate.
14. Authorization is server-enforced from Amanah Cash role and current Student ownership.
15. Privacy outranks administrative visibility; Platform Admin has no implicit financial-data bypass.

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
- Student and Transaction remain the financial source entities; identity/session persistence must remain separate from financial truth.
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
- Scope every protected Student and Transaction operation by active user, role, and current ownership on the server.
- Keep financial data out of sessions, cookies, logs, analytics, and administrative screens.

## AI Must Never

- Modify `docs/00-product-principles.md`; it is immutable.
- Invent features, fields, screens, entities, business rules, or infrastructure.
- Persist or cache authoritative Balance.
- Add Transaction mutation or soft deletion.
- Put authoritative business logic in UI code.
- Use floating-point money.
- Split Withdrawal checking and insertion across transaction boundaries.
- Add authentication outside a separately approved Authentication Sprint, password authentication, public registration, an administrative financial bypass, offline sync, multi-currency, reporting implementation, or distributed infrastructure.
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
| `docs/26-adr-authentication.md` | Locked authentication decision |
| `docs/27-adr-authorization-and-roles.md` | Locked roles and ownership decision |
| `docs/28-adr-financial-data-privacy.md` | Locked privacy decision |

## Before Changing Anything

Read the relevant approved documents, identify requirement IDs and affected layers, inspect existing code and tests, preserve unrelated user changes, and verify implementation, tests, documentation, and the complete diff.
