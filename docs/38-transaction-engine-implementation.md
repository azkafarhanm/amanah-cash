# Transaction Engine Implementation

**Status:** Implemented
**Date:** 2026-07-20
**Architecture authority:** ADR-004 and the Transaction Foundation TDS

## Scope delivered

The Transaction Engine implements ownership-scoped Deposit, Withdrawal, directional Correction, edit, soft delete, and restore. It persists non-negative whole-IDR Student Balance and a monotonic financial version. Every successful lifecycle command writes the Transaction mutation, guarded Student Balance/version update, and immutable FinancialAuditEvent inside one SQLite `BEGIN IMMEDIATE` transaction.

No Dashboard, chart, report, export, analytics, attachment, allowance, approval, category, notification, financial UI redesign, or financial read model is included.

## Persistence

Migration `005_transaction_engine.sql` and its Prisma mirror add:

- `students.balance` and `students.financial_version` with non-negative checks;
- the complete Transaction lifecycle schema and actor relationships;
- conditional Correction and deletion-pair constraints;
- business-time, active-history, type/date, reconciliation, and audit indexes;
- immutable `financial_audit_events` with unique command IDs and deterministic snapshots; and
- triggers prohibiting Transaction hard deletion, immutable identity changes, and audit update/delete.

The migration fails closed when legacy Transaction rows exist. Those rows lack trustworthy actor, business-time, command, revision, and audit provenance, so the migration does not invent a backfill identity. An operator must resolve such data under a separately reviewed import/recovery procedure before applying the migration.

## Write protocol

Protected nested Operator APIs reuse the centralized owner authorization policy. The engine then rechecks the database actor, active Operator role, current Student ownership, and `ACTIVE` Student status inside the serialized write transaction.

The command flow is:

1. `BEGIN IMMEDIATE` and reload actor/Student state.
2. Resolve unique command ID and reject payload mismatch.
3. Validate type, exact signed-64-bit amount, Correction shape, lifecycle reason, occurrence time, and expected revision.
4. Calculate the proposed Balance and reject overflow or a negative result.
5. Insert/update the Transaction.
6. Update Balance and increment financial version with a version guard.
7. Append the immutable audit event.
8. Commit and return success; any failure rolls back every write.

Committed command replay returns the recorded Transaction snapshot and Balance outcome without applying the delta again. SQLite busy failures are retryable with the same command ID. Platform Admin has no financial bypass, and cross-Operator access remains masked as not found.

## HTTP boundaries

- `POST /api/operator/students/:studentId/transactions`
- `PATCH /api/operator/students/:studentId/transactions/:transactionId`
- `DELETE /api/operator/students/:studentId/transactions/:transactionId`
- `POST /api/operator/students/:studentId/transactions/:transactionId/restore`

Amounts are accepted as safe integers or decimal digit strings and are returned as strings so JSON never loses whole-IDR precision. Create requires stable client Transaction and command IDs. Edit/delete/restore require a new command ID and expected revision.

## Verification coverage

Automated coverage includes all three effects, Balance/version changes, Correction validation, insufficient Balance, edit deltas, soft delete, restore, stale revisions, command replay and mismatch, active ownership/role/status enforcement, audit evidence, database constraints, migration safety, and rollback after forced audit failure.
