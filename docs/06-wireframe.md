# Amanah Cash — Wireframes

**Version:** 1.2
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-20

---

## 1. Purpose

This document defines structured-text wireframes for the Amanah Cash MVP. It contains no visual assets and introduces no screens beyond the approved functional requirements.

These wireframes describe the target financial Operator workflow. The delivered Student Management module adds role-specific Platform Admin list/create/detail/edit pages and read-only, ownership-scoped Operator list/detail pages. Its list Balance and detail financial summary are explicit placeholders until the financial milestones. See `docs/35-student-management-implementation.md` for the current route and behavior contract.

## 2. Mobile-First Frame

The primary design target is a 320px–480px viewport. Every screen uses one vertical content column.

```text
┌──────────────────────────────────────┐
│ System / PWA frame                   │
├──────────────────────────────────────┤
│ Screen header                        │
├──────────────────────────────────────┤
│ Primary content                      │
│                                      │
│ Scrolls vertically when necessary    │
│                                      │
├──────────────────────────────────────┤
│ Contextual actions, when applicable  │
└──────────────────────────────────────┘
      target width: 320px–480px
```

Layout rules:

- Content remains readable without browser zoom.
- Interactive targets are at least 44px by 44px.
- Primary actions use the full available width where practical.
- Deposit and Withdrawal actions have equal prominence.
- Forms contain only the approved required field.
- Tablet and desktop retain the same hierarchy within a centered readable column; they do not add functionality.

## 3. Screen Inventory

| Screen | Purpose | Main Requirements |
|--------|---------|-------------------|
| Student List | Find, open, and create Students | FR-3.1.1, FR-3.1.2, FR-3.1.3 |
| Student Detail | Show Student, correct Balance, actions, and history | FR-3.1.4, FR-3.2.3, FR-3.3.1 |
| Transaction Entry | Record one Deposit or Withdrawal | FR-3.2.1, FR-3.2.2 |

Create Student is a focused form overlay within Student List. Search is embedded in Student List. Neither is an additional primary screen.

## 4. Navigation

```text
Student List
  ├── tap Student ───────────────> Student Detail
  ├── tap Add Student ───────────> Create Student form overlay
  └── focus Search ──────────────> Filter Student List in place

Student Detail
  ├── tap Deposit ───────────────> Transaction Entry: Deposit
  ├── tap Withdrawal ────────────> Transaction Entry: Withdrawal
  └── browser Back ──────────────> Student List

Transaction Entry
  ├── successful Confirm ────────> Student Detail
  ├── Cancel ────────────────────> Student Detail
  └── browser Back ──────────────> Student Detail
```

The screen header identifies the current screen through its title and Student context. Standard browser back/forward behavior remains functional.

## 5. Component Hierarchy

```text
ApplicationShell
├── StudentListScreen
│   ├── ScreenHeader
│   │   └── AddStudentButton
│   ├── StudentSearchInput
│   ├── StudentListState
│   │   ├── StudentList
│   │   │   └── StudentListItem *
│   │   ├── EmptyStudentsState
│   │   ├── EmptySearchState
│   │   ├── LoadingState
│   │   └── ErrorState
│   └── CreateStudentFormOverlay
│       ├── NameInput
│       ├── InlineError
│       ├── ConfirmButton
│       └── CancelButton
├── StudentDetailScreen
│   ├── ScreenHeader
│   ├── StudentIdentity
│   ├── BalancePanel
│   ├── TransactionActionGroup
│   │   ├── DepositButton
│   │   └── WithdrawalButton
│   └── TransactionHistorySection
│       ├── TransactionList
│       │   └── TransactionItem *
│       ├── EmptyHistoryState
│       ├── HistoryLoadingState
│       ├── HistoryErrorState
│       └── LoadOlderButton
└── TransactionEntryScreen
    ├── ScreenHeader
    ├── DirectionSummary
    ├── CurrentBalance (Withdrawal only)
    ├── AmountInput
    ├── InlineError
    ├── SubmitState
    ├── ConfirmButton
    └── CancelButton
```

The hierarchy names interface responsibilities only. It does not prescribe an implementation framework or create additional domain entities.

## 6. Student List Wireframes

### 6.1 Populated State

References: FR-3.1.2, FR-3.1.3

```text
┌──────────────────────────────────────┐
│ Students               [Add Student]│
├──────────────────────────────────────┤
│ [ Search students...               ]│
├──────────────────────────────────────┤
│ Ahmad                                │
│ Balance                      Rp 75.000│
│                                  [>] │
├──────────────────────────────────────┤
│ Budi                                 │
│ Balance                           Rp 0│
│                                  [>] │
├──────────────────────────────────────┤
│ ... alphabetical Student rows ...    │
└──────────────────────────────────────┘
```

- The full Student row is one touch target of at least 44px height.
- Every Balance comes from committed persisted Student state and is reconcilable with active Transaction effects.
- The list need not load transaction-history pages to display Balance.
- Search filters after each input change without a submit button.

### 6.2 First-Time Empty State

References: FR-3.1.1, FR-3.1.2

```text
┌──────────────────────────────────────┐
│ Students               [Add Student]│
├──────────────────────────────────────┤
│ [ Search students...               ]│
├──────────────────────────────────────┤
│                                      │
│           No students yet            │
│ Add a student to start recording     │
│ entrusted funds.                     │
│                                      │
│          [ Add Student ]             │
│                                      │
└──────────────────────────────────────┘
```

Both Add Student controls invoke the same form; they do not represent different actions.

### 6.3 Empty Search State

References: FR-3.1.3

```text
┌──────────────────────────────────────┐
│ Students               [Add Student]│
├──────────────────────────────────────┤
│ [ Siti                             ×]│
├──────────────────────────────────────┤
│                                      │
│          No students found           │
│     Change or clear the search.      │
│                                      │
└──────────────────────────────────────┘
```

The clear control has a 44px by 44px touch target even if its visible symbol is smaller.

### 6.4 Loading State

References: FR-3.1.2

```text
┌──────────────────────────────────────┐
│ Students               [Add Student]│
├──────────────────────────────────────┤
│ [ Search students...               ]│
├──────────────────────────────────────┤
│ [name placeholder]                   │
│ [balance placeholder]                │
├──────────────────────────────────────┤
│ [name placeholder]                   │
│ [balance placeholder]                │
└──────────────────────────────────────┘
```

The loading state reserves the final row layout and does not block the entire application with a decorative animation. Add Student remains available when safe.

### 6.5 System Error State

References: FR-3.1.2

```text
┌──────────────────────────────────────┐
│ Students                             │
├──────────────────────────────────────┤
│ Student list could not be loaded.    │
│                                      │
│              [ Retry ]               │
└──────────────────────────────────────┘
```

## 7. Create Student Form Overlay

References: FR-3.1.1

```text
┌──────────────────────────────────────┐
│ Add Student                          │
├──────────────────────────────────────┤
│ Name                                 │
│ [                                  ] │
│ Inline validation or system error    │
│                                      │
│ [ Cancel ]       [ Confirm Student ] │
└──────────────────────────────────────┘
```

Interaction states:

| State | Name input | Confirm | Cancel | Message |
|-------|------------|---------|--------|---------|
| Initial | Enabled, focused | Enabled | Enabled | None |
| Validation failure | Enabled, preserved | Enabled | Enabled | Inline specific error |
| Submitting | Read-only | Disabled | Disabled | `Saving student...` |
| System failure | Enabled, preserved | `Retry` | Enabled | Explicit failure |

The form collects only Student name. It has no account, identifier, note, or other field.

## 8. Student Detail Wireframes

### 8.1 Populated History

References: FR-3.1.4, FR-3.2.3, FR-3.3.1

```text
┌──────────────────────────────────────┐
│ [<] Student Detail                   │
├──────────────────────────────────────┤
│ Ahmad                                │
│                                      │
│ Balance                              │
│ Rp 75.000                            │
│ Committed Student Balance             │
├──────────────────────────────────────┤
│ [ Deposit ]       [ Withdrawal ]     │
├──────────────────────────────────────┤
│ Transaction History                  │
│                                      │
│ DEPOSIT                    + Rp 50.000│
│ Money entrusted to student           │
│ 17 Jul 2026, 10:30                   │
├──────────────────────────────────────┤
│ WITHDRAWAL                 - Rp 25.000│
│ Money returned by student             │
│ 17 Jul 2026, 09:15                   │
├──────────────────────────────────────┤
│ [ Load Older Transactions ]          │
└──────────────────────────────────────┘
```

- Balance is visually separate from the currently loaded history.
- Every Transaction item shows type, direction, amount, and timestamp.
- Deposit uses a plus sign and Withdrawal a minus sign in addition to text; meaning does not depend on color.
- Future Transaction lifecycle affordances must follow FR-3.2.5–FR-3.2.7, require reason/revision, distinguish soft delete from permanent removal, and expose audit consequences. Their UI is not designed in this architecture sprint.
- Load Older Transactions has at least a 44px height.

### 8.2 Empty History

References: FR-3.1.4, FR-3.2.3, FR-3.3.1

```text
┌──────────────────────────────────────┐
│ [<] Student Detail                   │
├──────────────────────────────────────┤
│ Ahmad                                │
│ Balance                         Rp 0  │
├──────────────────────────────────────┤
│ [ Deposit ]       [ Withdrawal ]     │
├──────────────────────────────────────┤
│ No transactions yet                  │
└──────────────────────────────────────┘
```

### 8.3 Initial Loading

References: FR-3.1.4, FR-3.2.3, FR-3.3.1

```text
┌──────────────────────────────────────┐
│ [<] Student Detail                   │
├──────────────────────────────────────┤
│ [student name placeholder]           │
│ Balance                              │
│ [balance placeholder]                │
├──────────────────────────────────────┤
│ [ Deposit disabled ] [ Withdrawal disabled ]
├──────────────────────────────────────┤
│ [transaction row placeholder]        │
│ [transaction row placeholder]        │
└──────────────────────────────────────┘
```

No provisional numeric Balance is shown. Transaction actions remain disabled until the Student context and correct Balance are available.

### 8.4 Initial Load Error

References: FR-3.1.4, FR-3.3.1

```text
┌──────────────────────────────────────┐
│ [<] Student Detail                   │
├──────────────────────────────────────┤
│ Student details could not be loaded. │
│ No balance is currently available.   │
│                                      │
│          [ Retry ]   [ Back ]        │
└──────────────────────────────────────┘
```

### 8.5 Loading Older History

References: FR-3.2.3, FR-3.3.1

```text
┌──────────────────────────────────────┐
│ Balance                       Rp 75.000│
│ ... existing Transactions remain ... │
├──────────────────────────────────────┤
│ Loading older transactions...        │
│ [ Load Older disabled ]              │
└──────────────────────────────────────┘
```

Only the history footer enters a loading state. Balance and already loaded entries remain visible.

### 8.6 Older History Error

References: FR-3.2.3, FR-3.3.1

```text
┌──────────────────────────────────────┐
│ Balance                       Rp 75.000│
│ ... existing Transactions remain ... │
├──────────────────────────────────────┤
│ Older transactions could not load.   │
│               [ Retry ]              │
└──────────────────────────────────────┘
```

Retry requests the same next page. It does not recalculate Balance from displayed rows.

## 9. Transaction Entry Wireframes

### 9.1 Deposit

References: FR-3.2.1

```text
┌──────────────────────────────────────┐
│ [<] Deposit — Ahmad                  │
├──────────────────────────────────────┤
│ Money entrusted to student           │
│ Balance will increase.               │
├──────────────────────────────────────┤
│ Amount (IDR, whole Rupiah)            │
│ Rp [                               ] │
│ Inline validation or system error    │
│                                      │
│ [ Cancel ]       [ Confirm Deposit ] │
└──────────────────────────────────────┘
```

### 9.2 Withdrawal

References: FR-3.2.2, FR-3.3.1

```text
┌──────────────────────────────────────┐
│ [<] Withdrawal — Ahmad               │
├──────────────────────────────────────┤
│ Money returned by student            │
│ Balance will decrease.               │
│ Current Balance             Rp 75.000│
├──────────────────────────────────────┤
│ Amount (IDR, whole Rupiah)            │
│ Rp [                               ] │
│ Inline validation or system error    │
│                                      │
│ [ Cancel ]    [ Confirm Withdrawal ] │
└──────────────────────────────────────┘
```

The visible Balance helps input but does not replace the atomic balance check at submission time.

### 9.3 Validation Error

References: FR-3.2.1, FR-3.2.2

```text
│ Amount (IDR, whole Rupiah)            │
│ Rp [ 12.50                         ] │
│ Amount must be a whole Rupiah value.  │
│                                      │
│ [ Cancel ]       [ Confirm ... ]      │
```

The input remains present and editable. Insufficient Balance uses the same inline error location with `Insufficient balance`.

### 9.4 Submitting

References: FR-3.2.1, FR-3.2.2

```text
│ Rp [ 50000                   read-only]
│ Saving transaction...                 │
│                                      │
│ [ Cancel disabled ] [ Confirm disabled]
```

Disabling both actions prevents duplicate submission or navigation while the immediate outcome is being established.

### 9.5 System Failure and Retry

References: FR-3.2.1, FR-3.2.2

```text
│ Transaction could not be saved.       │
│                                      │
│ [ Edit Amount ]    [ Retry ]          │
```

For an unknown commit outcome, the state instead reads:

```text
│ Checking whether transaction saved... │
│ [ Actions disabled ]                   │
```

Retry reuses the original command identity and, for create, Transaction identity. The UI never reports success until the persisted result is confirmed.

## 10. Error-State Rules

| Context | Placement | Preserved content | Available action |
|---------|-----------|-------------------|------------------|
| Student name validation | Below Name input | Entered name | Correct and confirm |
| Duplicate Student | Below Name input | Entered name | Change name or cancel |
| Amount validation | Below Amount input | Entered amount | Correct and confirm |
| Insufficient Balance | Below Amount input | Entered amount and current Balance | Reduce amount or cancel |
| Student List system failure | Main content | None on initial failure | Retry |
| Student Detail system failure | Main content | No provisional Balance | Retry or Back |
| Older history failure | History footer | Balance and loaded history | Retry page |
| Transaction system failure | Transaction Entry | Amount and transaction mode | Retry or edit amount |

Errors use text, not color alone. Every Retry target is at least 44px by 44px.

## 11. Loading-State Rules

- Initial screens reserve the final layout with text placeholders.
- Loading does not show invented or stale financial values as current.
- Student Detail actions are disabled until Student and correct Balance data are available.
- Progressive history loading affects only the history footer.
- Existing Balance and loaded history remain visible while older entries load.
- Transaction submission disables repeated confirmation.
- No transaction is queued or presented as saved while offline.

## 12. Touch and Input Rules

- Every button, tappable Student row, clear-search control, and retry action has a minimum 44px by 44px target.
- Adjacent Deposit and Withdrawal controls have sufficient separation to prevent accidental activation.
- Text inputs use the full available width.
- Amount input accepts whole-number entry appropriate for IDR and does not imply decimal support.
- Search receives focus with one tap and opens the mobile keyboard.
- The primary screen content remains operable at 320px width.

## 13. Desktop and Tablet Adaptation

```text
Wide viewport
┌──────────────────────────────────────────────┐
│          centered mobile-first column        │
│          maximum readable width              │
│          same hierarchy and actions          │
└──────────────────────────────────────────────┘
```

Larger viewports do not introduce sidebars, dashboards, bulk actions, or additional information. They preserve the mobile workflow with more surrounding space.

## 14. Wireframe Traceability

| Wireframe Area | Functional Requirements | Business Rules |
|----------------|-------------------------|----------------|
| Student List and search | FR-3.1.1, FR-3.1.2, FR-3.1.3 | BR-STU-001–003 |
| Create Student form | FR-3.1.1 | BR-STU-001–003 |
| Student Detail Balance | FR-3.1.4, FR-3.3.1 | BR-BAL-001–003, BR-UI-003 |
| Transaction history | FR-3.1.4, FR-3.2.3 | BR-TXN-004, BR-UI-001–003 |
| Deposit entry | FR-3.2.1 | BR-MON-001–003, BR-TXN-001, BR-UI-001 |
| Withdrawal entry | FR-3.2.2 | BR-MON-001–003, BR-TXN-002, BR-BAL-004–005, BR-UI-001 |
| Retry states | FR-3.2.1, FR-3.2.2 | BR-TXN-005, BR-PWA-001 |
| Navigation and touch | FR-3.4.2, FR-3.4.3 | None |
