# Export Foundation Implementation

**Status:** Implemented  
**Date:** 2026-07-22  
**Last updated:** 2026-07-23  
**Scope:** Reusable report export coordination with CSV, Excel, and PDF delivery

## Architecture

Export is a downstream consumer of the completed Reporting Foundation.

```text
existing centralized Admin / Operator authorization
  → Export Coordinator request resolution
  → existing Reporting Read Service with the authorized scope and report query
  → presentation-neutral Export Document
  → Export Registry
  → CSV, Excel, or PDF adapter
  → private no-store download response
```

`src/exports/` contains no Prisma dependency, Transaction Engine dependency, financial effect calculation, authorization policy, or report-filter normalization. The authorized HTTP routes pass the server-derived Operator ID or established Admin role into the coordinator. The coordinator requests every matching report page through `src/reports/read-service.ts`; it never queries persistence directly.

## Export Coordinator

`src/exports/coordinator.ts` is the application boundary for exports. It:

- requires a known, implemented format;
- extracts only the existing report query fields from the request;
- ignores a caller-supplied report page and starts at page one;
- forwards the remaining raw filter values to the Reporting Read Service for its existing normalization;
- preserves the authorized Operator ID on every operational page read;
- enforces centralized row and optional byte guard rails after the first authorized Reporting page and before collecting later pages;
- gathers all pages in the existing report order;
- creates one display-ready report document; and
- forwards that document to the selected adapter.

Pagination is intentionally sequential so export does not create an unbounded burst of report queries. Each page remains ownership-scoped and database-paginated by Reporting. The first page supplies Reporting's authoritative matching `total`; requests above the configured row limit are rejected before page two. An optional byte limit uses the first display-ready page for early estimation and also checks the final rendered byte size.

The current path still accumulates every permitted result and the rendered response in memory; it is not streaming. The default `EXPORT_MAX_ROWS=10000` safety cap means a 30,000- or 100,000-row result is rejected after the first 20-row Reporting page rather than issuing 1,500 or 5,000 reads. This cap is a guard rail, not a benchmarked service-level guarantee. The capacity decision, consistency limitation, and remaining hardening gates are recorded in `docs/45-export-production-readiness-review.md`.

## Guard Rails and Configuration

`src/exports/config.ts` owns Export configuration:

| Environment variable | Default | Behavior |
|---|---:|---|
| `EXPORT_MAX_ROWS` | `10000` | Mandatory positive integer. Rejects when Reporting's matching `total` is higher. |
| `EXPORT_MAX_BYTES` | unset | Optional positive integer. Applies an early estimate and an exact post-render byte check. |

Invalid configured values fail environment validation instead of silently weakening the limits. The application does not add an execution deadline because the current synchronous pipeline has no safe cancellation primitive. Concurrency, timeout, streaming, background processing, and rate limiting remain Production Hardening work.

Oversized exports return HTTP `413` with code `EXPORT_LIMIT_EXCEEDED` and the user-safe instruction to narrow the period or filters. The response contains no configured thresholds, stack trace, query details, or internal identifiers.

## Export Document Model

The existing `ReportExportDocument` and `ReportExportAdapter` contract remains compatible and unchanged. `src/exports/documents.ts` produces presentation-neutral documents containing:

- title, generated time, and business-period label;
- ordered display-ready summary label/value pairs;
- ordered column keys and labels; and
- display-ready string rows.

Adapters do not receive Prisma records, ownership identifiers, raw financial audit payloads, or instructions for interpreting Deposit, Withdrawal, or Correction effects. Shared presentation formatters provide the exact Rupiah, Asia/Jakarta date/time, sign, Transaction label, Correction direction, and administrative category text used by Reporting UI and export documents.

Operator documents expose only fields already presented by Reporting: time, Student and status, Transaction type/direction, signed Amount, persisted exact-revision Balance-after evidence when available, Notes, reason, revision/update attribution, and the visible shortened audit reference. Internal Transaction, Student, command, and correlation IDs are omitted.

Admin documents contain only time, administrative category, subject, description, period, and activity count. They contain no Transaction, Balance, Amount, revision, financial snapshot, or financial audit payload.

## Export Registry

`src/exports/registry.ts` owns format discovery and adapter resolution.

| Format | Registry state | UI state |
|---|---|---|
| CSV | Implemented | Exposed |
| Excel (`xlsx`) | Implemented | Exposed |
| PDF | Implemented | Exposed |

Unknown formats fail validation. The Reporting UI derives its links from implemented registry entries, so CSV, Excel, and PDF appear without page-specific format logic.

## CSV Adapter

The CSV adapter emits:

- UTF-8 with a byte-order mark for spreadsheet interoperability;
- comma-separated records with CRLF line endings;
- quoting for every cell and doubled embedded quotes;
- preserved commas, quotes, Unicode, and line breaks;
- spreadsheet-formula injection hardening for untrusted cells;
- report metadata and summaries followed by the report table; and
- the same display strings used by Reporting for currency and dates.

CSV rendering performs serialization only. It does not interpret business rules or calculate financial values.

## Excel Adapter

`src/exports/excel-adapter.ts` consumes the same display-ready Export Document and creates one print-ready `Laporan` worksheet. Title, aligned metadata, and a compact `Ringkasan` block appear above the generated transaction table; headers and ordered rows come only from the document. The adapter adds neutral table styling, semantic bounded column widths, report/table freeze panes, transaction-only filtering, and A4 page setup without querying Reporting or reinterpreting financial effects. See `docs/46-excel-export-foundation.md`.

## PDF Adapter

`src/exports/pdf-adapter.ts` consumes only the same display-ready Export Document and creates a minimal landscape PDF. The title, generated time, period, summaries, table headers, and ordered rows are generated from the document. Proportional columns, wrapping, row continuation, repeated table headers, and page numbering are presentation concerns only; the adapter does not query Reporting or reinterpret financial effects. See `docs/47-pdf-export-foundation.md`.

## HTTP and UI Integration

Downloads are available through:

- `GET /api/operator/reports/export?format=csv...`
- `GET /api/admin/reports/export?format=csv...`

Both endpoints also accept `format=xlsx` and `format=pdf` through the same request path.

The Operator route reuses the centralized Operator authorization adapter and forwards `authorization.id`. The Admin route reuses the centralized Admin authorization adapter. Responses use attachment disposition, `nosniff`, and private `no-store` caching.

Successful filenames contain the report family, normalized period, Jakarta generation timestamp to the second, and Admin report kind where applicable. For example: `laporan-keuangan-2026-07-20260722-143015.csv` and `laporan-administratif-aktivitas-operator-2026-07-20260722-143015.csv`. They never contain Student names, Operator names, email addresses, or identifiers.

Operator Reports, Operator Student report detail, and Admin Reports expose **Unduh CSV**, **Unduh Excel**, and **Unduh PDF** actions. Each action carries the current report filters; export always includes the complete permitted matching result rather than only the visible page.

## Verification

Automated coverage proves registry availability, configuration validation, row and byte limit enforcement, first-page oversized rejection, controlled HTTP errors, deterministic privacy-safe Jakarta filenames, UTF-8 CSV behavior, XLSX workbook/worksheet/header/row/layout generation, PDF metadata/summary/table/pagination generation, multipage coordination, current-filter forwarding, shared Rupiah/date formatting, hidden-identifier exclusion, cross-Operator isolation, Admin financial privacy, centralized route authorization, Reporting Read Service-only access, UI format gating, and existing Export Contract compatibility.

No schema, migration, Reporting query/calculation, authorization rule, ownership rule, Dashboard, Transaction Engine, or Export Contract change was introduced.

## Deferred Presentation Work

Logos, organization branding, signatures, watermarks, cover pages, charts, graphs, custom themes, advanced typography, native Excel cell typing, multi-sheet workbooks, advanced workbook styling, and measured per-format capacity remain separately scoped Presentation/Production Hardening work.
