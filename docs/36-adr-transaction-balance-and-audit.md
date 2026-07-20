# ADR-004 — Transaction, Balance, and Financial Audit Strategy

**Status:** Accepted
**Date:** 2026-07-20
**Owner:** Project Owner
**Decision scope:** Transaction Foundation architecture only; no implementation or schema change is approved by this ADR

## Context

Amanah Cash records financial events after they occur. It does not initiate bank transfers, connect to payment gateways, or claim that a recorded event proves settlement outside the application.

The Transaction Engine must support operational correction while retaining trustworthy evidence. The earlier design used immutable Transactions and a Balance derived on demand. The locked Transaction Foundation decisions instead require a persisted `Student.balance`, editable Transactions, soft deletion, restoration, Correction entries, and an audit record for every financial mutation and Student ownership transfer.

This ADR supersedes earlier financial decisions that required append-only Transactions, prohibited Transaction editing/deletion, excluded Correction, prohibited persisted Balance, or omitted financial actor attribution. It does not change ADR-001 through ADR-003: Google authentication, Amanah Cash authorization, current Student ownership, and administrative financial-data separation remain authoritative.

## Decision

### 1. Financial ownership

- Every Transaction belongs to exactly one Student.
- A Transaction has no Operator ownership field and cannot be reassigned to another Student through edit.
- The Student's current `operatorId` controls routine visibility and mutation of the Student, its Balance, its Transactions, and its financial audit history.
- Changing Student ownership transfers visibility automatically without rewriting Transaction rows.

### 2. Persisted Balance

- `Student.balance` is the authoritative current operational Balance and is persisted as an exact whole-IDR integer.
- Every financial mutation locks or serializes the Student, calculates the mutation's signed Balance delta, writes the Transaction change, writes the audit event, updates `Student.balance`, and commits as one database transaction.
- The consistency invariant is:

```text
Student.balance = sum(effect of every non-deleted Transaction for that Student)
```

- The active Transaction set remains the reconstruction and reconciliation evidence for the persisted Balance. A mismatch is an integrity incident; it is not repaired silently.
- A Student with no active Transactions has Balance `0`. Balance must never be negative.

### 3. Transaction types and effects

MVP types are `DEPOSIT`, `WITHDRAWAL`, and `CORRECTION`.

| Type | Stored amount | Additional direction | Balance effect |
|---|---:|---|---:|
| `DEPOSIT` | Positive whole IDR | None | `+amount` |
| `WITHDRAWAL` | Positive whole IDR | None | `-amount` |
| `CORRECTION` | Positive whole IDR | `INCREASE` or `DECREASE` | `+amount` or `-amount` |

Correction represents an explicit ledger adjustment after a discrepancy is discovered. It is not a disguised Deposit or Withdrawal. Correction requires a reason and its direction must be explicit. Every type uses a stable Transaction identity, business occurrence time, system creation time, and current revision metadata.

The type vocabulary is extensible through reviewed domain policy. Unknown types fail closed; future types do not inherit a Balance effect by default.

### 4. Editing and soft deletion

- An active Transaction may be edited by its Student's current active Operator.
- Edit may change type, amount, Correction direction/reason, business occurrence time, and approved descriptive fields. It cannot change `studentId`, identity, creation actor, or creation time.
- Edit applies `newEffect - oldEffect` to Balance and records immutable before/after evidence.
- Delete is soft delete. It marks the Transaction deleted, removes its current effect from Balance, and records reason, actor, and before/after Balance.
- Restore clears the deletion state, reapplies the Transaction's current effect, and records reason, actor, and before/after Balance.
- Editing an already deleted Transaction is prohibited. Restore must occur first.
- Permanent deletion of Transaction or financial audit records is prohibited through product behavior.

### 5. Audit is the immutable evidence layer

Transactions are operationally mutable; `FinancialAuditEvent` is append-only and immutable. It records `CREATE`, `EDIT`, `DELETE`, `RESTORE`, and `OWNERSHIP_TRANSFER` with actor, Student, optional Transaction, command/correlation identity, reason, before/after snapshots appropriate to the event, Balance before/after, signed delta, timestamp, and schema version.

Ownership-transfer audit contains ownership identifiers and reason but does not expose Transaction details or Balance to Platform Admin. Financial audit payloads remain Operator-owned financial data under ADR-003.

### 6. Atomicity, concurrency, and retry

- All financial writes for one Student use one serialization boundary.
- The current SQLite design uses one immediate write transaction before ownership, Student status, Transaction, or Balance reads. A future database must use an equivalent Student row lock or compare-and-set protocol.
- A monotonically increasing Student financial version participates in write conflict detection and changes with every committed financial mutation.
- Every mutation command has a unique command ID. Repeating a committed command returns its recorded outcome and never applies its delta twice.
- Success is returned only after commit. Any error rolls back the Transaction mutation, Balance update, version change, and audit event together.

## Status policy

- Financial reads remain ownership-scoped for active, inactive, and archived Students.
- Financial mutations are allowed only while the Student status is `ACTIVE` and the assigned Operator account is active and non-deleted.
- Inactive or archived Students are read-only. Platform Admin must deliberately change Student status before an Operator can mutate financial history.
- Missing/deleted Students fail as not found. Student product deletion remains unsupported.

## Security and privacy consequences

- Platform Admin does not gain routine Balance, Transaction, report, export, or financial-audit visibility.
- Platform Admin may transfer Student ownership and creates a privacy-minimized ownership audit event.
- Authorization is re-evaluated inside the same database transaction that performs the financial mutation, preventing a transfer race from granting stale-owner access.
- Client-supplied Balance, owner, actor, delta, audit snapshot, and authorization claims are never trusted.

## Reporting consequences

- Dashboard-style current totals may aggregate persisted `Student.balance` within the authorized Operator scope.
- Operational Transaction reports default to non-deleted Transactions.
- Audit/reconciliation reports can include deleted/restored revisions and immutable audit events.
- Exports and analytics must preserve Student ownership scope, type/direction semantics, deletion state, business occurrence time, and audit provenance.
- Reporting, export, dashboard, and analytics products remain future scope; this ADR only guarantees that the Transaction Foundation will support them.

## Alternatives rejected

- **Derived-only Balance:** rejected by the locked persisted-Balance decision.
- **Immutable Transactions plus reversal-only corrections:** rejected because Transaction editing is required.
- **Hard delete:** rejected because financial history must never be permanently removed.
- **Transaction-owned Operator:** rejected because Student ownership already defines visibility and transfer behavior.
- **Platform Admin financial superuser:** rejected by ADR-003.
- **Audit in general application logs:** rejected because logs lack the transactional, immutable, domain-specific evidence contract.

## Consequences and implementation gate

The next implementation sprint must design and review the physical schema, migration/backfill, repository operations, command idempotency, audit storage, reconciliation tooling, and tests against this ADR and the Transaction Foundation technical design. This architecture sprint creates no code, migration, Prisma model, API, or UI.
