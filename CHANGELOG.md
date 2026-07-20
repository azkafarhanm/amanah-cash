# Changelog

All notable changes to Amanah Cash will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

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

- Approved the complete MVP documentation set after final consistency review.
- Replaced obsolete governance documents with the approved Engineering Rules and Development Workflow.
- Synchronized requirements, domain, flows, architecture, roadmap, accessibility, and Landing Page contracts with the locked authentication and privacy decisions.
- Updated authentication admission and authorization lookups to exclude logically deleted users and record successful Operator login time.
- Replaced Student financial values with explicit static placeholders until the Financial Transactions sprint; no balance or Transaction query is performed.
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
