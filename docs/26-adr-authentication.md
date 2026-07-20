# ADR-001 — Authentication with Auth.js and Google

**Status:** Accepted
**Date:** 2026-07-20
**Owner:** Project Owner

## Context

Amanah Cash requires an authenticated entry at `/login` before a person may enter the protected application at `/app`. Authentication verifies identity only; Amanah Cash remains authoritative for access and permissions.

## Decision

- Use Auth.js with the Database Session Strategy.
- Use Google as the only authentication provider.
- `/` remains the public Landing Page, `/login` is the authentication entry, and `/app` is the protected application entry.
- A successful Google authentication is accepted only when the normalized Google email exactly matches an active Amanah Cash user provisioned by a Platform Admin.
- An unregistered or inactive email is denied without starting an authorized application session.
- The denied state uses friendly Bahasa Indonesia copy equivalent to: `Akun Anda belum terdaftar. Silakan hubungi Administrator Platform.`
- The pre-provisioned Amanah Cash user is the authorization record. Provider identity/profile linkage may be created on first successful login when required by the approved Auth.js adapter.
- There is no email-and-password authentication, public registration, Sign Up, Forgot Password, or password reset.
- Google verifies identity; it does not assign Amanah Cash roles or Student access.

## Authentication Flow

```text
Landing Page (/)
       ↓
Login (/login)
       ↓
Google authentication
       ↓
Match normalized Google email to active provisioned user
       ├── match → create session → /app
       └── no match/inactive → Access Denied
```

An authenticated visitor to `/login` proceeds to `/app`. An unauthenticated or expired-session request for `/app` proceeds to `/login`. Logout invalidates the database session before returning the person to `/`.

## Security Consequences

- Server-side session validation protects `/app` and every protected operation.
- Auth.js owns provider-protocol and CSRF protections; application code must not bypass them.
- Redirects are restricted to approved same-origin destinations.
- Session cookies are HTTP-only, secure in production, and configured with an explicit same-site policy during implementation.
- Authentication errors do not disclose provider tokens, session tokens, database details, or whether an unrelated email exists.

## Consequences

- Google availability is an authentication dependency.
- Platform Admin provisioning is required before first login.
- Password storage and password-recovery features are prohibited.
- Package versions, cookie lifetimes, physical schema, initial Platform Admin bootstrap, and deployment secrets remain implementation contracts and require review before code is introduced.
