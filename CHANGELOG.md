# Changelog

All notable changes to Amanah Cash will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Sprint 4 — Epic 4.1: Repository Production Preflight

- Upgraded Auth.js to 4.24.15, Next.js and its ESLint rules to the build-verified 16.2.11 patch, and the Prisma client/SQLite adapter/CLI to 7.9.1, resolving the directly actionable critical Auth.js and reported framework/tooling advisories.
- Added `npm run env:check:production` to force production-mode OAuth, HTTPS-origin, SQLite, secret, and export-limit validation while redacting database location and all secret values.
- Redacted database targets from environment and migration command output and mapped migration failures to an actionable operator-safe message without SQL, stack traces, or exception payloads.
- Added Production Preflight regression coverage and documented the remaining ExcelJS/Archiver and Next.js PostCSS/Sharp high advisory chains, their current reachability, and the required supported-upgrade or separately approved replacement/override decision.
- Preserved the approved single-server SQLite architecture, authorization and ownership boundaries, Admin financial privacy, bounded synchronous export behavior, and all product scope.

### Sprint 3 — Epic 3: Financial Assurance

- Added the Batch 4 Financial Audit Detail Drawer: selecting a timeline event lazily loads the existing ownership-protected detail endpoint, deduplicates concurrent requests, caches successful DTOs for the page lifetime, and presents only allow-listed audit fields.
- Added native modal focus containment, Escape/backdrop/close-button dismissal, trigger-focus restoration, loading announcements, visible error Retry, and a dedicated `UNSUPPORTED_SCHEMA` unavailable state without client-side decoding.
- Added the platform `ContextDetailDrawer` with semantic responsive tokens, inline-end desktop/tablet and full-screen mobile presentation, sticky header, isolated native scrolling, temporary-layer elevation, reduced motion, and reusable consumer boundaries. Financial Audit now supplies content rather than owning a feature-local drawer primitive.
- Added component regression coverage and synchronized the affected architecture, roadmap, README, accessibility handoff, and AI context. No backend, HTTP, business, Prisma, schema, or financial-write behavior changed.
- Added ownership-scoped, read-only reconciliation and immutable Financial Audit read services with typed DTOs, opaque cursor pagination, event/date filtering, schema-version-aware allow-listed detail projection, and no repair path.
- Added protected Operator HTTP endpoints for audit timelines and projected detail: `GET /api/operator/reconciliation/students/:studentId/audit` and `GET /api/operator/reconciliation/students/:studentId/audit/:auditEventId`.
- Added the Financial Audit Timeline beneath the Student Reconciliation result. It renders semantic event cards, committed timestamps, summaries, available revisions, loading/empty/error/retry states, and incremental opaque-cursor Load More pagination without client-side financial calculations.
- Preserved current-Student ownership isolation, private no-store responses, raw-snapshot exclusion, and the distinction between audit commit time and Transaction business occurrence time.

### Sprint 3 — Epic 2: Export Experience

- Replaced direct report download navigation with a local, deterministic export interaction for CSV, Excel, and PDF while preserving the existing endpoints, coordinator, adapters, authorization, filters, limits, and filenames.
- Added per-format guidance, in-place preparing feedback, truthful browser-handoff confirmation, controlled inline failures and Retry, zero-result guidance, immediate duplicate-activation protection, and isolated per-tab state.
- Moved export actions after report results and pagination, retained focus and report context, and added regression coverage for state isolation, stale-attempt protection, semantic announcements, responsive layout, and browser-history-safe state reset.
- Simplified operational CSV, Excel, and PDF documents to Waktu, Siswa, Jenis Transaksi, Jumlah, Saldo Tersisa, Catatan, and Alasan; removed Audit Reference, revision/update metadata, Student status, the separate Correction-direction column, and net-movement summary while preserving Correction direction in the transaction-type text and retaining all audit/report data for the future dedicated Audit Log.

### Sprint 3 — Epic 1: Reports Enhancement

- Added 350 ms debounced Reports search with abortable pending work and newest-request protection so stale queries cannot navigate after newer input.
- Added concise applied-filter context and matching counts above Operator and Admin report results.
- Consolidated Operator sorting into accessible table headings, prioritized net movement in summaries, and moved secondary audit evidence into responsive native detail disclosures.
- Clarified that CSV, Excel, and PDF downloads include all data matching the active filters at click time, not only the visible page; Export architecture and behavior are unchanged.

## [1.1.0] - 2026-07-25

### Sprint 2 — Epic 2 & 2B: Dashboard Analytics, Insights & Visual UI Polish

- Implemented Operator Dashboard Analytics: month-to-date cash flow aggregations (Setoran Bulan Ini, Penarikan Bulan Ini, Arus Kas Bersih), operational attention alerts (`AttentionStudentsCard`), and filtered activity streams (`recentCorrections`, `recentWithdrawals`).
- Added `AttentionStudentsCard` component surfacing active zero-balance students, dormant students with 0 transactions, and inactive students holding balance.
- Standardized Level 1 visual hierarchy with hero card left accent border (`4px solid var(--color-action-primary)`), elevated surface, bold tabular numeric font (`1.875rem / 30px`), top border accents for trend cards, micro-interaction hover states, and `:focus-visible` focus ring styling.
- Documented complete architecture & design specification in `docs/42-dashboard-implementation.md`.

### Sprint 2 — Epic 1: Student Financial History


- Implemented date-grouped financial timeline component (`StudentTimeline`) on Operator Student Detail (`/operator/students/[id]`) rendering transaction history grouped by Jakarta timezone date headers (`Hari ini`, `Kemarin`, `Juli 2026`).
- Added `formatTimelineGroup` helper in `src/presentation/formatting.ts` for Asia/Jakarta date group formatting with today/yesterday/month-year categorization.
- Added comprehensive unit test for timeline group categorization (`test/student-financial-history.test.ts`).

### Sprint 2 — Global Currency Standardization

- Established `src/presentation/formatting.ts` as the single source of truth for Rupiah formatting (`Rp 10.000`, no decimal digits).
- Added `rupiah()`, `formatThousand()`, `parseNumericValue()`, `signedRupiah()`, and `correctionDirectionLabel()` centralized formatting functions.
- Standardized all currency display across Transaction Workspace, Transaction Modal, Student List, Student Detail, Dashboard, Reports, Statistics, Summary Cards, and Edit Transaction screens.
- Documented `BR-TXN-010` (Edit vs Correction distinction) in `docs/03-business-rules.md`.

### Sprint 2 — Epic 1A: Search UX & Filter Experience

- Added debounced live search (350ms) for Student and Transaction search fields.
- Expanded Transaction search scope to include `amount` (`BigInt`) matching, enabling numeric searches like `50000` or `Rp 50.000`.
- Updated search placeholders to `"Cari nominal, catatan, atau operator..."` for clarity.
- Scoped Operator student search to `name` and `notes` fields, omitting self-matching operator name.

### Sprint 2 — Epic 1B: QA Bug Fix Batch

- Fixed Student live search scoping in `src/students/service.ts`: Operator search now matches only `name` and `notes`, preventing self-matching operator name from returning all owned students.
- Fixed Correction button visual design: solidified `.correctionButton:not(:disabled)` with background `var(--color-warning-foreground)` and white text `var(--color-text-inverse)`.
- Connected controlled form state for all filter fields (`search`, `type`, `status`, `dateFrom`, `dateTo`) in `TransactionExperience` with URL SearchParams synchronization.
- Implemented instant reset action clearing all controlled form states and replacing router to clean base path.

### Sprint 2 — Epic 1C: Final UI Polish Batch

- Standardized cursor behavior across Report and Transaction filter forms: `cursor: pointer` for enabled interactive elements (`select:not(:disabled)`, `input[type="date"]:not(:disabled)`, buttons, links); `cursor: not-allowed` only for explicitly disabled elements.
- Added hover background feedback for Reset Filter buttons and links with `var(--color-primary-subtle)` background and `var(--color-action-primary)` border on `:hover:not(:disabled)`.
- Added automated CSS cursor and hover rule assertions in `test/ux-polish.test.ts`.
- All 151 automated tests passing, typecheck clean, lint clean, production build clean.

### Operator Self-Provisioning (Batch 5)

- Implemented Operator self-provisioning: Operators can now create new Students directly from their workspace (`/operator/students`).
- Server-enforced session operator binding: `operatorId` is strictly derived from active server session (`authorization.id`); client payload `operatorId` parameter is ignored/rejected to prevent identity spoofing.
- Added automatic `OperatorAudit` logging with action `STUDENT_CREATE` and actor Operator upon student creation.
- Added lightweight, accessible `CreateStudentModal` dialog component on `/operator/students` page with fields: Nama (required), Kelas, and Catatan (optional).
- Added SQLite migration `007_operator_self_provisioning_audit.sql` to support `STUDENT_CREATE` in `operator_audit` check constraint.
- Added comprehensive unit and integration tests covering operator self-provisioning, audit logging, security isolation, and immediate transaction entry (`test/operator-self-provisioning.test.ts`, 150 total tests passing).


- Added `WorkspaceStudentPicker` component: reusable, searchable combobox displaying Student Name, secondary Class/Notes, and live balance (`Saldo Rp150.000`) with full ARIA accessibility (`combobox`, `listbox`, `option`) and keyboard navigation.
- Extended `TransactionDialog` with dual submit actions: `"Simpan & Catat Lagi"` (consecutive multi-student mode) and `"Simpan & Selesai"`.
- Implemented Consecutive Entry Mode with Transaction Type Memory: saves transaction, retains dialog open state, preserves selected transaction type and correction direction, resets amount/notes & student picker, and auto-focuses student search input for instant follow-up entries.
- Added top-level **"+ Catat Transaksi"** action button to Transaction Workspace header, enabling multi-student transaction entry directly from the workspace.
- Added inline **Edit**, **Hapus** (Delete), and **Pulihkan** (Restore) action triggers directly on workspace desktop table rows and mobile transaction cards.
- Added toast notification feedback banner and auto-refresh workspace stream sync upon successful transaction mutations.
- Extended `studentManagement().list` to include persisted student balance formatting.
- Added comprehensive unit and UI component regression tests (145 total tests passing).

### Transaction Workspace Batch 2B (Operational Filters & Cash Flow Metrics)

- Added `WorkspaceMetricsBanner` rendering today's drawer cash flow summary (`Kas Masuk Hari Ini`, `Kas Keluar Hari Ini`, `Transaksi Hari Ini`) consumed directly from `GET /api/operator/transactions` summary data without client-side total recalculations.
- Added `WorkspaceFilterToolbar` supporting debounced search input (matching student name, notes, or reason), transaction type segmented pills (`Semua`, `Setoran`, `Penarikan`, `Koreksi`), and period preset selector (`Hari Ini`, `7 Hari Terakhir`, `Bulan Ini`, `Semua`).
- Synchronized all workspace filter controls with URL SearchParams (`search`, `type`, `period`), triggering server-side filtering and data refetches.
- Updated `workspaceHistory` read service and `GET /api/operator/transactions` route to support native `period` query parameter boundaries.
- Added comprehensive unit and structural tests for Batch 2B metrics and filter components (141 total tests passing).

### Transaction Workspace Batch 2A (Workspace Foundation & Table Stream)


- Replaced `FeaturePlaceholder` on `/operator/transactions` with the initial production-ready **Transaction Workspace** UI foundation (`TransactionWorkspaceView`).
- Implemented desktop semantic table (`WorkspaceTransactionTable`) and touch-friendly mobile card view (`WorkspaceTransactionCards`) displaying transaction timestamp, student name with secondary notes/class badge, IDR amount, operator attribution, and status badge.
- Added contextual empty state (`WorkspaceEmptyState`), loading skeleton (`WorkspaceSkeleton`), and cursor-based pagination bar (`WorkspacePaginationBar`).
- Integrated UI client controller directly with `GET /api/operator/transactions` without client-side total recalculations, maintaining server API as single source of truth.
- Added comprehensive UI structural and rendering tests (139 total tests passing).

### Transaction Workspace Batch 1 (Read Service & API Route)


- Added `transactionReadService().workspaceHistory(operatorId, query)` supporting multi-student cursor-paginated transaction history scoped strictly by the authenticated Operator identity.
- Added `GET /api/operator/transactions` API endpoint guarded by `withAuthorization({ role: "operator" })`, returning paginated workspace transaction items, student notes/class identity, cursor tokens, and today's cash flow summary (`todayDeposits`, `todayWithdrawals`, `todayTransactionCount`), while enforcing 403 Forbidden for Platform Admin.
- Added regression tests covering operator isolation, cursor pagination, search/type/status/student filtering, and API authorization.

### Excel Export Presentation

- Reorganized the `Laporan` worksheet into title, aligned metadata, compact `Ringkasan`, and transaction-table sections without changing the Export Document or export flow.
- Added neutral table styling, semantic column widths, report/table freeze panes, transaction-only filters, A4 print setup, repeated table headers, and page-number footers.

### PDF Export Foundation

- Added a presentation-only PDFKit adapter that converts the existing Export Document into a minimal landscape report without persistence, Reporting, authorization, filtering, or financial-calculation dependencies.
- Registered `pdf` beside CSV and Excel so the existing authorized endpoints, Coordinator, guard rails, filename generator, HTTP response, and registry-derived UI actions support PDF without format-specific request logic.
- Added document-derived title, generated time, period, summaries, columns, and ordered transaction rows with proportional column sizing, safe wrapping, continued oversized rows, repeated multipage headers, and page numbering.
- Added PDF parsing, metadata, summary, transaction, MIME type, filename, Coordinator pagination, registry selection, final-row preservation, and multipage repeated-header regression coverage.
- Added PDFKit `0.19.1` for maintained Node PDF generation and `pdfjs-dist` as a test-only round-trip parser.

### Excel Export Foundation

- Added a presentation-only ExcelJS adapter that converts the existing Export Document into one `Laporan` worksheet without persistence, Reporting, authorization, or financial-calculation dependencies.
- Registered `xlsx` beside CSV so existing authorized endpoints, Coordinator, guard rails, filenames, and registry-derived UI actions support Excel without duplicated format-specific request logic.
- Added document-derived metadata, summaries, headers and ordered rows with a frozen table header, auto-filter, wrapping, bounded widths, and display-ready numeric alignment.
- Added workbook round-trip, registry, MIME type, filename, multipage Coordinator, row-count, worksheet, header, and oversized preflight regression coverage.
- Added ExcelJS `4.4.0` with a scoped `uuid@11.1.1` override to remove its transitive UUID advisory while preserving the compatible API.

### Export Foundation

- Added a reusable Export Coordinator that validates format requests, forwards existing filter inputs to the Reporting Read Service, preserves the authorized Operator scope, and collects all matching report pages without direct persistence access.
- Added presentation-neutral Operator and Admin export documents, an extensible CSV/Excel/PDF registry, and shared Reporting/UI/export formatters without duplicated financial calculations.
- Implemented UTF-8 CSV downloads with complete escaping, spreadsheet-formula injection hardening, identical Rupiah/Jakarta date presentation, filtered-result export, and omission of hidden identifiers and Admin financial fields.
- Added centrally authorized Admin and Operator export endpoints plus registry-gated **Unduh CSV** actions on Reports and Operator Student report detail.
- Added regression coverage for registry validation, CSV encoding/escaping, multipage coordination, Reporting data parity, ownership isolation, Admin privacy, authorization reuse, read-only boundaries, and Export Contract compatibility.
- Added centralized `EXPORT_MAX_ROWS` and optional `EXPORT_MAX_BYTES` guard rails, first-page oversized rejection, exact rendered-byte enforcement, and controlled privacy-safe HTTP 413 errors.
- Improved filenames with normalized report period, Admin report kind where applicable, and collision-resistant `Asia/Jakarta` generation timestamps without names, search text, or identifiers.
- Added regression coverage for configuration validation, early row/estimated-byte rejection, final-byte enforcement, stable error mapping, and deterministic privacy-safe filenames.

### Reporting Foundation

- Replaced the Operator report placeholder with ownership-scoped financial reports supporting Student/type/status/search filters, Asia/Jakarta Today/Week/Month/custom periods, controlled sorting, summaries, and database pagination.
- Added read-only Student report detail with timeline metadata, Correction context, revisions, actor attribution, and exact persisted audit Balance-after evidence when available.
- Added privacy-safe Admin reports for Operator lifecycle activity, initial Student assignments, and minimized ownership changes without Transaction, Balance, or financial-audit payload access.
- Added reusable accessible filters, summaries, semantic responsive tables, contextual empty/error/loading states, and a future PDF/Excel/CSV adapter contract without implementing exports.
- Polished Reporting UX with distinct no-assignment/first-use/search/filter empty states, meaningful icons and context-preserving actions, explanatory zero-value summaries, role-appropriate search hints, grouped custom dates, contextual disabled controls, pending/live-result feedback, table captions/sort semantics, consistent badges, pointer/keyboard row feedback, and clearer responsive presentation.
- Added real SQLite regression coverage for ownership isolation, soft-delete exclusion, filters, Jakarta dates, pagination, summary accuracy, Admin privacy, and export-neutral/read-only boundaries.

### Dashboard Foundation

- Replaced Admin and Operator dashboard placeholders with production read-only dashboards using fixed-count aggregate and bounded activity projections.
- Added ownership-scoped Operator Student counts, managed persisted Balance, Asia/Jakarta daily Deposit/Withdrawal totals, recent Transactions, updated Students, and quick links to existing workflows.
- Added privacy-safe Admin Operator/Student counts, Student distribution, Operator audit activity, ownership changes, latest assignments, and administrative quick actions without financial-detail access.
- Added reusable statistic, trend, summary, activity, quick-action, grid, and skeleton dashboard components with mobile single-column behavior and accessible labelled regions.
- Added real SQLite dashboard regression coverage proving cross-Operator Balance and activity isolation, Admin financial privacy, empty projections, read-only boundaries, fixed query limits, responsiveness, and accessibility.

### Fixed

- Made Student ownership reassignment require a reason and atomically append immutable privacy-minimized `OWNERSHIP_TRANSFER` audit evidence; injected audit failure now rolls back the owner update.
- Kept Correction reasons visible when optional Notes exist, enforced required Deposit Notes during edit-to-Deposit, and moved dialog focus to asynchronous error summaries.
- Converted malformed Operator and Student admin API JSON from unexpected 500 failures into stable `VALIDATION` 400 responses.

### Quality Assurance

- Added long-chain Balance/revision/audit reconciliation, real SQLite ownership-transfer rollback/immutability, malformed-body, development-role login, and Transaction UI regression coverage.
- Completed isolated HTTP workflow validation, foreign-key/orphan checks, query-plan smoke checks, and the MVP release report in `docs/41-mvp-quality-assurance-report.md`.

### Added

- Reusable `FeaturePlaceholder` with planned/in-development status, optional icon/action/availability, and richer future-capability cards.
- Intentional placeholder routes for every unfinished sidebar destination plus richer Admin and Operator dashboard roadmap previews.
- Context-aware empty/no-result copy, table/card/ledger skeleton variants, responsive mobile table cards, and UX-state regression tests.
- Ownership-scoped Operator Student-list Balance summaries with explicit `Rp 0` and no-transactions context; Platform Admin financial privacy remains unchanged.
- Complete mobile-first Transaction UI on Operator Student Detail with authoritative Balance overview, last-updated activity, Transaction count, newest-first ledger, filters, and stable cursor pagination.
- Accessible Deposit, Withdrawal, Correction, edit, soft-delete, and restore dialogs with exact-IDR input, Notes, lifecycle reasons, backend error display, in-flight protection, and idempotent unknown-outcome retry identity.
- Ownership-scoped financial read projection and additive bounded Transaction Notes migration with read, filter, accessibility, responsive, migration, and workflow tests.
- Complete Transaction Engine persistence and protected Operator APIs for Deposit, Withdrawal, directional Correction, edit, soft delete, and restore.
- Persisted non-negative Student Balance and financial version with SQLite `BEGIN IMMEDIATE` serialization, guarded updates, command idempotency, and rollback-safe immutable financial audit.
- Transaction lifecycle actor/revision/deletion metadata, deterministic audit snapshots, financial constraints/indexes, hard-delete and audit-immutability triggers, fail-closed legacy migration, and comprehensive engine tests.

- Milestone 1 project foundation with a mobile-first PWA shell, server boundary, relational schema migrations, and baseline tests.
- Accepted ADRs for Google-only Auth.js authentication, Amanah Cash role/ownership authorization, and financial-data privacy.
- Prisma identity schema, Auth.js-compatible User/Account/Session persistence, required active-Operator Student ownership, reversible migration, and persistence constraint tests.
- Stable Auth.js Google authentication with pre-provisioned active-user admission, Prisma-backed sessions, login/logout pages, reusable authentication-only helpers, and failure/security tests.
- Centralized role and Student-ownership authorization for routes, APIs, and Server Actions, including masked cross-Operator ownership failures.
- Authenticated App Shell with role-aware navigation, protected Admin and Operator route groups, and shared loading, empty, forbidden, not-found, and error states.
- Complete Operator Management with server-side search and pagination, inactive-by-default provisioning, activation/deactivation, assignment-safe logical deletion, session revocation, last-login tracking, audit summaries, protected APIs, UI, documentation, migrations, and tests.
- Complete Student Management with Platform Admin creation/editing, active-Operator assignment and reassignment, active/inactive/archived statuses, notes, server-side search and pagination, Operator-owned list/detail access, protected APIs, UI states, documentation, migrations, and tests.
- Accepted ADR-004 for Student-owned Transactions, persisted Student Balance, Deposit/Withdrawal/Correction effects, controlled edit/soft-delete/restore, immutable financial audit, command idempotency, and per-Student atomicity.
- Approved the implementation-ready Transaction Foundation technical design covering domain/lifecycle contracts, Balance consistency and rollback, audit, failures, authorization, reporting implications, sequence diagrams, and reserved extension points.
- Canonical engineering handoff requirements in `AI_CONTEXT.md`, including sprint status, architecture, decisions, limitations, outstanding work, and next-sprint guidance.

### Changed

- Reserved generic 404 for unknown routes and missing resources; known roadmap modules no longer appear broken.
- Differentiated unexpected, forbidden, unauthorized, not-found, validation, empty, loading, and development-placeholder presentation.
- Replaced mobile table overflow with labeled record cards and added consistent focus-visible behavior for list controls.
- Approved the complete MVP documentation set after final consistency review.
- Replaced obsolete governance documents with the approved Engineering Rules and Development Workflow.
- Synchronized requirements, domain, flows, architecture, roadmap, accessibility, and Landing Page contracts with the locked authentication and privacy decisions.
- Updated authentication admission and authorization lookups to exclude logically deleted users and record successful Operator login time.
- Replaced the Operator Student Detail financial placeholder with the committed Balance and complete Transaction workflow while preserving Platform Admin financial privacy.
- Synchronized README, roadmap, changelog, and canonical AI handoff with the implemented Operator and Student modules.
- Superseded the pre-Transaction-Foundation derived-Balance, append-only Transaction, no-actor, and no-soft-delete architecture with the locked ADR-004 model across requirements, rules, domain, database target, system architecture, roadmap, engineering workflow, privacy/authorization references, and affected future-content specifications.
- Kept Transaction Foundation architecture-only: no application code, migration, Prisma model, API, or UI change is included.

## [1.0.0] - 2026-07-17

### Added

- Immutable Product Principles.
- Functional and Non-Functional Requirements.
- Authoritative Business Rules.
- Domain Model and Database Design.
- User Flows and structured-text Wireframes.
- System Architecture and Development Roadmap.
