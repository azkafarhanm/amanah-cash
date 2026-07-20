# Student Management Implementation

**Status:** Implemented  
**Date:** 2026-07-20

Student Management provides Platform Admin write access and ownership-scoped Operator read access. It reuses the approved admin, operator, and owner authorization policies; feature code does not recreate role or ownership decisions.

## Ownership and lifecycle

Every Student has one required `operatorId`. Creation and editing accept only an existing, active, non-deleted Operator. Changing `operatorId` immediately transfers ownership, so existing ownership authorization automatically follows the new assignment. Database foreign keys and ownership triggers prevent orphaning or assignment to an inactive account.

Statuses are `ACTIVE`, `INACTIVE`, and `ARCHIVED`. Active means the Student is in normal use; inactive temporarily removes the Student from normal operational use; archived is the terminal organizational state for historical retention. Status does not delete the Student or its future financial history. Transfer history is intentionally deferred.

## Interfaces

- Platform Admin: `/admin/students`, create, detail, edit, assignment, search, status filtering, and pagination.
- Operator: `/operator/students` and owned detail pages only.
- APIs: admin list/create/detail/edit under `/api/admin/students`; Operator-owned reads under `/api/operator/students`.
- Lists show a literal “Belum tersedia” balance placeholder. Details show a static future-financial-summary placeholder. Neither performs a Transaction or balance query.

All validation is server-side in `src/students/domain.ts`. UI constraints are convenience only. Search and ten-row pagination execute in the repository query. Cross-Operator detail access uses the existing masked owner policy and returns the established not-found response.

## Verification

Tests cover creation, editing, assignment and ownership updates, validation, inactive Operator rejection, Student/Operator/status search, pagination, Platform Admin visibility, and Operator isolation. Existing authorization tests continue to cover admin 403 behavior and masked ownership failures.
