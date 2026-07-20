# Amanah Cash — User Flows

**Version:** 1.2
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-20

---

## 1. Purpose

This document defines the Amanah Cash MVP user flows. It translates the approved functional requirements, non-functional requirements, business rules, domain model, and database design into simple mobile-first interactions.

## 2. Flow Conventions

```text
[Screen]       A primary application screen
<Action>       An operator action
{Decision}     A validation or system outcome
-->            Forward flow
<--            Return flow
```

Global rules for every flow:

- Balance is shown only from the complete persisted transaction history.
- A progressively loaded history never becomes the balance source.
- Deposit means money entrusted to the student and increases balance.
- Withdrawal means money returned by the student and decreases balance.
- A transaction is shown as successful only after persistence succeeds.
- Offline transaction recording is not supported.
- Validation errors remain on the current interaction and preserve valid input.
- System failures are explicit and never imply that an operation succeeded.

## 3. Screen-Level Navigation

Public and protected route ownership:

```text
/ (Landing Page) → /login (Google authentication) → /app (protected application)
```

The implemented Student Management routes are role-specific:

```text
Platform Admin: /admin/students → /admin/students/new or /admin/students/:id
Operator:       /operator/students → /operator/students/:id (owned Students only)
```

```text
[Student List]
      │ select Student
      v
[Student Detail]
      │ Deposit or Withdrawal
      v
[Transaction Entry]

Browser Back:
[Transaction Entry] --> [Student Detail] --> [Student List]
```

The three-screen flow below remains the target financial workflow. In the delivered Student Management module, Platform Admin creation uses a dedicated page, edit is presented from admin detail, list filters submit as server queries, and Operator pages are read-only. Student lists and details show explicit financial placeholders until the Transaction and Balance milestones are delivered.

## 4. Authentication and Access

```text
Landing Page → Login → Google authentication → Check active provisioned email
                                              ├─ Match → database session → /app
                                              └─ No match/inactive → Access Denied
```

- An authenticated visitor opening `/login` proceeds to `/app`.
- An unauthenticated or expired-session visitor opening `/app` proceeds to `/login` without protected data.
- Logout invalidates the database session before returning to `/`.
- Browser Back never restores authorized access after logout or expiration.
- `/login` has no Sign Up, password, Forgot Password, or password-reset path.
- The denied state tells the visitor that the account is not registered and to contact Platform Admin.

### 4.1 Provision, Deactivate, Assign, and Transfer

Platform Admin provisions a user with Full Name, Google Email, and Role and may deactivate an Operator. Platform Admin assigns each Student to exactly one Operator and may transfer that ownership. Transfer changes subsequent access without changing Transaction history.

## 5. First-Time Application Use

References: FR-3.1.1, FR-3.1.2, FR-3.4.2

```text
<Open application>
  --> [Student List: loading]
  --> {Load outcome}
        ├── Success, no Students
        │     --> [Empty state: "No students yet"]
        │     --> {Role}
        │           ├── Platform Admin --> <Open Add Student> --> Create Student flow (Section 5.1)
        │           └── Operator       --> Remain in read-only empty state
        │
        └── System failure
              --> Student List failure flow (Section 13.1)
```

The Platform Admin can add the first Student after at least one active Operator exists. An Operator cannot create a Student and receives a read-only empty state when no Students are currently assigned. Authentication and account provisioning occur before this application state.

### 5.1 Create Student

References: FR-3.1.1, FR-3.1.2

```text
[Admin Student List]
  --> <Open Add Student>
  --> [Create Student page]
  --> <Enter name, select active Operator and status, optionally enter notes>
  --> <Tap Confirm>
  --> {Client validation}
        ├── Invalid
        │     --> Show inline validation error
        │     --> Browser validation preserves entered values
        │     --> Remain on form
        │
        └── Valid
              --> Normalize name
              --> Submit once
              --> {Persistence outcome}
                    ├── Success
                    │     --> [Admin Student Detail: new Student]
                    │
                    ├── Duplicate after normalization
                    │     --> Show duplicate-name error
                    │     --> Reload create form with default values
                    │
                    └── System failure
                          --> Show explicit error state with Retry
                          --> Do not imply that a Student was created
```

Validation:

- Trim leading and trailing whitespace.
- Collapse consecutive internal whitespace.
- Reject an empty normalized name.
- Reject a normalized name longer than 100 characters.
- Reject a case-insensitive duplicate normalized name.
- Require an existing active, non-deleted Operator.
- Accept only `ACTIVE`, `INACTIVE`, or `ARCHIVED` status.
- Trim optional notes and reject notes longer than 500 characters.

Browser-native validation preserves input in place. The current Server Action redirects after a server-side Student validation error, so submitted create values are not restored; an unexpected failure enters the route error state. This is a documented interaction-state limitation rather than a persistence or validation guarantee.

### 5.2 Edit and Transfer Student

References: FR-3.1.5

```text
[Admin Student Detail]
  --> <Open Edit>
  --> <Change name, notes, status, or active Operator>
  --> <Tap Save>
  --> Server applies creation validation
        ├── Invalid --> Show explicit validation outcome; persist nothing
        └── Valid   --> Update Student --> [Admin Student Detail]
```

Changing the Operator immediately changes current ownership. The previous Operator loses list/detail visibility, the new Operator gains it, and Transaction history remains unchanged. Operators have no edit or transfer action.

## 6. Search Student

References: FR-3.1.2, FR-3.1.3, FR-3.1.4

```text
[Student List]
  --> <Enter partial Student or Operator name>
  --> <Optionally select status>
  --> <Tap Apply>
  --> Server applies visibility scope, search, filter, and pagination
  --> {Matching result exists?}
        ├── Yes
        │     --> <Tap Student>                 Tap 2
        │     --> [Student Detail]
        │
        └── No
              --> [Empty search state: "No students found"]
              --> <Change or clear search>
```

Search is partial and case-insensitive. Platform Admin results may match Student or assigned Operator name; Operator results remain ownership-scoped. Status filtering is independent of the text query. Clearing filters restores the newest-first visible list, paginated at ten Students per page.

## 7. View Student Detail

References: FR-3.1.4, FR-3.2.3, FR-3.3.1

```text
[Student List]
  --> <Tap Student>
  --> [Student Detail: loading]
  --> Load visible Student management data
  --> {Load outcome}
        ├── Success
        │     --> Show name, Operator, status, dates, and notes
        │     --> Show static financial-summary placeholder
        │     --> Platform Admin may edit; Operator remains read-only
        │
        └── System failure
              --> Student Detail failure flow (Section 13.2)
```

This is the delivered non-financial detail state. Milestone 5 replaces the placeholder with the authoritative complete-history Balance and progressive Transaction history; no subtotal of visible rows may be shown as Balance.

## 8. Record Deposit

References: FR-3.1.4, FR-3.2.1, FR-3.3.1

```text
[Student List]
  --> <Tap Student>                             Tap 1
  --> [Student Detail]
  --> <Tap Deposit>                             Tap 2
  --> [Transaction Entry: Deposit]
        Direction: "Money entrusted to student"
        Effect: "Balance increases"
  --> <Enter whole-Rupiah amount>
  --> <Tap Confirm Deposit>                     Tap 3
  --> {Client validation}
        ├── Invalid
        │     --> Show inline amount error
        │     --> Preserve input
        │     --> Remain on Transaction Entry
        │
        └── Valid
              --> Disable duplicate submission
              --> Submit deposit
              --> {Persistence outcome}
                    ├── Success after commit
                    │     --> [Student Detail]
                    │     --> Show updated full-history Balance
                    │     --> Show new Deposit as newest event
                    │
                    └── System failure or unknown outcome
                          --> Transaction retry flow (Section 14)
```

Valid amount: numeric, greater than zero, whole Rupiah, and representable by the approved monetary storage.

## 9. Record Withdrawal

References: FR-3.1.4, FR-3.2.2, FR-3.3.1

```text
[Student List]
  --> <Tap Student>                             Tap 1
  --> [Student Detail]
  --> <Tap Withdrawal>                          Tap 2
  --> [Transaction Entry: Withdrawal]
        Direction: "Money returned by student"
        Effect: "Balance decreases"
        Current full-history Balance is visible
  --> <Enter whole-Rupiah amount>
  --> <Tap Confirm Withdrawal>                  Tap 3
  --> {Client validation}
        ├── Invalid amount
        │     --> Show inline amount error
        │     --> Preserve input
        │     --> Remain on Transaction Entry
        │
        └── Valid input
              --> Disable duplicate submission
              --> Submit atomic withdrawal
              --> Database begins approved SQLite write serialization and checks current full history
              --> {Atomic outcome}
                    ├── Success after commit
                    │     --> [Student Detail]
                    │     --> Show updated full-history Balance
                    │     --> Show new Withdrawal as newest event
                    │
                    ├── Insufficient balance
                    │     --> No Transaction is created
                    │     --> Show "Insufficient balance"
                    │     --> Remain on Transaction Entry
                    │
                    └── System failure or unknown outcome
                          --> Transaction retry flow (Section 14)
```

The displayed pre-submit Balance is informative. The authoritative sufficient-balance check occurs atomically when the withdrawal is persisted.

## 10. Progressive Transaction History

References: FR-3.1.4, FR-3.2.3, FR-3.3.1

```text
[Student Detail]
  --> Show correct full-history Balance
  --> Load newest history page
  --> {History result}
        ├── No Transactions
        │     --> [Empty history state]
        │
        ├── Transactions, more available
        │     --> Show entries newest first
        │     --> Show Load Older Transactions action
        │     --> <Tap Load Older Transactions>
        │     --> Show history-section loading state
        │     --> {Page outcome}
        │           ├── Success --> Append older entries
        │           └── Failure --> Show history retry action
        │
        └── Transactions, complete history loaded
              --> Show entries newest first
              --> Do not show Load Older Transactions action
```

Loading or retrying an older page does not hide or recalculate Balance. Existing history remains visible during the page request.

## 11. Validation Failures

### 11.1 Student Name

References: FR-3.1.1

| Failure | UI response | Next action |
|---------|-------------|-------------|
| Empty after normalization | `Name is required` | Edit name and confirm again |
| More than 100 normalized characters | Inline length error | Shorten name and confirm again |
| Case-insensitive duplicate | `A student with this name already exists` | Change name or cancel |

### 11.2 Transaction Amount

References: FR-3.2.1, FR-3.2.2

| Failure | UI response | Next action |
|---------|-------------|-------------|
| Zero or negative | `Amount must be greater than zero` | Correct amount and confirm again |
| Non-numeric | `Enter a valid number` | Correct amount and confirm again |
| Decimal | `Amount must be a whole Rupiah value` | Enter whole Rupiah and confirm again |
| Outside supported integer range | Inline invalid-amount error | Enter a supported amount |
| Withdrawal exceeds current atomic balance | `Insufficient balance` | Reduce amount or cancel |

No validation failure creates or partially creates a record.

## 12. Empty States

### 12.1 No Students

References: FR-3.1.1, FR-3.1.2

```text
No students yet
Add a student to start recording entrusted funds.
[Add Student]
```

### 12.2 No Search Results

References: FR-3.1.3

```text
No students found
Change or clear the search text.
```

The search empty state does not offer student creation because adding a Student is already available as the primary Student List action and must not be confused with search results.

### 12.3 No Transactions

References: FR-3.1.4, FR-3.2.3

```text
No transactions yet
Balance: Rp 0
[Deposit] [Withdrawal]
```

Withdrawal remains available but any positive withdrawal is rejected by the non-negative balance rule.

## 13. System Failures

### 13.1 Student List Failure

References: FR-3.1.2

```text
Student list could not be loaded.
[Retry]
```

Retry reloads the Student list. No stale list is presented as current when the initial load fails.

### 13.2 Student Detail Failure

References: FR-3.1.4, FR-3.3.1

```text
Student details could not be loaded.
[Retry] [Back]
```

If the full-history Balance cannot be loaded, no provisional Balance is shown.

### 13.3 Older History Failure

References: FR-3.2.3

```text
[Existing Balance remains visible]
[Existing history entries remain visible]
Older transactions could not be loaded.
[Retry]
```

Only the failed history section is retried.

### 13.4 Unexpected Failure

References: FR-3.1.1, FR-3.1.2, FR-3.1.4, FR-3.2.1, FR-3.2.2, FR-3.2.3

An unexpected failure shows a generic error and an action that is safe for the current operation. No failure is silent.

## 14. Transaction Retry Flow

References: FR-3.2.1, FR-3.2.2

```text
[Transaction Entry: submitting]
  --> {Outcome known?}
        ├── Committed
        │     --> [Student Detail with updated Balance]
        │
        ├── Rejected or rolled back
        │     --> Show explicit failure
        │     --> [Retry same submission] or [Edit amount]
        │
        └── Unknown commit outcome
              --> Resolve original Transaction UUID
              --> {Transaction exists?}
                    ├── Yes
                    │     --> Treat as success
                    │     --> [Student Detail with updated Balance]
                    │
                    └── No
                          --> Allow Retry using same Transaction UUID
```

The retry action reuses the original logical submission identity. Repeated taps are disabled while a submission or outcome-resolution request is in progress. This prevents an unintended duplicate Transaction.

If the device is offline or the network is unavailable, the application reports that the Transaction was not saved or that its outcome is being resolved. It does not queue an offline Transaction.

## 15. Back and Cancel Behavior

References: FR-3.4.2

- Browser Back from Transaction Entry returns to Student Detail without creating a Transaction.
- Browser Back from Student Detail returns to Student List.
- Cancel on Create Student closes the form without creating a Student.
- Cancel on Transaction Entry returns to Student Detail without creating a Transaction.
- Leaving a form before successful persistence has no financial effect.

## 16. Flow Traceability Summary

| Flow | Functional Requirements |
|------|-------------------------|
| First-time use | FR-3.1.1, FR-3.1.2, FR-3.4.2 |
| Create Student | FR-3.1.1, FR-3.1.2 |
| Edit and transfer Student | FR-3.1.5 |
| Search Student | FR-3.1.2, FR-3.1.3, FR-3.1.4 |
| View Student Detail | FR-3.1.4, FR-3.2.3, FR-3.3.1 |
| Record Deposit | FR-3.1.4, FR-3.2.1, FR-3.3.1 |
| Record Withdrawal | FR-3.1.4, FR-3.2.2, FR-3.3.1 |
| Progressive history | FR-3.1.4, FR-3.2.3, FR-3.3.1 |
| Validation failures | FR-3.1.1, FR-3.2.1, FR-3.2.2 |
| System failures and retry | FR-3.1.2, FR-3.1.4, FR-3.2.1, FR-3.2.2, FR-3.2.3 |
| Empty states | FR-3.1.1, FR-3.1.2, FR-3.1.3, FR-3.1.4, FR-3.2.3 |
| Back and cancel | FR-3.4.2 |
