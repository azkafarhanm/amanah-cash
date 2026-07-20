# Amanah Cash — Business Rules

**Version:** 1.0
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-17

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

Every transaction has a unique identifier, student reference, type, positive whole-Rupiah amount, and creation timestamp.

### BR-TXN-004: Transactions Are Append-Only

After a transaction has been recorded successfully, it cannot be edited or deleted through any application operation.

### BR-TXN-005: No Partial Transaction

A transaction is either recorded completely or not recorded at all. A failed attempt must not leave a partial financial event.

## 5. Balance Rules

### BR-BAL-001: Balance Formula

A student's balance equals the sum of every deposit for that student minus the sum of every withdrawal for that student.

### BR-BAL-002: Transaction History Is Authoritative

Balance is derived from persisted transaction history and is never manually entered or maintained as an independent financial value.

### BR-BAL-003: Complete History Determines Balance

The balance calculation includes every persisted transaction for the student. Progressive loading of history in the UI does not change or limit the calculation.

### BR-BAL-004: Balance Cannot Be Negative

A withdrawal is invalid if recording it would make the student's balance negative.

### BR-BAL-005: Withdrawal Is Atomic

The check required by BR-BAL-004 and the recording of its withdrawal must behave as one atomic operation. Concurrent requests must not allow a negative balance.

## 6. Auditability Rules

### BR-AUD-001: Financial Event Traceability

Every balance must be reproducible from immutable transaction records. Each financial event is traceable through its transaction identifier, student reference, type, amount, and timestamp.

### BR-AUD-002: Audit Boundary

Authentication identifies a user and authorization scopes access, but immutable Transaction traceability remains event-based. This decision does not add actor attribution to Transaction records.

## 7. Identity, Ownership, and Privacy Rules

### BR-AUTH-001: Google Is the Only Authentication Provider

Auth.js authenticates through Google only. Password login and public account self-service do not exist.

### BR-AUTH-002: Provisioning Precedes Access

Authentication grants access only when the normalized Google email matches an active user provisioned by Platform Admin.

### BR-AUTHZ-001: Amanah Cash Owns Authorization

Google verifies identity. Amanah Cash determines active status, role, Student ownership, and permitted operations.

### BR-AUTHZ-002: One Student Has One Operator

Every Student is assigned to exactly one Operator. Transfer replaces the responsible Operator without changing Transaction history.

### BR-AUTHZ-003: Operator Access Is Ownership-Scoped

An Operator may read or change financial data only for currently assigned Students.

### BR-PRIV-001: Administration Does Not Imply Financial Access

Platform Admin may manage Operators, assignments, transfers, configuration, and maintenance but may not routinely access Operator financial data.

### BR-PRIV-002: Authorization Fails Closed

If an active user, valid role, or required Student ownership cannot be established, access is denied.

## 8. Presentation Rules

### BR-UI-001: Transaction Direction Is Explicit

Wherever a deposit or withdrawal is entered or displayed, the UI must communicate its direction:

- Deposit: money entrusted to the student; balance increases.
- Withdrawal: money returned by the student; balance decreases.

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
| BR-STU-001–003 | FR-3.1.1, FR-3.1.3 |
| BR-STU-004 | Scope Boundary: Student deletion |
| BR-MON-001–003 | FR-3.2.1, FR-3.2.2, FR-3.3.1 |
| BR-TXN-001 | FR-3.2.1 |
| BR-TXN-002 | FR-3.2.2 |
| BR-TXN-003–005 | FR-3.2.1, FR-3.2.2, FR-3.2.3 |
| BR-BAL-001–003 | FR-3.1.2, FR-3.1.4, FR-3.3.1 |
| BR-BAL-004–005 | FR-3.2.2 |
| BR-AUD-001–002 | FR-3.1.4, FR-3.2.1, FR-3.2.2, FR-3.2.3 |
| BR-AUTH-001–002 | FR-7.1 |
| BR-AUTHZ-001–003, BR-PRIV-001–002 | FR-7.2 |
| BR-UI-001 | FR-3.1.4, FR-3.2.1, FR-3.2.2, FR-3.2.3 |
| BR-UI-002–003 | FR-3.1.4, FR-3.2.3, FR-3.3.1 |
| BR-PWA-001–002 | FR-3.4.1, Error Handling, Scope Boundary |
