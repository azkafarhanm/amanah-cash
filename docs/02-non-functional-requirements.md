# Amanah Cash — Non-Functional Requirements

**Version:** 1.1
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-20

---

## 1. Purpose

This document defines the non-functional requirements for the Amanah Cash MVP. Functional behavior remains authoritative in `docs/01-functional-requirements.md`.

## 2. Requirement Priorities

Financial correctness and data integrity take priority over presentation speed. Performance optimizations must never calculate a balance from an incomplete transaction set or permit an invalid withdrawal.

## 3. Financial Correctness

### NFR-3.1: Exact Monetary Representation

- The only MVP currency is Indonesian Rupiah (`IDR`).
- Every monetary value is represented as a whole Rupiah amount.
- Monetary calculations use integer arithmetic and do not perform decimal or floating-point rounding.

### NFR-3.2: Balance Correctness

- A displayed balance must equal the sum of all persisted deposits minus the sum of all persisted withdrawals for that student.
- Progressive transaction-history loading must not affect balance correctness.
- After a transaction is reported as successfully recorded, subsequent balance presentation must include it.
- The system must never report a withdrawal as successful if the resulting balance would be negative.

### NFR-3.3: Concurrent Integrity

- Balance validation and withdrawal recording must behave atomically.
- Concurrent transaction requests must preserve a correct, non-negative balance.
- A failed transaction must not partially change the financial history.

## 4. Performance and Responsiveness

### NFR-4.1: Progressive History Loading

- Student Detail may load recent transactions before older transactions.
- The operator must be able to progressively load older entries until the complete history is available.
- Balance computation must use the complete persisted history, not only entries currently loaded in the UI.

### NFR-4.2: Interactive Search

- Search results update after each input change without an explicit submit action.
- Search and sorting must use the same normalized student-name representation used for duplicate detection.

### NFR-4.3: Workflow Usability Targets

The following are usability targets measured without network delay:

| Workflow | Target |
|----------|--------|
| Record deposit | Under 5 seconds |
| Record withdrawal | Under 5 seconds |
| Search and open student detail | Under 3 seconds |
| Create student | Under 5 seconds |

These targets measure interaction efficiency. They are not network or backend latency guarantees.

## 5. Reliability and Error Handling

### NFR-5.1: Explicit Outcomes

- The system must not silently discard a transaction request.
- Every transaction attempt must result in an explicit success or failure outcome.
- Retrying after a failure must not create an unintended duplicate transaction.

### NFR-5.2: Failure Isolation

- A database, network, or unexpected failure must not create a partial transaction.
- Error messages must distinguish validation failures from system failures.
- A retry option must be provided when retrying is safe.

## 6. Auditability

### NFR-6.1: Financial Event Traceability

- Every financial event has a unique transaction identifier, student reference, type, whole-Rupiah amount, and creation timestamp.
- Transactions are append-only and cannot be edited or deleted through application operations.
- A balance must always be reproducible from its transaction records.
- Authentication does not add actor attribution to immutable Transaction events.

## 7. PWA and Device Support

### NFR-7.1: PWA Delivery

- The application provides the metadata and service-worker registration required for PWA installability.
- The installed application launches in standalone display mode on supported platforms.
- The application provides installation guidance when a supported browser does not expose an automatic install prompt.

### NFR-7.2: Responsive Interaction

- The primary layout supports viewport widths from 320px through 480px.
- The application remains usable on tablet and desktop viewports.
- Touch targets are at least 44px by 44px.
- Text remains readable without browser zoom on mobile.

## 8. Offline Scope

- Offline capability and offline synchronization are not part of the MVP.
- The application must report network failure explicitly rather than implying that a transaction was saved offline.
- No MVP requirement depends on offline storage or synchronization behavior.

## 9. Security, Authorization, and Privacy

### NFR-9.1: Server-Enforced Authorization

- Every protected request validates the database session, active user, role, and applicable Student ownership on the server.
- Client visibility and filtering are never authorization controls.
- Missing or stale authorization context fails closed.

### NFR-9.2: Financial Data Privacy

- An Operator receives financial data only for assigned Students.
- Platform Admin has no routine access to Transaction history, Balances, financial reports, or Student financial data.
- Authentication sessions, cookies, logs, analytics, and administrative screens do not contain unnecessary financial data.

### NFR-9.3: Authentication Security

- Auth.js uses Google only and database-backed sessions.
- Provider and session secrets are server-only.
- Production cookies are HTTP-only and secure, with an explicitly reviewed same-site policy.
- Authentication and logout retain Auth.js CSRF and provider-protocol protections.
- Errors do not disclose tokens, secrets, database internals, or unnecessary account-existence information.

## 10. Open Measurement Baseline

Concrete network-latency targets, supported-browser versions, and production data-volume thresholds require an agreed deployment and test baseline. They must be defined before this document can move from Draft to Approved.

## 11. Traceability

| NFR | Related Functional Requirements |
|-----|---------------------------------|
| NFR-3.1 | FR-3.2.1, FR-3.2.2, FR-3.3.1 |
| NFR-3.2 | FR-3.1.2, FR-3.1.4, FR-3.2.1, FR-3.2.2, FR-3.3.1 |
| NFR-3.3 | FR-3.2.2, FR-3.3.1 |
| NFR-4.1 | FR-3.1.4, FR-3.2.3, FR-3.3.1 |
| NFR-4.2 | FR-3.1.1, FR-3.1.2, FR-3.1.3 |
| NFR-4.3 | FR-3.1.1, FR-3.1.3, FR-3.2.1, FR-3.2.2 |
| NFR-5.1 | FR-3.2.1, FR-3.2.2 |
| NFR-5.2 | FR-3.2.1, FR-3.2.2 |
| NFR-6.1 | FR-3.1.4, FR-3.2.1, FR-3.2.2, FR-3.2.3, FR-3.3.1 |
| NFR-7.1 | FR-3.4.1 |
| NFR-7.2 | FR-3.4.3 |
| NFR-9.1–9.3 | FR-7.1, FR-7.2 |
