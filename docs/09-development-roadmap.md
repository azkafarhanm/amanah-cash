# Amanah Cash — Executable Engineering Roadmap

**Version:** 2.3
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-29

---

## 1. Purpose

This document is the authoritative implementation sequence for Amanah Cash. It
records completed delivery, identifies the next executable batch, and separates
implementation-ready work from work that still needs an owner decision or a
separate architecture approval.

An engineer or AI agent must select work from this document without inferring a
new feature from placeholders, extension points, or marketing copy.

## 2. Execution Rules

1. The next implementation target is the first Batch, in document order, whose
   Status is `READY FOR IMPLEMENTATION`.
2. Only one Batch may be `READY FOR IMPLEMENTATION` at a time.
3. Complete and verify that Batch before changing the next eligible Batch to
   `READY FOR IMPLEMENTATION`.
4. A `BLOCKED` Batch must name the missing decision, environment, or dependency.
   Do not implement around the blocker.
5. An `ON HOLD` Batch is outside the currently approved implementation sequence.
   It requires explicit scope or architecture approval before its status changes.
6. Preserve exact whole-Rupiah arithmetic, persisted-Balance reconciliation,
   immutable audit, current Student ownership, Platform Admin financial privacy,
   and the approved Presentation → Application → Domain → Persistence dependency
   direction.
7. Reuse existing Design Tokens before proposing a new token. A new token is
   permitted only when the existing semantic and component vocabulary cannot
   express the required meaning.
8. Every completed implementation Batch must update its Status here and
   synchronize `AI_CONTEXT.md`, `CHANGELOG.md`, and affected implementation
   documentation.
9. No Batch may add offline financial mutation, hard deletion, password
   authentication, public registration, direct client database access, or
   unapproved distributed infrastructure.

Allowed Status values:

- `COMPLETE`
- `READY FOR IMPLEMENTATION`
- `BLOCKED`
- `ON HOLD`

## 3. Current Progress

The repository is complete through Sprint 3, Epic 3, Batch 4. The implemented
system includes the application foundation, authentication and authorization,
Operator and Student management, the complete Transaction lifecycle, persisted
Balance and immutable audit, dashboards, reports, bounded CSV/Excel/PDF export,
the Transaction Workspace, reconciliation, the Financial Audit Timeline, and
the read-only Audit Detail Drawer.

Repository Production Preflight is complete. Direct Auth.js, Next.js, and Prisma
advisories with supported patch releases were remediated; production
configuration validation and redacted operational diagnostics are implemented.
The release recommendation remains `READY WITH MINOR LIMITATIONS`. Deployment
qualification is not part of the current MVP feature-development phase and is
held in Release Sprint R1. The next approved unfinished MVP feature is
server-validation form recovery for Admin Student and Operator create/edit
workflows, as required by the approved validation and error-handling contracts.

## 4. Sprint 0 — Product and Application Foundation

**Sprint Goal:** Establish the approved mobile-first PWA, layered application,
relational persistence, identity boundary, and core administrative capabilities.

**Status:** `COMPLETE`

### Epic 0.1 — Project Foundation

**Objective:** Create the runnable Next.js PWA shell, local SQLite persistence,
schema migration path, shared presentation foundation, and test baseline.

**Status:** `COMPLETE`

#### Batch 0.1.1 — Bootstrap and Landing Foundation

**Objective:** Deliver the application shell, landing route, metadata, local
font, PWA assets, approved Design Tokens, and reusable UI primitives.

**Dependencies:** Approved requirements, architecture, wireframes, and Design
System.

**Affected modules:** `src/app`, `src/components/ui`, `src/app/globals.css`,
`public`, Prisma configuration, migration scripts, foundation tests.

**Acceptance Criteria:**

- The application builds and launches as one Next.js deployable.
- PWA metadata and service-worker registration are present.
- Visual values resolve through approved Design Tokens.
- The local SQLite schema and ordered migration runner work from a fresh setup.

**Status:** `COMPLETE`

### Epic 0.2 — Authentication, Authorization, and App Shell

**Objective:** Admit only provisioned active users and enforce role and current
Student ownership at server boundaries.

**Status:** `COMPLETE`

#### Batch 0.2.1 — Google Authentication and Database Sessions

**Objective:** Implement Google-only Auth.js admission, database sessions,
provisioned-user checks, logout, and isolated development authentication.

**Dependencies:** Batch 0.1.1 and approved authentication architecture.

**Affected modules:** `src/auth`, Auth.js routes, persistence schema/migrations,
login presentation, authentication tests.

**Acceptance Criteria:**

- Production authentication uses Google only and database sessions.
- Unknown, inactive, or deleted users fail closed.
- Secrets and financial data never enter client-visible session state.
- Development authentication remains isolated from production behavior.

**Status:** `COMPLETE`

#### Batch 0.2.2 — Central Authorization and Role-Aware Shell

**Objective:** Centralize Admin, Operator, and Student-owner policies and render
the authenticated role-aware application shell.

**Dependencies:** Batch 0.2.1.

**Affected modules:** `src/authorization`, protected route groups, App Shell,
navigation, authorization tests.

**Acceptance Criteria:**

- Protected pages, APIs, and Server Actions reuse centralized policies.
- Operator financial access is restricted to currently owned Students.
- Platform Admin has no routine financial-data bypass.
- Unauthorized, forbidden, missing, and unexpected states are distinct.

**Status:** `COMPLETE`

### Epic 0.3 — Administrative Management

**Objective:** Deliver Operator and Student lifecycle management with assignment
integrity and privacy-minimized audit.

**Status:** `COMPLETE`

#### Batch 0.3.1 — Operator Management

**Objective:** Implement Admin Operator provisioning, search, detail, editing,
activation, deactivation, logical deletion, and assignment safety.

**Dependencies:** Batch 0.2.2.

**Affected modules:** `src/operators`, Admin Operator routes/components,
Operator audit persistence, tests.

**Acceptance Criteria:**

- Operator lifecycle operations enforce documented validation and restrictions.
- Assigned Operators cannot be deactivated or logically deleted.
- Identity and audit history are retained.
- Admin list/search/pagination and explicit UI states are implemented.

**Status:** `COMPLETE`

#### Batch 0.3.2 — Student Management and Ownership Transfer

**Objective:** Implement Student create/edit/search/lifecycle behavior, required
active Operator assignment, reassignment, and ownership-scoped Operator reads.

**Dependencies:** Batches 0.2.2 and 0.3.1.

**Affected modules:** `src/students`, Admin and Operator Student routes/components,
ownership-transfer audit, persistence constraints, tests.

**Acceptance Criteria:**

- Student names use one normalized case-insensitive uniqueness representation.
- Every Student has one valid active Operator owner.
- Reassignment requires a reason and atomically appends
  `OWNERSHIP_TRANSFER` evidence.
- Current ownership immediately controls Operator visibility.

**Status:** `COMPLETE`

#### Batch 0.3.3 — Operator Student Self-Provisioning

**Objective:** Allow an authenticated Operator to create a Student bound to the
server-derived Operator identity.

**Dependencies:** Batch 0.3.2.

**Affected modules:** Student service/actions, Operator Student presentation,
Operator audit migration, tests.

**Acceptance Criteria:**

- Client input cannot select or spoof the owning Operator.
- Creation appends the approved `STUDENT_CREATE` Operator audit.
- The created Student is immediately available for transaction entry.

**Status:** `COMPLETE`

## 5. Sprint 1 — Financial MVP and Read-Only Operations

**Sprint Goal:** Deliver the complete atomic Transaction lifecycle and the
read-only operational surfaces that consume authoritative financial data.

**Status:** `COMPLETE`

### Epic 1.1 — Transaction Foundation

**Objective:** Implement exact-IDR financial writes, persisted Balance,
controlled lifecycle, safe retry, and immutable audit as one atomic engine.

**Status:** `COMPLETE`

#### Batch 1.1.1 — Transaction Engine

**Objective:** Implement Deposit, Withdrawal, directional Correction, edit,
soft delete, restore, Balance/version updates, and immutable audit.

**Dependencies:** Sprint 0 and approved ADR-004/TDS.

**Affected modules:** `src/transactions`, Prisma schema/migrations, SQLite write
adapter, protected Transaction APIs, engine tests.

**Acceptance Criteria:**

- Every financial mutation atomically commits Transaction, Balance/version, and
  audit or commits none of them.
- Whole-Rupiah, non-negative Balance, revision, status, and ownership rules pass.
- `BEGIN IMMEDIATE` serialization and command idempotency prevent duplicate or
  conflicting effects.
- Hard delete and direct Balance mutation do not exist.

**Status:** `COMPLETE`

#### Batch 1.1.2 — Student Financial Experience

**Objective:** Present persisted Balance, progressive newest-first history, and
every approved Transaction lifecycle action on Operator Student Detail.

**Dependencies:** Batch 1.1.1.

**Affected modules:** Transaction read service, Operator Student Detail,
Transaction dialogs/components, presentation formatters, tests.

**Acceptance Criteria:**

- Balance is read from persisted Student state, never calculated from a page.
- History pagination uses the stable server cursor.
- Create/edit/delete/restore interactions expose explicit loading, validation,
  error, retry, and success states.
- Mobile, keyboard, focus, and touch-target contracts pass.

**Status:** `COMPLETE`

### Epic 1.2 — Operational Read Surfaces

**Objective:** Provide privacy-safe dashboards, reports, and bounded exports
without changing financial write behavior.

**Status:** `COMPLETE`

#### Batch 1.2.1 — Dashboard and Analytics Foundation

**Objective:** Deliver bounded Admin operational aggregates and ownership-scoped
Operator financial summaries/activity.

**Dependencies:** Batch 1.1.2 and centralized authorization.

**Affected modules:** `src/dashboard`, dashboard components/routes, tests.

**Acceptance Criteria:**

- Admin dashboard contains no financial data.
- Operator metrics are scoped by authenticated Operator ID.
- Persisted Balance is used directly.
- Empty, loading, responsive, and failure states are implemented.

**Status:** `COMPLETE`

#### Batch 1.2.2 — Reporting Foundation

**Objective:** Deliver privacy-safe Admin activity reports and ownership-scoped
Operator financial reports with server filtering and pagination.

**Dependencies:** Batch 1.2.1 and authoritative financial reads.

**Affected modules:** `src/reports`, report routes/components, tests.

**Acceptance Criteria:**

- Reporting reads remain read-only and authorization-scoped.
- Filters, sorting, Jakarta periods, summaries, and pagination are server-owned.
- Admin reports exclude financial data.
- Exact Balance evidence is shown only from authorized persisted audit evidence.

**Status:** `COMPLETE`

#### Batch 1.2.3 — CSV, Excel, and PDF Export Foundation

**Objective:** Export the complete authorized filtered report through a
Reporting-read-only coordinator and presentation adapters.

**Dependencies:** Batch 1.2.2.

**Affected modules:** Export coordinator/registry/documents/adapters, export API
routes, report export presentation, tests.

**Acceptance Criteria:**

- Export adapters do not query Prisma or recalculate financial meaning.
- Operator scope is forwarded on every Reporting page read.
- CSV, Excel, and PDF share centralized row/optional-byte guard rails.
- Oversized requests fail with controlled `413`; filenames contain no personal
  data or internal identifiers.

**Status:** `COMPLETE`

### Epic 1.3 — Transaction Workspace

**Objective:** Provide one ownership-scoped multi-Student operational stream and
fast consecutive transaction entry.

**Status:** `COMPLETE`

#### Batch 1.3.1 — Workspace Read Service and API

**Objective:** Add the authorized multi-Student transaction stream and
server-computed daily cash summary.

**Dependencies:** Batch 1.1.1.

**Affected modules:** Transaction read service, Operator workspace API, tests.

**Acceptance Criteria:**

- Every result is scoped by the authenticated Operator.
- Cursor pagination and filters are server-owned.
- Daily summary values come from authoritative reads.

**Status:** `COMPLETE`

#### Batch 1.3.2 — Workspace Presentation and Filters

**Objective:** Deliver responsive stream presentation, operational filters,
metrics, pagination, and contextual states.

**Dependencies:** Batch 1.3.1.

**Affected modules:** Transaction Workspace components/routes/styles, tests.

**Acceptance Criteria:**

- Desktop table and mobile cards expose the same authorized records.
- Filters synchronize with URL SearchParams and refetch server results.
- Client code does not recalculate financial totals.

**Status:** `COMPLETE`

#### Batch 1.3.3 — Consecutive Entry and Inline Lifecycle Actions

**Objective:** Enable rapid multi-Student transaction entry and inline
edit/delete/restore from the workspace.

**Dependencies:** Batch 1.3.2 and existing Transaction Engine commands.

**Affected modules:** Workspace Student picker, Transaction dialog, table/cards,
feedback presentation, tests.

**Acceptance Criteria:**

- Consecutive entry preserves only approved local form preferences.
- Every mutation reuses existing protected Transaction commands.
- Successful mutations refresh authoritative workspace data.

**Status:** `COMPLETE`

## 6. Sprint 2 — Financial UX and Quality

**Sprint Goal:** Improve financial comprehension and interaction efficiency
without changing domain, persistence, authorization, or ownership behavior.

**Status:** `COMPLETE`

### Epic 2.1 — Student History and Search Experience

**Objective:** Standardize financial presentation and make history discovery
fast and predictable.

**Status:** `COMPLETE`

#### Batch 2.1.1 — Timeline and Currency Standardization

**Objective:** Add Jakarta date-grouped Student history and establish centralized
Rupiah/date/transaction presentation formatting.

**Dependencies:** Sprint 1 financial reads.

**Affected modules:** Student timeline, `src/presentation/formatting.ts`,
financial components, tests.

**Acceptance Criteria:**

- Timeline grouping uses documented Jakarta date semantics.
- All financial surfaces reuse centralized formatters.
- Presentation changes do not alter financial calculations.

**Status:** `COMPLETE`

#### Batch 2.1.2 — Search, Filter, and Interaction Polish

**Objective:** Add protected debounced search, URL-synchronized controlled
filters, Correction clarity, and consistent pointer/disabled behavior.

**Dependencies:** Batch 2.1.1.

**Affected modules:** Report and Transaction filter components/styles, tests.

**Acceptance Criteria:**

- Search waits 350 ms and stale requests cannot win.
- Filter controls and URLs remain synchronized.
- Reset, enabled, and disabled interactions are visually and semantically clear.

**Status:** `COMPLETE`

### Epic 2.2 — MVP Quality Assurance

**Objective:** Verify the complete business workflow and remediate confirmed
defects without expanding scope.

**Status:** `COMPLETE`

#### Batch 2.2.1 — Workflow Validation and Regression Fixes

**Objective:** Execute the approved authentication, ownership, financial,
responsive, database, and release test matrix and fix verified defects.

**Dependencies:** All Sprint 1 capabilities.

**Affected modules:** Cross-application tests and the minimal modules implicated
by confirmed defects.

**Acceptance Criteria:**

- Static, migration, automated, isolated HTTP, reconciliation, and integrity
  checks pass.
- Every fixed defect has regression coverage.
- No unresolved defect permits unauthorized financial access, negative Balance,
  duplicate effect, lost audit, or hard deletion.

**Status:** `COMPLETE`

## 7. Sprint 3 — Reports, Export, and Financial Assurance

**Sprint Goal:** Improve read-only financial review, export interaction, and
Operator trust evidence without widening financial access or mutation scope.

**Status:** `COMPLETE`

### Epic 3.1 — Reports Enhancement

**Objective:** Improve report discovery and interpretation using the existing
Reporting Read Service.

**Status:** `COMPLETE`

#### Batch 3.1.1 — Report Search, Context, Sorting, and Audit Disclosure

**Objective:** Add cancellable debounced search, applied-filter context,
table-heading sorting, net-movement-first summaries, and compact audit evidence.

**Dependencies:** Batch 1.2.2.

**Affected modules:** Report components/styles and tests.

**Acceptance Criteria:**

- Newest search wins and canceled work cannot navigate.
- Filter/result context describes the currently authorized result.
- Reporting calculations, URLs, reads, and authorization remain unchanged.

**Status:** `COMPLETE`

### Epic 3.2 — Export Experience

**Objective:** Add reliable browser-side feedback around the existing bounded
export endpoints and simplify operational document presentation.

**Status:** `COMPLETE`

#### Batch 3.2.1 — Export Interaction and Document Refinement

**Objective:** Provide per-format preparing/success/failure/Retry states and
parent-readable CSV/Excel/PDF columns.

**Dependencies:** Batch 1.2.3.

**Affected modules:** Report export components, export document/adapters, tests.

**Acceptance Criteria:**

- Duplicate activation and stale attempt updates are prevented.
- The server filename and media content are preserved.
- Operational files retain only approved parent-readable columns.
- Export limits, endpoints, authorization, coordinator, and Reporting reads are
  unchanged.

**Status:** `COMPLETE`

### Epic 3.3 — Financial Assurance

**Objective:** Let an Operator verify persisted Balance and inspect allow-listed
immutable audit evidence for a currently owned Student.

**Status:** `COMPLETE`

#### Batch 3.3.1 — Reconciliation Read Boundary

**Objective:** Compare persisted Balance with active Transaction effects without
repairing a mismatch.

**Dependencies:** Transaction Engine and authoritative financial reads.

**Affected modules:** `src/financial-assurance/read-service.ts`, protected
reconciliation route, reconciliation presentation, tests.

**Acceptance Criteria:**

- Reconciliation is snapshot-consistent and read-only.
- Cross-owner and missing Student resources are masked consistently.
- Mismatch is reported as an integrity incident and never silently repaired.

**Status:** `COMPLETE`

#### Batch 3.3.2 — Immutable Audit Read Service and Protected API

**Objective:** Expose ownership-scoped timeline/detail DTOs with opaque cursors
and supported-schema allow-listed projection.

**Dependencies:** Batch 3.3.1 and immutable audit persistence.

**Affected modules:** Financial audit read service, protected API routes, tests.

**Acceptance Criteria:**

- APIs are Operator-only, ownership-scoped, private, and no-store.
- Raw snapshots and ORM models never cross the read boundary.
- Unsupported schemas return a typed unavailable result.

**Status:** `COMPLETE`

#### Batch 3.3.3 — Financial Audit Timeline

**Objective:** Present semantic audit events with filters, explicit states, and
opaque-cursor progressive loading.

**Dependencies:** Batch 3.3.2.

**Affected modules:** Financial Audit Timeline components/styles, reconciliation
page integration, tests.

**Acceptance Criteria:**

- The client appends later pages and forwards cursors unchanged.
- No financial calculation or schema decoding occurs in Presentation.
- Loading, empty, error/Retry, and focus-after-append behavior are explicit.

**Status:** `COMPLETE`

#### Batch 3.3.4 — Audit Detail Drawer

**Objective:** Lazily present allow-listed audit detail in the reusable platform
Context Detail Drawer.

**Dependencies:** Batches 3.3.2 and 3.3.3.

**Affected modules:** Context Detail Drawer, Financial Audit detail/timeline
components, shared UI exports, styles, tests.

**Acceptance Criteria:**

- Detail loads only after selection through the protected endpoint.
- Successful results are page-cached and concurrent requests are deduplicated.
- Native modal, responsive, focus restoration, loading, error/Retry, reduced
  motion, and unsupported-schema states pass.
- Raw snapshots, internal identifiers, actor metadata, and client schema
  decoding are absent.

**Status:** `COMPLETE`

## 8. Sprint 4 — MVP Completion and Repository Readiness

**Sprint Goal:** Close approved repository-local MVP gaps without beginning
deployment qualification or expanding product scope.

**Status:** `COMPLETE`

### Epic 4.1 — Repository Production Preflight

**Objective:** Close repository-local production risks that do not depend on a
selected hosting vendor, external database, or physical-device lab.

**Status:** `COMPLETE`

#### Batch 4.1.1 — Dependency, Configuration, and Diagnostic Preflight

**Objective:** Produce a clean, reproducible production preflight by reviewing
runtime dependency advisories, validating production configuration contracts,
and verifying that production failures remain diagnostic to operators without
disclosing secrets or internals.

**Dependencies:** Sprint 3 complete; existing local release commands and
`.env.example`.

**Affected modules:** `package.json` and lockfile only if a safe advisory fix is
required; environment loaders; production error boundaries and logging adapters
only where a verified defect exists; `.env.example`; deployment/configuration
documentation; focused tests.

**Acceptance Criteria:**

- Runtime dependency advisories are reviewed; every unresolved high/critical
  advisory is either safely remediated or recorded as a blocker with package,
  impact, and required decision.
- Required production environment variables, validation, secret boundaries, and
  Google OAuth callback requirements are accurate and reproducible from
  repository documentation.
- Production-safe error behavior is verified for authentication, database
  connectivity, migration, protected routes, and export-limit failures; no
  secret, token, SQL detail, stack trace, or financial payload is exposed.
- `npm test`, `npm run typecheck`, `npm run lint`,
  `npm run prisma:validate`, `npm run build`, and `git diff --check` pass.
- No hosting vendor, external database, streaming, queue, or new product feature
  is introduced.
- `AI_CONTEXT.md`, `CHANGELOG.md`, and affected operational documentation are
  synchronized with evidence and remaining blockers.

**Status:** `COMPLETE`

### Epic 4.2 — Validation Interaction Completion

**Objective:** Close the documented MVP interaction gap in administrative forms
without changing Operator or Student Domain rules.

**Status:** `COMPLETE`

#### Batch 4.2.1 — Admin Form Validation Recovery

**Objective:** Keep Admin Student and Operator create/edit validation failures in
the current form interaction, preserve every still-valid submitted field, and
associate actionable inline errors with the affected controls.

**Dependencies:** Completed Operator Management and Student Management services,
centralized Admin authorization, existing validation outcomes, shared form and
error-state conventions.

**Affected modules:** Admin Operator and Student create/edit Server Actions and
form presentation under `src/app/(app)/(admin)/admin/operators` and
`src/app/(app)/(admin)/admin/students`; focused Operator/Student presentation and
action tests; affected implementation documentation.

**Acceptance Criteria:**

- A server-rejected create or edit remains on the same logical form instead of
  redirecting through query-string error transport.
- Name, email, Operator assignment, status, notes, ownership-transfer reason,
  and other submitted fields retain their submitted value when that value is
  still valid for correction.
- Field-specific validation messages render inline, are programmatically
  associated with their controls, and the error summary or first invalid field
  receives focus according to the existing accessibility contract.
- Duplicate-name/email, inactive-Operator, required transfer-reason, malformed
  input, authorization, not-found, and unexpected failures retain their current
  authoritative server outcomes and privacy behavior.
- Successful create/edit navigation and notices remain unchanged.
- No submitted form values or validation payloads are placed in URLs, logs,
  cookies, or persistent client storage.
- Operator/Student Domain validation, persistence, ownership transfer audit,
  authorization, and financial-data boundaries remain unchanged.
- Automated tests cover create and edit recovery for both resource types,
  preserved valid values, corrected resubmission, focus/error association,
  successful completion, and absence of query-string form payloads.

**Status:** `COMPLETE`

## 9. Sprint R1 — Release and Deployment Qualification

**Sprint Goal:** Qualify and release the completed MVP in a selected production
environment without expanding product scope or weakening financial,
authorization, privacy, and export boundaries.

**Status:** `ON HOLD`

Release Sprint R1 begins only after the Product Owner declares MVP feature
development complete. Its environment decisions are intentionally not blockers
for Sprint 4 feature delivery.

### Epic R1.1 — Deployment Baseline and Topology

**Objective:** Select and document the production environment, resource
envelope, database topology, backup/restore policy, OAuth registration, and
Platform Admin bootstrap procedure.

**Status:** `ON HOLD`

#### Batch R1.1.1 — Deployment Environment Decision

**Objective:** Convert the approved one-client/one-server/one-relational-database
architecture into a concrete production topology and qualification baseline.

**Dependencies:** MVP feature development declared complete; Batch 4.1.1
complete; Product Owner resumes Release Sprint R1.

**Affected modules:** Deployment configuration, environment contract,
migration/rollback scripts if required by the selected environment, operational
documentation, deployment verification tests.

**Acceptance Criteria:**

- Hosting/runtime, region, resource limits, process count, and persistent storage
  are explicitly selected.
- The database remains server-only and the topology preserves the approved
  financial serialization guarantees.
- Backup, restore, migration, rollback, secret management, Google OAuth callback,
  and Platform Admin bootstrap procedures are documented and rehearsable.
- Supported browser versions, target devices, network latency, and production
  data-volume baselines are approved.

**Status:** `ON HOLD`

**Decisions deferred to the Release Sprint:**

- Production hosting/runtime and region.
- Single-process SQLite with durable storage versus another relational database.
- Resource envelope, backup retention, restore objective, and secret manager.
- Production Google OAuth origins/callbacks and Platform Admin bootstrap owner.
- Supported-browser/device/network/data-volume baseline.

### Epic R1.2 — Deployment Qualification

**Objective:** Deploy the selected topology and verify migrations, authentication,
PWA behavior, accessibility, diagnostics, backup/restore, and operational safety.

**Status:** `ON HOLD`

#### Batch R1.2.1 — Staging Deployment and Recovery Verification

**Objective:** Execute a production-like deployment, migration, rollback, backup,
restore, Google OAuth, and failure-diagnostic rehearsal.

**Dependencies:** Batch R1.1.1 complete and access to the selected environment.

**Affected modules:** Deployment manifests/configuration, migration tooling,
operational runbooks, environment-specific verification.

**Acceptance Criteria:**

- A clean environment deploys the server/PWA and schema reproducibly.
- Migration, rollback, backup, and restore procedures are executed and recorded.
- Database access is restricted to the server boundary.
- Live Google OAuth admits only provisioned active users.
- Operator-safe failure messages and server-side diagnostics are verified.

**Status:** `ON HOLD`

#### Batch R1.2.2 — Physical Device, PWA, and Accessibility Qualification

**Objective:** Close the remaining release-browser, mobile viewport, standalone
PWA, screen-reader, keyboard, and 200% zoom gates.

**Dependencies:** Batch R1.2.1 and the approved browser/device matrix.

**Affected modules:** Presentation components/styles only for confirmed defects;
PWA metadata/assets; qualification evidence and regression tests.

**Acceptance Criteria:**

- Approved mobile browsers verify 320–480 px operation and 44 px touch targets.
- Installability and standalone launch pass on supported platforms.
- Keyboard, focus, native dialog/drawer, screen-reader announcements, and 200%
  zoom pass the approved matrix.
- Network failure is explicit and no offline Transaction is queued.
- Confirmed defects are fixed with regression coverage; no speculative redesign
  is introduced.

**Status:** `ON HOLD`

### Epic R1.3 — Export Capacity Qualification

**Objective:** Establish measured, deployment-specific service limits for the
existing synchronous CSV, Excel, and PDF exporters.

**Status:** `ON HOLD`

#### Batch R1.3.1 — Representative Export Benchmark

**Objective:** Measure small, normal, 30,000-row, and 100,000-row representative
datasets in the selected deployment environment without claiming unsupported
large-volume generation.

**Dependencies:** Batch R1.2.1; representative row-width fixtures; monitoring for
heap, duration, database load, and timeout behavior.

**Affected modules:** Export benchmark fixtures/scripts, configuration limits,
`docs/45-export-production-readiness-review.md`, operational evidence.

**Acceptance Criteria:**

- CSV, Excel, and PDF record page/query count, duration, time-to-first-byte, peak
  heap, output size, database load, and timeout behavior.
- Existing 30,000-/100,000-row preflight rejection is verified where the active
  cap rejects those datasets.
- `EXPORT_MAX_ROWS` and optional `EXPORT_MAX_BYTES` are tuned from evidence, not
  estimates.
- Supported synchronous volume and explicitly unsupported volume are documented
  per format.

**Status:** `ON HOLD`

#### Batch R1.3.2 — Export Deadline and Concurrency Controls

**Objective:** Apply evidence-based request deadline and allowed-concurrency
policy to the bounded synchronous exporter.

**Dependencies:** Batch R1.3.1 measurements and an approved operational policy.

**Affected modules:** Export HTTP/application boundary, environment configuration,
tests, production readiness documentation.

**Acceptance Criteria:**

- Deadline and concurrency limits are explicit, configuration-validated, and
  tested under contention and cancellation.
- Controlled failures preserve authorization, ownership, Admin privacy, and
  existing size guard rails.
- Limits fit the selected deployment resource envelope.
- No streaming, background job, queue, or object storage is introduced.

**Status:** `ON HOLD`

### Epic R1.4 — Final Release Acceptance

**Objective:** Produce the final evidence-backed MVP deployment decision.

**Status:** `ON HOLD`

#### Batch R1.4.1 — Final MVP Acceptance

**Objective:** Re-run repository and environment gates, reconcile documentation,
and issue the final release recommendation.

**Dependencies:** Batches 4.1.1, R1.2.1, R1.2.2, R1.3.1, and R1.3.2 complete.

**Affected modules:** Release evidence, roadmap/handoff/changelog, affected
operational documentation; application code only for confirmed release defects.

**Acceptance Criteria:**

- All automated repository gates and approved environment qualification checks
  pass.
- Production migrations, recovery, OAuth, PWA, accessibility, and bounded export
  service levels have recorded evidence.
- Documentation matches the deployed behavior and remaining limitations.
- The final recommendation is explicitly `READY`, `READY WITH LIMITATIONS`, or
  `NOT READY`, with unresolved blockers listed.

**Status:** `ON HOLD`

## 10. Explicitly On-Hold Extension Work

**Sprint Goal:** Preserve documented extension boundaries without treating them
as approved implementation commitments.

**Status:** `ON HOLD`

### Epic 10.1 — Export Architecture Extensions

**Objective:** Hold architecture-changing export options until measurement
demonstrates need and separate approval defines their contracts.

**Status:** `ON HOLD`

#### Batch 10.1.1 — Streaming and Cross-Page Consistency

**Objective:** If separately approved, define backpressure-aware CSV streaming
and point-in-time/high-water-mark semantics at the Reporting read boundary.

**Dependencies:** Batch R1.3.1 evidence and separate architecture approval.

**Affected modules:** Reporting read boundary, Export coordinator/CSV adapter,
HTTP delivery, cancellation/backpressure tests, architecture documentation.

**Acceptance Criteria:**

- Separate approval defines bounded memory, cancellation, backpressure, and
  consistency semantics.
- Export does not query Prisma directly or duplicate Reporting calculations.
- Ownership, authorization, and Admin privacy remain unchanged.

**Status:** `ON HOLD`

#### Batch 10.1.2 — Asynchronous Oversized Export

**Objective:** If separately approved, define background generation, queue,
storage, expiry, notification, and secure download behavior.

**Dependencies:** Demonstrated need after Batch R1.3.1 and separate product,
security, operations, and architecture approval.

**Affected modules:** Not determined; the current architecture contains no
approved queue, object storage, worker, or notification boundary.

**Acceptance Criteria:**

- A separately approved design defines ownership revalidation, expiry, secure
  retrieval, operational limits, and deletion.
- No implementation starts from the current roadmap alone.

**Status:** `ON HOLD`

### Epic 10.2 — Product Extensions Outside the MVP

**Objective:** Keep documented future ideas out of the implementation sequence
until product requirements explicitly approve them.

**Status:** `ON HOLD`

#### Batch 10.2.1 — Unapproved Product Extensions

**Objective:** Hold schedules, monthly allowance, categories, attachments,
approvals, notifications, bulk operations, advanced analytics, advanced export
styling, settings, and any remaining placeholder route behavior.

**Dependencies:** New or amended approved Functional Requirements, Business
Rules, flows, architecture, Design System mapping, and acceptance criteria.

**Affected modules:** Not determined because no approved implementation contract
exists.

**Acceptance Criteria:**

- The Project Owner approves explicit scope and requirement traceability.
- Architecture, privacy, authorization, Domain meaning, Design Tokens, and tests
  are defined before a Batch becomes implementation-ready.
- Placeholder or landing-page language alone is not treated as approval.

**Status:** `ON HOLD`

## 11. Requirement and Evidence Map

| Delivery area | Authoritative evidence |
|---|---|
| Product scope and exclusions | `docs/00-product-principles.md`, `docs/01-functional-requirements.md`, `README.md` |
| Financial and ownership rules | `docs/03-business-rules.md`, `docs/04-domain-model.md` |
| User behavior and states | `docs/05-user-flow.md`, `docs/06-wireframe.md`, `docs/14-component-guidelines.md`, `docs/19-screen-specifications.md` |
| Architecture and persistence | `docs/08-system-architecture.md`, `docs/28-database-design.md`, `docs/36-adr-transaction-balance-and-audit.md`, `docs/37-technical-design-transaction-foundation.md` |
| Authentication and authorization | `docs/27-adr-authentication-authorization.md`, `docs/29-technical-design-authentication-authorization.md`, `docs/30-authentication-persistence-design.md`, `docs/31-authentication-implementation.md`, `docs/32-authorization-implementation.md` |
| Design implementation | `docs/12-ui-design-system.md`, `docs/14-component-guidelines.md`, `docs/16-accessibility-guidelines.md`, `docs/18-design-tokens.md` |
| Implemented delivery state and known MVP interaction gap | `AI_CONTEXT.md`, `CHANGELOG.md`, `docs/34-operator-management-implementation.md`, `docs/35-student-management-implementation.md`, `docs/41-mvp-quality-assurance-report.md`, `docs/42-dashboard-implementation.md`, `docs/43-reporting-foundation.md`, `docs/44-export-foundation.md`, `docs/48-financial-assurance-implementation.md` |
| Production/export gaps | `docs/02-non-functional-requirements.md`, `docs/45-export-production-readiness-review.md` |

## 12. Roadmap Integrity Check

At this revision:

- First `READY FOR IMPLEMENTATION` Batch: **none**.
- Number of `READY FOR IMPLEMENTATION` Batches: **0**.
- Batch 4.2.1 completed the approved validation/error-handling requirement
  without changing Operator or Student Domain behavior.
- Deployment qualification and release acceptance are isolated in Release Sprint
  R1 and remain `ON HOLD` until MVP feature development is complete.
- Architecture-changing and unapproved product extensions remain `ON HOLD`.
