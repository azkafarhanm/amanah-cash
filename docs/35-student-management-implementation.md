# Student Management Implementation

**Status:** Implemented  
**Date:** 2026-07-20

Student Management provides Platform Admin write access and ownership-scoped Operator read access. It reuses the approved admin, operator, and owner authorization policies; feature code does not recreate role or ownership decisions.

## Ownership and lifecycle

Every Student has one required `operatorId`. Creation and editing accept only an existing, active, non-deleted Operator. Changing `operatorId` requires a bounded reason and atomically appends a privacy-minimized immutable `OWNERSHIP_TRANSFER` event with the old/new Operator and Platform Admin actor. Existing ownership authorization immediately follows the new assignment. Database foreign keys and ownership triggers prevent orphaning or assignment to an inactive account.

Statuses are `ACTIVE`, `INACTIVE`, and `ARCHIVED`. Status does not independently change ownership visibility. Platform Admin may move a Student among any of the three states. Status does not delete the Student or its financial history; inactive and archived Students remain readable by their owner but reject financial mutations.

## Interfaces

- Platform Admin: `/admin/students`, create, detail, edit, assignment, search, status filtering, and pagination.
- Operator: `/operator/students` and owned detail pages only.
- APIs: admin list/create/detail/edit under `/api/admin/students`; Operator-owned reads under `/api/operator/students`.
- Operator lists and detail pages use ownership-scoped persisted Balance and Transaction reads. Platform Admin Student presentation intentionally excludes Balance and Transaction data.

All validation is server-side in `src/students/domain.ts`. UI constraints are convenience only. Partial Student/Operator-name search, status filtering, newest-first ordering, and ten-row pagination execute in the repository query. Invalid page and status query values safely fall back to page one and no status filter. Cross-Operator detail access uses the existing masked owner policy and returns the established not-found response.

## Known interaction limitation

Browser-native form validation preserves entered values, but a server-side create/edit validation error redirects to the form page and reloads persisted/default values. Submitted invalid values are not restored. This does not create a partial Student update, but preserving server-rejected input remains future interaction-state work.

## Verification

Tests cover creation, editing, assignment and ownership updates, required transfer reason, atomic transfer-audit rollback, immutable transfer audit, validation, inactive Operator rejection, Student/Operator-name search, status filtering, pagination, Platform Admin visibility, and Operator isolation. Existing authorization tests continue to cover admin 403 behavior and masked ownership failures.
