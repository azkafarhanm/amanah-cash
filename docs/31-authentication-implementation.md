# Authentication Implementation

**Status:** Implemented  
**Date:** 2026-07-20  
**Scope:** Google identity admission, Auth.js database sessions, and an isolated local-development substitute

## 1. Implemented boundary

This implementation provides Auth.js authentication through Google, registered-active-user admission, database sessions, login, logout, friendly authentication errors, and reusable server authentication helpers. An explicit non-production mode substitutes two configured seeded identities so local work does not require Google credentials. It implements no role decision, ownership decision, Student/Transaction filtering, financial permission, administrative permission, or dashboard permission.

The installed stable integration versions are:

- `next-auth` 4.24.14, the npm `latest` stable release; Auth.js v5 remains beta and is not selected under the stable-version requirement;
- `@next-auth/prisma-adapter` 1.0.7, the stable Prisma adapter compatible with NextAuth.js/Auth.js v4;
- Prisma Client and SQLite driver adapter 7.8.0; and
- `better-sqlite3` 12.11.1.

The package manifest overrides Auth.js's compatible transitive `uuid` range to 11.1.1 to remove the published buffer-bounds advisory present in the stable package's default dependency resolution.

The Auth.js API route is `/api/auth/[...nextauth]`. The Google callback is always `${NEXTAUTH_URL}/api/auth/callback/google`.

## 2. Required environment

| Variable | Required value | Security/behavior |
|---|---|---|
| `DATABASE_URL` | SQLite `file:` URL for the migrated Amanah Cash database | Server-only; must contain the identity/session migration |
| `GOOGLE_CLIENT_ID` | Google OAuth Web application client ID | Server configuration |
| `GOOGLE_CLIENT_SECRET` | Matching Google OAuth client secret | Secret; server-only |
| `NEXTAUTH_SECRET` | Independent cryptographically random value of at least 32 characters | Secret; signs/encrypts Auth.js security material; never reuse across environments |
| `NEXTAUTH_URL` | Exact application origin, such as `http://localhost:3000` or `https://cash.example.com` | Determines trusted Auth.js URLs and secure-cookie behavior |
| `AUTH_DEV_MODE` | Optional boolean; defaults to `false` | Enables the development credentials provider outside production; `true` is rejected in production |
| `DEV_SEED_ADMIN_EMAIL` | Required only for development auth/seed | Allowed seeded Platform Admin identity |
| `DEV_SEED_OPERATOR_EMAIL` | Required only for development auth/seed | Allowed seeded Operator identity |
| `DEV_SEED_STUDENT_NAME` | Required only for the development seed | Name of the active Student assigned to the seeded Operator |

The committed `.env.example` contains a local-only secret and reserved example-domain seed identities for clone-and-run development. Real local and production secrets belong in an ignored `.env` or deployment secret store. Production requires HTTPS except that a production build may be run on loopback HTTP for local verification. Non-HTTPS non-loopback origins are rejected. `NEXTAUTH_URL` must not contain a path, query, or fragment.

Google Cloud OAuth configuration must use an OAuth 2.0 Web application client and exact redirect URIs:

- local: `http://localhost:3000/api/auth/callback/google`;
- production: `https://<canonical-origin>/api/auth/callback/google`; and
- any additional local port must be registered exactly and match `NEXTAUTH_URL`.

Wildcard production callbacks and untrusted preview origins are not permitted. Requested scopes are only `openid email profile`.

## 3. Admission flow

1. `/login` uses the Auth.js client to start Google sign-in. Auth.js retrieves and submits its CSRF token.
2. Google returns to the exact Auth.js callback.
3. The admission callback requires provider `google`, a non-empty email, and `email_verified === true`.
4. Email normalization trims surrounding whitespace and applies locale-independent lowercase. It performs no dot, alias, or plus-tag rewriting.
5. Prisma looks up the unique normalized User email.
6. Only an existing `isActive = true` User is admitted. Unknown and inactive users receive the same external denial.
7. If the Google subject is already linked, its linked User must be the same admitted User; cross-link conflicts are denied. Otherwise Auth.js links the verified Google subject to the existing User and creates a database Session.
8. Successful login redirects to `/app`.

The Google provider enables email account linking only inside this constrained flow. The normally dangerous generic behavior is bounded by verified Google email, exact normalization, a unique pre-provisioned User, and the admission callback. The adapter's generic `createUser` operation is disabled as defense in depth, so authentication cannot become public registration.

No role is read or placed in the session. No ownership or permission lookup occurs.

## 4. Sessions and logout

- Google authentication uses the explicit `database` strategy. Only `AUTH_DEV_MODE=true` uses a JWT session because the Auth.js credentials provider does not support database sessions.
- Session inactivity maximum is 8 hours.
- Auth.js renewal is throttled to once every 15 minutes and extends an eligible active session to request time plus 8 hours.
- Each device receives an independent opaque session token. There is no uniqueness constraint on User ID, so multiple devices are supported.
- Session cookies are HTTP-only, host-only, `SameSite=Lax`, `Path=/`, and `Secure` when `NEXTAUTH_URL` uses HTTPS. Production HTTPS uses the `__Secure-` cookie prefix.
- Session resolution rechecks the current persisted User. Deleted Users lose sessions through database cascade. Inactive Users have all sessions removed when one is presented.
- Expired sessions are deleted and rejected.
- Logout uses Auth.js's CSRF-protected sign-out flow, deletes only the presented database session, expires the browser cookie, and redirects to `/login`.
- Protected authentication pages are dynamically rendered; authentication errors and configuration failures use `no-store` responses where directly controlled.

Auth.js owns OAuth state/correlation, callback validation, and sign-in/sign-out CSRF mechanics. Application code does not reproduce those protocols.

## 5. Routes and helpers

| Surface | Authentication behavior |
|---|---|
| `/login` | Shows Google login, or the two seeded identity buttons in local mode; an existing valid session redirects to `/app` |
| `/access-denied` | Shows generic unknown/inactive denial or temporary provider/callback message |
| `/app` | Authentication-only handoff page; requires an active session and exposes no application permission |
| `/api/auth/*` | Auth.js provider, callback, CSRF, session, sign-in, and sign-out endpoints |

Server helpers in `src/auth/index.ts` are:

- `auth()` — resolves the Auth.js database session;
- `currentUser()` — returns only authenticated identity fields (`id`, `name`, `email`, `image`); and
- `requireAuthentication()` — redirects unauthenticated requests to `/login`.

These helpers intentionally expose no `role`, capability, owner ID, Student, Transaction, Balance, or report data. They must not be treated as authorization helpers in the next sprint.

## 5.1 Local development authentication

`AUTH_DEV_MODE=true` replaces Google with one credentials provider whose only accepted emails are `DEV_SEED_ADMIN_EMAIL` and `DEV_SEED_OPERATOR_EMAIL`. The provider still requires a matching active, non-deleted database User. The login page renders explicit buttons for those identities; there is no arbitrary role or user-ID input.

The environment loader rejects development auth whenever `NODE_ENV=production`. With the switch absent or false, Google, verified-email admission, provider-subject binding, and database sessions are unchanged. Authorization continues to reload the active User and persisted role for every protected operation in both modes.

## 6. Failure behavior

| Failure | Result |
|---|---|
| Unknown or inactive email | Same friendly unregistered-account message; no session |
| Missing/unverified Google email | Access denied; no lookup-derived disclosure and no session |
| Google OAuth/callback failure | Friendly temporary/invalid-flow message with retry path |
| Deleted User | Database cascade removes sessions; subsequent request is unauthenticated |
| Inactive User with existing session | All that User's sessions are removed; request is unauthenticated |
| Expired session | Session is removed; `/app` redirects to `/login` |
| Invalid environment | Auth API returns generic 503 without configuration values |
| Database unavailable | Session/admission fails; Auth.js returns a generic authentication failure and creates no authorized session |

Authentication pages never display whether a specific unrelated email exists, provider tokens, session tokens, database errors, roles, or financial information.

## 7. Verification coverage

Automated tests cover successful registered-active admission; unknown/inactive parity; unverified/callback failure; independent multiple-device session creation; expiry deletion; inactive-account revocation; logout deletion and redirect; environment/HTTPS validation; and a real Prisma/SQLite adapter create-resolve-delete cycle. Full Google network authentication requires configured Google test credentials and the exact local callback URI.
