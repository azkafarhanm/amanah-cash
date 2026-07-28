# Financial Assurance Implementation

**Status:** Implemented through Sprint 3 Epic 3 Batch 3C
**Date:** 2026-07-28

## Scope

Financial Assurance is a read-only Operator capability on `/operator/reconciliation/students/[studentId]`. It contains persisted-Balance reconciliation and an immutable Financial Audit Timeline. It does not repair mismatches, mutate audit/Transaction/Student data, expose raw snapshots, grant Platform Admin financial access, or implement audit-detail UI.

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

## Time semantics

`FinancialAuditEvent.occurredAt` is the server-generated audit commit timestamp. The audit API and UI call it `committedAt`. It is distinct from `Transaction.occurredAt`, which is the operator-supplied business occurrence time. Audit order and audit date filtering use the commit timestamp.

## Verification

Coverage verifies ownership masking, typed error mapping, opaque cursor pagination, event/date filtering, unsupported/malformed snapshot handling, no-write reads, timeline rendering, all event badges, loading/empty/error/retry states, focus behavior, and no client-side financial calculation.
