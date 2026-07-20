# Changelog

All notable changes to Amanah Cash will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Milestone 1 project foundation with a mobile-first PWA shell, server boundary, relational schema migrations, and baseline tests.
- Accepted ADRs for Google-only Auth.js authentication, Amanah Cash role/ownership authorization, and financial-data privacy.
- Prisma identity schema, Auth.js-compatible User/Account/Session persistence, required active-Operator Student ownership, reversible migration, and persistence constraint tests.
- Stable Auth.js Google authentication with pre-provisioned active-user admission, Prisma-backed sessions, login/logout pages, reusable authentication-only helpers, and failure/security tests.
- Centralized role and Student-ownership authorization for routes, APIs, and Server Actions, including masked cross-Operator ownership failures.
- Authenticated App Shell with role-aware navigation, protected Admin and Operator route groups, and shared loading, empty, forbidden, not-found, and error states.
- Complete Operator Management with server-side search and pagination, inactive-by-default provisioning, activation/deactivation, assignment-safe logical deletion, session revocation, last-login tracking, audit summaries, protected APIs, UI, documentation, migrations, and tests.
- Complete Student Management with Platform Admin creation/editing, active-Operator assignment and reassignment, active/inactive/archived statuses, notes, server-side search and pagination, Operator-owned list/detail access, protected APIs, UI states, documentation, migrations, and tests.
- Canonical engineering handoff requirements in `AI_CONTEXT.md`, including sprint status, architecture, decisions, limitations, outstanding work, and next-sprint guidance.

### Changed

- Approved the complete MVP documentation set after final consistency review.
- Replaced obsolete governance documents with the approved Engineering Rules and Development Workflow.
- Synchronized requirements, domain, flows, architecture, roadmap, accessibility, and Landing Page contracts with the locked authentication and privacy decisions.
- Updated authentication admission and authorization lookups to exclude logically deleted users and record successful Operator login time.
- Replaced Student financial values with explicit static placeholders until the Financial Transactions sprint; no balance or Transaction query is performed.
- Synchronized README, roadmap, changelog, and canonical AI handoff with the implemented Operator and Student modules.

## [1.0.0] - 2026-07-17

### Added

- Immutable Product Principles.
- Functional and Non-Functional Requirements.
- Authoritative Business Rules.
- Domain Model and Database Design.
- User Flows and structured-text Wireframes.
- System Architecture and Development Roadmap.
