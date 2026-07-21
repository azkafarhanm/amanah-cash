# UX Polish and Placeholder Strategy

**Status:** Implemented  
**Date:** 2026-07-21  
**Scope:** Presentation state clarity, navigation completeness, responsive behavior, and accessibility only

## 1. Sprint boundary

This sprint improves perceived quality without changing authentication, authorization, ownership, APIs, database schema, migrations, financial writes, audit, or business rules. Planned modules remain unimplemented; their routes now communicate that state intentionally.

## 2. State taxonomy

| State | Meaning | Required presentation |
|---|---|---|
| Planned feature | Roadmap capability has no approved implementation yet | `FeaturePlaceholder` with status, explanation, assurance, and optional action/availability |
| Empty data | Implemented read completed successfully but returned no records | Context-specific `EmptyState` explaining why the result is empty and what can happen next |
| No search results | Implemented filtered read returned no match | Explicit no-match copy with reset/change-filter guidance |
| Loading | Route or data is still resolving | Layout-stable text, table, card, or ledger skeleton |
| Validation error | Submitted input is correctable | Inline, field-adjacent or form-level alert preserving the module context |
| Unauthorized | No valid session exists | Dedicated session-required state and login action |
| Forbidden | Valid identity lacks the role or ownership scope | Dedicated access-denied state without revealing protected data |
| Missing resource / 404 | Route or requested record does not exist | Dedicated not-found state; never used for known roadmap modules |
| Unexpected system error | Implemented operation failed unexpectedly | Consistent error card with retry and no false success implication |

These states must not borrow one another's wording. In particular, “not yet implemented” is never represented as empty data or 404.

## 3. Reusable placeholder contract

`src/components/ui/feature-placeholder.tsx` is the only unfinished-feature presentation primitive. It supports:

- title and explanatory description;
- `PLANNED` or `IN_DEVELOPMENT` status;
- optional icon;
- optional action;
- optional estimated availability text; and
- optional future-capability cards for richer roadmap surfaces.

Dashboard pages used this primitive during the UX Polish sprint and were replaced by the approved Dashboard Foundation. Remaining planned leaf modules use the compact form. No route owns a one-off placeholder implementation.

## 4. Navigation consistency

Every current sidebar destination resolves as follows:

| Route | Outcome |
|---|---|
| `/admin` | Implemented read-only administrative dashboard |
| `/admin/operators` | Implemented Operator Management |
| `/admin/students` | Implemented Student Management |
| `/admin/reports` | Implemented privacy-safe administrative reporting |
| `/admin/settings` | Planned feature placeholder |
| `/operator` | Implemented ownership-scoped operational dashboard |
| `/operator/students` | Implemented owned-Student list |
| `/operator/transactions` | Planned centralized-module placeholder; current Student-level transactions remain available |
| `/operator/reports` | Implemented ownership-scoped financial reporting |
| `/operator/settings` | Planned feature placeholder |

Generic 404 remains reserved for unknown routes and missing resources.

## 5. Empty and balance guidance

- First-use empty lists explain that no record is registered or assigned.
- Filtered empty lists state that no record matches and recommend changing/resetting filters.
- Empty transaction history states that no financial transaction has been recorded.
- Operator Student lists show authoritative ownership-scoped persisted Balance. Zero is displayed as `Rp 0` with “Belum ada transaksi tercatat” when the transaction count is zero.
- Platform Admin Student lists intentionally omit Balance to preserve the financial-data privacy boundary.
- Ambiguous phrases such as “Belum tersedia” must not represent a valid zero, empty result, or planned feature.

## 6. Loading, mobile, and accessibility

`LoadingSkeleton` provides text, table, and card layouts. List routes use table skeletons; dashboard and detail routes use card/ledger skeletons to preserve layout stability.

At phone widths, Operator and Student tables become labeled record cards rather than forcing viewport-level horizontal scrolling. Actions wrap to full width where needed. Existing sidebar collapse, scrim, skip link, touch targets, and focus-visible treatments remain intact.

Placeholder status is visible text, headings follow the page `h1` → placeholder `h2` → capability `h3` hierarchy, decorative icons are hidden from assistive technology, and planned-capability groups have an accessible label.

## 7. Known roadmap modules

Still unimplemented: centralized cross-Student transaction workspace, exports, user/platform settings, reconciliation presentation, full financial-audit history, and advanced historical analytics. Placeholders do not imply approval, dates, or hidden functionality. Dashboard and report routes are now implemented and no longer use this placeholder contract.
