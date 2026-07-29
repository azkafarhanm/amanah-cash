# Student Management Implementation

**Status:** Implemented  
**Date:** 2026-07-29

Student Management provides Platform Admin write access and ownership-scoped Operator read access. It reuses the approved admin, operator, and owner authorization policies; feature code does not recreate role or ownership decisions.

## Ownership and lifecycle

Every Student has one required `operatorId`. Creation and editing accept only an existing, active, non-deleted Operator. Changing `operatorId` requires a bounded reason and atomically appends a privacy-minimized immutable `OWNERSHIP_TRANSFER` event with the old/new Operator and Platform Admin actor. Existing ownership authorization immediately follows the new assignment. Database foreign keys and ownership triggers prevent orphaning or assignment to an inactive account.

Statuses are `ACTIVE`, `INACTIVE`, and `ARCHIVED`. Status does not independently change ownership visibility. Platform Admin may move a Student among any of the three states. Status does not delete the Student or its financial history; inactive and archived Students remain readable by their owner but reject financial mutations.

## Interfaces

- Platform Admin: `/admin/students`, create, detail, edit, assignment, search, status filtering, and pagination.
- Operator: `/operator/students` and owned detail pages. Includes `+ Tambah Student` modal dialog for self-provisioning Students assigned automatically to the logged-in Operator session.
- APIs: admin list/create/detail/edit under `/api/admin/students`; Operator-owned reads and self-provisioning `POST` under `/api/operator/students`.
- Operator self-provisioning derives `operatorId` strictly from active session (`authorization.id`), ignoring client-supplied `operatorId` payloads, and logs a `STUDENT_CREATE` event to `OperatorAudit`.
- Operator lists and detail pages use ownership-scoped persisted Balance and Transaction reads. Platform Admin Student presentation intentionally excludes Balance and Transaction data.


All validation is server-side in `src/students/domain.ts`. UI constraints are convenience only. Partial Student/Operator-name search, status filtering, newest-first ordering, and ten-row pagination execute in the repository query. Invalid page and status query values safely fall back to page one and no status filter. Cross-Operator detail access uses the existing masked owner policy and returns the established not-found response.

## Validation interaction recovery

Admin create/edit forms now use local React Action state for expected
`StudentManagementError` outcomes. Server-rejected submissions remain in the
same form and preserve name, Operator assignment, status, notes, and
ownership-transfer reason. Domain messages render beside the affected field and
focus moves to the first invalid control. Pending submission disables the submit
action and announces an explicit busy label.

Successful create/edit redirects and notices remain unchanged. Authorization,
not-found, ownership-transfer audit, and unexpected-error behavior remain
server-owned. No submitted form value or validation payload is transported in a
URL, log, cookie, or persistent browser store.

## Verification

Tests cover creation, editing, assignment and ownership updates, required
transfer reason, atomic transfer-audit rollback, immutable transfer audit,
validation, inactive Operator rejection, preserved create/edit values, inline
error association, focus recovery, pending protection, absence of query-string
form payloads, Student/Operator-name search, status filtering, pagination,
Platform Admin visibility, and Operator isolation. Existing authorization tests
continue to cover admin 403 behavior and masked ownership failures.
