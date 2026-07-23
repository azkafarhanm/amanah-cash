# Reporting Foundation Implementation

**Status:** Implemented  
**Date:** 2026-07-22  
**Scope:** Read-only administrative and ownership-scoped financial reporting

## Architecture

Reporting is a server-rendered presentation layer under the existing protected Admin and Operator route groups.

```text
central role / ownership authorization
  → report filter normalization
  → export-neutral report read projection
  → reusable summaries, filters, tables, pagination, and states
  → implemented downstream Export Foundation
```

`src/reports/read-service.ts` is the only reporting persistence boundary. Report components do not access Prisma, recalculate Student Balance, authorize identities, or invoke financial mutations. No schema, migration, API, Dashboard, Transaction Engine, ownership policy, or authorization behavior changed.

## Read Model

### Operator financial report

Every Transaction and financial-audit query includes the server-derived current `operatorId` through current `Student.operatorId`. The operational dataset:

- defaults to the current Asia/Jakarta month;
- includes only non-deleted Transactions because soft-deleted effects are absent from operational Balance;
- filters and paginates in the database before rendering;
- selects persisted Transaction, Student, latest actor, revision, and occurrence metadata;
- batches exact-revision financial audit evidence for the visible page; and
- uses persisted `FinancialAuditEvent.balanceAfter` when available instead of reconstructing historical Balance.

Current Student ownership governs the complete historical record. A transfer immediately removes the report from the previous Operator and makes it visible to the new Operator without rewriting Transactions.

### Admin administrative report

Platform Admin can select one privacy-safe dataset at a time:

- Operator lifecycle audit;
- initial Student assignments; or
- ownership changes with Student, old/new Operator, reason, and occurrence time.

Admin reports never select Transaction rows, Student Balance, Transaction revision, financial snapshots, Balance deltas, or financial audit payloads. Ownership-transfer reads intentionally select only the ADR-approved minimized fields.

## Filter System

`src/reports/filters.ts` provides one deterministic normalization boundary for:

- Student;
- Transaction type;
- Asia/Jakarta Today, This Week (Monday start), This Month, custom range, or all time;
- Student status;
- bounded search text;
- controlled sort field and direction; and
- positive page number.

Custom dates use strict `YYYY-MM-DD` parsing. Reversed valid ranges are normalized. Invalid values fail closed to approved defaults rather than entering Prisma dynamically. All active filters compose into one ownership-scoped database predicate.

## Summary Generation

Summary queries use grouped persisted active Transactions. Deposit and Withdrawal totals use database sums. Net movement applies the existing centralized `transactions/domain.effect` function to the small grouped result; reporting does not own a second financial-effect implementation. Student Balance is never reconstructed.

The summary includes total Deposits, total Withdrawals, signed net movement, Transaction count, active owned Students in scope, and the explicit business period. Corrections retain their approved increase/decrease semantics.

Zero values retain the same calculated values and Rupiah formatting, but now include short supporting explanations such as no Setoran, Penarikan, Transaction, or net movement in the selected period. This is presentation context only; no summary calculation is duplicated or changed.

## Tables and Detail

Reusable report components provide:

- semantic tables and headings;
- controlled server-side sorting;
- 20-row database pagination;
- responsive mobile record cards without horizontal scrolling;
- contextual first-use and filtered empty states;
- layout-stable loading skeletons;
- retryable error presentation;
- focus-visible keyboard controls; and
- Student report detail with Transaction timeline, amount/direction, Notes, Correction reason, revision/actor metadata, exact persisted Balance-after evidence when available, and an authorized audit reference.

The final UX review adds distinct no-assigned-Students, first-use, search-without-results, and filtered-without-results states with meaningful report/search/filter/Student icons and contextual actions. Clearing a failed search preserves the other active filters; full Reset remains available for an empty filtered result. Operator search mentions only fields available in the Operator dataset; Admin search remains administrative. Custom-date controls are visually and semantically grouped, explain when they become available, and are enabled only for a custom period. Admin Operator-action filtering is enabled only for the Operator Activity dataset, Reset is disabled at the default state, and Apply/Reset controls expose an in-flight disabled state while navigation is pending.

Tables include screen-reader captions, column scopes, `aria-sort` on sortable headings, semantic time values, consistent status/category badges, live result-count feedback, tabular currency values, alternating desktop rows, pointer-hover and keyboard-focus row feedback, and labeled mobile record cards. Loading presentation announces progress and reserves space for filters, summaries, and tables. Because Reporting is read-only, successful filtering is communicated through the live result count rather than a mutation-style success notice.

The report detail is read-only. Existing Transaction mutation dialogs remain only on the owned Student workflow. The UX review did not change report queries, financial calculations, export contracts, authorization, ownership rules, Dashboard code, Transaction Engine code, schema, or migrations.

## Ownership and Privacy Rules

- Protected route layouts remain the role gate.
- Operator report pages resolve the current Operator through centralized authorization.
- Student report detail additionally uses the centralized masked ownership check.
- Direct Student IDs and search parameters never authorize access.
- Platform Admin has no financial report or audit-payload bypass.
- No report query or component performs a write.

## Performance

- Pagination is applied in Prisma before rows are returned.
- Summary aggregation is performed in the database over filtered rows.
- Related Student and actor data is selected with each page query.
- Exact-revision audit evidence is loaded in one bounded batch for visible Transaction IDs.
- Independent counts, grouping, options, and page reads execute concurrently.
- No per-row query loop or complete Transaction dataset load exists.

Student filter options are a lightweight ownership-scoped ID/name/status projection. A future asynchronous selector can replace its presentation without changing the report query or result contract if production volume requires it.

## Export Integration

`src/reports/export-contract.ts` defines `ReportExportDocument` and `ReportExportAdapter`. The implemented Export Foundation consumes this unchanged contract and the Reporting Read Service. Export adapters receive an already authorized, display-ready report document and return bytes plus adapter media metadata. They must not query Prisma, reinterpret Correction direction, recalculate Balance, or broaden ownership.

CSV is implemented and exposed on Admin, Operator, and Student-detail Reporting pages. Excel and PDF remain registered placeholders and are not shown. See `docs/44-export-foundation.md` for the coordinator, document, registry, adapter, privacy, and delivery contracts.

## Verification

Regression coverage uses a migrated SQLite database with three Operators—including one without assigned Students—an asymmetric multi-owner ledger, more than one report page, daily/weekly/monthly/custom dates, directional Correction, a soft-deleted Transaction, persisted audit Balance evidence, administrative audits, assignments, and ownership changes. Tests prove ownership isolation, empty ownership scope, filter composition, Jakarta boundaries, pagination, summary accuracy, Admin privacy, empty behavior, read-only source boundaries, responsive tables, accessibility semantics, and export-contract separation.
