# Amanah Cash — System Architecture

**Version:** 1.3
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-20

---

## 1. Purpose

This document defines the implementation architecture for the approved Amanah Cash MVP. It translates existing requirements into technical responsibilities without selecting application frameworks or adding product behavior.

## 2. Architecture Goals

- Preserve transaction history as the single financial source of truth.
- Keep financial writes correct under concurrent requests.
- Support a fast mobile-first PWA experience.
- Keep deployment and operations small enough for an MVP.
- Maintain clear boundaries so implementation technology can change without changing business rules.

## 3. Overall Architecture

```text
┌──────────────────────┐
│ PWA Client           │
│ Presentation         │
└──────────┬───────────┘
           │ request / response
           v
┌──────────────────────┐
│ Server               │
│ Application + Domain │
│ + Persistence        │
└──────────┬───────────┘
           │ database transaction
           v
┌──────────────────────┐
│ Relational Database  │
│ Identity boundary +  │
│ financial records    │
└──────────────────────┘
```

The MVP uses one client, one server application, and one relational database. The server is one deployable unit even though its internal responsibilities are separated into layers.

## 4. Layered Architecture

```text
Presentation Layer
        ↓
Application Layer
        ↓
Domain Layer
        ↓
Persistence Layer
        ↓
Relational Database
```

### 4.1 Presentation Layer

Runs in the PWA client and is responsible for:

- The three approved screens and Create Student overlay.
- Mobile-first layout, navigation, loading, empty, and error states.
- Immediate input-format validation and inline feedback.
- Explicit Deposit and Withdrawal direction.
- Preventing repeated submission while a request is in progress.
- Progressive transaction-history interaction.
- Never presenting a partial-history balance as authoritative.

The client does not calculate the authoritative Balance, enforce concurrency, or access the database directly.

### 4.2 Application Layer

Runs on the server and coordinates the approved use cases:

- Create Student.
- List and search Students.
- Load Student Detail and Balance.
- Record Deposit.
- Record Withdrawal.
- Load progressive Transaction history.
- Resolve or safely retry a Transaction submission.

It validates request shape, invokes Domain rules, establishes transaction boundaries through Persistence, and returns explicit outcomes. It contains orchestration, not presentation layout or database-specific queries.

### 4.3 Domain Layer

Runs on the server and owns approved business meaning and invariants:

- StudentName normalization and validity.
- Whole-Rupiah Amount validity.
- Deposit and Withdrawal direction.
- Append-only Transaction semantics.
- Balance formula.
- Non-negative Balance rule.
- Student aggregate boundary.

The Domain layer has no dependency on client screens, transport details, or a database product.

### 4.4 Persistence Layer

Runs on the server and translates application operations into database access:

- Student and Transaction storage.
- Case-insensitive Student uniqueness.
- Complete-history Balance aggregation.
- Stable progressive-history queries.
- SQLite financial-write serialization through `BEGIN IMMEDIATE`.
- Atomic Deposit and Withdrawal persistence.
- Stable Transaction UUID lookup for retry resolution.

Database-specific behavior remains behind this layer.

## 5. Client Responsibilities

The PWA client:

- Loads current data from the server while online.
- Renders Student List, Student Detail, and Transaction Entry.
- Registers the approved PWA service worker and installability metadata.
- Uses browser navigation semantics.
- Preserves valid form input after validation or retryable system failures.
- Shows success only after the server confirms persistence.
- Reports network failure and does not queue offline Transactions.

The service worker supports PWA delivery only. It does not implement offline data or transaction synchronization.

## 6. Server Responsibilities

The server is the authoritative boundary for all application operations. It:

- Revalidates all client input.
- Applies Domain invariants.
- Controls access to Persistence.
- Computes Balance from complete persisted history.
- Opens, commits, and rolls back database transactions.
- Serializes financial writes for each Student.
- Maps validation, conflict, not-found, and system outcomes into explicit responses.
- Prevents a retry from creating an unintended duplicate Transaction.

Client validation improves speed but never replaces server validation.

## 7. Database Responsibilities

The single relational database:

- Stores `students` and immutable `transactions` as the financial source entities.
- After its separately reviewed schema is implemented, stores provisioned users, provider linkage, database sessions, roles, and Student ownership outside the financial source of truth.
- Enforces primary keys, foreign keys, required values, type checks, positive Amount, and Student-name uniqueness.
- Restricts Student deletion when Transactions exist.
- Supports append-only Transaction access for the application.
- Provides single-writer serialization through `BEGIN IMMEDIATE` and atomic commit or rollback.
- Computes exact whole-Rupiah Balance from all persisted Transactions.
- Supports deterministic newest-first history retrieval.

It does not store Balance, offline state, or a second financial representation. Authentication data must not contain financial values.

## 8. Validation Responsibilities

| Validation | Client | Server / Domain | Database |
|------------|--------|-----------------|----------|
| Required Student name | Immediate feedback | Authoritative validation | Not-null and non-blank constraint |
| Name normalization and length | Preview and feedback | Authoritative normalization and validation | Length constraint |
| Case-insensitive uniqueness | No | Convert conflict to domain outcome | Unique index |
| Whole-Rupiah Amount | Immediate feedback | Authoritative validation | Integer type and positive check |
| Transaction type | Fixed by entry mode | Allow only approved type | Type check |
| Existing Student | No | Map missing Student outcome | Foreign key and lookup inside the immediate transaction |
| Sufficient Balance | Informative only | Invoke atomic operation | Serialized full-history check and insert |
| Duplicate retry | Disable repeated tap | Reuse logical Transaction UUID | Transaction primary key |

Validation is intentionally repeated at trust boundaries. Client validation improves interaction speed; server and database validation protect correctness.

## 9. Transaction Boundaries

### 9.1 Create Student

One database transaction normalizes and inserts the Student. The unique index resolves concurrent duplicate creation. Failure commits nothing.

### 9.2 Deposit

One `BEGIN IMMEDIATE` SQLite transaction acquires the write reservation, verifies the Student, inserts one complete Deposit, and commits. Every financial write uses the same serialization protocol.

### 9.3 Withdrawal

One database transaction:

1. Starts `BEGIN IMMEDIATE` before reading the Student or Balance.
2. Calculates Balance from all persisted Transactions.
3. Rejects the request if Amount exceeds Balance.
4. Otherwise inserts the Withdrawal.
5. Commits the operation.

Validation and insertion are not split across transactions.

### 9.4 SQLite Process and Retry Contract

The MVP runs one active server process against one SQLite database file. All database access passes through that server's Persistence layer; multiple server writers and external direct writers are unsupported. SQLite may serialize writes for different Students because its physical lock is database-wide. This still satisfies the Domain guarantee that writes for the same Student are serialized.

The connection sets `PRAGMA busy_timeout = 5000`. Exhausted lock acquisition returns the retryable unavailable outcome without an automatic server retry and without beginning a financial read or insert. The client preserves the logical Transaction UUID. Unknown commit outcomes are resolved by UUID lookup before the same submission may be retried, following Database Design Section 7.4.

### 9.5 Read Operations

Student reads, Balance queries, and history-page queries do not mutate state. Balance and history may be requested separately, but Balance always uses complete history.

## 10. Balance Calculation Flow

References: FR-3.1.2, FR-3.1.4, FR-3.3.1; NFR-3.1–3.3; BR-BAL-001–005

```text
Client requests Student Balance
        ↓
Application validates Student identity
        ↓
Persistence selects all Transactions for Student
        ↓
Database aggregates:
  deposits - withdrawals
        ↓
Server returns exact whole-Rupiah Balance
        ↓
Client renders Balance separately from history page
```

There is no Balance write path. After a successful Deposit or Withdrawal, the response or following read uses the same complete-history calculation.

## 11. Data Flows

### 11.1 Create Student

References: FR-3.1.1

```text
Client input
  → client format validation
  → server normalization and validation
  → database insert with unique-name constraint
  → committed Student or explicit validation/system failure
  → Student Detail
```

### 11.2 Record Deposit

References: FR-3.2.1, FR-3.3.1

```text
Whole-Rupiah input
  → client validation
  → server/domain validation
  → BEGIN IMMEDIATE
  → verify Student
  → insert immutable Deposit
  → commit
  → calculate/return updated Balance
  → Student Detail
```

### 11.3 Record Withdrawal

References: FR-3.2.2, FR-3.3.1

```text
Whole-Rupiah input
  → client validation
  → server/domain validation
  → BEGIN IMMEDIATE
  → verify Student
  → calculate full-history Balance
  → sufficient? ── no → rollback + Insufficient balance
       │
       yes
       ↓
  insert immutable Withdrawal
  → commit
  → calculate/return updated Balance
  → Student Detail
```

### 11.4 Load Student

References: FR-3.1.2, FR-3.1.4, FR-3.3.1

```text
Client requests Student Detail
  → server validates Student identity
  → persistence loads Student
  → database computes complete-history Balance
  → persistence loads newest history page
  → client renders correct Balance and available history
```

No provisional Balance is produced if the complete-history query fails.

### 11.5 Load History

References: FR-3.2.3

```text
Client sends Student identity + optional stable cursor
  → server validates request
  → persistence queries next newest-first page
  → server returns page and continuation state
  → client appends older entries
```

The existing Balance and loaded history remain visible during progressive loading.

### 11.6 Retry Transaction

References: FR-3.2.1, FR-3.2.2; NFR-5.1

```text
Submission outcome unknown
  → server looks up original Transaction UUID
  → exists? ── yes → return committed result
       │
       no
       ↓
  retry same logical submission with same UUID
  → primary key prevents duplicate event
  → explicit committed or failed outcome
```

### 11.7 Validation Failure

```text
Invalid input
  → reject before persistence when detectable
  → return specific validation outcome
  → client preserves input and shows inline error
```

Database constraint conflicts are translated into the corresponding approved validation outcome.

### 11.8 System Failure

```text
Operation fails
  → rollback active database transaction
  → classify known failure or generic unexpected failure
  → return explicit non-success outcome
  → client preserves safe context and offers safe Retry
```

No system failure silently writes partial data or queues an offline operation.

## 12. Error Handling

| Failure category | Server behavior | Client behavior |
|------------------|-----------------|-----------------|
| Input validation | No write; return specific failure | Preserve input; show inline message |
| Duplicate Student | No Student created | Show duplicate-name message |
| Insufficient Balance | Roll back; no Withdrawal | Preserve Amount; show insufficient balance |
| Student not found | No write | Show load or submission failure |
| History-page failure | No state change | Keep Balance/history; retry failed page |
| Transaction outcome unknown | Resolve original UUID before retry | Disable repeated action while resolving |
| Database/network/unexpected failure | Roll back where applicable; explicit failure | Never report success; offer safe Retry |

Errors do not expose database internals. Diagnostic logging may record technical failure details, while the operator receives a concise actionable message.

## 13. Security Boundaries

MVP security is limited to approved integrity protections:

- Treat every client value as untrusted and revalidate it on the server.
- Prevent direct client access to the database.
- Use parameterized persistence operations rather than combining input with database commands.
- Limit application database capabilities to approved reads, Student inserts, and Transaction inserts.
- Deny application mutation or deletion of persisted Transactions.
- Use the approved SQLite `BEGIN IMMEDIATE` transaction protocol for financial integrity.
- Use stable Transaction UUIDs for duplicate prevention and retry safety.
- Return only the data required by approved screens.

### 13.1 Authentication

Auth.js uses Google only and the Database Session Strategy. `/` is public, `/login` owns authentication, and `/app` is protected. A Google identity is admitted only when its normalized email matches an active pre-provisioned user. There is no password authentication or public account self-service. Google verifies identity; Amanah Cash determines authorization.

### 13.2 Authorization

Every protected operation resolves the active PlatformUser and role on the server. `PLATFORM_ADMIN` reaches dedicated administration operations. `OPERATOR` operations additionally require current ownership of the target Student. Presentation filtering is not a security boundary, and Persistence must scope data before returning it.

### 13.3 Privacy

Platform Admin manages the platform but has no routine route to Transaction history, Balances, financial reports, or Student financial data. There is no implicit administrator financial bypass. Financial data must not enter sessions, cookies, administrative UI, logs, analytics, or authentication errors. Authentication does not add Transaction actor attribution.

## 14. Deployment

```text
Supported browser / installed PWA
              ↓
Single application endpoint
  ├── serves PWA assets
  └── handles application requests
              ↓
Single relational database
```

Deployment responsibilities:

- Serve the PWA and server application from one logical application deployment.
- Keep the database reachable by the server, not directly by the client.
- Apply schema migrations before application behavior depends on them.
- Provide configuration for the server-to-database connection outside source code.
- Provide production error diagnostics without changing operator-facing behavior.

Exact hosting provider, transport configuration, supported-browser versions, and operational monitoring remain deployment decisions. The process model is fixed for the MVP: one active application server process owns the SQLite database file. These choices do not add MVP features.

Sprint 1 targets Local Development only. It uses the approved local SQLite database and does not include Vercel deployment, production hosting configuration, or production persistence hosting and operations decisions. Those decisions and activities are deferred to the Deployment phase. Sprint 1 must not introduce an external database or alter the approved persistence architecture in anticipation of production deployment.

Kubernetes, service mesh, API gateway, read replicas, multiple databases, queues, background workers, caches, and distributed transaction infrastructure are intentionally absent.

## 15. Architecture Decisions

| Decision | Why chosen | Approved source |
|----------|------------|-----------------|
| One server deployable | Smallest unit that centralizes validation and financial integrity | Principles 6–8, 12 |
| One SQLite database | Matches the implemented foundation and approved tables, constraints, serialization, and atomic writes | Database Design Sections 3–11 |
| Layered internals | Separates UI, use-case orchestration, rules, and persistence without distributed complexity | Domain Model Sections 3–7 |
| Server-authoritative financial operations | Client state cannot enforce concurrency or append-only history | NFR-3.2–3.3; BR-TXN-004–005 |
| Per-Student transaction boundary | Non-negative Balance is scoped to one Student aggregate | BR-BAL-004–005; Domain Model Section 6 |
| Query Balance on demand | Preserves Transaction history as single source of truth | FR-3.3.1; BR-BAL-001–003 |
| Progressive history separate from Balance | Improves presentation performance without weakening correctness | NFR-4.1; BR-UI-002–003 |
| PWA with no offline data flow | Provides approved installation model without offline scope | FR-3.4.1; NFR-7.1; BR-PWA-001 |
| Technology-neutral boundaries | Framework selection is not an approved product requirement | Simplicity Over Generality |
| Auth.js, Google only, database sessions | Verify identity without application passwords | ADR-001 |
| Amanah Cash roles and Student ownership | Identity provider does not authorize financial data | ADR-002 |
| Administrative/financial separation | Privacy outranks administrative visibility | ADR-003 |

## 16. MVP Fit and Evolution

This architecture retains one deployable server and one relational database without distributed coordination. Student and Transaction remain the financial source entities; identity/session persistence is isolated from financial truth. Domain and persistence boundaries still allow internal replacement of technology without changing approved rules.

Future evolution means changing an implementation behind an existing boundary when an approved requirement demands it. This document does not pre-design or authorize future features.

## 17. Architecture Traceability

| Architecture Concern | Requirements and Rules |
|----------------------|------------------------|
| Student operations | FR-3.1.1–3.1.4; BR-STU-001–004 |
| Transaction writes | FR-3.2.1–3.2.2; BR-TXN-001–005 |
| History reads | FR-3.2.3; NFR-4.1; BR-UI-002–003 |
| Balance calculation | FR-3.3.1; NFR-3.1–3.3; BR-BAL-001–005 |
| Retry safety | NFR-5.1–5.2; Database Design Section 7.4 |
| Financial traceability | NFR-6.1; BR-AUD-001–002 |
| PWA and responsive client | FR-3.4.1–3.4.3; NFR-7.1–7.2 |
| Offline exclusion | NFR Section 8; BR-PWA-001 |
