# Student Management Implementation

**Status:** Implemented  
**Date:** 2026-07-20

Student Management provides Platform Admin write access and ownership-scoped Operator read access. It reuses the approved admin, operator, and owner authorization policies; feature code does not recreate role or ownership decisions.

## Ownership and lifecycle

Every Student has one required `operatorId`. Creation and editing accept only an existing, active, non-deleted Operator. Changing `operatorId` immediately transfers ownership, so existing ownership authorization automatically follows the new assignment. Database foreign keys and ownership triggers prevent orphaning or assignment to an inactive account.

Statuses are `ACTIVE`, `INACTIVE`, and `ARCHIVED`. The current module uses them as management labels and list filters only; status does not independently change visibility or authorization. Platform Admin may move a Student among any of the three states. Status does not delete the Student or its future financial history. Transfer history is intentionally deferred.

## Interfaces

- Platform Admin: `/admin/students`, create, detail, edit, assignment, search, status filtering, and pagination.
- Operator: `/operator/students` and owned detail pages only.
- APIs: admin list/create/detail/edit under `/api/admin/students`; Operator-owned reads under `/api/operator/students`.
- Lists show a literal “Belum tersedia” balance placeholder. Details show a static future-financial-summary placeholder. Neither performs a Transaction or balance query.

All validation is server-side in `src/students/domain.ts`. UI constraints are convenience only. Partial Student/Operator-name search, status filtering, newest-first ordering, and ten-row pagination execute in the repository query. Invalid page and status query values safely fall back to page one and no status filter. Cross-Operator detail access uses the existing masked owner policy and returns the established not-found response.

## Known interaction limitation

Browser-native form validation preserves entered values, but a server-side create/edit validation error redirects to the form page and reloads persisted/default values. Submitted invalid values are not restored. This does not create a partial Student update, but preserving server-rejected input remains future interaction-state work.

## Verification

Tests cover creation, editing, assignment and ownership updates, validation, inactive Operator rejection, Student/Operator-name search, status filtering, pagination, Platform Admin visibility, and Operator isolation. Existing authorization tests continue to cover admin 403 behavior and masked ownership failures.
