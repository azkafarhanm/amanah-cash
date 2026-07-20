# Amanah Cash — Business Rules

**Version:** 1.2
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-20

---

## 1. Purpose

This document defines the authoritative business rules for the Amanah Cash MVP. Each rule derives from `docs/01-functional-requirements.md` and the immutable principles in `docs/00-product-principles.md`.

## 2. Student Rules

### BR-STU-001: Student Name Is Required

A student must have a non-empty name no longer than 100 characters after normalization.

### BR-STU-002: Student Name Normalization

Before validation and persistence, a student name is normalized by:

1. Removing leading and trailing whitespace.
2. Replacing consecutive internal whitespace with a single space.

### BR-STU-003: Student Name Is Unique

Two students cannot have the same normalized name under case-insensitive comparison.

### BR-STU-004: Student Records Are Not Deleted

Student deletion is not available in the MVP. A student referenced by transaction history must remain identifiable.

### BR-STU-005: Student Lifecycle Is Explicit

Every Student has one of `ACTIVE`, `INACTIVE`, or `ARCHIVED` status. The current module treats these as management labels and list filters; status alone does not change visibility or authorization. Platform Admin may change among the approved states. No status deletes the Student or changes historical Transactions.

### BR-STU-006: Student Notes Are Optional and Bounded

Student notes are optional, trimmed before persistence, and limited to 500 characters. Empty notes are stored as absent rather than as meaningful whitespace.

### BR-STU-007: Only Platform Admin Maintains Student Records

Platform Admin creates and edits Student identity, notes, lifecycle status, and Operator assignment. Operators have read access to currently assigned Students and do not maintain Student records.

## 3. Monetary Rules

### BR-MON-001: MVP Currency

The only currency in the MVP is Indonesian Rupiah (`IDR`).

### BR-MON-002: Whole-Rupiah Amounts

Every transaction amount must be a positive whole-Rupiah value. Zero, negative, decimal, and non-numeric amounts are invalid.

### BR-MON-003: Exact Arithmetic

All monetary calculations use exact whole-Rupiah arithmetic. No decimal or floating-point rounding is applied.

## 4. Transaction Rules

### BR-TXN-001: Deposit Direction

A deposit records money entrusted to a student. It increases the student's balance.

### BR-TXN-002: Withdrawal Direction

A withdrawal records money returned by a student. It decreases the student's balance.

### BR-TXN-003: Required Transaction Data

Every Transaction has a unique identifier, immutable Student reference, approved type, positive whole-Rupiah amount, business occurrence time, creation actor/time, current revision, and lifecycle metadata.

### BR-TXN-004: Correction Is Explicit

A Correction is an explicit `INCREASE` or `DECREASE`, requires a reason, and changes Balance in that direction. It must not be represented as a Deposit or Withdrawal.

### BR-TXN-005: Transaction Editing Preserves Evidence

An active Transaction may be edited only within its Student aggregate. Editing cannot change Transaction identity, Student, creation actor, or creation time. Every edit requires a reason, increments revision, applies the difference between new and old effects, and appends immutable before/after audit evidence atomically.

### BR-TXN-006: Transaction Delete Is Soft

Delete sets lifecycle metadata and removes the Transaction's effect from current Balance. It never permanently removes the Transaction or its audit history. A deleted Transaction cannot be edited until restored.

### BR-TXN-007: Transaction Restore Reapplies Effect

Restore clears deletion metadata and reapplies the Transaction's current effect. Delete and restore require a reason, expected revision, unique command identity, and immutable audit event.

### BR-TXN-008: Student Assignment Is Immutable on Transaction

Transaction edit cannot change `studentId`. A future Transaction Transfer is a separate cross-aggregate operation and is not implemented in MVP scope.

### BR-TXN-009: No Partial Financial Mutation

Transaction create, edit, delete, or restore; Student Balance update; financial-version update; and audit append either commit together or roll back together.

## 5. Balance Rules

### BR-BAL-001: Balance Formula

A Student's persisted Balance equals the sum of effects of every non-deleted Transaction: Deposit `+amount`, Withdrawal `-amount`, and Correction `±amount` according to direction.

### BR-BAL-002: Balance Is Persisted but Not Independently Editable

`Student.balance` is persisted for operational reads. No application operation may set it directly; only the Transaction Engine may change it as part of an atomic financial mutation.

### BR-BAL-003: Active Transactions Reconcile Balance

Persisted Balance must reconcile to all non-deleted Transaction effects. Progressive history loading does not change Balance. A mismatch is an integrity incident and is not repaired silently.

### BR-BAL-004: Balance Cannot Be Negative

Any financial mutation is invalid if its proposed Balance would be negative.

### BR-BAL-005: Every Balance Change Is Atomic

Student serialization, authorization/status recheck, Transaction mutation, Balance/version update, and audit append behave as one database transaction. Concurrent requests must not lose updates or allow a negative Balance.

### BR-BAL-006: Retry Is Idempotent

Every financial mutation has a unique command identity. Repeating a committed command returns its recorded outcome without applying its Balance effect again. Reusing an identity with a different payload is an integrity conflict.

## 6. Auditability Rules

### BR-AUD-001: Financial Event Traceability

Every Balance must be reproducible from non-deleted Transaction effects and explainable through immutable financial audit events.

### BR-AUD-002: Required Financial Audit Events

`CREATE`, `EDIT`, `DELETE`, `RESTORE`, and `OWNERSHIP_TRANSFER` are audited. Financial audit records include the server-derived actor, Student, optional Transaction, revision, command identity, required reason, before/after state, Balance transition, commit time, and schema version as appropriate.

### BR-AUD-003: Audit Is Immutable and Atomic

Financial audit records cannot be edited or deleted through application behavior. Audit append commits atomically with the mutation it describes; audit failure rolls back the mutation.

### BR-AUD-004: Ownership Audit Preserves Privacy

Student ownership transfer records old/new Operator, actor, reason, and time without disclosing Balance or Transaction details to Platform Admin. Financial audit payloads remain scoped by current Student ownership.

## 7. Identity, Ownership, and Privacy Rules

### BR-AUTH-001: Google Is the Only Authentication Provider

Auth.js authenticates through Google only. Password login and public account self-service do not exist.

### BR-AUTH-002: Provisioning Precedes Access

Authentication grants access only when the normalized Google email matches an active user provisioned by Platform Admin.

### BR-AUTHZ-001: Amanah Cash Owns Authorization

Google verifies identity. Amanah Cash determines active status, role, Student ownership, and permitted operations.

### BR-AUTHZ-002: One Student Has One Operator

Every Student is assigned to exactly one existing, active, non-deleted Operator. Transfer replaces the responsible Operator without changing Transaction history.

### BR-AUTHZ-003: Operator Access Is Ownership-Scoped

An Operator may read or change financial data only for currently assigned Students.

### BR-AUTHZ-004: Only Active Students Accept Financial Mutations

Financial reads remain ownership-scoped for every Student status. Deposit, Withdrawal, Correction, edit, delete, and restore are allowed only for an `ACTIVE` Student. `INACTIVE` and `ARCHIVED` Students are read-only until Platform Admin changes status.

### BR-PRIV-001: Administration Does Not Imply Financial Access

Platform Admin may manage Operators, assignments, transfers, configuration, and maintenance but may not routinely access Operator financial data.

### BR-PRIV-002: Authorization Fails Closed

If an active user, valid role, or required Student ownership cannot be established, access is denied.

## 8. Presentation Rules

### BR-UI-001: Transaction Direction Is Explicit

Wherever a financial Transaction is entered or displayed, the UI must communicate its type and Balance effect:

- Deposit: money entrusted to the student; balance increases.
- Withdrawal: money returned by the student; balance decreases.
- Correction: explicit increase or decrease with a visible reason.

### BR-UI-002: Newest Transactions Appear First

Transaction history is presented newest first. Older entries may be loaded progressively until the complete history is available.

### BR-UI-003: Progressive Loading Does Not Affect Balance

The UI must not imply that the balance is based only on currently displayed history.

## 9. PWA and Connectivity Rules

### BR-PWA-001: Offline Transactions Are Not Supported

Offline capability and offline synchronization are outside the MVP. The application must not present a transaction as saved when it has not been persisted because of a network failure.

### BR-PWA-002: Installation Depends on Platform Support

The application must satisfy supported-browser installability requirements. An automatic browser install prompt is not guaranteed; installation guidance may be provided instead.

## 10. Requirement Traceability

| Business Rule | Functional Requirements |
|---------------|-------------------------|
| BR-STU-001–003 | FR-3.1.1, FR-3.1.3, FR-3.1.5 |
| BR-STU-004 | Scope Boundary: Student deletion |
| BR-STU-005–007 | FR-3.1.1, FR-3.1.2, FR-3.1.5 |
| BR-MON-001–003 | FR-3.2.1–FR-3.2.7, FR-3.3.1 |
| BR-TXN-001 | FR-3.2.1 |
| BR-TXN-002 | FR-3.2.2 |
| BR-TXN-003–009 | FR-3.2.1–FR-3.2.7 |
| BR-BAL-001–003 | FR-3.1.2, FR-3.1.4, FR-3.2.1–FR-3.2.7, FR-3.3.1 |
| BR-BAL-004–006 | FR-3.2.1–FR-3.2.7, FR-3.3.1 |
| BR-AUD-001–004 | FR-3.1.5, FR-3.2.1–FR-3.2.7, FR-3.3.2 |
| BR-AUTH-001–002 | FR-7.1 |
| BR-AUTHZ-001–004, BR-PRIV-001–002 | FR-7.2 |
| BR-UI-001 | FR-3.1.4, FR-3.2.1–FR-3.2.7 |
| BR-UI-002–003 | FR-3.1.4, FR-3.2.3, FR-3.3.1 |
| BR-PWA-001–002 | FR-3.4.1, Error Handling, Scope Boundary |
