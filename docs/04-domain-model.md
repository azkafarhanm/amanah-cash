# Amanah Cash — Domain Model

**Version:** 1.3
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
  │
  └── 0..* Transaction
          ├── Deposit: money entrusted to the student
          └── Withdrawal: money returned by the student

Balance = sum(Deposits) - sum(Withdrawals)
```

There is no Balance entity. Balance is a derived financial value calculated from the complete persisted transaction history for one student.

## 3. Entities

### 3.1 Student

Student is the aggregate root and identifies the person whose entrusted funds are tracked.

| Attribute | Domain Type | Required | Meaning |
|-----------|-------------|----------|---------|
| `id` | StudentId (UUID) | Yes | Stable system-generated identity |
| `name` | StudentName | Yes | Normalized display and search name |
| `created_at` | Timestamp | Yes | Time the student record was created |

Responsibilities:

- Own its identity and normalized name.
- Provide the boundary for its transaction history.
- Guard financial operations that must be serialized for that student.
- Expose a balance derived from all of its persisted transactions.

Invariants:

- The normalized name is not empty and contains at most 100 characters.
- Leading and trailing whitespace is removed.
- Consecutive internal whitespace is represented by one space.
- The normalized name is unique under case-insensitive comparison.
- A Student referenced by a Transaction cannot be deleted.
- Student editing and deletion are not supported by the MVP.

### 3.2 Transaction

Transaction is an immutable financial event belonging to exactly one Student.

| Attribute | Domain Type | Required | Meaning |
|-----------|-------------|----------|---------|
| `id` | TransactionId (UUID) | Yes | Stable system-generated event identity |
| `student_id` | StudentId (UUID) | Yes | Identity of the owning Student |
| `type` | TransactionType | Yes | `deposit` or `withdrawal` |
| `amount` | RupiahAmount | Yes | Positive whole-Rupiah amount in IDR |
| `created_at` | Timestamp | Yes | Time the event was persisted |

Responsibilities:

- Record one deposit or withdrawal without later mutation.
- Preserve the minimum data required to reproduce a balance.
- Make the direction of money unambiguous through its type.
- Provide stable identity and ordering data for traceability and progressive history loading.

Invariants:

- The Transaction belongs to an existing Student.
- The amount is a positive whole-Rupiah value.
- `deposit` increases the Student balance.
- `withdrawal` decreases the Student balance.
- A withdrawal cannot produce a negative balance.
- After persistence, a Transaction cannot be edited or deleted through an application operation.
- A Transaction is persisted completely or not at all.

### 3.3 PlatformUser and Role

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

TransactionType has exactly two values:

| Value | Direction | Balance Effect |
|-------|-----------|----------------|
| `deposit` | Money entrusted to the student | Increase |
| `withdrawal` | Money returned by the student | Decrease |

### 4.5 Balance

Balance is a derived Rupiah value, not an entity and not persisted independently.

```text
Balance(student) = Σ deposit.amount - Σ withdrawal.amount
```

The calculation always uses the complete persisted history for the Student. A progressively loaded UI history is not a balance input.

### 4.6 Cross-Layer Terminology Contract

Each layer uses one authoritative vocabulary. Translations and transport names do not change Domain meaning.

| Concept | Domain terminology | Database terminology | API terminology | Production UI terminology | Public-facing terminology |
|---------|--------------------|----------------------|-----------------|---------------------------|---------------------------|
| Student | `Student` | table `students`; `student_id` reference | `student`; `studentId` | `Siswa` | `siswa` |
| Transaction | `Transaction` | table `transactions` | `transaction` | `Transaksi` | `transaksi` or `transaksi keuangan siswa` |
| Deposit | `Deposit` | `transactions.type = 'deposit'` | type value `deposit` | action `Setor`; noun `Setoran`; title `Setor dana` | exact type `Setoran`; broader narrative term `pemasukan` |
| Withdrawal | `Withdrawal` | `transactions.type = 'withdrawal'` | type value `withdrawal` | action `Tarik`; noun `Penarikan`; title `Tarik dana` | exact type `Penarikan`; broader narrative term `pengeluaran` |
| Balance | `Balance` | derived query result `balance`; never a stored column | `balance` | `Saldo` | `saldo` |
| Amount | `RupiahAmount` or `Amount` | column `amount` | `amount` | `Jumlah` | `jumlah Rupiah` |

Authority rules:

1. Domain rules, code-level Domain types, and technical traceability use the English Domain terminology in this document.
2. Database schema and queries use the exact table, column, and lowercase Transaction type names in the Database column above.
3. API request and response contracts use the API terminology above. Transaction direction values are exactly `deposit` and `withdrawal`; translated values are not transport enums.
4. Production application copy uses the UI terminology above and the final strings in `docs/19-screen-specifications.md`.
5. Public Landing Page copy uses the Public-facing terminology above and the final strings in `docs/24-landing-page-content.md`.
6. English Domain terms that appear in requirements, flows, wireframes, component anatomy, tests, logs, or developer tools are internal semantic and implementation terminology. They are not approved production UI copy.
7. `Setor`, `Setoran`, and public `pemasukan` map only to Domain `Deposit`. `Tarik`, `Penarikan`, and public `pengeluaran` map only to Domain `Withdrawal`. Implementers must not improvise synonyms such as credit/debit, send/receive, income/expense, or cash-in/cash-out.

Financial perspective is explicit:

- A Deposit is money entrusted to the Student. It leaves the operator's custody perspective and enters the tracked entrusted-funds Balance, so Balance increases.
- A Withdrawal is money returned by the Student. It returns to the operator's custody perspective and leaves the tracked entrusted-funds Balance, so Balance decreases.
- Public `pemasukan` and `pengeluaran` describe movement into and out of the tracked Student Balance. They do not describe the operator's accounting revenue, expense, or cash position.

This contract maps vocabulary only. It does not change Transaction direction, Balance calculation, product scope, or any Business Rule.

## 5. Relationships

### 5.1 Student to Transaction

- One Student has zero or more Transactions.
- One Transaction belongs to exactly one Student.
- A Transaction cannot exist without its Student.
- Removing a Student with Transactions is prohibited.

This relationship provides financial traceability without introducing an account ledger, currency, or Transaction actor entity.

### 5.2 Operator to Student

- One Operator owns zero or more Students.
- Every Student belongs to exactly one Operator.
- Ownership controls access to the Student, Transactions, Balance, history, and Operator-scoped reports.
- Transfer changes current responsibility without rewriting, duplicating, deleting, or reattributing Transactions.

## 6. Aggregate Boundary

Student remains the financial aggregate root. PlatformUser and Student ownership form a separate authorization boundary and do not alter the Student financial consistency boundary.

Commands that change financial history must enter through the Student boundary:

- Record deposit.
- Record withdrawal.

All financial writes for the same Student are serialized. A withdrawal checks the balance from the complete persisted history and appends the withdrawal inside the same atomic operation.

Transactions for different Students do not share a financial invariant and are logically independent. The approved SQLite implementation may serialize them at its physical single-writer boundary without changing the aggregate rule.

The aggregate boundary does not require loading every Transaction into application memory. Persistence may calculate the full-history balance and load transaction pages separately, provided the same invariants are enforced.

## 7. Domain Operations

### 7.1 Create Student

1. Normalize the supplied name.
2. Validate required length and content rules.
3. Enforce case-insensitive uniqueness.
4. Create the Student with a generated identity and timestamp.

### 7.2 Record Deposit

1. Validate a positive whole-Rupiah amount.
2. Serialize the financial write for the Student.
3. Append one immutable deposit Transaction.
4. Derive the updated balance from the complete history.

### 7.3 Record Withdrawal

1. Validate a positive whole-Rupiah amount.
2. Serialize the financial write for the Student.
3. Derive the current balance from the complete persisted history.
4. Reject the operation if the amount exceeds that balance.
5. Otherwise, append one immutable withdrawal in the same atomic operation.
6. Derive the updated balance from the complete history.

### 7.4 Read Transaction History

Transaction history is ordered newest first. Older Transactions may be retrieved progressively using stable ordering, while Balance continues to use all persisted Transactions.

## 8. Excluded Domain Concepts

The MVP domain model intentionally excludes:

- Stored Balance entity or balance field.
- Password credentials, public registration, password recovery, and provider-assigned roles.
- Transaction actor attribution.
- Currency selection or exchange rates.
- Transaction edit, deletion, category, tag, note, or description.
- Student deletion.
- Offline state or synchronization concepts.

These exclusions preserve Google-only authentication, Amanah Cash authorization, minimal identity collection, and append-only financial history.

Auth.js with Google and the Database Session Strategy is approved. The physical identity, provider-linkage, and session schema remains deferred to its implementation design.

## 9. Design Decisions

| Decision | Rationale |
|----------|-----------|
| Student is the only aggregate root | The non-negative balance invariant is scoped to one Student and does not require a broader aggregate. |
| Transaction is an immutable entity | Stable event identity and append-only history provide financial traceability. |
| Balance is derived, not stored | Transaction history remains the single source of truth. |
| RupiahAmount is an integer value | The approved currency is IDR and decimal amounts are invalid. |
| Currency is not stored per Transaction | The MVP supports only IDR, so a repeated currency field adds no operational value. |
| All financial writes are serialized per Student | Deposit and withdrawal ordering must be deterministic, and withdrawal validation must remain correct under concurrency. |
| History retrieval is separate from balance calculation | Progressive loading improves presentation performance without weakening financial correctness. |
| No Transaction actor entity exists | Authentication and authorization do not change immutable financial event traceability. |
| One Operator per Student | Current ownership is the financial-data authorization boundary. |

## 10. Traceability

| Domain Concern | Source Rules |
|----------------|--------------|
| Student identity and normalized name | FR-3.1.1; BR-STU-001–003 |
| Student retention | BR-STU-004 |
| Whole-Rupiah values | NFR-3.1; BR-MON-001–003 |
| Transaction direction | FR-3.2.1, FR-3.2.2; BR-TXN-001–002 |
| Transaction immutability | FR-3.2.3; NFR-6.1; BR-TXN-004 |
| No partial events | NFR-3.3, NFR-5.2; BR-TXN-005 |
| Derived balance | FR-3.3.1; NFR-3.2; BR-BAL-001–003 |
| Non-negative atomic withdrawal | FR-3.2.2; NFR-3.3; BR-BAL-004–005 |
| Financial event traceability | NFR-6.1; BR-AUD-001–002 |
| Progressive history | FR-3.2.3; NFR-4.1; BR-UI-002–003 |
