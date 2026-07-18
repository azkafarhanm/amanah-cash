# Amanah Cash

Amanah Cash is a mobile-first Progressive Web App for managing funds entrusted to Students. It provides a deliberately small workflow for creating Students, recording Deposits and Withdrawals, and reproducing every Balance from immutable Transaction history.

## Problem Statement

Entrusted student funds require fast daily recording without weakening financial traceability. Manually maintained balances can diverge from their underlying events, while broad financial systems add unnecessary workflow overhead.

## Solution

Transaction history is the single financial source of truth. The Operator records whole-Rupiah Deposits and Withdrawals; the application derives Balance from complete history and loads older Transactions progressively.

## Core Principles

- Mobile-first PWA delivery.
- Fast input and minimal cognitive load.
- Append-only financial event traceability.
- Intentionally small MVP scope.
- Simplicity over generality.
- Production-grade correctness and explicit failures.

See [Product Principles](docs/00-product-principles.md).

## Architecture Summary

```text
PWA Presentation → Server Application → Domain → Persistence → Relational Database
```

The MVP uses one client, one server deployable, and one database. Student is the aggregate root. Transactions are append-only. Balance is calculated from complete history and never persisted independently.

## MVP Scope

Included:

- Create, list, search, and view Students.
- Record whole-IDR Deposits and Withdrawals.
- Prevent negative Balance.
- Load newest-first Transaction history progressively.
- Responsive PWA operation and explicit interaction states.

Excluded:

- Authentication, multi-user behavior, roles, and actor attribution from current MVP behavior and its foundation.
- Offline synchronization.
- Transaction or Student editing and deletion.
- Reports, exports, notes, categories, notifications, and bulk operations.
- Multiple currencies and distributed infrastructure.

Auth.js with Database Sessions remains the approved long-term authentication solution, but its installation, configuration, and schema are deferred to a dedicated Authentication Sprint. Sprint 1 is limited to Local Development project bootstrap with SQLite; production deployment decisions are deferred to the Deployment phase.

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

AI assistants should begin with [AI_CONTEXT.md](AI_CONTEXT.md).

## Development Roadmap

The roadmap covers Project Foundation, Student Management, Deposit, Balance and Withdrawal, progressive history, interaction states, safe retry, verification, and production readiness. Each milestone defines scope, dependencies, deliverables, and completion criteria.

## Contributing

Contributions must trace to approved requirements, preserve append-only history and derived Balance, respect architecture layers, include relevant verification, and synchronize documentation. Follow the [Engineering Rules](docs/10-engineering-rules.md) and [Development Workflow](docs/11-development-workflow.md).

Framework-specific setup commands will be documented only after implementation technology is approved.

## License

License information has not yet been specified.
