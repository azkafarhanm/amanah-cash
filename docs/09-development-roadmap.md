# Amanah Cash — Executable Engineering Roadmap

**Version:** 4.0
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-31

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

The repository is complete through Sprint 6. The implemented
system includes the application foundation, authentication and authorization,
Operator and Student management, the complete Transaction lifecycle, persisted
Balance and immutable audit, dashboards, reports, bounded CSV/Excel/PDF export,
the Transaction Workspace, reconciliation, the Financial Audit Timeline, the
read-only Audit Detail Drawer, and the complete MVP Settings module (theme,
page-size preferences, admin-only backup/restore, Google security handoff,
version, and sanitized changelog). Admin Student and Operator create/edit forms
also preserve submitted values and expose accessible inline server-validation
recovery.

Repository Production Preflight is complete. Direct Auth.js, Next.js, and Prisma
advisories with supported patch releases were remediated; production
configuration validation and redacted operational diagnostics are implemented.
The release recommendation remains `READY WITH MINOR LIMITATIONS`. Deployment
qualification is not part of the current MVP feature-development phase and is
held in Release Sprint R1.

Sprint 6 (MVP Settings) is complete. All five Settings groups — Appearance
(Light/Dark/System theme), Preferences (10/20/50 page size), Data (admin-only
backup/restore), Security (Google handoff), and About (version/changelog) — are
implemented, persisted per provisioned user, and covered by automated tests.

Phase 1 (Functional MVP, Sprints 0–6) is complete. Phase 2 (Product Quality)
begins with Sprint 7 — Design System Polish. The Design System Foundation
(`docs/51-design-system-foundation-v2.md`) is the visual reference. No new
business features are added in Phase 2. The remaining Landing Page visual
evidence work (authentic screenshots, brand identity) is folded into Sprint 7
and remains blocked by Product Owner decisions. Release qualification remains
in the Release Phase (Sprint R1) and is `ON HOLD` until the Product Owner
declares "MVP Quality Complete" based on the Sprint 8 completion report.


## Phase 1 — Functional MVP

Sprints 0–6 delivered the complete functional MVP: application foundation,
authentication, authorization, Operator and Student management, the Transaction
Engine, persisted Balance and immutable audit, dashboards, reports, bounded
export, the Transaction Workspace, reconciliation, the Financial Audit Timeline,
the Audit Detail Drawer, the Landing Page core narrative, and the complete MVP
Settings module. No new business features are added after Phase 1.

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

## 9. Sprint 5 — Landing Page Content Experience

**Sprint Goal:** Complete the approved, deployment-independent public product
narrative using truthful descriptions of the now-implemented MVP.

**Status:** `COMPLETE`

### Epic 5.1 — Core Narrative Sections

**Objective:** Extend the existing Landing Page foundation with the approved
Problems, Solution, Workflow, Features, Security & Trust, and FAQ sections.

**Status:** `COMPLETE`

#### Batch 5.1.1 — Core Landing Content and FAQ

**Objective:** Implement the approved static narrative and accessible FAQ
interaction without depending on unresolved brand, screenshot, canonical-origin,
or deployment decisions.

**Dependencies:** Completed Sprint 4; existing Landing Page Header/Hero/Footer
foundation; approved Landing Page Strategy, Blueprint, Content Specification,
Design Tokens, Component Guidelines, Motion Guidelines, and Accessibility
Guidelines.

**Affected modules:** `src/components/landing`, public-route styles and focused
Landing Page tests; affected Landing Page implementation evidence within this
roadmap only until the Batch completion synchronization step.

**Acceptance Criteria:**

- Problems, Solution, Workflow, Features, Security & Trust, and FAQ render in
  the exact approved order between the existing Hero and Footer.
- Visible copy, counts, ordering, icons, headings, lists, and in-page fragment
  destinations match `docs/23-landing-page-blueprint.md` and
  `docs/24-landing-page-content.md`.
- Product claims describe only capabilities already implemented through Sprint
  4; no pricing, registration, certification, integration, settings, offline
  financial mutation, or future-feature claim is introduced.
- Static content remains server-rendered; only the FAQ disclosure interaction
  creates the minimal approved Client Component boundary.
- FAQ disclosure uses native buttons, exposes expanded and controlled-region
  relationships, supports keyboard operation and multiple open answers, and
  remains usable with motion disabled.
- All visual values resolve through approved Design Tokens, icons are treated
  according to their semantic purpose, and static cards do not imply
  interactivity.
- Existing Header, Hero, Footer, `/login` access, authenticated product entry,
  metadata, and PWA behavior remain functional.
- Automated tests cover section order, exact content inventory, heading/list
  semantics, fragment targets, FAQ behavior, reduced-motion fallback, and the
  absence of unsupported claims or placeholder content in these sections.

**Status:** `COMPLETE`

**Completion evidence (2026-07-29):**

- Added the exact approved Problems, Solution, Workflow, Features, Security &
  Trust, and seven-question FAQ content in the required server-rendered order.
- Isolated disclosure state to independent FAQ item Client Components using
  native buttons, expanded/controlled-region relationships, and motion-free
  keyboard-operable behavior.
- Reused approved responsive, surface, spacing, typography, focus, card, and FAQ
  tokens; added the specified decorative Lucide icons without interactive card
  styling.
- Preserved the existing Header, Hero, Footer, routes, metadata, PWA behavior,
  application boundaries, business rules, and Settings scope.
- Verified `npm test` (208 passing), `npm run typecheck`, `npm run lint`,
  `npm run prisma:validate`, `npm run build`, and `git diff --check`.

## 10. Sprint 6 — MVP Settings

**Sprint Goal:** Replace Settings placeholders with the approved daily-usability,
recovery, security-handoff, and product-transparency module before MVP feature
completion.

**Status:** `COMPLETE`

### Epic 6.1 — Appearance and Daily Preferences

**Objective:** Deliver per-user theme and default-page-size preferences through
the authenticated role-aware Settings screens.

**Status:** `COMPLETE`

#### Batch 6.1.1 — Theme and Page-Size Preferences

**Objective:** Implement Light, Dark, and System theme plus the 10/20/50 default
items-per-page preference using the approved semantic and persistence contracts.

**Dependencies:** Batch 5.1.1 complete; approved MVP Settings Specification,
Dark semantic token overrides, existing authenticated Settings placeholders,
and provisioned-user persistence.

**Affected modules:** Admin/Operator Settings routes, presentation/theme
foundation, preference application/persistence, compatible paginated reads,
focused accessibility and regression tests.

**Acceptance Criteria:**

- Both roles can select Light, Dark, or System; System is the default and follows
  device preference changes.
- Dark uses the complete approved semantic palette rather than inversion and
  passes component-state contrast verification.
- Both roles can select 10, 20, or 50 default items per page; 20 is the default
  and a valid explicit URL value wins for that view.
- Preferences follow the provisioned user, fail closed on invalid values, and
  never alter authorization, financial data, exports, or audit.
- Delete-confirmation behavior is not configurable; financial, administrative,
  and domain safeguards remain mandatory.

**Status:** `COMPLETE`

**Completion evidence (2026-07-31):**

- `src/settings/theme.ts` defines `THEME_PREFERENCES = ["LIGHT", "DARK", "SYSTEM"]`
  with `DEFAULT_THEME_PREFERENCE = "SYSTEM"`; `src/settings/preferences.ts` defines
  `PAGE_SIZE_OPTIONS = [10, 20, 50]` with `DEFAULT_PAGE_SIZE = 20`.
- Per-user persistence via `settingsPreference` Prisma model; `src/settings/service.ts`
  reads/writes theme and page-size; `src/settings/actions.ts` guards with
  `authorizeServerAction({ role: "authenticated" })`.
- `src/components/settings/theme-settings.tsx` renders a three-option radio group
  (Light/Dark/System) with optimistic update and `aria-live` feedback.
- `src/components/settings/preferences-settings.tsx` renders a native select with
  10/20/50 options and reserved-geometry saving feedback.
- Dark theme uses the complete approved semantic palette in `src/app/globals.css`
  (`:root[data-theme="dark"]` block), verified by `test/theme-polish.test.ts`.
- No Time theme option or delete-confirmation preference exists; confirmed by
  `test/settings-preferences.test.ts`.
- Theme bootstrap script (`src/components/settings/theme-bootstrap-script.tsx`)
  prevents flash-of-wrong-theme on SSR.
- `test/theme-settings.test.ts`, `test/theme-polish.test.ts`,
  `test/settings-preferences.test.ts`, and `test/settings-data.test.ts` pass
  within the 216-test suite.

### Epic 6.2 — Data Continuity

**Objective:** Give Platform Admin a bounded, privacy-preserving manual Backup
and whole-state Restore workflow.

**Status:** `COMPLETE`

#### Batch 6.2.1 — Operational Backup

**Objective:** Generate one versioned, opaque, database-consistent artifact that
preserves the approved operational state.

**Dependencies:** Batch 6.1.1 complete; approved Settings persistence and
maintenance-audit schema.

**Affected modules:** Admin Settings Data group, maintenance application and
persistence boundaries, backup format/validation contract, authorization and
recovery tests.

**Acceptance Criteria:**

- Only Platform Admin can generate or download an application backup.
- The artifact includes approved business, identity, preference, migration, and
  audit state while excluding secrets, configuration, logs, caches, and
  reusable sessions.
- Snapshot generation is database-consistent and records privacy-minimized
  maintenance evidence.
- Admin presentation cannot browse decoded financial payload and makes no
  unsupported encryption claim.

**Status:** `COMPLETE`

**Completion evidence (2026-07-31):**

- `src/settings/backup.ts` implements `createBackupArtifact()` using
  `better-sqlite3` `.backup()` for a database-consistent snapshot; `sanitizeSnapshot`
  clears sessions and nulls OAuth tokens before artifact creation.
- `src/app/api/admin/settings/backup/route.ts` guards with
  `withAuthorization({ role: "admin" })`; Operator settings page omits the Data
  group (asserted in `test/settings-data.test.ts`).
- `inspectBackupArtifact()` returns only `BackupMetadata` (format version, source
  version, schema version, creation timestamp, integrity digest) — no financial
  payload browsing.
- `recordMaintenanceEvent` stores actor/operation/outcome/metadata only — no
  Transaction rows, Balances, or secrets.
- Migration `012_maintenance_audit.sql` creates the maintenance audit table.
- `test/settings-data.test.ts` covers admin-only access, artifact structure,
  and round-trip backup/restore.

#### Batch 6.2.2 — Validated Atomic Restore

**Objective:** Restore a compatible whole-application backup safely for computer
migration, device replacement, manual recovery, or disaster recovery.

**Dependencies:** Batch 6.2.1 complete.

**Affected modules:** Admin Settings Restore interaction, maintenance
coordination, isolated validation, atomic replacement, session revocation,
maintenance audit, recovery tests.

**Acceptance Criteria:**

- Format, version, integrity, schema, referential, ownership, Balance, and audit
  checks complete before replacement.
- Restore requires explicit whole-state confirmation and a verified pre-restore
  safety backup.
- Concurrent writes are prevented; replacement commits completely or preserves
  current state.
- Successful Restore revokes sessions and requires Google login again.
- Partial merge, backup browsing, scheduled/cloud backup, and secret restoration
  remain absent.

**Status:** `COMPLETE`

**Completion evidence (2026-07-31):**

- `src/settings/backup.ts` `restoreBackupArtifact()` validates format
  (`parseEnvelope`), version (`FORMAT_VERSION`), integrity (`integrity_check`
  pragma), schema (`SCHEMA_VERSION` comparison), referential integrity
  (`foreign_key_check` pragma), and Balance reconciliation (SUM-by-direction vs
  `students.balance`).
- Pre-restore safety backup created via `current.backup(safetyPath)` +
  `verifySnapshot(safetyPath)` before any replacement.
- Atomic replacement via `rename(candidatePath, targetPath)` after
  `disconnectPrismaClient()`; on error, safety backup retained and candidate
  cleaned.
- `src/components/settings/data-settings.tsx` requires `window.confirm` before
  restore; on success, client calls `signOut({ callbackUrl: "/login" })`.
- `src/app/api/admin/settings/restore/route.ts` returns `{ sessionEnded: true }`.
- No partial merge, browsing, scheduler, cloud, or secret-restore code exists.
- `test/settings-data.test.ts` covers round-trip restore.

### Epic 6.3 — Security and About

**Objective:** Complete Settings with a truthful Google security handoff,
application Version, and sanitized Changelog.

**Status:** `COMPLETE`

#### Batch 6.3.1 — Google Password Handoff, Version, and Changelog

**Objective:** Deliver the remaining read/navigation capabilities without
creating application password management, update services, or promotional UI.

**Dependencies:** Batch 6.2.2 complete.

**Affected modules:** Admin/Operator Settings Security and About groups,
read-only Changelog route/content adapter, build-version source, route and
content tests.

**Acceptance Criteria:**

- `Ubah kata sandi Google` clearly opens Google Account Security externally;
  Amanah Cash never receives or changes a password.
- Application Version is read-only and comes from one build-time source.
- Changelog shows sanitized released user-facing changes newest first through a
  stable in-application route.
- Internal unreleased notes, secrets, exploit details, developer-only migration
  steps, update checking, telemetry, support portal, and promotional content are
  absent.
- Settings completes the responsive, loading, saving, failure, keyboard, focus,
  announcement, and role-authorization contracts in the approved specification.

**Status:** `COMPLETE`

**Completion evidence (2026-07-31):**

- `src/components/settings/security-about-settings.tsx` renders the Google
  Security handoff (`href="https://myaccount.google.com/security"`,
  `target="_blank"`, `rel="noreferrer"`) with truthful "tidak menyimpan atau
  mengubah kata sandi" copy.
- `src/settings/about.ts` reads `APPLICATION_VERSION` from `package.json`
  metadata (one build-time source); rendered read-only.
- `src/app/(app)/changelog/page.tsx` renders the sanitized changelog route;
  `releasedChangelog()` skips `## [Unreleased]` and only emits released version
  sections, newest first.
- All Settings groups use `aria-live="polite"` / `role="alert"` / `role="status"`
  for feedback; `useId` associates labels with controls; role-gated page
  composition (Admin gets Data, Operator does not).
- No update checker, telemetry, feedback form, support portal, or promotional
  content exists.

## Phase 2 — Product Quality

Phase 2 improves visual quality, consistency, responsiveness, motion, and
assurance without adding business features, changing workflows, or expanding
MVP scope. Every batch preserves existing functionality, domain rules,
authorization boundaries, and financial integrity. The Design System Foundation
(`docs/51-design-system-foundation-v2.md`), Dashboard Analytics Specification
(`docs/52-dashboard-analytics-specification.md`), and Students Management
Specification (`docs/53-students-management-specification.md`) are the visual
references for Phase 2 work.

## 11. Sprint 7 — Design System Polish

**Sprint Goal:** Improve visual quality and consistency across every surface
while preserving all existing functionality, business logic, and authorization
boundaries.

**Status:** `READY FOR IMPLEMENTATION`

### Epic 7.1 — Visual Identity

**Objective:** Refine the color system, surface hierarchy, borders, shadows, and
radii so the visual foundation is consistent, accessible, and premium across
light and dark themes.

**Status:** `READY FOR IMPLEMENTATION`

#### Batch 7.1.1 — Design Token Alignment

**Objective:** Align the implemented CSS custom properties and component styles
with the Design System Foundation (`docs/51-design-system-foundation-v2.md`).
Refine semantic color mappings, surface hierarchy steps, border weights, shadow
levels, and radius consistency for both light and dark themes without changing
component behavior, business logic, or workflow structure.

**Dependencies:** Phase 1 complete (Sprints 0–6); Design System Foundation
document approved.

**Affected modules:** `src/app/globals.css`, component CSS modules across
`src/components/`, focused visual-regression and token-consistency tests.

**Acceptance Criteria:**

- Semantic color tokens map cleanly to the approved primitive palette for both
  light and dark themes with no hardcoded color values in component CSS.
- Surface hierarchy (canvas, surface, elevated, subtle, glass) is visually
  distinct through tonal steps and borders in both themes.
- Border weights, shadow levels, and radii are consistent within each component
  category (controls, containers, overlays).
- Deposit, Withdrawal, Correction, Success, Warning, and Error semantic colors
  are consistent across every surface that uses them.
- Dark theme uses independently designed semantic values, never CSS inversion,
  filters, or opacity tricks.
- Glass treatment is applied only to approved accent surfaces (hero KPI cards,
  dialogs, login) and absent from tables, forms, and lists.
- Financial values remain flat, bordered, and visually stable; no glass or
  animated surface touches financial data.
- All existing tests pass; no business logic, authorization, or domain behavior
  changes.

**Status:** `COMPLETE`

**Completion evidence (2026-07-31):**

- Added missing primitive tokens from `docs/51` to `src/app/globals.css`:
  `--radius-sm` (4px), `--radius-xl` (16px), `--radius-2xl` (20px), `--space-1-5`
  (6px), `--space-20` (80px), `--size-4`/`--size-6`/`--size-10`,
  `--font-size-12`/`--font-size-20`/`--font-size-28`, full `--line-height-*`
  scale, `--shadow-xs` through `--shadow-xl`, `--shadow-focus-error`,
  `--motion-duration-instant`/`--motion-duration-deliberate`/`--motion-duration-slow`,
  `--motion-ease-in`/`--motion-ease-out`, `--motion-distance-small`/`--motion-distance-medium`,
  `--z-base`/`--z-sticky`/`--z-dropdown`/`--z-popover`/`--z-tooltip`/`--z-toast`/`--z-loading`,
  `--opacity-40`/`--opacity-60`/`--opacity-80`/`--opacity-96`.
- Added typography semantic tokens: `--type-body-small`, `--type-caption`,
  `--type-overline`, `--type-h1` through `--type-h6`, `--type-money`,
  `--type-balance`.
- Added `--shape-overlay` semantic token.
- Existing `--shadow-subtle`/`--shadow-raised`/`--shadow-large` aliased to new
  scale for backward compatibility.
- Dark-theme shadow overrides use reduced opacity and larger blur radii.
- Replaced hardcoded `0.15s ease` transitions in `dashboard.module.css` with
  `var(--motion-duration-fast) var(--motion-ease-standard)`.
- Replaced hardcoded `500ms`/`600ms` animations in `auth.module.css` with
  `var(--motion-duration-slow)`/`var(--motion-duration-loading)`.
- Replaced hardcoded `200ms`/`400ms` animation delays in `hero-section.module.css`
  with `var(--motion-duration-panel)` and `calc()`.
- Replaced hardcoded `blur(12px)` in `landing-header.module.css` with
  `var(--glass-blur)`.
- Replaced hardcoded `rgb()` decorative values with `color-mix()` referencing
  `var(--color-action-primary)`.
- Replaced hardcoded `32px`/`20px`/`11px` in `dashboard-v2.module.css` with
  `var(--size-8)`/`var(--size-5)`/`var(--font-size-12)`.
- No hardcoded transition durations, animation durations, or blur values remain
  in component CSS modules.
- `npm test` (216 passing), `npm run typecheck`, `npm run lint`, `npm run build`
    all pass.

### Epic 7.2 — Component Polish

**Objective:** Review and polish every reusable component for visual consistency,
state clarity, and accessibility without changing its API, behavior, or contract.

**Status:** `READY FOR IMPLEMENTATION`

#### Batch 7.2.1 — Component Visual Consistency

**Objective:** Polish buttons, cards, inputs, selects, tables, dialogs, badges,
toasts, dropdowns, and navigation items so each component category shares
consistent padding, radius, typography, elevation, hover/focus/active/disabled
states, and semantic color usage across light and dark themes.

**Dependencies:** Batch 7.1.1 complete.

**Affected modules:** `src/components/ui/`, `src/components/dashboard/`,
`src/components/app-shell/`, `src/components/students/`,
`src/components/transactions/`, `src/components/settings/`,
`src/components/reports/`, `src/components/financial-assurance/`, focused
component visual-regression tests.

**Acceptance Criteria:**

- Every interactive component defines visually distinct default, hover, focus,
  active, disabled, and loading states using the approved token vocabulary.
- Button variants (primary, secondary, ghost, danger, deposit, withdrawal) are
  visually consistent in height, padding, radius, and typography.
- Card surfaces use consistent padding, radius, border, and elevation across
  dashboard, reports, and settings.
- Input and select controls share consistent height, padding, border, focus ring,
  and error treatment.
- Tables use consistent row height, cell padding, header treatment, and zebra
  behavior; financial columns use tabular numerals and right alignment.
- Dialogs and sheets use consistent radius, padding, scrim, and elevation.
- Badges use consistent height, padding, radius, and semantic color across all
  surfaces.
- All changes are token-driven; no hardcoded values are introduced.
- All existing tests pass; no behavior, API, or contract changes.

**Status:** `COMPLETE`

**Completion evidence (2026-07-31):**

- Replaced all literal `1px solid` border declarations with
  `var(--border-width-default) var(--border-style-default)` in
  `students.module.css` (~11 occurrences) and `operators.module.css` (~11
  occurrences).
- Replaced hardcoded `width: 100%` with `var(--size-full)`, bare `margin: 0`
  with `var(--space-0)`, and `border-bottom` with logical `border-block-end`
  in students and operators CSS.
- Added `color: var(--color-text-primary)` and `font: var(--type-body)` to
  input/select controls; added `font-variant-numeric: tabular-nums` to balance
  values.
- Replaced hardcoded `40px`/`36px`/`20px`/`3px`/`8px` in `app-shell.module.css`
  with `var(--control-height-default)`/`var(--control-height-minimum)`/
  `var(--navigation-icon-size)`/`var(--border-width-emphasis)`/`var(--space-2)`.
- Replaced hardcoded `opacity: 0.6`/`font-size: 1.25rem`/`min-height: 2.25rem`
  in `workspace.module.css` with `var(--opacity-60)`/`var(--font-size-20)`/
  `var(--control-height-minimum)`.
- Replaced hardcoded `letter-spacing: 0.05em` in transactions with
  `var(--letter-spacing-wide)`; added the token to `globals.css`.
- No hardcoded hex colors, rgba values, or legacy tokens remain in operational
  component CSS modules (verified by `test/ui-polish.test.ts` and
  `test/theme-polish.test.ts`).
- `npm test` (216 passing), `npm run typecheck`, `npm run lint`, `npm run build`
  all pass.

### Epic 7.3 — Screen Polish

**Objective:** Review every application screen for spacing, typography,
hierarchy, and visual consistency without redesigning workflows or changing
functionality.

**Status:** `READY FOR IMPLEMENTATION`

#### Batch 7.3.1 — Authenticated Screen Polish

**Objective:** Polish Dashboard, Students, Operators, Transactions, Reports,
Reconciliation, and Settings screens for consistent spacing rhythm, typography
hierarchy, section structure, and visual balance across desktop, tablet, and
mobile.

**Dependencies:** Batch 7.2.1 complete.

**Affected modules:** All authenticated page components under
`src/app/(app)/`, focused screen-level visual tests.

**Acceptance Criteria:**

- Every screen follows the 8px spacing system consistently for padding, gaps,
  and section separation.
- Typography hierarchy (page title, section title, card title, body, caption) is
  consistent across all screens.
- KPI cards, charts, tables, forms, and action groups use consistent section
  spacing and alignment.
- Empty states, loading skeletons, and error states are visually consistent
  across all screens.
- Dark and light theme produce equivalent hierarchy and readability on every
  screen.
- No workflow, route, field, action, or business behavior changes.
- All existing tests pass.

**Status:** `COMPLETE`

**Completion evidence (2026-07-31):**

- Wrapped both Dashboard pages (admin and operator) in `ContentWrapper` for
  consistent content width and canonical section gap.
- Replaced hand-rolled dashboard headers with shared `SectionHeader`; page titles
  now render at `--type-screen-title` (24px bold) matching every other page.
- Extracted all inline-styled elements to CSS classes in
  `dashboard-v2.module.css`: `.netCashFlow*`, `.attentionList*`, `.adminList*`.
- Updated `.dashboardSection` gap to `--layout-section-gap` and `.sectionTitle`
  to `--type-screen-title`.
- Cleaned up dead duplicate `.emptyState*` CSS from `dashboard-v2.module.css`.
- Replaced hardcoded skeleton heights and animation values with tokens.
- Replaced changelog empty state with shared `EmptyState` component.
- `npm test` (216 passing), `npm run typecheck`, `npm run lint`, `npm run build`
  all pass.

#### Batch 7.3.2 — Landing Page Visual Evidence and Identity

**Objective:** Add authentic product screenshots to the Landing Page, finalize
brand identity treatment, and verify all public-facing visual elements are
consistent with the polished design system.

**Dependencies:** Batch 7.3.1 complete; Product Owner approval of the exact
synthetic screenshot dataset, capture viewport, final screenshot assets,
redaction/provenance record, brand mark/wordmark treatment, and whether a
verified Documentation destination enables the Footer Resource group.

**Affected modules:** `src/components/landing/`, approved image assets,
focused visual/content tests.

**Acceptance Criteria:**

- Screenshots show exactly the approved screens, modes, and states from the
  implemented application using a reconciled synthetic dataset with no real
  personal or financial data.
- Every image has approved intrinsic dimensions, alternative text, caption,
  responsive sizing, and provenance/redaction evidence.
- Brand identity (logo, wordmark, header, footer) is consistent and approved.
- Hero and Final CTA labels and destinations match the Content Specification.
- Only verified destinations render; unsupported claims or placeholder content
  are absent.
- The page remains understandable if images do not load and reserves image space
  without avoidable layout shift.
- All existing tests pass; no business behavior changes.

**Status:** `BLOCKED`

**Blocker:** Product Owner approval of the screenshot dataset, viewport, assets,
redaction record, brand mark treatment, and Documentation destination.

### Epic 7.4 — Motion and Micro-interactions

**Objective:** Polish hover, focus, loading, success, error, navigation, and
transition motion so it remains subtle, purposeful, and consistent with the
approved Motion Guidelines.

**Status:** `READY FOR IMPLEMENTATION`

#### Batch 7.4.1 — Motion Polish

**Objective:** Review and refine all transitions, hover effects, focus rings,
loading indicators, success/error feedback, navigation transitions, and overlay
animations for consistency, subtlety, and reduced-motion compliance.

**Dependencies:** Batch 7.2.1 complete.

**Affected modules:** Component CSS modules, `src/app/globals.css`, focused
motion and reduced-motion tests.

**Acceptance Criteria:**

- Transition durations and easing functions are consistent within each
  interaction category (feedback, overlay, navigation).
- Hover and focus states use consistent visual treatment across all interactive
  components.
- Loading skeletons and spinners are visually consistent across all screens.
- Success and error feedback (toasts, inline messages, alerts) use consistent
  motion and timing.
- Navigation and overlay transitions are subtle, interruptible, and never delay
  input or comprehension.
- Financial values never animate, count, interpolate, or transition.
- `prefers-reduced-motion: reduce` disables all non-essential motion across the
  entire application.
- All existing tests pass; no behavior changes.

**Status:** `READY FOR IMPLEMENTATION`

### Epic 7.5 — Responsive Polish

**Objective:** Verify and polish responsive behavior across desktop, tablet, and
mobile for consistent touch spacing, responsive hierarchy, and layout stability.

**Status:** `BLOCKED`

**Blocker:** Batch 7.3.1 must complete screen polish before responsive behavior
is verified.

#### Batch 7.5.1 — Responsive Consistency

**Objective:** Review every screen at 320px, 360px, 390px, 480px, 768px, 1024px,
1280px, and 1536px for consistent touch targets, spacing adaptation, content
reflow, sidebar behavior, and layout stability.

**Dependencies:** Batches 7.3.1 and 7.3.2 complete.

**Affected modules:** All component CSS modules, focused responsive tests.

**Acceptance Criteria:**

- Touch targets are at least 44px in both dimensions on mobile across all
  interactive elements.
- Content reflows without horizontal scrolling at 320px on every screen.
- Sidebar collapses correctly on tablet and overlays on mobile.
- Tables convert to card layouts on mobile with consistent field labeling.
- Dialogs use bottom-sheet presentation on mobile and centered dialog on desktop.
- KPI grids, chart layouts, and form layouts adapt cleanly at each breakpoint.
- Layout shift is minimized during loading and data updates.
- All existing tests pass; no behavior changes.

**Status:** `BLOCKED`

## 12. Sprint 8 — Product Quality Assurance

**Sprint Goal:** Validate the polished application across accessibility,
performance, cross-device compatibility, visual consistency, and final MVP
compliance. Produce the evidence-backed MVP Quality Completion report.

**Status:** `BLOCKED`

**Blocker:** Sprint 7 (Design System Polish) must complete before quality
assurance begins.

### Epic 8.1 — Accessibility Audit

**Objective:** Verify WCAG 2.2 AA compliance across keyboard navigation, screen
reader support, contrast, reduced motion, and touch targets.

**Status:** `BLOCKED`

#### Batch 8.1.1 — Accessibility Audit and Remediation

**Objective:** Execute a comprehensive accessibility audit across every
authenticated and public screen, remediate confirmed defects, and record
evidence.

**Dependencies:** Sprint 7 complete.

**Affected modules:** Any component with confirmed accessibility defects;
accessibility test coverage.

**Acceptance Criteria:**

- Keyboard navigation works on every interactive element with visible focus.
- Screen reader labels and announcements are correct for all financial values,
  statuses, and actions.
- Color contrast meets WCAG 2.2 AA (4.5:1 text, 3:1 UI components) in both
  themes.
- `prefers-reduced-motion` is respected globally with no essential motion lost.
- Touch targets meet minimum size requirements on all mobile surfaces.
- Accessible charts have data-table alternatives and keyboard-navigable data
  points.
- Confirmed defects are fixed with regression coverage.

**Status:** `BLOCKED`

### Epic 8.2 — Performance Review

**Objective:** Verify rendering performance, bundle size, animation efficiency,
and loading state quality.

**Status:** `BLOCKED`

#### Batch 8.2.1 — Performance Review and Optimization

**Objective:** Measure and optimize First Contentful Paint, Largest Contentful
Paint, Time to Interactive, bundle size, and animation performance.

**Dependencies:** Sprint 7 complete.

**Affected modules:** Components with confirmed performance issues;
build configuration.

**Acceptance Criteria:**

- First Contentful Paint is under 1.5s on representative hardware.
- Largest Contentful Paint (dashboard KPI cards) is under 2.0s.
- Bundle size is reviewed and unnecessary dependencies are absent.
- Animations use opacity and transform exclusively; no layout-triggering
  properties are animated in scrolling lists.
- Loading skeletons approximate final geometry to minimize layout shift.
- No animation degrades search input, scrolling, or keyboard response.

**Status:** `BLOCKED`

### Epic 8.3 — Cross-device QA

**Objective:** Validate the application across desktop, tablet, mobile, dark
theme, light theme, and PWA installation.

**Status:** `BLOCKED`

#### Batch 8.3.1 — Cross-device Validation

**Objective:** Test every approved workflow on representative desktop, tablet,
and mobile browsers in both themes and PWA mode.

**Dependencies:** Sprint 7 complete.

**Affected modules:** Components with confirmed device-specific defects.

**Acceptance Criteria:**

- Desktop (Chrome, Firefox, Safari), tablet, and mobile browsers render all
  screens correctly.
- Dark and light themes produce equivalent readability and hierarchy.
- PWA installation and standalone launch work on supported platforms.
- Network failure is explicit on every screen; no offline transaction is queued.
- Orientation changes reflow without clipping or overlap.
- Confirmed defects are fixed with regression coverage.

**Status:** `BLOCKED`

### Epic 8.4 — Visual Review

**Objective:** Verify visual consistency, empty states, error states, charts,
dashboard, landing page, and authentication surfaces.

**Status:** `BLOCKED`

#### Batch 8.4.1 — Visual Consistency Review

**Objective:** Conduct a comprehensive visual review of every surface for
consistency, polish, and professional quality.

**Dependencies:** Sprint 7 complete.

**Affected modules:** Components with confirmed visual defects.

**Acceptance Criteria:**

- Visual consistency is verified across all dashboard widgets, charts, tables,
  forms, dialogs, and navigation.
- Empty states are contextual, consistent, and actionable across all screens.
- Error states are clear, consistent, and non-alarming.
- Charts use the approved color palette, tabular numerals, and accessible
  alternatives.
- Landing page visual evidence, identity, and conversion flow are consistent.
- Authentication screen is polished and trustworthy.
- Confirmed defects are fixed with regression coverage.

**Status:** `BLOCKED`

### Epic 8.5 — Final MVP Audit

**Objective:** Produce the final evidence-backed MVP Quality Completion report.

**Status:** `BLOCKED`

#### Batch 8.5.1 — MVP Quality Completion Report

**Objective:** Re-run all repository gates, verify business rules, architecture,
roadmap alignment, design system compliance, accessibility, and performance, and
issue the MVP Quality Completion declaration.

**Dependencies:** Batches 8.1.1, 8.2.1, 8.3.1, and 8.4.1 complete.

**Affected modules:** Quality evidence, roadmap/handoff/changelog, affected
documentation.

**Acceptance Criteria:**

- All automated repository gates pass: TypeScript, ESLint, Prisma, build, tests.
- Business rules, authorization boundaries, financial integrity, and audit
  immutability are verified.
- Architecture and dependency direction are verified.
- Design system token compliance is verified.
- Accessibility audit evidence is recorded.
- Performance benchmarks meet targets.
- The Product Owner receives an evidence-backed report stating whether MVP
  Quality is complete and whether Release Sprint R1 may begin.

**Status:** `BLOCKED`

## Release Phase — Deployment Qualification

Release qualification begins only after the Product Owner declares "MVP Quality
Complete" based on the Sprint 8 completion report. Its environment decisions are
intentionally not blockers for Phase 2 quality work.

## 13. Sprint R1 — Release and Deployment Qualification

**Sprint Goal:** Qualify and release the completed MVP in a selected production
environment without expanding product scope or weakening financial,
authorization, privacy, and export boundaries.

**Status:** `ON HOLD`

Release Sprint R1 begins only after the Product Owner declares "MVP Quality
Complete" based on the Sprint 8 evidence-backed completion report. Its
environment decisions are intentionally not blockers for Phase 2 quality work.

### Epic R1.1 — Deployment Baseline and Topology

**Objective:** Select and document the production environment, resource
envelope, database topology, backup/restore policy, OAuth registration, and
Platform Admin bootstrap procedure.

**Status:** `ON HOLD`

#### Batch R1.1.1 — Deployment Environment Decision

**Objective:** Convert the approved one-client/one-server/one-relational-database
architecture into a concrete production topology and qualification baseline.

**Dependencies:** Product Owner declares "MVP Quality Complete"; Batch 4.1.1
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

**Dependencies:** Batches 4.1.1, 8.5.1, R1.2.1, R1.2.2, R1.3.1, and R1.3.2
complete.

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

## 14. Explicitly On-Hold Extension Work

**Sprint Goal:** Preserve documented extension boundaries without treating them
as approved implementation commitments.

**Status:** `ON HOLD`

### Epic 14.1 — Export Architecture Extensions

**Objective:** Hold architecture-changing export options until measurement
demonstrates need and separate approval defines their contracts.

**Status:** `ON HOLD`

#### Batch 14.1.1 — Streaming and Cross-Page Consistency

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

#### Batch 14.1.2 — Asynchronous Oversized Export

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

### Epic 14.2 — Product Extensions Outside the MVP

**Objective:** Keep documented future ideas out of the implementation sequence
until product requirements explicitly approve them.

**Status:** `ON HOLD`

#### Batch 14.2.1 — Unapproved Product Extensions

**Objective:** Hold schedules, monthly allowance, categories, attachments,
approvals, notifications, bulk operations, advanced analytics, advanced export
styling, and any remaining unapproved placeholder route behavior.

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

## 15. Requirement and Evidence Map

| Delivery area | Authoritative evidence |
|---|---|
| Product scope and exclusions | `docs/00-product-principles.md`, `docs/01-functional-requirements.md`, `README.md` |
| Financial and ownership rules | `docs/03-business-rules.md`, `docs/04-domain-model.md` |
| User behavior and states | `docs/05-user-flow.md`, `docs/06-wireframe.md`, `docs/14-component-guidelines.md`, `docs/19-screen-specifications.md` |
| Architecture and persistence | `docs/08-system-architecture.md`, `docs/28-database-design.md`, `docs/36-adr-transaction-balance-and-audit.md`, `docs/37-technical-design-transaction-foundation.md` |
| Authentication and authorization | `docs/27-adr-authentication-authorization.md`, `docs/29-technical-design-authentication-authorization.md`, `docs/30-authentication-persistence-design.md`, `docs/31-authentication-implementation.md`, `docs/32-authorization-implementation.md` |
| Design implementation | `docs/12-ui-design-system.md`, `docs/14-component-guidelines.md`, `docs/16-accessibility-guidelines.md`, `docs/18-design-tokens.md` |
| Remaining Landing Page feature | `docs/22-landing-page-strategy.md`, `docs/23-landing-page-blueprint.md`, `docs/24-landing-page-content.md`, `docs/25-landing-page-implementation-plan.md` |
| Implemented MVP Settings feature | `docs/21-mvp-settings-specification.md`, `docs/50-settings-ui-ux-review-proposal.md`, `src/settings/`, `src/components/settings/` |
| Implemented delivery state and known MVP interaction gap | `AI_CONTEXT.md`, `CHANGELOG.md`, `docs/34-operator-management-implementation.md`, `docs/35-student-management-implementation.md`, `docs/41-mvp-quality-assurance-report.md`, `docs/42-dashboard-implementation.md`, `docs/43-reporting-foundation.md`, `docs/44-export-foundation.md`, `docs/48-financial-assurance-implementation.md` |
| Production/export gaps | `docs/02-non-functional-requirements.md`, `docs/45-export-production-readiness-review.md` |

## 16. Roadmap Integrity Check

At this revision:

- Number of `READY FOR IMPLEMENTATION` Batches: **1** — Batch 7.4.1
  (Motion Polish).
- Phase 1 (Functional MVP, Sprints 0–6) is `COMPLETE`.
- Phase 2 (Product Quality) is in progress. Batches 7.1.1 (Design Token
  Alignment), 7.2.1 (Component Visual Consistency), and 7.3.1 (Authenticated
  Screen Polish) are `COMPLETE`. The single executable batch is **Batch 7.4.1
  (Motion Polish)**. Batch 7.3.2 (Landing Page Visual Evidence) remains
  `BLOCKED` by Product Owner decisions. Batch 7.5.1 (Responsive Polish) is
  `BLOCKED` pending 7.3.2. Sprint 8 (Product Quality Assurance) is `BLOCKED`
  pending Sprint 7 completion.
- The Landing Page visual evidence work (authentic screenshots, brand identity)
  is folded into Batch 7.3.2 and remains `BLOCKED` by Product Owner decisions on
  screenshot dataset, viewport, assets, redaction record, and brand mark
  treatment.
- Release Phase (Sprint R1) remains `ON HOLD` until the Product Owner declares
  "MVP Quality Complete" based on the Sprint 8 Batch 8.5.1 completion report.
- Architecture-changing and unapproved product extensions remain `ON HOLD`.
- Only the four approved status values (`COMPLETE`, `READY FOR IMPLEMENTATION`,
  `BLOCKED`, `ON HOLD`) are used.
