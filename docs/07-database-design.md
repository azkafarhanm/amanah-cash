# Amanah Cash — Database Design

**Version:** 1.0
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-17

---

## 1. Purpose

This document defines the logical relational database design for the Amanah Cash MVP. It implements the approved requirements in:

- `docs/01-functional-requirements.md`
- `docs/02-non-functional-requirements.md`
- `docs/03-business-rules.md`
- `docs/04-domain-model.md`

The design is intentionally limited to Student and Transaction persistence. It does not select a database product or define deployment infrastructure.

## 2. Design Principles

1. Transaction history is the only persisted source for financial calculations.
2. No balance column, cache table, or independently maintained balance value exists.
3. Monetary values use exact whole-Rupiah integer storage.
4. Transactions are append-only for the application.
5. Financial writes are serialized per Student.
6. Balance validation and withdrawal insertion are one atomic database operation.
7. Indexes support case-insensitive student lookup and progressive transaction history without adding product features.

## 3. Entity Relationship

```text
students
  id PK
   │
   └──< transactions
          student_id FK → students.id
```

- One row in `students` may have zero or more rows in `transactions`.
- Every row in `transactions` references exactly one existing Student.
- A Student referenced by a Transaction cannot be deleted.

## 4. Table: `students`

### 4.1 Columns

| Column | Logical Type | Null | Default | Description |
|--------|--------------|------|---------|-------------|
| `id` | UUID | No | Generated UUID | Primary key |
| `name` | Variable text, maximum 100 characters | No | None | Normalized student name |
| `created_at` | Timestamp with time zone | No | Database current timestamp | Creation time |

### 4.2 Constraints

| Constraint | Definition | Purpose |
|------------|------------|---------|
| `pk_students` | Primary key on `id` | Stable Student identity |
| `ck_students_name_not_blank` | `name` is not empty after normalization | Enforces required name |
| `ck_students_name_length` | Character length is between 1 and 100 | Enforces approved name length |
| `uq_students_name_ci` | Unique case-insensitive normalized `name` | Prevents visually duplicate Student records |

Name normalization—trimming outer whitespace and collapsing consecutive internal whitespace—occurs before insertion. Database uniqueness must use a deterministic case-insensitive comparison compatible with the application's comparison. The stored `name` is the normalized display value; an additional raw-name column is not retained.

### 4.3 Indexes

| Index | Columns or Expression | Unique | Purpose |
|-------|-----------------------|--------|---------|
| `pk_students` | `id` | Yes | Primary-key lookup |
| `uq_students_name_ci` | Case-insensitive expression over normalized `name` | Yes | Duplicate prevention and exact normalized-name lookup |
| `ix_students_name_ci` | Case-insensitive expression over normalized `name` | No | Alphabetical listing and name search where the chosen database requires a separate search index |

The database implementation may omit `ix_students_name_ci` when `uq_students_name_ci` supports the required ordering and search access paths. This avoids redundant indexes.

## 5. Table: `transactions`

### 5.1 Columns

| Column | Logical Type | Null | Default | Description |
|--------|--------------|------|---------|-------------|
| `id` | UUID | No | Generated UUID | Primary key and financial event identity |
| `student_id` | UUID | No | None | Owning Student |
| `type` | Restricted text or enum | No | None | `deposit` or `withdrawal` |
| `amount` | Signed 64-bit integer | No | None | Positive whole Rupiah (`IDR`) |
| `created_at` | Timestamp with time zone | No | Database current timestamp | Persistence time |

No `updated_at`, `deleted_at`, currency, actor, note, category, or balance column is present. These fields are unnecessary or explicitly outside the MVP.

### 5.2 Constraints

| Constraint | Definition | Purpose |
|------------|------------|---------|
| `pk_transactions` | Primary key on `id` | Stable event identity and duplicate retry protection |
| `fk_transactions_student` | `student_id` references `students.id` with delete restricted | Prevents orphaned Transactions and Student deletion |
| `ck_transactions_type` | `type IN ('deposit', 'withdrawal')` | Limits direction to approved terminology |
| `ck_transactions_amount_positive` | `amount > 0` | Rejects zero and negative values |

The integer type rejects fractional storage. Input parsing must reject decimal and non-numeric input before the insert. Values outside the signed 64-bit range are invalid because they cannot be represented by the approved storage type.

### 5.3 Indexes

| Index | Columns | Unique | Purpose |
|-------|---------|--------|---------|
| `pk_transactions` | `id` | Yes | Event lookup and retry deduplication |
| `ix_transactions_student_history` | `student_id`, `created_at DESC`, `id DESC` | No | Stable newest-first progressive history |

The trailing `id` provides deterministic ordering when multiple Transactions have the same timestamp. A history cursor uses the pair `(created_at, id)` rather than an offset, so progressively loading older entries remains stable as new events are appended.

The same student-leading index supports locating a Student's complete transaction set for balance aggregation. No balance-specific index or summary table is added because the MVP requires balance to derive from source Transactions.

## 6. Balance Query

Balance is calculated from every Transaction for one Student:

```sql
SELECT COALESCE(
  SUM(
    CASE
      WHEN type = 'deposit' THEN amount
      WHEN type = 'withdrawal' THEN -amount
    END
  ),
  0
) AS balance
FROM transactions
WHERE student_id = :student_id;
```

Requirements:

- The result uses exact integer arithmetic.
- A Student with no Transactions has balance `0`.
- The query is independent of transaction-history pagination.
- The result is not persisted as a separate balance value.

## 7. Atomic Financial Writes

### 7.1 Per-Student Serialization

Every deposit and withdrawal write acquires an exclusive transactional lock for the target Student row. The lock is held until commit or rollback.

Using the Student row as the lock target provides one stable serialization point even when the Student has no Transactions. Writes for different Students remain independent.

All application paths that append a financial Transaction must use this protocol. Locking only withdrawals would allow a concurrent deposit to have ambiguous ordering relative to a withdrawal.

### 7.2 Deposit Transaction

```text
BEGIN
  1. Lock the target Student row for update.
  2. Fail if the Student does not exist.
  3. Insert the complete deposit row.
  4. Commit.
COMMIT
```

The lock gives all financial writes for that Student a deterministic database order. The insert and commit are one unit; failure rolls back the event completely.

### 7.3 Withdrawal Transaction

```text
BEGIN
  1. Lock the target Student row for update.
  2. Fail if the Student does not exist.
  3. Calculate balance from every persisted Transaction for the Student.
  4. If withdrawal amount is greater than balance, roll back without inserting.
  5. Otherwise, insert the complete withdrawal row.
  6. Commit.
COMMIT
```

The Student lock ensures another deposit or withdrawal for the same Student cannot pass the lock until the current operation commits or rolls back. Therefore, balance validation and withdrawal insertion observe one serialized history and behave atomically.

Application-side validation without this database transaction is insufficient and must not be used as the financial integrity boundary.

### 7.4 Failure Behavior

- Any error before commit rolls back the complete write.
- A failed withdrawal creates no Transaction row.
- A transaction is reported as successful only after commit succeeds.
- A lost connection or unknown commit outcome must be resolved by looking up the same Transaction UUID before retrying.
- The system generates one Transaction UUID for a logical submission and reuses it when resolving or retrying that submission. The primary key prevents the same event from being inserted twice.

This retry behavior satisfies the requirement that a safe retry must not create an unintended duplicate without adding a separate idempotency entity or field.

## 8. Append-Only Transaction Model

The application database role receives:

- `SELECT` and `INSERT` access to `transactions`.
- No `UPDATE`, `DELETE`, or `TRUNCATE` access to `transactions`.

The application exposes no operation that updates or deletes a Transaction. Corrections, reversals, administrative mutation, and transaction deletion are outside MVP scope.

Schema migrations and controlled database administration are operational responsibilities outside the application role. They do not create an MVP product capability to mutate financial events.

No soft-delete column is added because soft deletion would allow a persisted financial event to be excluded from balance calculation and would weaken the append-only source of truth.

## 9. Student Retention

The application exposes create and read operations for Students, but no update or delete operation. The foreign key uses restricted deletion so a referenced Student cannot be removed even outside the application flow without first violating or explicitly overriding the relationship.

## 10. Progressive History Retrieval

History is retrieved newest first with a fixed page size selected by the application. The database contract is:

```sql
SELECT id, student_id, type, amount, created_at
FROM transactions
WHERE student_id = :student_id
  AND (
    :cursor_created_at IS NULL
    OR (created_at, id) < (:cursor_created_at, :cursor_id)
  )
ORDER BY created_at DESC, id DESC
LIMIT :page_size;
```

The first request has no cursor. Each later request uses the `(created_at, id)` pair from the last row of the previous page. Page size is a presentation and performance setting, not a domain rule.

Balance is queried separately from this page and always uses complete persisted history.

## 11. Application Role Permissions

Minimum application permissions are:

| Table | SELECT | INSERT | UPDATE | DELETE | TRUNCATE |
|-------|--------|--------|--------|--------|----------|
| `students` | Yes | Yes | No | No | No |
| `transactions` | Yes | Yes | No | No | No |

These permissions match the MVP capabilities: create/read Students and append/read Transactions. Database locking of a selected Student row must remain available to the application role under the selected database product.

## 12. Design Decisions

| Decision | Rationale |
|----------|-----------|
| Two tables only | Student and Transaction are the only persisted MVP entities. |
| UUID primary keys | The approved SRS requires automatically generated UUID identities. |
| Signed 64-bit integer amount | Whole-Rupiah values require exact integer storage; 64-bit range avoids premature custom monetary types. |
| Timestamp with time zone | Financial events need an unambiguous persistence time for traceability and ordering. |
| Database-generated timestamps | A single database clock gives persisted events a consistent time source. |
| Normalized name stored once | The raw input has no operational value; one value supports display, uniqueness, and search. |
| Case-insensitive unique name index | Duplicate prevention must remain correct under concurrent Student creation. |
| Restricted Student deletion | Transaction history must always retain a valid Student reference. |
| No balance column or table | Persisting balance would create a second financial source of truth. |
| Per-Student write lock | It enforces the non-negative invariant without serializing unrelated Students. |
| Lock deposits and withdrawals | Every financial event receives a deterministic order within one Student aggregate. |
| Append-only application permissions | Database permissions reinforce the absence of edit and delete operations. |
| Composite history index and cursor | It supports deterministic progressive loading while Transactions are appended. |
| Stable Transaction UUID on retry | The existing primary key prevents duplicate logical submissions without another MVP field. |

## 13. Constraint and Rule Traceability

| Database Element | Source Rules |
|------------------|--------------|
| `students.name` checks and unique index | FR-3.1.1; BR-STU-001–003 |
| Restricted Student deletion | BR-STU-004 |
| `transactions.type` check | BR-TXN-001–003 |
| Integer positive `amount` | NFR-3.1; BR-MON-001–003 |
| Transaction primary key and required columns | NFR-6.1; BR-TXN-003 |
| Append-only permissions | FR-3.2.3; BR-TXN-004; BR-AUD-001 |
| Atomic insert and rollback | NFR-3.3, NFR-5.2; BR-TXN-005 |
| Balance query | FR-3.3.1; BR-BAL-001–003 |
| Per-Student lock and atomic withdrawal | FR-3.2.2; NFR-3.3; BR-BAL-004–005 |
| History index and cursor | FR-3.2.3; NFR-4.1; BR-UI-002–003 |
| Stable retry UUID | NFR-5.1 |
