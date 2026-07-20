# Amanah Cash

Amanah Cash is a mobile-first Progressive Web App for managing funds entrusted to Students. The implemented platform provides Google authentication, centralized role and ownership authorization, Operator and Student management, and the complete Transaction Engine financial core.

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

Excluded:

- Offline synchronization.
- Hard Transaction deletion and Student deletion.
- Transaction transfer, schedules, monthly allowance, categories, attachments, approval workflow, Reports, Export, analytics, notifications, and bulk operations remain unimplemented extension scope.
- Multiple currencies and distributed infrastructure.
- Financial read presentation, reconciliation tooling, and progressive history remain the next milestone.

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

AI assistants should begin with [AI_CONTEXT.md](AI_CONTEXT.md).

## Development Roadmap

Project Foundation, Student Management, authentication, authorization, App Shell, Operator Management, and the Transaction Engine are complete. The next recommended sprint implements ownership-scoped reconciliation and financial reads without adding reporting or presentation scope.

## Contributing

Contributions must trace to approved requirements, preserve atomic persisted-Balance reconciliation, controlled Transaction lifecycle, immutable audit, ownership/privacy boundaries, architecture layers, relevant verification, and synchronized documentation. Follow the [Engineering Rules](docs/10-engineering-rules.md) and [Development Workflow](docs/11-development-workflow.md).

Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run prisma:validate`, and `npm run build` before handing off an implementation sprint. Every sprint must also synchronize `AI_CONTEXT.md` and relevant implementation documentation.

## License

License information has not yet been specified.
