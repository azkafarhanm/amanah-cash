# Changelog

All notable changes to Amanah Cash will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
