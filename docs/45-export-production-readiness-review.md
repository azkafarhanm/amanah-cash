# Export Foundation — Architecture and Production Readiness Review

**Status:** Guard rails implemented; conditionally ready for bounded synchronous exports  
**Review date:** 2026-07-22  
**Last updated:** 2026-07-23  
**Scope:** CSV/Excel export capacity, memory behavior, filename policy, and high-volume operation

## Executive Decision

The Export Foundation has appropriate security and layering boundaries: it is read-only, reuses centralized authorization, obtains data only through the Reporting Read Service, preserves Operator ownership scope, and keeps Admin exports free of financial data. Those boundaries are production-appropriate and must remain unchanged.

The current CSV and Excel delivery paths remain **not qualified for large production datasets** because they are synchronous and fully buffered. They share a centralized default 10,000-row safety cap, optional byte cap, early first-page rejection, controlled `413` error, and privacy-safe filenames. They are adequate only for bounded requests within those guard rails; the default cap is not a measured service-level guarantee.

## Current Runtime Behavior

### Pagination and dataset coverage

Export does not export only the visible UI page. The coordinator deliberately removes the caller-supplied page, starts at page one, and sequentially requests every matching page through the Reporting Read Service. Consequently, an export represents the complete filtered dataset visible to the authorized report scope.

The current Reporting page size is 20 rows. Therefore:

| Matching rows | Reporting page reads | Expected behavior |
|---:|---:|---|
| 30,000 | 1 | Rejected after the first authorized Reporting page because `total` exceeds the default 10,000-row cap. |
| 100,000 | 1 | Rejected by the same preflight guard; later pages and CSV rendering do not run. |

Sequential pagination prevents an unbounded concurrent query burst, but it does not make the operation cheap. Each Reporting service call continues to execute its existing report query responsibilities, including page metadata and summaries. The export layer correctly does not bypass or duplicate those responsibilities.

The read is also not protected by a database snapshot or high-water mark. Transactions that change while a long offset-paginated export is running can make the resulting file reflect more than one point in time. The current file is best understood as an eventually assembled report, not a point-in-time financial snapshot.

### Memory and response delivery

The implementation is buffered, not streaming:

1. the coordinator accumulates every Reporting row;
2. the document builder creates display-ready export rows;
3. the CSV adapter creates a complete array of line strings;
4. those lines are joined into one complete CSV string;
5. `TextEncoder` creates the complete UTF-8 byte array; and
6. the HTTP response creates and fills another `ArrayBuffer`.

Peak memory is therefore materially greater than the final file size because several representations can coexist. ExcelJS also constructs the workbook archive in memory. The exact multiplier differs by format and depends on row width, runtime garbage collection, and deployment platform. No safe 30,000- or 100,000-row generation guarantee can be stated without representative per-format measurement.

### Export size limits

`EXPORT_MAX_ROWS` is a mandatory positive integer with a default of `10000`. `EXPORT_MAX_BYTES` is an optional positive integer and is disabled when unset. After the first Reporting page, the coordinator checks the authoritative matching row total and estimates output bytes from display-ready sample rows. It rejects likely oversized requests before page two. When a byte cap is enabled, the final rendered byte size is checked as well.

The controlled failure is HTTP `413`, code `EXPORT_LIMIT_EXCEEDED`, with a user-safe instruction to narrow the period or filters. It exposes no threshold, stack trace, query detail, or internal identifier. There is still no generation deadline, concurrency limit, per-actor rate limit, or measured deployment capacity. Production must tune the row and optional byte values from representative measurements.

### Filename policy

Current filename shapes are:

- `laporan-keuangan-<periode>-<YYYYMMDD-HHmmss>.csv`
- `laporan-administratif-<jenis>-<periode>-<YYYYMMDD-HHmmss>.csv`

The period comes from normalized Reporting filters and the generation timestamp is computed in `Asia/Jakarta` to the second. Admin filenames include a safe report-kind segment. These names are deterministic for the same report and generation instant, operationally meaningful, and substantially collision-resistant.

Examples are `laporan-keuangan-2026-07-20260722-143015.csv` and `laporan-administratif-aktivitas-operator-2026-07-20260722-143015.csv`. Filenames never contain Student or Operator names, email addresses, raw search terms, or identifiers. This policy does not alter report queries or the Export Contract.

### Locale and timezone consistency

The current UI, CSV, and Excel documents consume the shared presentation formatters. Currency uses Indonesian IDR formatting and report timestamps use `Asia/Jakarta`; the filename date also uses `Asia/Jakarta`. Excel preserves those display-ready strings rather than reverse-parsing them into potentially divergent native cell values.

## Production Hardening Gates

The following work is required before claiming support for large synchronous exports:

1. **Measure representative workloads.** Benchmark at least small, normal, 30,000-row, and 100,000-row datasets with realistic long text. Record page/query count, wall time, time-to-first-byte, peak heap, final bytes, database load, and timeout behavior in the selected deployment environment.
2. **Tune bounded synchronous service levels.** Use measurements to tune the implemented row and optional byte cap. Define request timeout, allowed concurrent exports, and any rate limit without weakening the existing guard rails.
3. **Introduce backpressure-aware CSV streaming only in a future approved milestone.** Fetch a bounded page, serialize rows, write to the response, and release page-local data. Handle client cancellation and downstream backpressure.
4. **Prevent repeated expensive report work.** If measurement proves the existing page-by-page read contract too expensive, propose an approved Reporting-owned export iterator/read capability. Exporters must still never query Prisma or reproduce calculations.
5. **Choose consistency semantics.** The present guarantee is ownership-scoped, filter-consistent per Reporting call, but not one point-in-time snapshot across all pages. Snapshot/high-water-mark/keyset work belongs at the Reporting read boundary and remains deferred because it changes read architecture.
6. **Plan oversized asynchronous exports only if separately approved.** A background job, queue, object storage, expiry policy, and secure download flow remain outside the current approved architecture.

PDF implementation should not begin until its workload and memory behavior are reviewed. Excel is implemented behind the existing limits, but its deployment capacity must be benchmarked separately from CSV because workbook generation has a different memory profile.

## Readiness Matrix

| Area | Decision | Evidence / limitation |
|---|---|---|
| Reporting-only data access | Ready | Coordinator reads exclusively through the existing Reporting Read Service. |
| Authorization and ownership | Ready | Existing Admin/Operator authorization and Operator ID scope are reused on every read. |
| Admin financial privacy | Ready | Admin document remains administrative and contains no financial fields. |
| Complete filtered dataset | Ready for bounded volume | All matching pages are fetched sequentially; UI pagination is not exported as a data limit. |
| Locale and timezone | Ready | UI, CSV, and Excel share IDR and `Asia/Jakarta` display formatting. |
| Filename usability | Ready | Includes family, normalized period, Admin kind where applicable, and Jakarta timestamp; excludes personal data and identifiers. |
| Memory behavior | Not high-volume ready | Complete rows, strings, bytes, and response copy are buffered. |
| Size controls | Guarded, not capacity-qualified | Default 10,000-row cap plus optional estimated/exact byte cap; deployment tuning remains outstanding. |
| Deadline/concurrency controls | Not ready | No request deadline, concurrency limit, or rate limit exists. |
| 30,000–100,000-row operation | Safely rejected by default | One first-page Reporting read, then controlled `413`; generation at those volumes remains unsupported. |
| Point-in-time consistency | Not guaranteed | No snapshot or high-water mark spans the multipage read. |

## Final Recommendation

Classify the implementation as a guard-railed, bounded-volume synchronous exporter. Do not advertise or depend on generation of 30,000- or 100,000-row files. Production Hardening must still establish measured capacity and separately approve any streaming, snapshot, or asynchronous architecture.
