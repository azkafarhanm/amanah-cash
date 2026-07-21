# Amanah Cash

Amanah Cash is a mobile-first Progressive Web App for managing funds entrusted to Students. The implemented platform provides Google authentication, centralized role and ownership authorization, Operator and Student management, the complete Transaction Engine, and its Operator-facing financial UI.

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
- Create, edit, list, search, filter, paginate, and view Students.
- Operator visibility limited to currently assigned Students.
- Responsive PWA operation and explicit interaction states.

Implemented financial engine scope:

- Record whole-IDR Deposits, Withdrawals, and reasoned Corrections.
- Edit, soft-delete, and restore Transactions with immutable actor/reason/before-after audit evidence.
- Persist non-negative Student Balance through atomic financial operations.
- View committed Balance, recent activity, Transaction count, filtered newest-first history, Notes, Operator, lifecycle status, and stable cursor pagination.
- Complete Deposit, Withdrawal, Correction, edit, soft-delete, and restore workflows from mobile-first accessible dialogs.

Excluded:

- Offline synchronization.
- Hard Transaction deletion and Student deletion.
- Transaction transfer, schedules, monthly allowance, categories, attachments, approval workflow, Reports, Export, analytics, notifications, and bulk operations remain unimplemented extension scope.
- Multiple currencies and distributed infrastructure.
- Financial-audit read presentation and reconciliation tooling remain future milestones.

Auth.js with Google and Database Sessions is implemented. Platform Admin provisions Operator identities; Amanah Cash owns roles, activation, and authorization. Platform Admin has no routine financial-data access. SQLite remains the current approved persistence target, while production deployment decisions remain deferred to the Deployment phase.

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
| [Development Roadmap](docs/09-development-roadmap.md) | Nine delivery milestones |
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
| [MVP QA Report](docs/41-mvp-quality-assurance-report.md) | Executed workflow matrix, defects, regression evidence, limitations, and release recommendation |

AI assistants should begin with [AI_CONTEXT.md](AI_CONTEXT.md).

## Local Development

Prerequisites are Node.js 24 or newer, npm, and a local SQLite-compatible environment. From a fresh clone:

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

`npm run db:setup` validates the environment, applies all ordered SQLite migrations, and runs the development seed. It is safe to rerun. Use `npm run env:check`, `npm run db:migrate`, or `npm run db:seed` when only one step is needed. The seed command refuses to run when `NODE_ENV=production`.

### Environment variables

`.env.example` is the authoritative local template. Keep real values in the ignored `.env` file or in the deployment secret store.

| Variable | When required | Description |
|---|---|---|
| `DATABASE_URL` | Always | SQLite `file:` URL. The default stores the database under ignored `data/`. |
| `NEXTAUTH_SECRET` | Always | At least 32 characters. Generate a unique deployment value with `openssl rand -base64 32`; never deploy the local example. |
| `NEXTAUTH_URL` | Always | Exact application origin with no path, query, or fragment. Non-HTTPS is accepted only on loopback during development. |
| `AUTH_DEV_MODE` | Optional; defaults to `false` | Enables seeded local sign-in only outside production. A production process fails closed if this is `true`. |
| `GOOGLE_CLIENT_ID` | When `AUTH_DEV_MODE=false` | Google OAuth 2.0 Web application client ID. |
| `GOOGLE_CLIENT_SECRET` | When `AUTH_DEV_MODE=false` | Secret matching the Google client ID. |
| `DEV_SEED_ADMIN_EMAIL` | Development seed; local auth | Platform Admin seed email and local-auth allowlist entry. |
| `DEV_SEED_OPERATOR_EMAIL` | Development seed; local auth | Operator seed email and local-auth allowlist entry. |
| `DEV_SEED_STUDENT_NAME` | Development seed | Seeded Student name. |

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

Project Foundation, Student Management, authentication, authorization, App Shell, Operator Management, the Transaction Engine, Transaction UI, developer onboarding, UX Polish, and the MVP QA sprint are complete. The current recommendation is **READY WITH MINOR LIMITATIONS**; the next bounded product sprint remains ownership-scoped reconciliation and financial-audit reads, while deployment-environment qualification remains Milestone 9.

## Contributing

Contributions must trace to approved requirements, preserve atomic persisted-Balance reconciliation, controlled Transaction lifecycle, immutable audit, ownership/privacy boundaries, architecture layers, relevant verification, and synchronized documentation. Follow the [Engineering Rules](docs/10-engineering-rules.md) and [Development Workflow](docs/11-development-workflow.md).

Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run prisma:validate`, and `npm run build` before handing off an implementation sprint. Every sprint must also synchronize `AI_CONTEXT.md` and relevant implementation documentation.

## License

License information has not yet been specified.
