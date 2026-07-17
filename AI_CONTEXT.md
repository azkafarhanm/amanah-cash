# Amanah Cash — AI Context

## Project Purpose

Amanah Cash is a mobile-first PWA for managing funds entrusted to Students. A single Operator creates Students, records Deposits and Withdrawals, and views Balances derived from immutable Transaction history. Approved documents in `docs/` remain authoritative.

## MVP Scope

Included:

- Create, list, search, and view Students.
- Record Deposits and Withdrawals in whole IDR.
- View correct Balance and progressively loaded Transaction history.
- PWA installation and mobile-first responsive operation.
- Explicit validation, loading, empty, failure, and retry states.

Excluded:

- Authentication, accounts, multiple users, roles, and actor attribution.
- Offline data or Transaction synchronization.
- Transaction or Student editing and deletion.
- Notes, categories, reports, exports, notifications, and bulk operations.
- Multiple currencies and distributed infrastructure.

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
- Add authentication, offline sync, multi-currency, reporting, or distributed infrastructure.
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
