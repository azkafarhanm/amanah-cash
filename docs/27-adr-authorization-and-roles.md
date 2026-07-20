# ADR-002 — Amanah Cash Authorization and Roles

**Status:** Accepted
**Date:** 2026-07-20
**Owner:** Project Owner

## Context

Google authentication establishes identity but cannot decide what Amanah Cash data that identity may use. The platform needs explicit roles and Student ownership without weakening financial invariants.

## Decision

The only current roles are `PLATFORM_ADMIN` and `OPERATOR`. Amanah Cash assigns roles; Google does not.

### `PLATFORM_ADMIN`

May:

- create and deactivate Operator accounts;
- assign Students to Operators;
- transfer Students between Operators;
- manage platform configuration; and
- maintain the application.

Must not routinely access Operator financial data, including Student balances, Transaction history, or financial reports. Platform administration is not financial management.

### `OPERATOR`

May manage Transactions, Balances, financial history, and approved reports only for Students currently assigned to that Operator.

### Student ownership

```text
Operator 1 ─── 0..* Students
Student  1 ─── exactly 1 Operator
```

Every Student belongs to exactly one active Operator. Creating or transferring ownership is an authorization operation. A transfer changes responsibility for subsequent access without changing, duplicating, deleting, or reattributing the Student's immutable financial history.

## Enforcement

- Authentication is necessary but never sufficient for protected data access.
- The server resolves the current active Amanah Cash user and role from the database session.
- Every Student and Transaction read or write is scoped through current Student ownership.
- Client-side filtering is presentation only and is never an authorization boundary.
- Platform Admin capabilities use dedicated administrative operations; they do not grant routine financial-data reads.
- There is no implicit superuser bypass for financial data.
- Deactivation prevents new sessions and invalidates or rejects existing sessions according to the implementation contract.

## Consequences

- Existing unscoped Student queries must not be reused after authorization is implemented.
- The physical User, session, role, and Student-ownership schema requires a separately reviewed database design and migration before implementation.
- Actor attribution to immutable Transactions is not introduced by this decision.

