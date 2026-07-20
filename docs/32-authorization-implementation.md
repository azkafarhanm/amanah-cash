# Authorization Implementation

**Status:** Implemented  
**Date:** 2026-07-20  
**Scope:** Shared role, ownership, route, API, and Server Action authorization infrastructure

## Architecture

`src/authorization` is the sole authorization boundary. Authentication remains responsible only for resolving the Auth.js database session and its user ID. The authorization service then reloads the current User row from Prisma, requires `isActive`, validates the persisted role against the closed `PLATFORM_ADMIN | OPERATOR` set, and applies a named role or ownership policy.

The policy order is:

1. resolve the server-side database session;
2. reload and validate the current active User and role from the database;
3. enforce the required role;
4. for Operator Student access, query by both `Student.id` and the current User ID;
5. execute the protected handler only after authorization succeeds.

Role and ownership are never accepted from cookies, request bodies, query strings, route parameters other than the target Student ID, or client state. A target ID selects what to check; it never proves access.

## Permission model

The current model intentionally has no permission tables or user-configurable grants.

| Role | Current capabilities |
|---|---|
| `PLATFORM_ADMIN` | Manage Operators, assign Students, transfer Students, and manage platform resources |
| `OPERATOR` | Access assigned Students and manage financial data only for assigned Students |

A Platform Admin is not an Operator and has no implicit financial-data bypass. `canAccessStudent`, `canManageStudent`, and `requireOwnership` therefore require an Operator and current database ownership. Future permissions should be introduced behind named policy functions in this module, not scattered role comparisons.

## Shared helpers

- `requireAuthenticatedUser()` reloads the active User and validates its current role.
- `requirePlatformAdmin()` and `requireOperator()` enforce exact roles.
- `currentRole()` and `currentOperator()` expose authoritative server-side context.
- `canAccessStudent()` and `canManageStudent()` answer ownership-based policy questions.
- `requireOwnership()` enforces ownership and masks missing/cross-owner resources as 404 by default.
- `protectRoute()` applies page behavior: anonymous users go to `/login`; wrong-role users receive a generic 403.
- `withAuthorization()` protects future route handlers in one declaration and produces stable, non-cacheable JSON errors.
- `authorizeServerAction()` must be the first operation in every future protected Server Action.

Example API declaration:

```ts
export const GET = withAuthorization(
  { role: "operator" },
  async (_request, { authorization }) => Response.json({ actorId: authorization.id })
);
```

Example ownership-protected API declaration:

```ts
export const POST = withAuthorization(
  { role: "owner", studentId: (request) => new URL(request.url).searchParams.get("studentId") ?? "" },
  async () => new Response(null, { status: 204 })
);
```

Example Server Action entry:

```ts
"use server";

const actor = await authorizeServerAction({ role: "owner", studentId });
```

The helper authorizes entry into an action. A future write service must repeat the ownership predicate inside the same database transaction as its mutation to prevent transfer/write races.

## Route enforcement

`/app` is the protected role dispatcher. It sends active Platform Admins to `/admin` and active Operators to `/operator`. The `/admin` and `/operator` segment layouts enforce their exact roles for all future descendant pages. These layouts contain no business UI.

Future protected page trees should add a layout that calls `protectRoute("authenticated" | "admin" | "operator")`. Middleware may later provide a lightweight early redirect, but it must never replace these authoritative database-backed checks.

## Error and disclosure policy

| Condition | Page behavior | API behavior |
|---|---|---|
| Missing/invalid session, deleted/inactive User, invalid role | Redirect to `/login` | `401 UNAUTHENTICATED` |
| Valid user with wrong role | Generic 403 | `403 UNAUTHORIZED` |
| Missing or cross-owner Student | Generic 404 by default | `404 RESOURCE_NOT_FOUND` by default |

API error responses include a server-generated correlation ID and `Cache-Control: no-store`. They never disclose a User role, actual owner, Student existence, or database detail. Endpoint design may explicitly select a generic 403 for ownership failure only when existence disclosure is safe and consistent.

## Extension rules

- Add new capabilities as named policies in `src/authorization`; never add inline role comparisons to pages, handlers, actions, or business services.
- Keep administrative projections separate from financial repositories.
- Scope database reads using ownership in the query itself; never fetch an unscoped record and filter afterward.
- Recheck ownership in the transaction that performs any future protected write.
- Keep the role set closed until a reviewed ADR changes it. Do not implement role inheritance or an admin superuser shortcut.
- Add negative cross-Operator tests for every future Student-related endpoint or use case.
