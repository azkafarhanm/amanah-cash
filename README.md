# Amanah Cash

Amanah Cash is a mobile-first Progressive Web App for managing funds entrusted to Students. The implemented platform provides Google authentication, centralized role and ownership authorization, Operator and Student management (including archiving Students who have left), the complete Transaction Engine, its Operator-facing financial UI, Student Financial History timeline, reports and exports, dashboards, Student profile photos, and centralized Rupiah formatting.

It runs in production on Vercel with a Neon PostgreSQL database. The current version is in `package.json` and what each release changed is in [CHANGELOG.md](CHANGELOG.md).

## Problem Statement

Entrusted student funds require fast daily recording without weakening financial traceability. Manually maintained balances can diverge from their underlying events, while broad financial systems add unnecessary workflow overhead.

## Solution

Operators record whole-Rupiah Deposit, Withdrawal, and Correction events after they occur; Amanah Cash does not connect to banking or payment gateways. The approved Transaction Engine atomically couples Transaction lifecycle state, persisted Student Balance, and immutable financial audit evidence.

## Core Principles

- Mobile-first PWA delivery.
- Fast input and minimal cognitive load.
- Audited financial lifecycle traceability.
- Intentionally small MVP scope.
- Simplicity over generality.
- Production-grade correctness and explicit failures.

See [Product Principles](docs/00-product-principles.md).

## Architecture Summary

```text
PWA Presentation → Server Application → Domain → Persistence → Relational Database
```

The MVP uses one Next.js application, one server boundary, and one relational database. Student is the aggregate root. Every Student belongs to exactly one active Operator, and current ownership scopes Operator access to the Student's complete financial record. The implementation persists `Student.balance`; every Transaction create/edit/soft-delete/restore updates Transaction state, Balance/version, and immutable audit in one atomic database transaction.

## MVP Scope

Included:

- Google-only authentication for active, pre-provisioned accounts.
- Centralized Platform Admin, Operator, and Student-ownership authorization.
- Platform Admin management of Operator accounts and Student assignments.
- Operator self-provisioning of Students ("+ Tambah Student") automatically bound to the active Operator session.
- Create, edit, list, search, filter, paginate, and view Students.
- Archive a Student who has left, once their balance is zero, and restore them. Archived Students leave everyday lists, the transaction picker, and dashboard counts; their history and past reports are kept. See BR-STU-008 in [Business Rules](docs/03-business-rules.md).
- Operator visibility limited to currently assigned Students.
- Read-only administrative and ownership-scoped operational dashboards with reusable summary and activity cards.
- Read-only administrative reports and ownership-scoped Operator financial reports with composable periods, summaries, sorting, pagination, and Student detail timelines.
- Authorized CSV, Excel, and PDF export of permitted currently filtered Admin or ownership-scoped Operator reports through the reusable Export Foundation, with configurable synchronous size guard rails.
- Responsive PWA operation and explicit interaction states.

Implemented financial engine scope:

- Record whole-IDR Deposits, Withdrawals, and reasoned Corrections.
- Edit, soft-delete, and restore Transactions with immutable actor/reason/before-after audit evidence.
- Persist non-negative Student Balance through atomic financial operations.
- View committed Balance, recent activity, Transaction count, filtered newest-first history, Notes, Operator, lifecycle status, and stable cursor pagination.
- Date-grouped Student Financial History timeline with Jakarta timezone categorization (today, yesterday, month/year).
- Debounced live search (350ms) supporting amount, notes, and operator matching.
- Complete Deposit, Withdrawal, Correction, edit, soft-delete, and restore workflows from mobile-first accessible dialogs.
- Ownership-scoped Financial Assurance reconciliation, immutable audit timeline reads, and lazy allow-listed Audit Detail rendered through the platform Context Detail Drawer for an Operator's currently assigned Student.

Excluded:

- Offline synchronization.
- Hard Transaction deletion and Student deletion. Database triggers refuse to delete Transactions and financial audit events; a Student who has left is archived instead.
- Transaction transfer, schedules, monthly allowance, categories, attachments, approval workflow, advanced export document styling, advanced analytics, notifications, and bulk operations remain unimplemented extension scope.
- Multiple currencies and distributed infrastructure.
- Audit-detail inspection is read-only and allow-listed; the timeline and drawer never expose raw snapshots or internal metadata.

Auth.js with Google and Database Sessions is implemented. Platform Admin provisions Operator identities; Amanah Cash owns roles, activation, and authorization. Platform Admin has no routine financial-data access.

Production runs on Vercel with Neon PostgreSQL. Local development can target either SQLite or PostgreSQL; the two share one schema contract, and tests assert that the financial integrity guards and audit constraints are present on both.

## Documentation Map

| Document | Purpose |
|----------|---------|
| [Product Principles](docs/00-product-principles.md) | Immutable product foundation |
| [Functional Requirements](docs/01-functional-requirements.md) | MVP capabilities |
| [Non-Functional Requirements](docs/02-non-functional-requirements.md) | Quality constraints |
| [Business Rules](docs/03-business-rules.md) | Authoritative rules |
| [Domain Model](docs/04-domain-model.md) | Entities and invariants |
| [User Flows](docs/05-user-flow.md) | Operator flows and states |
| [Wireframes](docs/06-wireframe.md) | Structured UI specification |
| [Database Design](docs/07-database-design.md) | Schema and integrity |
| [System Architecture](docs/08-system-architecture.md) | Technical responsibilities |
| [Development Roadmap](docs/09-development-roadmap.md) | Historical delivery sequence up to 2026-07-31; see its status note |
| [MVP Settings Specification](docs/21-mvp-settings-specification.md) | Approved appearance, preferences, Backup/Restore, Security, About, roles, states, and exclusions |
| [Landing Page Strategy](docs/22-landing-page-strategy.md) | Landing Page positioning, motion rules, and the recorded phone-aurora exception |
| [Landing Page Design & Content Specification](docs/56-landing-page-design-content-specification.md) | Public product narrative and experience specification |
| [Engineering Rules](docs/10-engineering-rules.md) | Contributor standards |
| [Development Workflow](docs/11-development-workflow.md) | Requirement-to-release workflow |
| [Authentication and Authorization TDS](docs/29-technical-design-authentication-authorization.md) | Implementation contract for identity, sessions, roles, and ownership |
| [Authentication Persistence Design](docs/30-authentication-persistence-design.md) | Prisma identity schema, ownership constraints, and migration decisions |
| [Authentication Implementation](docs/31-authentication-implementation.md) | Google admission, database sessions, routes, helpers, and environment contract |
| [Authorization Implementation](docs/32-authorization-implementation.md) | Central role and ownership enforcement |
| [Application Shell Architecture](docs/33-application-shell-architecture.md) | Authenticated shell and role navigation |
| [Operator Management Implementation](docs/34-operator-management-implementation.md) | Operator account lifecycle and audit behavior |
| [Student Management Implementation](docs/35-student-management-implementation.md) | Student lifecycle, assignment, and visibility |
| [Transaction, Balance, and Audit ADR](docs/36-adr-transaction-balance-and-audit.md) | Locked financial ownership, lifecycle, Balance, audit, and concurrency decisions |
| [Transaction Foundation TDS](docs/37-technical-design-transaction-foundation.md) | Implementation-ready Transaction Engine architecture, failures, security, reporting implications, diagrams, and extensions |
| [Transaction Engine Implementation](docs/38-transaction-engine-implementation.md) | Physical schema, atomic write protocol, APIs, migration policy, errors, and tests |
| [Transaction UI Implementation](docs/39-transaction-ui-implementation.md) | Financial overview, history, filters, forms, lifecycle dialogs, accessibility, and UI tests |
| [UX Polish and Placeholder Strategy](docs/40-ux-polish-and-placeholder-strategy.md) | Planned-feature placeholders, empty/loading/error state taxonomy, navigation consistency, mobile behavior, and accessibility |
| [Dashboard Implementation](docs/42-dashboard-implementation.md) | Dashboard read model, reusable cards, performance, authorization, privacy, and verification |
| [Reporting Foundation](docs/43-reporting-foundation.md) | Report read model, polished filters/states/summaries/tables, accessibility, ownership/privacy boundaries, performance, and export integration |
| [Export Foundation](docs/44-export-foundation.md) | Coordinator, documents, registry, CSV/Excel/PDF adapters, authorized endpoints, privacy boundaries, and presentation boundaries |
| [Export Production Readiness Review](docs/45-export-production-readiness-review.md) | Buffering and pagination behavior, filename policy, high-volume limits, consistency, and hardening gates |
| [Excel Export Foundation](docs/46-excel-export-foundation.md) | ExcelJS adapter, workbook layout, registry/HTTP integration, guard rails, tests, and deferred presentation work |
| [PDF Export Foundation](docs/47-pdf-export-foundation.md) | PDFKit adapter, document-derived layout, pagination, registry/HTTP integration, guard rails, and tests |
| [Financial Assurance Implementation](docs/48-financial-assurance-implementation.md) | Reconciliation, immutable audit reads, protected APIs, timeline UI, ownership/privacy boundaries, and verification |
| [Profile Photos Specification](docs/53-profile-photos-feature-specification.md) | Profile photo design, storage, rendering, and delivery phases |
| [WebGL Perimeter LED Specification](docs/54-webgl-perimeter-led-specification.md) | Production WebGL perimeter LED lighting, geometry/SDF math, motion, fallback, and acceptance |
| [Login Experience](docs/55-login-experience.md) | The login screen as implemented: lamp choreography, returning browsers, brand plaque and contrast, layout, known accessibility gaps |
| [Students Management Specification](docs/57-students-management-specification.md) | Visual reference for the Student list and detail screens |

AI assistants should begin with [AI_CONTEXT.md](AI_CONTEXT.md).

## Local Development

Prerequisites are Node.js 24 or newer, npm, and a configured SQLite or PostgreSQL database target. From a fresh clone, the default `.env.example` uses SQLite:

```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Open `http://localhost:3000/login`. The example configuration enables the explicit local-only authentication mode and provides buttons for these idempotently seeded identities:

| Seed | Default value | Purpose |
|---|---|---|
| Platform Admin | `admin@amanah-cash.example` | Exercises Operator and Student administration |
| Operator | `operator@amanah-cash.example` | Owns and manages the seeded Student's financial record |
| Student | `Development Student` | Active Student assigned to the seeded Operator |

`npm run db:setup` validates the environment, applies migrations for the configured target, and runs the development seed. SQLite uses the ordered files in `migrations/`; PostgreSQL uses Prisma Migrate with the direct migration URL when `DIRECT_URL` is configured. It is safe to rerun. Use `npm run env:check`, `npm run db:migrate`, or `npm run db:seed` when only one step is needed. The seed command refuses to run when `NODE_ENV=production`. `npm run dev` also applies pending migrations and regenerates the provider-specific Prisma client before starting Next.js; restart the development server after changing the Prisma schema because an already-running process retains its loaded client.

A production build never applies migrations. `npm run build` runs `npm run db:check` first, which fails the build when the configured PostgreSQL database is missing migrations the release expects. Apply them deliberately with `npx prisma migrate deploy` and build again. Set `DIRECT_URL` to the unpooled connection string so Prisma Migrate avoids the connection pooler.

### Environment variables

`.env.example` is the authoritative local template. Keep real values in the ignored `.env` file or in the deployment secret store.

| Variable | When required | Description |
|---|---|---|
| `DATABASE_URL` | Always | SQLite `file:` URL or PostgreSQL connection URL. The default stores SQLite under ignored `data/`. |
| `DIRECT_URL` | PostgreSQL migrations; optional otherwise | Direct, unpooled PostgreSQL URL used by Prisma Migrate. |
| `NEXTAUTH_SECRET` | Always | At least 32 characters. Generate a unique deployment value with `openssl rand -base64 32`; never deploy the local example. |
| `NEXTAUTH_URL` | Always | Exact application origin with no path, query, or fragment. Non-HTTPS is accepted only on loopback during development. |
| `AUTH_DEV_MODE` | Optional; defaults to `false` | Enables seeded local sign-in only outside production. A production process fails closed if this is `true`. |
| `GOOGLE_CLIENT_ID` | When `AUTH_DEV_MODE=false` | Google OAuth 2.0 Web application client ID. |
| `GOOGLE_CLIENT_SECRET` | When `AUTH_DEV_MODE=false` | Secret matching the Google client ID. |
| `EXPORT_MAX_ROWS` | Optional; defaults to `10000` | Positive synchronous export row guard rail; this is not a measured capacity guarantee. |
| `EXPORT_MAX_BYTES` | Optional | Positive estimated and final rendered-byte guard rail. |
| `BLOB_READ_WRITE_TOKEN` | Student photos | Vercel Blob token for the private Student photo store, used to upload and serve photos. |
| `DEV_SEED_ADMIN_EMAIL` | Development seed; local auth | Platform Admin seed email and local-auth allowlist entry. |
| `DEV_SEED_OPERATOR_EMAIL` | Development seed; local auth | Operator seed email and local-auth allowlist entry. |
| `DEV_SEED_STUDENT_NAME` | Development seed | Seeded Student name. |

Run `npm run env:check:production` before deployment qualification. It forces
production-mode validation of Google OAuth, HTTPS origin, server-only database
configuration, secrets, and export limits while redacting database location and
secret values.
See [Production Preflight](docs/49-production-preflight.md) for dependency review,
diagnostic evidence, remaining blockers, and Manual QA.

### Applying a migration to production

`npm run build` refuses to ship while the production database is behind, so a
release that adds a migration needs the migration applied **before** its pull
request is merged. In practice this has been done in the Neon SQL Editor on the
`amanah_cash` database: run the migration file from
`prisma/migrations_postgresql/<name>/migration.sql` together with an
`INSERT INTO "_prisma_migrations"` row whose `checksum` is the `sha256sum` of that
file, inside `BEGIN … COMMIT`, then verify before merging. Running
`npx prisma migrate deploy` against the production `DIRECT_URL` achieves the same.
A pull request preview built before the migration was applied fails that check by
design; redeploy it afterwards.

### Authentication Modes

#### Development (Default)

Uses local seeded accounts. No Google OAuth setup required.

```bash
npm run dev
```

Open `http://localhost:3000/login`. Two buttons appear:

- **Masuk sebagai admin@amanah-cash.example** — Platform Admin
- **Masuk sebagai operator@amanah-cash.example** — Operator

#### Google OAuth Testing

Create `.env.local` from `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Fill in:

| Variable | Source |
|----------|--------|
| `GOOGLE_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` |

Restart the dev server:

```bash
npm run dev
```

Open `http://localhost:3000/login`. The "Lanjutkan dengan Google" button appears.

The Google account email must match an active, pre-provisioned user in the database. Create one via `npm run db:seed` or the Admin Operator management screen.

#### Switching Between Modes

```bash
# Development mode (default)
rm -f .env.local && npm run dev

# Google OAuth mode
# (ensure .env.local exists with real credentials)
npm run dev
```

#### Verify Current Mode

```bash
npm run env:check
```

Output shows `authentication: local development` or `authentication: Google OAuth`.

### Google OAuth setup

To test the production authentication path locally:

1. In Google Cloud Console, select or create a project and configure the OAuth consent screen. Add the developers who will sign in as test users while the app is in testing status.
2. Under **APIs & Services → Credentials**, create an **OAuth client ID** with application type **Web application**.
3. Add `http://localhost:3000` as an authorized JavaScript origin.
4. Add the exact authorized redirect URI `http://localhost:3000/api/auth/callback/google`. If the local port changes, update both this URI and `NEXTAUTH_URL` to the same origin.
5. In `.env`, set `AUTH_DEV_MODE="false"`, fill `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, and change the seed emails to the exact Google test-account emails that should be admitted.
6. Run `npm run db:setup`, restart `npm run dev`, and use **Continue with Google** on `/login`.

Google login never creates application users. The verified Google email must match an active, pre-provisioned seed or admin-created account after trim/lowercase normalization. Only `openid email profile` scopes are requested. For deployment, register the exact HTTPS callback `${NEXTAUTH_URL}/api/auth/callback/google`; do not use wildcard callbacks.

Local authentication is deliberately separated from production: it uses only the two configured seed identities, requires an existing active database row, and switches to JWT sessions solely in non-production development mode. With `AUTH_DEV_MODE=false`—and always in production—the original Google-only admission checks and database sessions remain in force.

## UX State Model

Known roadmap routes render an explicit planned or in-development placeholder instead of a generic 404. Implemented modules use separate contextual states for empty data, no search results, loading, validation, permission denial, missing resources, and unexpected failures. Operator Student lists show ownership-scoped persisted Balance—including `Rp 0` with a no-transactions explanation—while Platform Admin remains unable to view financial data.

## Development Roadmap

The MVP is complete and in production. Delivered work, newest first, is in [CHANGELOG.md](CHANGELOG.md), which the app also shows under Settings → About. The original sprint plan is kept in [docs/09](docs/09-development-roadmap.md) as a historical record; no forward plan has been written since it.

Known limits that remain open: measured per-format export capacity and a streaming export path, advanced export document styling, backup and restore on the PostgreSQL production target (they work on SQLite only), and the login screen's reduced-motion and screen-reader gaps listed in [Login Experience](docs/55-login-experience.md) §8.

## Contributing

Contributions must trace to approved requirements, preserve atomic persisted-Balance reconciliation, controlled Transaction lifecycle, immutable audit, ownership/privacy boundaries, architecture layers, relevant verification, and synchronized documentation. Follow the [Engineering Rules](docs/10-engineering-rules.md) and [Development Workflow](docs/11-development-workflow.md).

Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run prisma:validate`, and `npm run build` before handing off a change. Keep `AI_CONTEXT.md` and the relevant implementation documentation in step with it.

`npm test` regenerates the Prisma client for SQLite into `src/generated/prisma`, the same folder the PostgreSQL client uses. If your local database is PostgreSQL, run `npx prisma generate` (or `npm run typecheck`) after the tests, before using the dev server again.

## License

License information has not yet been specified.
