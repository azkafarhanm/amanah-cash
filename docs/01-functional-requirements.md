# Amanah Cash — Functional Requirements (SRS)

**Version:** 1.1
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-18

---

## 1. Introduction

### 1.1 Purpose

This document specifies the complete Software Requirements Specification (SRS) for Amanah Cash. It defines all functional requirements for the MVP release. Every requirement traces to one or more product principles in `docs/00-product-principles.md`.

### 1.2 Scope

Amanah Cash is a Progressive Web App for managing entrusted student funds. It enables an operator to track deposits and withdrawals for individual students. The system computes balances exclusively from the transaction history — no balance is ever stored manually.

### 1.3 Definitions

| Term | Definition |
|------|------------|
| **Operator** | The user who records deposits and withdrawals and views student balances. |
| **Student** | A person whose entrusted funds are tracked by the system. |
| **Deposit** | A record of funds entrusted to a student (money going out from the operator's perspective). |
| **Withdrawal** | A record of funds returned by a student (money coming in from the operator's perspective). |
| **Balance** | The net amount currently entrusted to a student, computed as total deposits minus total withdrawals. |
| **Transaction** | A single deposit or withdrawal event recorded in the system. |
| **Currency** | Indonesian Rupiah (`IDR`). All monetary values are whole Rupiah with no decimal amount. |
| **Auditability** | Traceability of financial events through immutable transaction records. Actor attribution is not part of the MVP. |

### 1.4 Product Principles Mapping

Every functional requirement in this document is grounded in the following principles:

| Principle | Relevance to Functional Requirements |
|-----------|--------------------------------------|
| Mobile First | All screens and interactions are designed for mobile. |
| PWA | The application is installable and works in a browser context. |
| Speed of Operation | Workflows use the fewest possible steps. |
| Fast Input | Common operations (search, deposit, withdrawal) require minimal taps. |
| Single Source of Truth | Balances are computed, never stored. |
| Small MVP Scope | Only core operational features are included. |
| No Scope Creep | No features beyond those listed are in scope. |
| Simplicity Over Generality | The system solves the specific problem of entrusted fund tracking. |
| Minimal Data Collection | Only operationally necessary data is collected. |
| Trust by Design | Every transaction is transparent and auditable. |
| Minimal Cognitive Load | Interfaces show only what is needed for the current task. |
| Production Ready | The system includes error handling, validation, and reliability from day one. |

---

## 2. User Roles

### 2.1 Operator

The operator is the sole user role in the MVP. There is no authentication, multi-user support, role-based access control, or actor attribution in the MVP scope. Financial auditability is provided by traceable transaction records, not by identifying who performed an action.

Auth.js with the Database Session Strategy is the approved long-term authentication solution, but it does not change this MVP behavior. Authentication is deferred to a dedicated Authentication Sprint. Sprint 1 must not install Auth.js or create `User`, `Account`, `Session`, `VerificationToken`, or any authentication schema.

**Capabilities:**
- Create, view, and search student records
- Record deposits and withdrawals
- View computed balances and transaction history

---

## 3. Functional Requirements

### 3.1 Student Management

#### FR-3.1.1: Create Student

**Description:** The operator can create a new student record.

**Fields:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Name | Text | Yes | Normalized, non-empty, max 100 characters |

**Principles:** Minimal Data Collection (9), Simplicity Over Generality (8)

**Acceptance Criteria:**
- The system accepts a student name and persists the record.
- The system assigns a unique identifier automatically.
- The system records the creation timestamp automatically.
- The system rejects empty or whitespace-only names.
- Before validation, the system trims leading and trailing whitespace and collapses consecutive internal whitespace to a single space.
- The system rejects duplicate normalized names using case-insensitive comparison.

#### FR-3.1.2: View Student List

**Description:** The operator can view a list of all students.

**Principles:** Mobile First (1), Minimal Cognitive Load (11), Speed of Operation (3)

**Acceptance Criteria:**
- The list displays each student's name and current balance.
- The list is sorted alphabetically by name.
- Each list item is tappable to navigate to the student detail view.
- The student list can become usable without waiting for any student's complete transaction history to be loaded.

#### FR-3.1.3: Search Student

**Description:** The operator can search for a student by name.

**Principles:** Fast Input (4), Speed of Operation (3), Mobile First (1)

**Acceptance Criteria:**
- A search input is visible on the student list screen.
- Search results update after each input change without requiring a submit action.
- Search is case-insensitive and matches partial name input.
- Search uses the same normalized student names used for uniqueness validation.
- The search field is accessible with a single tap from the primary screen.
- The keyboard appears automatically when the search field is focused on mobile.

#### FR-3.1.4: View Student Detail

**Description:** The operator can view a student's complete financial summary.

**Principles:** Trust by Design (10), Minimal Cognitive Load (11), Single Source of Truth (5)

**Acceptance Criteria:**
- The detail view displays the student's name.
- The detail view displays the student's current balance, computed from the full transaction history.
- The detail view displays transactions newest first and may load older entries progressively.
- Each transaction in the list shows: type (deposit/withdrawal), amount, and timestamp.
- Each transaction clearly communicates the direction of money: a deposit is money entrusted to the student, while a withdrawal is money returned by the student.
- The displayed balance is computed from the complete transaction history and must not be derived only from the currently loaded or displayed entries.

---

### 3.2 Transactions

#### FR-3.2.1: Record Deposit

**Description:** The operator can record a deposit (funds entrusted to a student).

**Fields:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Amount | Whole number | Yes | Positive whole Rupiah, greater than zero |

**Principles:** Fast Input (4), Speed of Operation (3), Trust by Design (10)

**Acceptance Criteria:**
- The system accepts a positive whole-Rupiah amount and creates a deposit transaction.
- The system records the student reference, amount, type (deposit), and timestamp automatically.
- The system rejects zero, negative, non-numeric, or decimal amounts.
- After recording, the student's computed balance updates immediately.
- The deposit action is accessible from the student detail view with a single tap.
- The transaction entry UI identifies a deposit as money entrusted to the student.

#### FR-3.2.2: Record Withdrawal

**Description:** The operator can record a withdrawal (funds returned by a student).

**Fields:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Amount | Whole number | Yes | Positive whole Rupiah, greater than zero |

**Principles:** Fast Input (4), Speed of Operation (3), Trust by Design (10)

**Acceptance Criteria:**
- The system accepts a positive whole-Rupiah amount and creates a withdrawal transaction.
- The system records the student reference, amount, type (withdrawal), and timestamp automatically.
- The system rejects zero, negative, non-numeric, or decimal amounts.
- The system does not allow a withdrawal that would make the balance negative.
- Balance validation and withdrawal recording behave as one atomic operation, including when multiple requests occur concurrently.
- After recording, the student's computed balance updates immediately.
- The withdrawal action is accessible from the student detail view with a single tap.
- The transaction entry UI identifies a withdrawal as money returned by the student.

#### FR-3.2.3: View Transaction History

**Description:** The operator can view the complete transaction history for a student.

**Principles:** Trust by Design (10), Single Source of Truth (5), Minimal Cognitive Load (11)

**Acceptance Criteria:**
- The transaction list displays transactions newest first and supports progressive loading of older entries.
- Each entry shows: type (deposit/withdrawal), amount, and timestamp.
- The list is scrollable if the loaded transactions exceed the screen height.
- The operator can continue loading older entries until the complete history is available.
- Transactions are append-only and cannot be edited or deleted through any application operation.

---

### 3.3 Financial Calculations

#### FR-3.3.1: Compute Balance

**Description:** The system computes a student's balance from the complete transaction history.

**Principles:** Single Source of Truth (5), Trust by Design (10), Production Ready (12)

**Acceptance Criteria:**
- Balance = sum of all deposits minus sum of all withdrawals for the student.
- The balance is computed on demand, never read from a stored field.
- The balance is always consistent with the transaction history.
- The balance uses exact whole-Rupiah arithmetic; no monetary rounding is performed.
- The balance uses every persisted transaction, regardless of how much transaction history is currently loaded in the UI.

---

### 3.4 Application Shell

#### FR-3.4.1: PWA Installation

**Description:** The application is installable as a PWA on the user's device.

**Principles:** PWA (2), Mobile First (1)

**Acceptance Criteria:**
- The application provides a valid web app manifest.
- The application registers a service worker.
- The application satisfies the installability requirements of supported browsers and provides installation guidance when the browser does not expose an automatic prompt.
- Once installed, the application launches in a standalone window without browser chrome.

#### FR-3.4.2: Navigation

**Description:** The application provides a minimal, consistent navigation structure.

**Principles:** Minimal Cognitive Load (11), Mobile First (1), Speed of Operation (3)

**Acceptance Criteria:**
- The application has three primary screens: Student List, Student Detail, and Transaction Entry.
- Navigation between screens uses standard browser back/forward behavior.
- The current screen is visually indicated.
- Each core workflow follows the tap counts defined in Section 5; there is no universal tap limit between every possible pair of screens.

#### FR-3.4.3: Responsive Layout

**Description:** The application layout adapts to mobile and desktop viewports.

**Principles:** Mobile First (1), Production Ready (12)

**Acceptance Criteria:**
- The primary layout targets a mobile viewport (320px–480px width).
- The layout remains usable on tablet and desktop viewports.
- Touch targets are at least 44px x 44px.
- Text is readable without zooming on mobile devices.

---

## 4. Data Model Summary

The data model supports the functional requirements above. Full schema details are in `docs/07-database-design.md`.

### 4.1 Student

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key, auto-generated |
| name | String | Normalized, unique (case-insensitive), max 100 chars |
| created_at | Timestamp | Auto-generated on creation |

### 4.2 Transaction

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key, auto-generated |
| student_id | UUID | Foreign key to Student |
| type | Enum | `deposit` or `withdrawal` |
| amount | Integer | Positive whole Rupiah (`IDR`) |
| created_at | Timestamp | Auto-generated on creation |

**Note:** There is no Balance entity. Balances are computed from transactions (Single Source of Truth — Principle 5).

---

## 5. User Flows

### 5.1 Record a Deposit

```
Student List → Tap Student → Student Detail → Tap Deposit → Enter Amount → Confirm → Updated Balance
```

**Steps:** 3 taps + 1 amount entry
**Usability target:** Under 5 seconds, excluding network delay

### 5.2 Record a Withdrawal

```
Student List → Tap Student → Student Detail → Tap Withdrawal → Enter Amount → Confirm → Updated Balance
```

**Steps:** 3 taps + 1 amount entry
**Usability target:** Under 5 seconds, excluding network delay

### 5.3 Search and View a Student

```
Student List → Tap Search → Type Name → Tap Student → Student Detail
```

**Steps:** 2 taps + typing
**Usability target:** Under 3 seconds, excluding network delay

### 5.4 Add a New Student

```
Student List → Tap Add → Enter Name → Confirm → Student Detail
```

**Steps:** 2 taps + 1 name entry
**Usability target:** Under 5 seconds, excluding network delay

---

## 6. Error Handling

### 6.1 Input Validation

| Scenario | Behavior |
|----------|----------|
| Empty student name | Display inline error: "Name is required" |
| Duplicate student name | Display inline error: "A student with this name already exists" |
| Zero or negative amount | Display inline error: "Amount must be greater than zero" |
| Non-numeric amount | Display inline error: "Enter a valid number" |
| Decimal amount | Display inline error: "Amount must be a whole Rupiah value" |
| Withdrawal exceeding balance | Display inline error: "Insufficient balance" |

### 6.2 System Errors

| Scenario | Behavior |
|----------|----------|
| Database unavailable | Display error message with retry option |
| Network failure (PWA) | Display error message; no silent failures |
| Unexpected error | Display generic error message; log error for diagnosis |

**Principle:** Production Ready (12) — every error state is handled explicitly. No silent failures.

---

## 7. Scope Boundary

The following are explicitly **out of scope** for the MVP and will not be implemented as part of MVP work. A deferred architecture is mentioned only where a separate Project Owner decision has approved it.

| Feature | Reason for Exclusion |
|---------|---------------------|
| Authentication / multi-user / actor attribution | Not required for the single-operator MVP; Auth.js with Database Sessions is deferred to a dedicated Authentication Sprint, and MVP auditability covers financial event traceability |
| Offline sync | Deferred to post-MVP (Principle 2) |
| Transaction editing or deletion | Preserves audit integrity (Principle 10) |
| Reports or exports | Not required for day-one operation (Principle 6) |
| Categories or tags on transactions | Adds complexity without immediate value (Principle 8) |
| Notes or descriptions on transactions | Minimal Data Collection (Principle 9) |
| Student deletion | Preserves data integrity |
| Multiple currency support | Simplicity Over Generality (Principle 8) |
| Notifications or reminders | Not required for core workflow |
| Bulk operations | Not required for core workflow |

---

## 8. Acceptance Criteria Summary

| ID | Requirement | Validation |
|----|-------------|------------|
| FR-3.1.1 | Create Student | Student record persists with unique ID and timestamp |
| FR-3.1.2 | View Student List | List displays all students with computed balances |
| FR-3.1.3 | Search Student | Instant case-insensitive filtering by name |
| FR-3.1.4 | View Student Detail | Correct full-history balance displayed; transaction entries may load progressively |
| FR-3.2.1 | Record Deposit | Positive amount recorded; balance updates immediately |
| FR-3.2.2 | Record Withdrawal | Positive amount recorded if balance sufficient; balance updates immediately |
| FR-3.2.3 | View Transaction History | Newest-first history with progressive access to all transactions |
| FR-3.3.1 | Compute Balance | Balance = deposits - withdrawals; computed on demand |
| FR-3.4.1 | PWA Installation | Application is installable and launches standalone |
| FR-3.4.2 | Navigation | Core workflows follow their documented tap counts |
| FR-3.4.3 | Responsive Layout | Usable on mobile (primary) and desktop (secondary) |

---

## 9. Dependencies

This document is referenced by:
- `docs/03-business-rules.md` — business rules derived from these requirements
- `docs/04-domain-model.md` — domain entities and relationships
- `docs/05-user-flow.md` — detailed user flow diagrams
- `docs/06-wireframe.md` — screen layouts
- `docs/07-database-design.md` — schema implementation
- `docs/08-system-architecture.md` — system architecture

Changes to this document require review of all affected requirements, design documents, tests, and traceability references according to `docs/11-development-workflow.md`.
