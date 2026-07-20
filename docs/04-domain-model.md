# Amanah Cash — Domain Model

**Version:** 1.5
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-20

---

## 1. Purpose

This document defines the Amanah Cash MVP domain model. It derives from:

- `docs/01-functional-requirements.md`
- `docs/02-non-functional-requirements.md`
- `docs/03-business-rules.md`

The model defines the financial aggregate and the identity, role, and ownership concepts required to protect it.

## 2. Domain Overview

```text
PlatformUser
  ├── PLATFORM_ADMIN
  └── OPERATOR ── owns 0..* Students

Student (financial aggregate root; exactly one Operator)
  ├── persisted Balance + financialVersion
  ├── 0..* Transaction
  │       ├── Deposit: +amount
  │       ├── Withdrawal: -amount
  │       └── Correction: ±amount
  └── 0..* immutable FinancialAuditEvent
```

Balance is persisted on Student and changes only inside the same atomic unit as a Transaction lifecycle mutation and FinancialAuditEvent. It must reconcile to the effects of all non-deleted Transactions.

## 3. Entities

### 3.1 Student

Student is the aggregate root and identifies the person whose entrusted funds are tracked.

| Attribute | Domain Type | Required | Meaning |
|-----------|-------------|----------|---------|
| `id` | StudentId (UUID) | Yes | Stable system-generated identity |
| `name` | StudentName | Yes | Normalized display and search name |
| `operator_id` | UserId | Yes | Current active Operator owner |
| `status` | StudentStatus | Yes | `ACTIVE`, `INACTIVE`, or `ARCHIVED` |
| `notes` | StudentNotes | No | Trimmed operational note, at most 500 characters |
| `balance` | Balance | Yes | Persisted non-negative whole-IDR current Balance; default `0` |
| `financial_version` | FinancialVersion | Yes | Monotonic concurrency/reconciliation version |
| `created_at` | Timestamp | Yes | Time the student record was created |
| `updated_at` | Timestamp | Yes | Time management data last changed |

Responsibilities:

- Own its identity and normalized name.
- Provide the boundary for its transaction history.
- Guard financial operations that must be serialized for that student.
- Own the persisted Balance and financial version.
- Ensure Transaction mutation, Balance change, and audit evidence commit atomically.

Invariants:

- The normalized name is not empty and contains at most 100 characters.
- Leading and trailing whitespace is removed.
- Consecutive internal whitespace is represented by one space.
- The normalized name is unique under case-insensitive comparison.
- Exactly one existing, active, non-deleted Operator owns the Student.
- Status is one of `ACTIVE`, `INACTIVE`, or `ARCHIVED`.
- Notes are absent or contain at most 500 trimmed characters.
- Balance is a non-negative whole-IDR integer.
- Balance equals the effects of every non-deleted Transaction.
- Financial version increments exactly once per committed financial mutation.
- A Student referenced by a Transaction cannot be deleted.
- Platform Admin may edit Student management data and transfer ownership; Student deletion is not supported by the MVP.

### 3.2 Transaction

Transaction is an auditable financial record belonging to exactly one Student. Its operational fields may change through controlled edit, soft delete, and restore; immutable FinancialAuditEvents preserve every revision.

| Attribute | Domain Type | Required | Meaning |
|-----------|-------------|----------|---------|
| `id` | TransactionId (UUID) | Yes | Stable system-generated event identity |
| `student_id` | StudentId (UUID) | Yes | Identity of the owning Student |
| `type` | TransactionType | Yes | `DEPOSIT`, `WITHDRAWAL`, or `CORRECTION` |
| `amount` | RupiahAmount | Yes | Positive whole-Rupiah amount in IDR |
| `correction_direction` | CorrectionDirection | Conditional | `INCREASE` or `DECREASE` for Correction only |
| `reason` | Reason | Conditional | Current ledger reason required for Correction; lifecycle command reasons are stored in audit evidence |
| `occurred_at` | Timestamp | Yes | Business time when the recorded event occurred |
| `created_at` / `created_by` | Timestamp / UserId | Yes | Immutable creation evidence |
| `updated_at` / `updated_by` | Timestamp / UserId | Yes | Latest revision evidence |
| `revision` | PositiveInteger | Yes | Optimistic concurrency revision |
| `deleted_at` / `deleted_by` | Timestamp / UserId | Conditional | Soft-delete evidence |

Responsibilities:

- Record one Deposit, Withdrawal, or Correction.
- Expose a deterministic signed Balance effect.
- Support controlled edit, soft delete, and restore without changing Student ownership.
- Make the direction of money unambiguous through its type.
- Provide stable identity, revision, business time, lifecycle state, and ordering data.

Invariants:

- The Transaction belongs to an existing Student.
- The amount is a positive whole-Rupiah value.
- Deposit increases Balance; Withdrawal decreases Balance; Correction has explicit increase/decrease direction.
- A Transaction lifecycle mutation cannot produce a negative Balance.
- `student_id`, identity, creation actor, and creation time are immutable.
- Editing requires an active Transaction, expected revision, and reason.
- Delete is soft and removes the current effect; restore reapplies it.
- A deleted Transaction cannot be edited until restored.
- Transaction state, Student Balance/version, and audit event commit together or not at all.

### 3.3 FinancialAuditEvent

FinancialAuditEvent is immutable evidence for Transaction creation/mutation and Student ownership transfer. It records event/command identity, actor, Student, optional Transaction and revision, reason, versioned before/after snapshots, Balance transition where applicable, ownership transition where applicable, commit time, correlation identity, and payload schema version.

It is append-only, cannot be edited or deleted through application behavior, and follows current Student financial ownership/privacy. Ownership-transfer audit omits Balance and Transaction details from administrative visibility.

### 3.4 PlatformUser and Role

PlatformUser is an Amanah Cash authorization identity provisioned by Platform Admin before access is granted. Its conceptual attributes are stable identity, Full Name, normalized Google Email, Role, active status, and creation time. The physical schema remains an Authentication implementation decision.

- Role is exactly `PLATFORM_ADMIN` or `OPERATOR`.
- Google Email is unique after approved normalization.
- Only an active provisioned user may start or retain authorized access.
- Google verifies identity and never overrides the Amanah Cash role.
- `PLATFORM_ADMIN` manages Operators, assignments, transfers, configuration, and maintenance without routine financial-data permission.
- `OPERATOR` manages financial records only for assigned Students.

## 4. Value Types

### 4.1 StudentId and TransactionId

StudentId and TransactionId are UUID identities. Separate domain names prevent a Student identity from being used accidentally where a Transaction identity is expected.

### 4.2 StudentName

StudentName represents the normalized student name. Normalization occurs before validation and uniqueness comparison:

1. Trim leading and trailing whitespace.
2. Collapse consecutive internal whitespace to one space.
3. Compare normalized values case-insensitively for uniqueness and search.

The original unnormalized input is not retained because it has no MVP operational purpose.

### 4.3 RupiahAmount

RupiahAmount is a positive whole-number value in Indonesian Rupiah. It has no decimal component and uses exact integer arithmetic.

Currency is fixed to IDR for the MVP, so currency is not stored on every Transaction and there is no multi-currency value type.

### 4.4 TransactionType

TransactionType has three MVP values and fails closed for unknown values:

| Value | Direction | Balance Effect |
|-------|-----------|----------------|
| `deposit` | Money entrusted to the student | Increase |
| `withdrawal` | Money returned by the student | Decrease |
| `correction` | Explicit reasoned ledger adjustment | Increase or decrease according to CorrectionDirection |

### 4.5 Balance

Balance is a persisted non-negative whole-IDR value owned by Student. It cannot be entered or updated independently.

```text
Balance(student) = Σ effect(non-deleted Transactions)
```

Every financial mutation atomically applies its signed delta to Balance. Reconciliation derives the same value from non-deleted Transaction effects. A progressively loaded UI history is never a Balance input.

### 4.6 CorrectionDirection, TransactionRevision, and CommandId

- CorrectionDirection is exactly `INCREASE` or `DECREASE` and is valid only for Correction.
- TransactionRevision is a positive monotonic integer used to reject stale edits, deletes, and restores.
- CommandId uniquely identifies one financial mutation for idempotent retry. Reuse with different input is an integrity conflict.

### 4.7 Cross-Layer Terminology Contract

Each layer uses one authoritative vocabulary. Translations and transport names do not change Domain meaning.

| Concept | Domain terminology | Database terminology | API terminology | Production UI terminology | Public-facing terminology |
|---------|--------------------|----------------------|-----------------|---------------------------|---------------------------|
| Student | `Student` | table `students`; `student_id` reference | `student`; `studentId` | `Siswa` | `siswa` |
| Transaction | `Transaction` | table `transactions` | `transaction` | `Transaksi` | `transaksi` or `transaksi keuangan siswa` |
| Deposit | `Deposit` | `transactions.type = 'deposit'` | type value `deposit` | action `Setor`; noun `Setoran`; title `Setor dana` | exact type `Setoran`; broader narrative term `pemasukan` |
| Withdrawal | `Withdrawal` | `transactions.type = 'withdrawal'` | type value `withdrawal` | action `Tarik`; noun `Penarikan`; title `Tarik dana` | exact type `Penarikan`; broader narrative term `pengeluaran` |
| Correction | `Correction` | `transactions.type = 'correction'` plus direction | type value `correction` | `Koreksi`; explicit `Tambah`/`Kurangi` effect | `koreksi` |
| Balance | `Balance` | persisted `students.balance` | `balance` | `Saldo` | `saldo` |
| Amount | `RupiahAmount` or `Amount` | column `amount` | `amount` | `Jumlah` | `jumlah Rupiah` |

Authority rules:

1. Domain rules, code-level Domain types, and technical traceability use the English Domain terminology in this document.
2. Database schema and queries use the exact table, column, and lowercase Transaction type names in the Database column above.
3. API request and response contracts use the API terminology above. Transaction type values are exactly `deposit`, `withdrawal`, and `correction`; translated values are not transport enums.
4. Production application copy uses the UI terminology above and the final strings in `docs/19-screen-specifications.md`.
5. Public Landing Page copy uses the Public-facing terminology above and the final strings in `docs/24-landing-page-content.md`.
6. English Domain terms that appear in requirements, flows, wireframes, component anatomy, tests, logs, or developer tools are internal semantic and implementation terminology. They are not approved production UI copy.
7. `Setor`, `Setoran`, and public `pemasukan` map only to Domain `Deposit`. `Tarik`, `Penarikan`, and public `pengeluaran` map only to Domain `Withdrawal`. `Koreksi` maps only to Domain `Correction` and always exposes increase/decrease direction and reason. Implementers must not improvise synonyms such as credit/debit, send/receive, income/expense, or cash-in/cash-out.

Financial perspective is explicit:

- A Deposit is money entrusted to the Student. It leaves the operator's custody perspective and enters the tracked entrusted-funds Balance, so Balance increases.
- A Withdrawal is money returned by the Student. It returns to the operator's custody perspective and leaves the tracked entrusted-funds Balance, so Balance decreases.
- A Correction is a reasoned ledger adjustment and must explicitly state whether it increases or decreases Balance.
- Public `pemasukan` and `pengeluaran` describe movement into and out of the tracked Student Balance. They do not describe the operator's accounting revenue, expense, or cash position.

This contract maps vocabulary only. It does not change Transaction direction, Balance calculation, product scope, or any Business Rule.

## 5. Relationships

### 5.1 Student to Transaction

- One Student has zero or more Transactions.
- One Transaction belongs to exactly one Student.
- A Transaction cannot exist without its Student.
- Transaction `student_id` is immutable; financial visibility follows Student ownership.
- Removing a Student with Transactions is prohibited.

This relationship provides financial ownership without a separate Transaction owner. Actor attribution belongs to creation/revision metadata and immutable audit evidence, not ownership.

### 5.2 Operator to Student

- One Operator owns zero or more Students.
- Every Student belongs to exactly one Operator.
- Ownership controls access to the Student, Transactions, Balance, history, and Operator-scoped reports.
- Transfer changes current responsibility without rewriting, duplicating, deleting, or reattributing Transactions.
- Transfer appends privacy-minimized ownership audit and does not change Balance.

### 5.3 Student to FinancialAuditEvent

- One Student has zero or more FinancialAuditEvents.
- A Transaction event references one Transaction; ownership transfer has no Transaction reference.
- Financial audit visibility follows current Student ownership. Platform Admin receives only the ownership-transfer evidence authorized by admin policy.

## 6. Aggregate Boundary

Student remains the financial aggregate root. PlatformUser and Student ownership form a separate authorization boundary and do not alter the Student financial consistency boundary.

Commands that change financial history must enter through the Student boundary:

- Record deposit.
- Record withdrawal.
- Record correction.
- Edit Transaction.
- Soft-delete Transaction.
- Restore Transaction.

All financial writes for the same Student are serialized. Each command reloads ownership/status, calculates its signed delta, rejects a negative proposed Balance, mutates the Transaction, updates persisted Balance/version, appends audit, and commits as one atomic operation.

Transactions for different Students do not share a financial invariant and are logically independent. The approved SQLite implementation may serialize them at its physical single-writer boundary without changing the aggregate rule.

The aggregate boundary does not require loading every Transaction into application memory. Current Balance is read from Student; reconciliation may aggregate active Transaction effects separately. History pagination never becomes the Balance source.

## 7. Domain Operations

### 7.1 Create Student

1. Normalize the supplied name.
2. Validate required length and content rules.
3. Normalize and validate optional notes, status, and required Operator assignment.
4. Confirm that the assignee is an existing active, non-deleted Operator.
5. Enforce case-insensitive name uniqueness.
6. Create the Student with generated identity and timestamps.

### 7.2 Edit and Transfer Student

1. Confirm that the Student exists.
2. Apply the same name, notes, status, and Operator validation used for creation.
3. Persist the management changes and update the modification timestamp.
4. If ownership changes, authorization follows the new `operator_id` immediately; Transaction history is unchanged.

### 7.3 Record Deposit

1. Validate a positive whole-Rupiah amount.
2. Serialize and authorize the active Student.
3. Insert Deposit, add its effect to Balance, increment financial version, and append CREATE audit.
4. Commit or roll back the complete unit.

### 7.4 Record Withdrawal

1. Validate a positive whole-Rupiah amount.
2. Serialize the financial write for the Student.
3. Read persisted Balance inside the serialized transaction.
4. Reject the operation if the amount exceeds that balance.
5. Otherwise, insert Withdrawal, update Balance/version, and append CREATE audit.
6. Commit or roll back the complete unit.

### 7.5 Record Correction

Validate positive amount, explicit direction, and reason; calculate signed effect; reject a negative proposed Balance; insert Correction, update Balance/version, and append CREATE audit atomically.

### 7.6 Edit Transaction

Require an active Transaction, expected revision, command identity, and reason. Calculate `newEffect - oldEffect`, reject a negative proposed Balance, update approved fields/revision, update Student Balance/version, and append before/after EDIT audit atomically.

### 7.7 Soft Delete and Restore

Delete removes an active Transaction's effect and sets deletion metadata. Restore reapplies a deleted Transaction's current effect and clears deletion metadata. Each requires revision, command identity, reason, non-negative result, Balance/version update, and immutable audit in one transaction.

### 7.8 Read Transaction History

Transaction history is ordered newest first. Older Transactions may be retrieved progressively using stable ordering, while Balance continues to use all persisted Transactions.

## 8. Excluded Domain Concepts

The MVP domain model intentionally excludes:

- Password credentials, public registration, password recovery, and provider-assigned roles.
- Currency selection or exchange rates.
- Hard Transaction deletion.
- Transaction transfer, categories, attachments, schedules, monthly allowance, and approval workflow.
- Student deletion.
- Offline state or synchronization concepts.

These exclusions preserve Google-only authentication, Amanah Cash authorization, minimal identity collection, and a bounded Transaction Engine while reserving reviewed extension points.

Auth.js with Google and the Database Session Strategy is implemented. The Transaction Foundation architecture adds actor attribution to future financial records/audit without changing authentication sessions or exposing financial data to Platform Admin.

## 9. Design Decisions

| Decision | Rationale |
|----------|-----------|
| Student is the only aggregate root | The non-negative balance invariant is scoped to one Student and does not require a broader aggregate. |
| Transaction is controlled mutable state | Edit, soft delete, and restore support operational correction while immutable audit preserves evidence. |
| Balance is persisted on Student | Atomic write coupling supports fast reads while active Transaction effects provide reconciliation. |
| RupiahAmount is an integer value | The approved currency is IDR and decimal amounts are invalid. |
| Currency is not stored per Transaction | The MVP supports only IDR, so a repeated currency field adds no operational value. |
| All financial writes are serialized per Student | Every lifecycle operation must preserve deterministic Balance, revision, and audit state under concurrency. |
| History retrieval is separate from Balance | Progressive loading improves presentation performance while Balance comes from persisted Student state. |
| Financial audit is immutable | Mutable operational records require durable actor, reason, and before/after evidence. |
| One Operator per Student | Current ownership is the financial-data authorization boundary. |
| Student lifecycle is explicit | Status classifies retained records without deleting them or independently changing authorization. |
| Ownership transfer updates one edge | Authorization follows current responsibility while Transaction rows and Balance remain unchanged and transfer audit is appended. |

## 10. Traceability

| Domain Concern | Source Rules |
|----------------|--------------|
| Student identity and normalized name | FR-3.1.1; BR-STU-001–003 |
| Student lifecycle, notes, and ownership maintenance | FR-3.1.1, FR-3.1.5; BR-STU-005–007; BR-AUTHZ-002–003 |
| Student retention | BR-STU-004 |
| Whole-Rupiah values | NFR-3.1; BR-MON-001–003 |
| Transaction direction | FR-3.2.1, FR-3.2.2; BR-TXN-001–002 |
| Transaction lifecycle | FR-3.2.1–FR-3.2.7; BR-TXN-001–009 |
| No partial events | NFR-3.3, NFR-5.2; BR-TXN-009 |
| Persisted reconcilable Balance | FR-3.3.1; NFR-3.2–3.4; BR-BAL-001–006 |
| Non-negative atomic mutation | FR-3.2.1–FR-3.2.7; NFR-3.3; BR-BAL-004–006 |
| Financial audit traceability | FR-3.3.2; NFR-6.1–6.2; BR-AUD-001–004 |
| Progressive history | FR-3.2.3; NFR-4.1; BR-UI-002–003 |
