# Graph Report - .  (2026-07-24)

## Corpus Check
- 256 files · ~139,520 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 941 nodes · 1912 edges · 116 communities (45 shown, 71 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- loading.tsx Group
- route.ts Group
- Auth & Security (2)
- Operator & Transactions (3)
- route.ts Group
- Auth & Security (5)
- Operator & Transactions (6)
- Auth & Security (7)
- Database & Core Config (8)
- Auth & Security (9)
- error.tsx Group
- Operator & Transactions (11)
- Operator & Transactions (12)
- button.tsx Group
- Operator & Transactions (14)
- Database & Core Config (15)
- Testing Suite (16)
- Database & Core Config (17)
- page.tsx Group
- pdf-adapter.ts Group
- card.tsx Group
- route.ts Group
- loading.tsx Group
- csv-adapter.ts Group
- Auth & Security (24)
- excel-adapter.ts Group
- types.ts Group
- Testing Suite (27)
- Testing Suite (28)
- migrate-database.ts Group
- Operator & Transactions (30)
- package.json Group
- Operator & Transactions (32)
- heading.tsx Group
- Testing Suite (34)
- Auth & Security (35)
- Operator & Transactions (36)
- container.tsx Group
- Auth & Security (38)
- app.js Group
- page.tsx Group
- layout.tsx Group
- database.d.ts Group
- Testing Suite (43)
- Operator & Transactions (44)
- dotenv Group
- Database & Core Config (46)
- Database & Core Config (47)
- pdfjs-dist Group
- tailwindcss Group
- @types/better-sqlite3 Group
- @types/pdfkit Group
- Database & Core Config (52)
- pdfkit-standalone.d.ts Group
- Workflow: graphify (graphify.md) Group
- Amanah Cash — Canonical Engineering Handoff (AI_CONTEXT.md) Group
- Changelog (CHANGELOG.md) Group
- Amanah Cash (README.md) Group
- Amanah Cash — Product Principles (00-product-principles.md) Group
- Amanah Cash — Functional Requirements (SRS) (01-functional-requirements.md) Group
- Amanah Cash — Non-Functional Requirements (02-non-functional-requirements.md) Group
- Amanah Cash — Business Rules (03-business-rules.md) Group
- Amanah Cash — Domain Model (04-domain-model.md) Group
- Amanah Cash — User Flows (05-user-flow.md) Group
- Amanah Cash — Wireframes (06-wireframe.md) Group
- Amanah Cash — Database Design (07-database-design.md) Group
- Amanah Cash — System Architecture (08-system-architecture.md) Group
- Amanah Cash — Development Roadmap (09-development-roadmap.md) Group
- Amanah Cash — Engineering Rules (10-engineering-rules.md) Group
- Amanah Cash — Development Workflow (11-development-workflow.md) Group
- Amanah Cash — UI Design System (12-ui-design-system.md) Group
- Amanah Cash — Design References (13-design-references.md) Group
- Amanah Cash — Component Guidelines (14-component-guidelines.md) Group
- Amanah Cash — Motion Guidelines (15-motion-guidelines.md) Group
- Amanah Cash — Accessibility Guidelines (16-accessibility-guidelines.md) Group
- Amanah Cash — Design Review Checklist (17-design-review-checklist.md) Group
- Amanah Cash — MVP Screen Specifications (19-screen-specifications.md) Group
- Amanah Cash — Master Interaction States (20-interaction-states.md) Group
- Amanah Cash — Landing Page Strategy (22-landing-page-strategy.md) Group
- Amanah Cash — Landing Page Blueprint (23-landing-page-blueprint.md) Group
- Amanah Cash — Landing Page Content Specification (24-landing-page-content.md) Group
- Amanah Cash — Landing Page Implementation Plan (25-landing-page-implementation-plan.md) Group
- Auth & Security (86)
- Auth & Security (87)
- ADR-003 — Financial Data Privacy and Administrative Separation (28-adr-financial-data-privacy.md) Group
- Auth & Security (89)
- Auth & Security (90)
- Auth & Security (91)
- Auth & Security (92)
- Application Shell Architecture (33-application-shell-architecture.md) Group
- Operator & Transactions (94)
- Student Management Implementation (35-student-management-implementation.md) Group
- Operator & Transactions (96)
- Operator & Transactions (97)
- Operator & Transactions (98)
- Operator & Transactions (99)
- UX Polish and Placeholder Strategy (40-ux-polish-and-placeholder-strategy.md) Group
- MVP Quality Assurance and Business Workflow Validation (41-mvp-quality-assurance-report.md) Group
- Dashboard and Analytics Foundation Implementation (42-dashboard-implementation.md) Group
- Reporting Foundation Implementation (43-reporting-foundation.md) Group
- Export Foundation Implementation (44-export-foundation.md) Group
- Export Foundation — Architecture and Production Readiness Review (45-export-production-readiness-review.md) Group
- Excel Export Foundation (46-excel-export-foundation.md) Group
- PDF Export Foundation (47-pdf-export-foundation.md) Group
- Amanah Cash Foundation Review (99-foundation-review.md) Group
- Domain Layer (README.md) Group

## God Nodes (most connected - your core abstractions)
1. `ContentWrapper()` - 29 edges
2. `rupiah()` - 24 edges
3. `studentManagement()` - 24 edges
4. `withAuthorization()` - 21 edges
5. `getPrismaClient()` - 21 edges
6. `loadAuthenticationEnvironment()` - 20 edges
7. `authorization()` - 18 edges
8. `SectionHeader()` - 18 edges
9. `scripts` - 17 edges
10. `operatorManagement()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `createAuthorization()` --indirect_call--> `authorize()`  [INFERRED]
  src/authorization/core.ts → test/authentication.test.ts
- `GET()` --indirect_call--> `operator()`  [INFERRED]
  src/app/api/admin/operators/[id]/route.ts → test/export.test.ts
- `inMemorySessionAdapter()` --calls--> `createAuthenticationAdapter()`  [EXTRACTED]
  test/authentication.test.ts → src/auth/adapter.ts
- `service()` --calls--> `createAuthorization()`  [EXTRACTED]
  test/authorization.test.ts → src/authorization/core.ts
- `fixture()` --calls--> `createOperatorManagement()`  [EXTRACTED]
  test/operator-management.test.ts → src/operators/domain.ts

## Import Cycles
- None detected.

## Communities (116 total, 71 thin omitted)

### Community 0 - "loading.tsx Group"
Cohesion: 0.06
Nodes (58): AdminReportsPage(), ReportsPage(), StudentReportPage(), adminReportExportHref(), adminReportHref(), operatorReportExportHref(), reportHref(), AdminReportExport() (+50 more)

### Community 1 - "route.ts Group"
Cohesion: 0.08
Nodes (40): Context, GET(), PATCH(), GET, POST, GET(), GET, createStudentAction() (+32 more)

### Community 2 - "Auth & Security (2)"
Cohesion: 0.06
Nodes (37): adminEmail, environment, operatorEmail, prisma, studentName, authHandler(), RouteContext, AuthenticatedLayout() (+29 more)

### Community 3 - "Operator & Transactions (3)"
Cohesion: 0.08
Nodes (36): transactionDate(), transactionPageHref(), DialogKind, localDateTime(), TransactionDialog(), TransactionExperience(), TransactionWorkspaceView(), FilterValues (+28 more)

### Community 4 - "route.ts Group"
Cohesion: 0.07
Nodes (41): POST, POST, DELETE, owner, PATCH, GET, amountValue(), checkedBalance() (+33 more)

### Community 5 - "Auth & Security (5)"
Cohesion: 0.09
Nodes (37): AdminLayout(), AuthenticatedApplicationEntry(), OperatorLayout(), authorizeServerActionWith(), ServerActionPolicy, ApiAuthorizationPolicy, AuthorizedApiHandler, withAuthorizationUsing() (+29 more)

### Community 6 - "Operator & Transactions (6)"
Cohesion: 0.12
Nodes (26): DELETE(), GET(), PATCH(), RouteContext, GET, POST, createOperatorAction(), deleteOperatorAction() (+18 more)

### Community 7 - "Auth & Security (7)"
Cohesion: 0.12
Nodes (21): AdminHome(), OperatorHome(), AuthenticationEnvironment, ACTIVITY_LABEL, ActivityCard(), activityDate(), DashboardActionLink(), DashboardGrid() (+13 more)

### Community 8 - "Database & Core Config (8)"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 9 - "Auth & Security (9)"
Cohesion: 0.09
Nodes (23): better-sqlite3, exceljs, geist, next, next-auth, @next-auth/prisma-adapter, dependencies, better-sqlite3 (+15 more)

### Community 11 - "Operator & Transactions (11)"
Cohesion: 0.10
Nodes (12): ExportConfigurationError, database, databasePath, emptyOperatorResult(), engine, environment, generatedAt, loadPdf() (+4 more)

### Community 12 - "Operator & Transactions (12)"
Cohesion: 0.17
Nodes (15): ExportEnvironment, ExportLimits, loadExportLimits(), positiveInteger(), ADMIN_QUERY_KEYS, completeAdminReport(), completeOperatorReport(), OPERATOR_QUERY_KEYS (+7 more)

### Community 13 - "button.tsx Group"
Cohesion: 0.16
Nodes (13): Button(), ButtonProps, ContentWrapperProps, LoadingSkeletonProps, LoadingSkeletonVariant, Logo(), LogoProps, Section() (+5 more)

### Community 14 - "Operator & Transactions (14)"
Cohesion: 0.15
Nodes (10): AppShell(), AppShellProps, adminNavigation, NavigationIcon(), navigationForRole(), NavigationItem, operatorNavigation, LogoutButton() (+2 more)

### Community 15 - "Database & Core Config (15)"
Cohesion: 0.12
Nodes (17): eslint, devDependencies, eslint, prisma, @tailwindcss/postcss, tsx, @types/node, @types/react (+9 more)

### Community 16 - "Testing Suite (16)"
Cohesion: 0.12
Nodes (17): scripts, build, db:migrate, db:seed, db:setup, dev, env:check, lint (+9 more)

### Community 17 - "Database & Core Config (17)"
Cohesion: 0.17
Nodes (11): createGetSystemStatus(), loadConfig(), projectRoot, config, database, getSystemStatus, server, contentTypes (+3 more)

### Community 18 - "page.tsx Group"
Cohesion: 0.18
Nodes (6): HeroSection(), LandingFooter(), LandingHeader(), LandingPage(), SkipLink(), PageContainer()

### Community 19 - "pdf-adapter.ts Group"
Cohesion: 0.25
Nodes (14): addPageFooters(), addTablePage(), COLUMN_WEIGHTS, PAGE_OPTIONS, printableText(), renderContinuationHeading(), renderReportHeading(), renderRowFragment() (+6 more)

### Community 20 - "card.tsx Group"
Cohesion: 0.16
Nodes (11): Card(), CardProps, COPY, EmptyState(), EmptyStateKind, EmptyStateProps, ErrorStateProps, ICON (+3 more)

### Community 21 - "route.ts Group"
Cohesion: 0.20
Nodes (8): GET, GET, createExportCoordinator(), exportCoordinator(), ExportFormatUnavailableError, ExportLimitExceededError, isExportError(), exportResponse()

### Community 23 - "csv-adapter.ts Group"
Cohesion: 0.21
Nodes (10): csvCell(), csvExportAdapter, csvRow(), safeCell(), ExportValidationError, pdfExportAdapter, createExportRegistry(), exportRegistry (+2 more)

### Community 24 - "Auth & Security (24)"
Cohesion: 0.15
Nodes (7): database, databasePath, engine, environment, root, temporary, toDelete

### Community 25 - "excel-adapter.ts Group"
Cohesion: 0.21
Nodes (8): CENTERED_COLUMNS, columnWidth(), displayWidth(), excelExportAdapter, horizontalAlignment(), isNumericDisplay(), PREFERRED_COLUMN_WIDTHS, ExportDocument

### Community 26 - "types.ts Group"
Cohesion: 0.22
Nodes (8): ExportFormat, ExportFormatDescriptor, ExportResult, ExportRow, ExportSummaryItem, ReportExportAdapter, ReportExportColumn, ReportExportDocument

### Community 27 - "Testing Suite (27)"
Cohesion: 0.18
Nodes (7): database, databasePath, engine, environment, removed, root, temporary

### Community 28 - "Testing Suite (28)"
Cohesion: 0.20
Nodes (6): database, databasePath, engine, environment, root, temporary

### Community 29 - "migrate-database.ts Group"
Cohesion: 0.32
Nodes (6): database, databasePathValue, environment, projectRoot, openDatabase(), runMigrations()

### Community 30 - "Operator & Transactions (30)"
Cohesion: 0.29
Nodes (5): createTransactionEngine(), TransactionEngineDatabase, directories, fixture(), root

### Community 31 - "package.json Group"
Cohesion: 0.29
Nodes (6): engines, node, name, private, type, version

### Community 32 - "Operator & Transactions (32)"
Cohesion: 0.33
Nodes (3): plainRows(), root, tableInfo()

### Community 33 - "heading.tsx Group"
Cohesion: 0.40
Nodes (4): Heading(), HeadingProps, variantClasses, SectionHeaderProps

### Community 35 - "Auth & Security (35)"
Cohesion: 0.40
Nodes (5): uuid, uuid, overrides, exceljs, next-auth

### Community 37 - "container.tsx Group"
Cohesion: 0.60
Nodes (3): Container(), ContainerProps, PageContainerProps

### Community 38 - "Auth & Security (38)"
Cohesion: 0.40
Nodes (4): JWT, next-auth, next-auth/jwt, Session

## Knowledge Gaps
- **274 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `type` (+269 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **71 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getPrismaClient()` connect `Auth & Security (2)` to `loading.tsx Group`, `route.ts Group`, `Operator & Transactions (3)`, `Auth & Security (5)`, `Operator & Transactions (6)`, `Auth & Security (7)`, `Operator & Transactions (11)`, `Auth & Security (24)`, `Testing Suite (27)`, `Testing Suite (28)`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `openDatabase()` connect `migrate-database.ts Group` to `Operator & Transactions (32)`, `route.ts Group`, `Auth & Security (2)`, `Testing Suite (34)`, `Operator & Transactions (3)`, `Operator & Transactions (11)`, `Database & Core Config (17)`, `Auth & Security (24)`, `Testing Suite (27)`, `Testing Suite (28)`, `Operator & Transactions (30)`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `loadAuthenticationEnvironment()` connect `Auth & Security (2)` to `loading.tsx Group`, `route.ts Group`, `Operator & Transactions (3)`, `route.ts Group`, `Auth & Security (5)`, `Operator & Transactions (6)`, `Auth & Security (7)`, `Operator & Transactions (12)`, `migrate-database.ts Group`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _274 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `loading.tsx Group` be split into smaller, more focused modules?**
  _Cohesion score 0.06293706293706294 - nodes in this community are weakly interconnected._
- **Should `route.ts Group` be split into smaller, more focused modules?**
  _Cohesion score 0.08469945355191257 - nodes in this community are weakly interconnected._
- **Should `Auth & Security (2)` be split into smaller, more focused modules?**
  _Cohesion score 0.06328320802005012 - nodes in this community are weakly interconnected._