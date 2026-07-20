# Amanah Cash — Database Design

**Version:** 1.6
**Status:** Approved target design; not implemented
**Owner:** Project Owner
**Last Updated:** 2026-07-20

## 1. Purpose and architecture boundary

This document defines the logical relational target for the Transaction Foundation. It is constrained by the Functional Requirements, Non-Functional Requirements, Business Rules, Domain Model, ADR-003, ADR-004, and the Transaction Foundation TDS.

The current database still contains the pre-Transaction-Engine `students` and `transactions` schema. This architecture sprint creates no migration, Prisma change, generated client, trigger, table, column, or data backfill. Physical DDL and migration sequencing belong to the next implementation sprint and must preserve the logical contract below.

Authentication, session, Operator management, and current Student ownership persistence remain as documented in [Authentication Persistence Design](30-authentication-persistence-design.md).

## 2. Design principles

1. Student is the financial aggregate and current ownership boundary.
2. `Student.balance` is persisted and changes only with an atomic Transaction lifecycle command.
3. Balance equals all non-deleted Transaction effects and never becomes negative.
4. Transaction mutation, Balance/version update, command idempotency, and immutable audit append commit or roll back together.
5. Transaction delete is soft; FinancialAuditEvent is append-only and never deleted through product behavior.
6. Monetary values use exact whole-IDR signed 64-bit integer arithmetic with explicit overflow checks.
7. Business occurrence time, system commit time, actor, revision, and deletion state remain distinguishable.
8. Every financial query is scopeable through current Student ownership.

## 3. Logical relationships

```text
users (OPERATOR) 1 ───< students
                          ├── persisted balance + financial_version
                          ├──< transactions
                          └──< financial_audit_events

transactions.student_id ──> students.id (immutable, delete restricted)
financial_audit_events.student_id ──> students.id (delete restricted)
financial_audit_events.transaction_id ──> transactions.id (nullable, delete restricted)
```

Transaction has no Operator ownership column. Current `students.operator_id` scopes all financial reads and writes. Ownership transfer changes one Student relationship and appends privacy-minimized audit; it does not rewrite Transactions or Balance.

## 4. Target changes to `students`

Existing identity and management columns remain. The Transaction Engine target adds:

| Column | Logical type | Null | Default | Contract |
|---|---|---|---|---|
| `balance` | Signed 64-bit integer | No | `0` | Current non-negative whole-IDR Balance |
| `financial_version` | Non-negative integer | No | `0` | Increments once for every committed financial mutation |

Required controls:

- `balance >= 0` database check;
- `financial_version >= 0` database check;
- application write boundary that never exposes direct Balance assignment;
- ownership/status reload inside the same database transaction as every financial mutation; and
- ownership/status/Balance lookup indexes justified by measured query plans, not speculative duplication.

Existing Student management updates do not change `financial_version`. Ownership transfer does not change Balance/version because it changes visibility, not financial state, but it must append `OWNERSHIP_TRANSFER` audit atomically with `operator_id`.

## 5. Target `transactions` contract

### 5.1 Columns

| Column | Logical type | Null | Contract |
|---|---|---|---|
| `id` | UUID | No | Stable Transaction identity and create retry identity |
| `student_id` | UUID | No | Immutable owning Student |
| `type` | Restricted text/enum | No | `deposit`, `withdrawal`, or `correction` |
| `amount` | Signed 64-bit integer | No | Positive whole IDR |
| `correction_direction` | Restricted text/enum | Conditional | `increase`/`decrease` for Correction; null otherwise |
| `reason` | Bounded text | Conditional | Required for Correction; current approved reason |
| `occurred_at` | UTC timestamp | No | Business event time supplied by Operator |
| `created_at` / `created_by` | UTC timestamp / User ID | No | Immutable creation evidence |
| `updated_at` / `updated_by` | UTC timestamp / User ID | No | Latest revision evidence |
| `revision` | Positive integer | No | Starts at 1; increments on edit/delete/restore |
| `deleted_at` / `deleted_by` | UTC timestamp / User ID | Conditional | Both null while active; both set while deleted |

Currency is fixed to IDR and is not repeated per row. Transaction `student_id`, `id`, `created_at`, and `created_by` are immutable.

### 5.2 Constraints

- Primary key on `id`.
- Restricted foreign key from `student_id` to Student.
- Type restricted to the three MVP values.
- `amount > 0`.
- Correction requires direction and reason; non-Correction rows reject Correction direction.
- `revision >= 1`.
- Deletion timestamp/actor are both null or both non-null.
- Actor references retain historical identity according to the User logical-deletion policy.
- Database and application prevent `student_id` mutation.

### 5.3 Indexes

The implementation plan must provide and verify:

- stable Student history retrieval ordered by `occurred_at DESC, id DESC`;
- current operational history filtered by `deleted_at IS NULL`;
- owned-Student type/date reporting paths;
- Transaction lookup constrained by Student; and
- reconciliation aggregation over active Transactions.

Cursor pagination uses `(occurred_at, id)`. Offset pagination is not approved for growing financial history.

## 6. Target `financial_audit_events` contract

FinancialAuditEvent is the immutable evidence store.

| Column group | Contract |
|---|---|
| Identity | Unique audit `id`; unique `command_id` |
| Classification | `event_type`: `create`, `edit`, `delete`, `restore`, `ownership_transfer`; payload `schema_version` |
| Actor/scope | `actor_id`, `actor_role`, `student_id`, nullable `transaction_id`, nullable Transaction revision |
| Explanation | Required `reason` where the domain requires it; safe `correlation_id` |
| Evidence | Deterministic versioned `before_snapshot` and `after_snapshot` of allowlisted fields |
| Balance | Nullable `balance_before`, `balance_after`, `balance_delta` for financial events |
| Ownership | Nullable `old_operator_id`, `new_operator_id` for transfer events |
| Time | Database commit timestamp |

Constraints enforce the valid shape for each event type. Ownership-transfer rows contain ownership fields and omit financial snapshots/Balance. Transaction rows require Transaction identity and Balance evidence. Audit rows have no update/delete product path.

Snapshots must not contain credentials, sessions, raw request bodies, unrelated personal data, or fields that would give Platform Admin a financial-data bypass. A physical JSON or normalized representation is an implementation decision, but deterministic serialization and schema versioning are mandatory.

## 7. Balance effects and reconciliation

```text
active deposit                       +amount
active withdrawal                    -amount
active correction/increase           +amount
active correction/decrease           -amount
soft-deleted Transaction              0
```

Current Balance reads select `students.balance`. Reconciliation independently aggregates active Transaction effects:

```sql
SELECT COALESCE(SUM(
  CASE
    WHEN type = 'deposit' THEN amount
    WHEN type = 'withdrawal' THEN -amount
    WHEN type = 'correction' AND correction_direction = 'increase' THEN amount
    WHEN type = 'correction' AND correction_direction = 'decrease' THEN -amount
  END
), 0)
FROM transactions
WHERE student_id = :student_id
  AND deleted_at IS NULL;
```

This query is a verification/reconciliation path, not the routine Balance write path. Mismatch with `students.balance` is an integrity incident. Automatic repair is prohibited until a separately audited recovery design is approved.

## 8. Atomic financial-write protocol

### 8.1 Serialization

The current SQLite target uses `BEGIN IMMEDIATE` before Student, ownership, status, Transaction, command, or Balance reads. This reserves the single-writer boundary. A future database must use an equivalent Student row lock or compare-and-set using `financial_version`.

The supported SQLite process boundary remains one active server process and one database file with no external writer. Physical serialization across different Students is acceptable; logical correctness remains per Student.

### 8.2 Command sequence

Inside one database transaction:

1. Resolve current session actor.
2. Lock/reload Student, current ownership, status, Balance, and financial version.
3. Require current active Operator ownership and `ACTIVE` Student status.
4. Resolve unique command ID; return its committed result when idempotently repeated.
5. Validate input and expected Transaction revision.
6. Calculate old effect, new effect, signed delta, and proposed Balance.
7. Reject integer overflow or proposed Balance below zero.
8. Insert/update Transaction lifecycle state.
9. Update Balance and increment financial version with a version guard.
10. Append FinancialAuditEvent.
11. Commit and only then report success.

Deposit uses `+amount`; Withdrawal uses `-amount`; Correction uses signed direction; Edit uses `newEffect - oldEffect`; Delete uses `-oldEffect`; Restore uses `+currentEffect`.

### 8.3 Rollback and retry

Any validation, authorization, revision, constraint, lock, overflow, Transaction, Balance, audit, or commit failure rolls back the entire unit. No partial audit event may claim a rolled-back mutation.

Every command carries a unique command ID. Create also carries its stable Transaction UUID. After an unknown commit outcome, retry first resolves command ID:

- committed matching command: return recorded outcome;
- absent command: retry the same command;
- same ID with different payload: integrity conflict;
- unavailable lookup: outcome remains unknown.

## 9. Lifecycle persistence behavior

| Operation | Required current row | Row change | Balance change |
|---|---|---|---:|
| Create | None | Insert revision 1, active | New effect |
| Edit | Active + expected revision | Update approved fields; revision++ | New effect − old effect |
| Delete | Active + expected revision | Set deletion fields; revision++ | −old effect |
| Restore | Deleted + expected revision | Clear deletion fields; revision++ | +current effect |

Edit of deleted, delete of deleted, restore of active, stale revision, missing Transaction, and negative proposed Balance fail without writes. Same-command replay is handled through idempotency, not by weakening lifecycle validation.

## 10. Read and reporting implications

- Student Detail reads current Balance from Student independently of paginated history.
- Operational history defaults to non-deleted rows.
- Authorized audit views can reconstruct all revisions from FinancialAuditEvent.
- Dashboard totals may aggregate ownership-scoped Student Balance.
- Future reports/exports use `occurred_at` for business periods and retain `created_at` for recording latency/audit.
- Deleted/restored evidence remains available to audit/reconciliation datasets.
- Platform-wide financial queries are prohibited by ADR-003.

No Dashboard, Report, Export, or analytics implementation is part of this design sprint.

## 11. Student retention and ownership transfer

Student deletion remains unsupported and foreign keys restrict removal while Transactions/audit exist. Ownership transfer:

- updates only `students.operator_id` and Student management timestamp;
- appends `OWNERSHIP_TRANSFER` with old/new Operator, actor, reason, and time in the same transaction;
- does not update Transaction rows, Balance, or financial version; and
- immediately changes routine financial visibility through current ownership authorization.

## 12. Implementation and migration gate

The next sprint must produce a separately reviewed physical migration/backfill plan. It must address existing Transaction rows, initial Student Balance/version, removal or replacement of pre-existing append-only triggers, actor backfill policy, rollback feasibility, audit bootstrap, constraint ordering, backups, and reconciliation verification.

No physical database change is authorized by this document alone.

## 13. Traceability

| Database concern | Authority |
|---|---|
| Persisted Balance/version | FR-3.3.1; BR-BAL-001–006; ADR-004 |
| Transaction types/effects | FR-3.2.1–FR-3.2.4; BR-TXN-001–004 |
| Edit/delete/restore lifecycle | FR-3.2.5–FR-3.2.7; BR-TXN-005–008 |
| Atomic mutation/rollback | NFR-3.3, NFR-5.2; BR-TXN-009 |
| Immutable audit | FR-3.3.2; NFR-6.1–6.2; BR-AUD-001–004 |
| Ownership/status authorization | FR-7.2; NFR-9.1–9.2; BR-AUTHZ-001–004; ADR-003 |
| Retry/idempotency | NFR-5.1; BR-BAL-006 |
| Progressive history | FR-3.2.3; NFR-4.1; BR-UI-002–003 |
