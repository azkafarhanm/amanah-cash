# Operator Management Implementation

**Status:** Implemented  
**Date:** 2026-07-20

Operator Management is the first business module and is available only below `/admin/operators` and `/api/admin/operators`. Both UI and API reuse the approved `admin` authorization policy; navigation remains presentational and is not an access boundary.

## Domain and persistence

`src/operators/domain.ts` owns server-side normalization, validation, lifecycle rules, pagination, and friendly domain errors. `src/operators/service.ts` is the Prisma repository adapter. Operator emails are trimmed and lower-cased before uniqueness checks. New accounts always use role `OPERATOR` and start inactive.

The persistence migration adds creation time, last login, logical deletion, and an append-only Operator audit summary. Logical deletion preserves the unique historical Google identity and audit trail. A database trigger and the domain service both prevent deletion while Students remain assigned. Deactivation also fails while assignments exist and revokes database sessions when successful.

Successful verified Google admission records `lastLoginAt`. Authentication and authorization exclude logically deleted users. Platform Admin queries expose profile, state, login time, audit summary, and Student counts only; no Transaction, balance, report, or other financial query is present.

## Interfaces

- List: server-side name/email search, active/inactive filtering, ten-row pagination, loading, empty, and error boundaries.
- Create: full name and Google email; inactive by default.
- Detail/edit: immutable email display, editable name and active state, Student count, login time, and audit summary.
- Delete: logical deletion only after the assigned Student count reaches zero.
- API: `GET/POST /api/admin/operators` and `GET/PATCH/DELETE /api/admin/operators/:id`, with stable validation errors and no-store responses.

Client constraints improve usability, but all inputs are validated again in the domain service. API and Server Actions authorize before invoking business behavior.

## Verification

The Operator test suite covers create, normalization, duplicate email, validation, edit, activation/deactivation, inactive provisioning, deletion success/failure, search, status filtering, and pagination. Existing authorization tests verify that Operators receive 403 for the shared admin policy.
