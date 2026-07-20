# Application Shell Architecture

**Status:** Implemented  
**Date:** 2026-07-20  
**Scope:** App Router hierarchy, authenticated shell, navigation, loading/error/empty states, and reusable presentation primitives

## Layout hierarchy

```text
src/app/layout.tsx                         Root HTML, metadata, font, global styles
├── (public)/layout.tsx                    Public presentation boundary
│   └── page.tsx                           Existing landing page at /
├── (auth)/layout.tsx                      Authentication presentation boundary
│   ├── login/page.tsx                     /login
│   └── access-denied/page.tsx             /access-denied
└── (app)/layout.tsx                       Session provider + authenticated App Shell
    ├── app/page.tsx                       /app role dispatcher
    ├── (admin)/admin/layout.tsx            Existing admin role enforcement
    │   └── admin/page.tsx                 Empty shell landing at /admin
    └── (operator)/operator/layout.tsx      Existing Operator role enforcement
        └── operator/page.tsx              Empty shell landing at /operator
```

Route groups organize code without changing public URLs. The root layout owns only document-wide concerns. Public and authentication routes never render the application navigation. The authenticated group resolves the existing server session and authorization context, hydrates the Auth.js `SessionProvider`, and renders one shared `AppShell`. Admin and Operator layouts retain the approved exact-role enforcement; the shell does not authorize access.

## Shell composition

`src/components/app-shell/app-shell.tsx` is the single application chrome implementation:

- sticky header with product identity, current session identity, role label, mobile navigation toggle, and logout;
- role-aware sidebar navigation;
- focusable main-content landmark and skip link;
- restrained application footer;
- mobile drawer with dismissible scrim below 48rem; and
- persistent sidebar and expanded account context from tablet width upward.

The shell receives already-resolved role and session display data. It performs no database lookup, ownership check, business query, or financial calculation.

## Navigation architecture

`navigationForRole()` is the sole navigation registry. Navigation visibility mirrors the current role model for usability but is not an authorization boundary.

| Platform Admin | Operator |
|---|---|
| Dashboard | Dashboard |
| Operators | Students |
| Student assignments | Transactions |
| Settings | Reports |
| | Settings |

Platform Admin navigation intentionally excludes Transactions and Reports. Operator navigation excludes platform administration. Most links designate future module locations and currently resolve through the shared not-found experience; no feature destination has been implemented.

## Async and failure boundaries

- `app/loading.tsx` supplies global route-transition feedback.
- `(app)/loading.tsx` and role-level loading files provide protected-route skeletons.
- The authenticated layout wraps future async route content in Suspense.
- `(app)/error.tsx` handles recoverable application-content failures inside the shell.
- `app/error.tsx` and `app/global-error.tsx` handle unexpected root failures.
- `forbidden.tsx`, `unauthorized.tsx`, and `not-found.tsx` provide generic, non-disclosing messages.

Errors never render stack traces, identifiers, ownership details, or financial information. Authorization continues to decide whether a request redirects, returns forbidden, or is masked; these files only present that result.

## Shared presentation primitives

The UI barrel exports `ContentWrapper`, `SectionHeader`, `Card`, `EmptyState`, `StatusBadge`, `LoadingSkeleton`, and `ErrorState`. `EmptyState` includes generic Students, Transactions, and Reports copy presets but performs no query and has no feature behavior.

## Extension guidelines

1. Place a future Operator module under `src/app/(app)/(operator)/operator/<module>/page.tsx`.
2. Place a future administrative module under `src/app/(app)/(admin)/admin/<module>/page.tsx`.
3. Do not add another header, sidebar, session provider, or authenticated chrome wrapper.
4. Add navigation metadata only in `navigation.ts`; never use navigation visibility as access control.
5. Keep role and ownership enforcement in the existing authorization layer and call its approved helpers at server boundaries.
6. Use `ContentWrapper` and `SectionHeader` for page composition, `loading.tsx` or Suspense for async work, and the generic states for no-data/failure outcomes.
7. Feature components belong in a future feature-owned component directory, not in `app-shell` or generic `ui`.
8. A future page may replace the placeholder `/admin` or `/operator` content, but it must not replace their layouts.

This sprint introduces no Students, Operators, Transactions, Reports, Dashboard widgets, charts, statistics, financial data, or workflows.
