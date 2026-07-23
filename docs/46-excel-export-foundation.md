# Excel Export Foundation

**Status:** Implemented  
**Date:** 2026-07-23  
**Scope:** Presentation-only XLSX adapter for the existing Export Foundation

## Architecture

Excel is an additional adapter behind the existing registry. It does not introduce a new request, authorization, query, filtering, document, filename, guard-rail, or HTTP path.

```text
existing centralized Admin / Operator authorization
  → existing Export Coordinator
  → existing Reporting Read Service
  → existing presentation-neutral Export Document
  → existing Export Registry
      ├─ CSV adapter
      └─ Excel adapter
  → existing private no-store download response
```

`src/exports/excel-adapter.ts` imports only ExcelJS and Export types. It does not import Prisma, Reporting filters/read services, authorization, Dashboard, or Transaction Engine code. All business selection, ownership scope, summaries, financial calculations, dates, Rupiah values, labels, and row ordering are already resolved before the adapter receives the document.

The Export Coordinator and `ReportExportDocument` / `ReportExportAdapter` contract remain unchanged.

## Adapter Responsibility

The Excel adapter performs presentation only:

- creates one workbook and one worksheet named `Laporan`;
- carries the document title, generated time, period, and existing summary items into a metadata panel beside the table;
- generates table headers exclusively from `document.columns`;
- renders rows in `document.rows` order using the declared column order;
- preserves the shared display-ready Jakarta dates and Rupiah strings without reverse-parsing business values;
- applies a bold first-row table header, frozen first row, auto-filter, wrapping, bounded column widths, and right alignment for display-ready currency/numeric cells; and
- serializes the result as an XLSX byte array.

Dates and currency deliberately remain the exact strings produced by shared Reporting presentation formatting. Converting them back into native spreadsheet dates or numbers would require parsing presentation text and could diverge from the UI/CSV contract. Rich cell typing and advanced workbook presentation remain future presentation work.

## Registry and HTTP Integration

The registry now exposes:

| Format | Adapter | Media type | UI |
|---|---|---|---|
| CSV | `csvExportAdapter` | `text/csv; charset=utf-8` | Exposed |
| Excel (`xlsx`) | `excelExportAdapter` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Exposed |
| PDF | `pdfExportAdapter` | `application/pdf` | Exposed |

The existing endpoints accept `format=csv`, `format=xlsx`, or `format=pdf`:

- `GET /api/operator/reports/export`
- `GET /api/admin/reports/export`

The UI already derives actions from `exportRegistry.availableFormats()`, so registering Excel exposes **Unduh Excel** without format-specific page logic. The Coordinator continues to resolve the adapter and reuse the existing privacy-safe Jakarta filename generator, producing `.xlsx` names with the same report family, period, kind, and timestamp rules as CSV.

## Guard Rails and Capacity

Excel uses the existing `EXPORT_MAX_ROWS` preflight and optional `EXPORT_MAX_BYTES` checks. Oversized results are rejected from the first authorized Reporting page before XLSX rendering. The final workbook byte size is also checked when the optional byte limit is configured.

ExcelJS builds the workbook in memory, so XLSX is synchronous and buffered like the current CSV path. The default row cap remains a safety ceiling rather than a measured XLSX capacity guarantee. Streaming, async jobs, queues, snapshot consistency, concurrency controls, and deployment-specific capacity tuning remain deferred to Production Hardening.

## Dependency Decision

The adapter uses ExcelJS `4.4.0`, a mature workbook library with maintained XLSX read/write APIs. Its transitive `uuid` is overridden to `11.1.1` to remove the advisory affecting ExcelJS's declared `uuid@8` range while retaining the compatible `v4` API used by the library. Workbook round-trip tests verify this integration.

Existing Next.js and Prisma toolchain advisories are not introduced by Excel Export and remain repository-level dependency maintenance work.

## Verification Coverage

Regression tests cover:

- registry availability and adapter selection;
- XLSX ZIP/workbook generation and round-trip loading;
- single `Laporan` worksheet creation;
- metadata, summaries, generated headers, row order, and row count;
- MIME type and `.xlsx` filename generation;
- frozen header, auto-filter, column-width bounds, and numeric alignment;
- Coordinator multipage integration using the existing reader;
- early guard-rail rejection before later page collection; and
- existing CSV, ownership-isolation, Admin privacy, authorization, and Export Contract behavior.

## Explicitly Deferred

- Logos, branding, covers, charts, graphs, signatures, formulas, multiple worksheets, advanced colors, conditional formatting, and premium layouts.
- Native spreadsheet date/currency cell typing or redesigned summaries.
- Streaming, asynchronous generation, background jobs, queues, object storage, snapshots, and read-model redesign.

Those changes require their own approved milestones and must continue to consume the same Export Document rather than moving business logic into adapters.
