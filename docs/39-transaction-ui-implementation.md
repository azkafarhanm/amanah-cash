# Transaction UI Implementation

**Status:** Implemented
**Date:** 2026-07-21
**Scope:** Operator-owned Student financial presentation and Transaction workflows

## Delivered experience

The Operator Student Detail page is now the financial trust surface. It displays the committed Student Balance, financial last-updated time, most recent activity, total Transaction count, and newest-first Transaction history. Platform Admin remains outside financial presentation under ADR-003.

Operators can create Deposit, Withdrawal, and directional Correction Transactions without manual API calls. Active Transactions expose edit and soft-delete controls; deleted Transactions expose restore. Every form calls the existing protected lifecycle APIs and therefore retains the Transaction Engine's ownership, status, revision, non-negative Balance, idempotency, atomic audit, and rollback rules.

## Read and filtering integration

`transactionReadService` provides a read-only, current-ownership-scoped query for the presentation layer. It reads persisted Balance independently of visible history and supports:

- stable newest-first `(occurredAt, id)` cursor pagination;
- type, active/deleted status, Jakarta date-range, and notes/reason/Operator search filters;
- current updater identity for the Operator column; and
- general Notes plus Correction reason without deriving Balance from history.

The UI never exposes Platform Admin financial access and never calculates an authoritative Balance.

## Forms and lifecycle states

Native modal dialogs provide browser focus trapping, Escape handling, focus return, semantic headings, and keyboard operation. Forms include whole-IDR numeric input, business occurrence time, bounded Notes, Correction direction/reason, and mandatory lifecycle reasons. Deposit Notes are required by the presentation contract.

Client validation handles required/positive whole-IDR input and provides a current-Balance hint for Withdrawal. Server validation remains authoritative and its safe messages are displayed inline. Submissions disable controls while in flight. Unknown network outcomes retain the same command and Transaction IDs so retry remains idempotent.

Inactive and archived Students render read-only financial history with mutation controls disabled. Empty, loading, error, success, filtered-empty, and pagination states use existing application primitives and semantic design tokens. Correction reasons remain visible independently from optional Notes, edit-to-Deposit enforces the Deposit Note contract, and asynchronous dialog errors receive predictable focus.

## Persistence addition

Migration `006_transaction_ui_notes.sql` adds optional bounded, normalized `transactions.notes`. Notes participate in create/edit payload identity and deterministic audit snapshots but never affect Balance. No financial effect, lifecycle, authorization, or audit decision changed.

## Verification

Tests cover Notes constraints/migration mirroring, read ownership, overview values, filters, cursor continuation, exact Rupiah formatting, explicit direction, dialogs, keyboard/focus semantics, lifecycle controls, responsive rules, and all existing Transaction Engine behavior.
