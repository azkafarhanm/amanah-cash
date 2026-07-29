# Financial Assurance Implementation

**Status:** Implemented through Sprint 3 Epic 3 Batch 4
**Date:** 2026-07-28

## Scope

Financial Assurance is a read-only Operator capability on `/operator/reconciliation/students/[studentId]`. It contains persisted-Balance reconciliation, an immutable Financial Audit Timeline, and an allow-listed Audit Detail Drawer. It does not repair mismatches, mutate audit/Transaction/Student data, expose raw snapshots, or grant Platform Admin financial access.

## Read architecture

`src/financial-assurance/read-service.ts` owns snapshot-consistent reconciliation. `src/financial-assurance/audit-read-service.ts` owns current-owner-scoped audit timeline/detail DTOs, event/date filtering, opaque cursor validation, and supported-schema allow-listed snapshot projection. The HTTP boundary delegates to these services and never queries Prisma directly.

Endpoints:

- `GET /api/operator/students/:studentId/reconciliation`
- `GET /api/operator/reconciliation/students/:studentId/audit`
- `GET /api/operator/reconciliation/students/:studentId/audit/:auditEventId`

All endpoints require the centralized Operator policy and send `Cache-Control: private, no-store`. Missing Student, cross-owner Student, and missing audit event are intentionally mapped to the same 404 response. Invalid audit query inputs return a controlled 400 response. Unsupported snapshot schemas remain a typed successful detail response with `UNSUPPORTED_SCHEMA` and no raw snapshot.

## Timeline UI

`FinancialAuditTimeline` is an API-only client component beneath the Reconciliation Result Card. It renders a semantic ordered list of event cards for `CREATE`, `EDIT`, `DELETE`, `RESTORE`, and `OWNERSHIP_TRANSFER`. Each card displays a badge, `committedAt`, Indonesian summary, and revision when present.

The component uses shared Card, StatusBadge, Button, LoadingSkeleton, EmptyState, and date-formatting primitives. It appends later pages only, sends `nextCursor` exactly as returned, and does not decode or calculate from audit data. Loading, empty, initial error/retry, incremental error/retry, and live loading status are explicit. After a successful Load More, focus moves to the first appended list item.

## Audit Detail Drawer

Selecting a timeline card opens the platform `ContextDetailDrawer` with
Financial Audit content. The accessible primitive remains a native modal
`dialog`; desktop/tablet render it from inline-end and mobile renders a
full-screen detail surface through approved semantic tokens. It calls only
`GET /api/operator/reconciliation/students/:studentId/audit/:auditEventId`,
after selection, and renders only the approved typed DTO fields. It never
renders actor, internal IDs, balance evidence, schema version, raw snapshots,
command hashes, correlations, or ORM data.

Successful detail DTOs are cached in component memory for the current page lifetime. A per-event in-flight Promise map prevents duplicate concurrent requests; failures are not cached and Retry starts a clean attempt. There is no timeline-wide preloading. Native modality supplies focus containment and Escape dismissal; backdrop and close-button dismissal are supported, and close returns focus to the selected timeline trigger. Loading is announced and errors expose a keyboard-operable Retry.

`UNSUPPORTED_SCHEMA` renders a dedicated unavailable state and no projected values. The client does not decode schemas or fabricate fallback values.

## Architecture audit and trade-offs

- Reused: `FinancialAuditTimeline`, native-dialog conventions from `TransactionDialog`, shared `Card`, `StatusBadge`, `Button`, `LoadingSkeleton`, and centralized date/Rupiah/transaction/correction formatters.
- New: one Financial Audit content composition hosted by the platform
  `ContextDetailDrawer`; no feature-local drawer primitive, service, hook,
  backend, HTTP, domain, or persistence module.
- Decision: fetch/cache ownership stays beside the drawer because no repository-wide query library exists. The cache is deliberately page-local and successful-response-only.
- Trade-off: native `dialog` keeps focus and Escape behavior browser-owned and
  consistent with existing architecture, while the platform component owns
  responsive position, elevation, motion, and scrolling. Cross-page caching,
  prefetching, and Browser Back integration are intentionally excluded.

## Time semantics

`FinancialAuditEvent.occurredAt` is the server-generated audit commit timestamp. The audit API and UI call it `committedAt`. It is distinct from `Transaction.occurredAt`, which is the operator-supplied business occurrence time. Audit order and audit date filtering use the commit timestamp.

## Verification

Coverage verifies ownership masking, typed error mapping, opaque cursor pagination,
event/date filtering, unsupported/malformed snapshot handling, no-write reads,
timeline selection and selected state, exact detail endpoint usage, lazy
loading, request deduplication/page-lifetime caching, allow-listed rendering,
loading/error/retry/unavailable states, platform drawer consumption, semantic
responsive tokens, modal semantics, focus restoration, reduced motion, and no
client-side decoding or financial calculation.

## Known limitations

- Cache lifetime ends when the reconciliation page unmounts.
- Native-dialog and responsive-drawer behavior still requires the release browser, screen-reader, 320 px, and 200% zoom matrix during deployment qualification.
- Export, print, mutation, restore, and audit filtering changes remain outside this batch.
