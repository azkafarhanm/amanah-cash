# Dashboard and Analytics Foundation Implementation

**Status:** Implemented  
**Date:** 2026-07-21  
**Scope:** Read-only Platform Admin and Operator dashboards

## Architecture

Dashboard pages are server-rendered presentation surfaces under the existing protected Admin and Operator layouts. They call one dashboard-specific read projection in `src/dashboard/read-service.ts`; no dashboard component accesses Prisma, authorizes a user, derives a Student Balance, or invokes a financial mutation.

```text
protected role layout / current Operator resolver
  → dashboard read projection
  → fixed-count Prisma aggregate and bounded activity queries
  → reusable server-rendered dashboard cards
```

The dashboard layer adds no schema, migration, client state store, background job, cache, or write API. The Transaction Engine and centralized authorization/ownership implementations are unchanged.

## Read Model

### Platform Admin

The Admin projection reads only administrative data:

- active/inactive non-deleted Operator counts;
- active/inactive/archived Student counts;
- current Student distribution per Operator;
- bounded Operator audit summaries;
- privacy-minimized `OWNERSHIP_TRANSFER` evidence selecting only Student, old/new Operator, reason, and occurrence time; and
- latest Student assignments.

It does not select Student Balance, Transaction rows, financial snapshots, financial deltas, or Transaction revisions. Platform Admin therefore receives no financial-data bypass.

### Operator

Every Operator query includes the authenticated `operatorId` through either `Student.operatorId` or `Transaction.student.operatorId`. The projection supplies:

- owned Student lifecycle counts;
- active owned Students with activity today;
- current managed Balance from the sum of persisted owned `Student.balance` values;
- active Deposit and Withdrawal totals for the current Asia/Jakarta business day;
- six newest owned Transactions; and
- six most recently administratively updated owned Students.

The dashboard never reconstructs Student Balance from Transaction history. Corrections remain visible in recent activity but are not relabeled as Deposit or Withdrawal. Deleted Transactions remain identifiable in recent activity and are excluded from today's operational Deposit/Withdrawal totals.

## Card Architecture

`src/components/dashboard/dashboard-cards.tsx` provides:

- `StatisticCard` for current counts and balances;
- `TrendCard` for period-labelled operational totals without inventing comparison data;
- `SummaryCard` and `SummaryList` for distributions;
- `ActivityCard` for administrative, financial, ownership, and status activity;
- `QuickActionCard` linking only to existing workflows;
- `DashboardGrid` and `DashboardSection` for consistent composition; and
- `DashboardSkeleton` for layout-stable loading.

Cards use semantic headings, labelled regions/groups, real lists and times, visible activity categories, focus-visible links, and explanatory zero/empty copy. The responsive grid collapses to one column at mobile width without horizontal scrolling.

## Performance

- Aggregate counts and sums execute in the database.
- Independent reads run concurrently through a fixed `Promise.all` set.
- Activity queries are bounded to six rows.
- Related names are loaded in fixed batch queries; no per-row query loop exists.
- All dashboard components are React Server Components, so there is no dashboard hydration or client render loop.
- Expensive historical trends, charting datasets, reports, and exports are intentionally absent.

## Authorization and Privacy

- Existing protected route-group layouts remain the Admin/Operator role boundary.
- Operator Dashboard additionally resolves the current Operator through the centralized authorization service and passes only that server-derived ID to the read model.
- Admin Dashboard contains administrative facts only.
- Operator Dashboard sees the complete financial record only through current Student ownership, matching ADR-003 and ADR-004.
- Quick actions navigate to existing protected pages and introduce no mutation behavior.

## Verification

Regression coverage uses a real migrated SQLite database with two Operators and deliberately different balances. It verifies Admin privacy, per-Operator isolation, Jakarta-day totals, persisted Balance aggregation, meaningful zero results, bounded fixed queries, read-only source boundaries, reusable cards, accessibility semantics, responsive single-column behavior, and absence of horizontal scrolling.
