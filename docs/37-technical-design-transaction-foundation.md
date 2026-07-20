# Technical Design Specification — Transaction Foundation

**Status:** Approved architecture contract; implementation not started
**Date:** 2026-07-20
**Owners:** Solution Architecture, Security, and Engineering
**Applies to:** Deposit, Withdrawal, Correction, Transaction edit/delete/restore, persisted Balance, financial audit, and Student ownership-transfer audit

## 1. Purpose, authority, and sprint boundary

This specification makes [ADR-004](36-adr-transaction-balance-and-audit.md) implementation-ready without creating code or changing the database. It inherits the authentication, authorization, and privacy controls in [ADR-001](26-adr-authentication.md), [ADR-002](27-adr-authorization-and-roles.md), [ADR-003](28-adr-financial-data-privacy.md), and the [Authentication and Authorization TDS](29-technical-design-authentication-authorization.md).

Normative terms `MUST`, `MUST NOT`, `SHOULD`, and `MAY` define the next Transaction Engine contract. This sprint explicitly contains no implementation, migration, Prisma change, API, Server Action, or UI work.

## 2. Domain model

### 2.1 Student financial aggregate

Student is the financial aggregate root and owns:

- current Operator ownership;
- persisted whole-IDR `balance`;
- monotonically increasing `financialVersion`;
- zero or more Transactions; and
- financial audit events associated with the Student.

All financial mutations execute through the Student aggregate boundary. Transaction history pagination and reporting reads may use optimized queries, but writes cannot bypass Student locking, ownership, status, Balance, audit, and version invariants.

### 2.2 Transaction entity

Logical fields for the implementation design are:

| Field | Required | Contract |
|---|---|---|
| `id` | Yes | Stable UUID; never reused |
| `studentId` | Yes | Immutable owning Student |
| `type` | Yes | `DEPOSIT`, `WITHDRAWAL`, or `CORRECTION` |
| `amount` | Yes | Positive whole-IDR integer |
| `correctionDirection` | Conditional | `INCREASE` or `DECREASE` only for Correction; absent otherwise |
| `reason` | Conditional | Current ledger reason required for Correction; edit/delete/restore command reasons belong to audit evidence |
| `occurredAt` | Yes | Operator-supplied business occurrence time, validated against approved clock bounds |
| `createdAt` / `createdBy` | Yes | Immutable system time and authenticated actor |
| `updatedAt` / `updatedBy` | Yes | Latest committed revision metadata |
| `revision` | Yes | Starts at 1; increments on edit, delete, and restore |
| `deletedAt` / `deletedBy` | Conditional | Null while active; set together on soft delete |

`effect(transaction)` returns a signed integer:

```text
DEPOSIT                         => +amount
WITHDRAWAL                      => -amount
CORRECTION + INCREASE           => +amount
CORRECTION + DECREASE           => -amount
deleted Transaction             => 0 for current Balance
```

The physical schema and storage representation are implementation-sprint deliverables, but they must preserve these logical contracts exactly.

### 2.3 FinancialAuditEvent

`FinancialAuditEvent` is immutable and append-only. Its logical contract contains:

| Field | Purpose |
|---|---|
| `id` | Stable audit identity |
| `commandId` | Unique idempotency identity for the mutation |
| `eventType` | `CREATE`, `EDIT`, `DELETE`, `RESTORE`, or `OWNERSHIP_TRANSFER` |
| `actorId` / `actorRole` | Server-derived accountable actor |
| `studentId` | Aggregate and authorization scope |
| `transactionId` | Present for Transaction events; absent for ownership transfer |
| `transactionRevision` | Revision created by the event |
| `reason` | Mandatory for Correction, edit, delete, restore, and ownership transfer |
| `beforeSnapshot` / `afterSnapshot` | Versioned, allowlisted domain fields; secrets excluded |
| `balanceBefore` / `balanceAfter` / `balanceDelta` | Financial mutation evidence; omitted for privacy-minimized ownership transfer |
| `oldOperatorId` / `newOperatorId` | Ownership-transfer evidence only |
| `occurredAt` | Server commit time in UTC |
| `schemaVersion` | Audit payload evolution |
| `correlationId` | Safe request/incident tracing without credentials |

Audit events cannot be edited or soft/hard deleted through the application. Snapshot serialization must be deterministic, versioned, and limited to approved fields.

## 3. Transaction lifecycle

| Operation | Preconditions | Transaction mutation | Balance delta | Audit |
|---|---|---|---:|---|
| Deposit | Active owned Student; valid positive amount | Insert active `DEPOSIT` | `+amount` | `CREATE` |
| Withdrawal | Active owned Student; sufficient Balance | Insert active `WITHDRAWAL` | `-amount` | `CREATE` |
| Correction increase/decrease | Active owned Student; reason; non-negative result | Insert active `CORRECTION` | `±amount` | `CREATE` with reason |
| Edit | Active owned Student and active Transaction; reason | Update approved fields; increment revision | `newEffect - oldEffect` | `EDIT` before/after |
| Delete | Active owned Student and active Transaction; reason | Set deletion metadata; increment revision | `-oldEffect` | `DELETE` |
| Restore | Active owned Student and deleted Transaction; reason | Clear deletion metadata; increment revision | `+currentEffect` | `RESTORE` |

All operations reject a final Balance below zero. Delete of a Deposit or increase-Correction and edit from a positive to smaller/negative effect can therefore fail. Delete of a Withdrawal or decrease-Correction increases Balance. Restore applies the opposite consequences.

Create requires a client-generated stable Transaction ID and command ID. Edit/delete/restore require current Transaction revision plus a new command ID. A stale revision returns conflict without mutation. Repeating the same command ID returns the original committed result.

Student reassignment is not a Transaction edit. It atomically changes `Student.operatorId` and appends `OWNERSHIP_TRANSFER` with old/new owner and reason. It does not update Transaction ownership, Balance, or Transaction revisions.

## 4. Balance lifecycle and consistency

### 4.1 Atomic write protocol

Every financial command follows this order inside one database transaction:

1. Begin the database write transaction and acquire the Student serialization boundary.
2. Resolve the authenticated actor from the database session.
3. Reload Student ownership, status, Balance, and financial version inside the transaction.
4. Require the actor to be the current active, non-deleted Operator owner.
5. Resolve command ID; return the prior outcome if already committed.
6. Validate input and, where applicable, load the current Transaction revision.
7. Calculate old effect, new effect, signed delta, and proposed Balance using exact integer arithmetic.
8. Reject overflow or proposed Balance below zero.
9. Insert or update the Transaction.
10. Update `Student.balance` and increment `Student.financialVersion` with a conflict guard.
11. Append the immutable FinancialAuditEvent.
12. Commit.
13. Return success only after commit.

The logical order “Transaction mutation, Balance update, audit append” is one atomic unit. No observer may receive success or a new Balance from an uncommitted unit.

### 4.2 Rollback strategy

Validation, authorization, conflict, lock timeout, overflow, audit failure, Transaction failure, Balance-update failure, and commit failure roll back every write in the unit. A failed command leaves:

- no new or partially edited Transaction revision;
- no Balance change;
- no financial-version change; and
- no audit event claiming success.

If the connection is lost during commit and the result is unknown, the client retains the same command ID. The server resolves that command ID before any retry: a committed audit event returns the recorded outcome; absence permits a retry; an unavailable lookup remains unknown and must not be presented as success or failure.

### 4.3 Consistency and reconciliation guarantees

- Current Balance is read from `Student.balance`, never calculated from a partial history page.
- Every committed mutation changes Transaction state, Balance, version, and audit together.
- Concurrent commands for one Student serialize. Commands for different Students are logically independent, though SQLite may serialize them physically.
- Integer overflow and underflow fail before persistence.
- A privileged reconciliation operation may compare persisted Balance with active Transaction effects, but this architecture does not authorize automatic repair. A mismatch emits an integrity incident and requires an audited recovery design.

## 5. Failure model

| Scenario | Required outcome |
|---|---|
| Insufficient Balance | Reject with domain validation outcome; write nothing |
| Missing/deleted Student | Mask as not found; write nothing |
| Inactive Student | Reject as read-only Student state; write nothing |
| Archived Student | Reject as read-only Student state; write nothing |
| Inactive/deleted Operator | Authentication/authorization fails closed; write nothing |
| Wrong Operator | Mask as not found; reveal no Student or financial existence |
| Platform Admin attempts financial access | Forbidden; admin role is not a financial bypass |
| Missing/deleted Transaction | Mask as not found within owned Student scope |
| Edit of deleted Transaction | Conflict; restore first |
| Delete of deleted Transaction | Idempotent only for the same committed command; otherwise conflict |
| Restore of active Transaction | Conflict |
| Stale revision | Conflict; return no sensitive current snapshot beyond authorized retry needs |
| Duplicate command ID, same command | Return recorded committed outcome without reapplying delta |
| Duplicate command ID, different payload | Integrity conflict and security telemetry; write nothing |
| Concurrent writes | Serialize or one loses the version guard and retries from fresh state |
| Lock timeout/database busy | Retryable unavailable; no automatic delta replay |
| Amount overflow | Validation failure; write nothing |
| Audit append failure | Roll back Transaction and Balance |
| Balance update failure | Roll back Transaction and audit |
| Commit outcome unknown | Resolve by command ID before retry |
| Ownership transfer races a write | Transactional ownership recheck permits only the owner serialized first; stale owner fails |

## 6. Security model

The authorization flow is:

```text
database session
  → active recognized OPERATOR
  → Student lookup scoped by Student.id + current operatorId
  → Student ACTIVE state for mutation
  → Transaction lookup scoped by Student.id
  → execute atomic financial command
```

Controls:

- Route middleware and hidden UI are convenience only; the application service and transaction boundary enforce authorization.
- Student, Transaction, actor, owner, Balance, delta, revision, and audit fields are reloaded or derived server-side.
- Transaction IDs never authorize access by themselves.
- All repository reads include Student ownership scope before returning financial data.
- Cross-Operator and nonexistent resources use the same masked not-found outcome.
- Platform Admin may perform ownership transfer through the admin policy but cannot call financial reads/writes or inspect financial audit payloads.
- Ownership transfer does not copy, rewrite, or disclose Transactions. The new owner sees the Student's full financial record through normal owner authorization.
- Audit and application logs exclude session tokens, provider credentials, raw request bodies, and unnecessary personal data.

## 7. Reporting and read-model implications

The write model supports future reads without implementing them now:

| Future capability | Foundation supplied by this design |
|---|---|
| Dashboard | Fast current totals from ownership-scoped persisted Student Balances |
| Operational reports | Stable Student/type/date filters over active Transactions and business `occurredAt` |
| Audit reports | Immutable revision history, actor, reason, deletion/restoration, and Balance transitions |
| Export | Stable IDs, explicit type/direction, current deletion state, business/system times, and scoped provenance |
| Analytics | Versioned event vocabulary and audit schema; clear separation of event time from recording time |

Operational totals exclude soft-deleted Transactions because their effect has already been removed from persisted Balance. Audit/reconciliation datasets retain deleted/restored evidence. All future read models must be scoped by current Student ownership and must define freshness, time zone, deletion, Correction, and transfer semantics before product approval. Platform-wide financial analytics remain prohibited unless ADR-003 is explicitly revised.

## 8. Sequence diagrams

### 8.1 Deposit

```mermaid
sequenceDiagram
    actor O as Operator
    participant A as Application Service
    participant D as Database Transaction
    O->>A: Deposit(studentId, amount, occurredAt, commandId)
    A->>D: Begin + serialize Student
    D->>D: Recheck session, ownership, ACTIVE status, commandId
    D->>D: Insert DEPOSIT
    D->>D: balance = balance + amount; version++
    D->>D: Append CREATE audit
    D-->>A: Commit
    A-->>O: Success with committed Transaction and Balance
```

### 8.2 Withdrawal

```mermaid
sequenceDiagram
    actor O as Operator
    participant A as Application Service
    participant D as Database Transaction
    O->>A: Withdrawal(studentId, amount, occurredAt, commandId)
    A->>D: Begin + serialize Student
    D->>D: Recheck authorization and Balance
    alt amount exceeds Balance
        D-->>A: Rollback: insufficient Balance
        A-->>O: Validation failure
    else sufficient Balance
        D->>D: Insert WITHDRAWAL
        D->>D: balance = balance - amount; version++
        D->>D: Append CREATE audit
        D-->>A: Commit
        A-->>O: Success
    end
```

### 8.3 Correction

```mermaid
sequenceDiagram
    actor O as Operator
    participant A as Application Service
    participant D as Database Transaction
    O->>A: Correction(direction, amount, reason, commandId)
    A->>D: Begin + serialize owned ACTIVE Student
    D->>D: Calculate signed correction delta
    alt proposed Balance is negative
        D-->>A: Rollback
        A-->>O: Validation failure
    else valid
        D->>D: Insert CORRECTION with reason
        D->>D: Apply delta; version++
        D->>D: Append CREATE audit
        D-->>A: Commit
        A-->>O: Success
    end
```

### 8.4 Edit

```mermaid
sequenceDiagram
    actor O as Operator
    participant A as Application Service
    participant D as Database Transaction
    O->>A: Edit(transactionId, expectedRevision, changes, reason, commandId)
    A->>D: Begin + serialize Student
    D->>D: Recheck ownership; load active Transaction revision
    D->>D: delta = newEffect - oldEffect
    alt stale revision or negative proposed Balance
        D-->>A: Rollback conflict/validation
        A-->>O: Explicit failure
    else valid
        D->>D: Update approved fields; revision++
        D->>D: Apply delta; version++
        D->>D: Append EDIT before/after audit
        D-->>A: Commit
        A-->>O: Success
    end
```

### 8.5 Delete

```mermaid
sequenceDiagram
    actor O as Operator
    participant A as Application Service
    participant D as Database Transaction
    O->>A: Delete(transactionId, expectedRevision, reason, commandId)
    A->>D: Begin + serialize Student
    D->>D: Recheck ownership; load active Transaction
    D->>D: proposedBalance = balance - oldEffect
    alt proposed Balance is negative
        D-->>A: Rollback
        A-->>O: Validation failure
    else valid
        D->>D: Set deleted metadata; revision++
        D->>D: Apply -oldEffect; version++
        D->>D: Append DELETE audit
        D-->>A: Commit
        A-->>O: Success
    end
```

Restore uses the Delete sequence with a required deleted Transaction, `+currentEffect`, cleared deletion metadata, and a `RESTORE` audit event.

## 9. Future extension points

These are reserved contracts, not implemented scope:

- **Transaction transfer:** a future command may move economic effect between Students only as one cross-aggregate atomic operation with dual ownership authorization, two Balance updates, and linked audit events. Editing `studentId` remains forbidden.
- **Scheduled transactions:** future schedule definitions create ordinary Transactions only when executed; schedules never affect Balance before execution.
- **Monthly allowance:** a future policy may generate scheduled or explicit Deposit commands with deterministic command IDs; it does not bypass normal authorization or audit.
- **Financial categories:** optional category identity may be attached to Transactions through a reviewed vocabulary; category never determines Balance effect.
- **Attachments:** immutable attachment references may support evidence, with private storage, malware scanning, retention policy, and ownership-scoped access; binary data does not belong in audit snapshots.
- **Approval workflow:** future pending commands have no Balance effect until approved and committed by an authorized actor; requester and approver identities remain distinct audit facts.

Unknown future types, states, or effects fail closed. Extension metadata must be versioned and cannot weaken whole-IDR arithmetic, non-negative Balance, atomicity, current ownership authorization, soft-delete retention, or immutable audit evidence.

## 10. Implementation readiness and traceability

The next sprint can begin the Transaction Engine only after its implementation plan traces to:

- FR-3.2.1 through FR-3.2.7 and FR-3.3.1 through FR-3.3.2;
- NFR-3.1 through NFR-3.4, NFR-5.1 through NFR-6.2, and NFR-9.1 through NFR-9.3;
- BR-TXN, BR-BAL, BR-AUD, BR-AUTHZ, and BR-PRIV rules;
- ADR-003 and ADR-004; and
- the failure, concurrency, security, audit, reconciliation, and retry contracts in this document.

No unresolved architectural decision remains for the Transaction Engine's domain behavior. Physical migration sequencing, code organization, API shape, and UI composition are implementation-design tasks constrained by this contract, not opportunities to reopen it.
