# Amanah Cash — MVP Screen Specifications

**Version:** 1.1

**Status:** Approved

**Owner:** Project Owner
**Last Updated:** 2026-07-20

---

## 1. Purpose

This document converts the approved screen inventory into implementation-ready presentation specifications. It extends the User Flows, Wireframes, UI Design System, Component Guidelines, Design Tokens, and Interaction States without redefining their business rules.

The screen inventory below is the target financial Operator experience. The current Student Management delivery uses dedicated Platform Admin list/create/detail/edit pages plus read-only, ownership-scoped Operator list/detail pages. Search and status filters submit to server-side ten-row pagination, lists are newest-first, and financial values remain explicit placeholders. Current behavior is authoritative in `docs/35-student-management-implementation.md` until the financial screen milestones replace those placeholders.

The MVP has exactly three primary screens:

1. Student List
2. Student Detail
3. Transaction Entry

Create Student remains a responsive overlay owned by Student List. Dashboard, Reports, Settings, authentication, and offline transaction entry are outside scope.

## 2. Global Screen Contract

- Treat Amanah Cash as a daily operational financial tool: calm, professional, minimal, and information-first.
- Apply Calm Before Color. Neutral surfaces carry the interface; color appears only for action, direction, focus, or status.
- Apply Information Before Decoration. Use typography, whitespace, alignment, and borders before cards, color, effects, or shadow.
- Communicate Quiet Confidence. Do not introduce playful, trendy, glossy, ornamental, marketing, crypto, or startup-dashboard treatments.
- Render one centered vertical column using `screen.shell.*` tokens.
- Use Bahasa Indonesia, `id-ID`, Indonesian dates, and 24-hour time.
- Follow `docs/04-domain-model.md` Section 4.6: `Setor`/`Setoran` map to Domain Deposit, and `Tarik`/`Penarikan` map to Domain Withdrawal. English Domain terminology is not production UI copy.
- Use browser Back/forward semantics.
- Do not use a sidebar, bottom navigation, floating action button, dashboard grid, or desktop-only function.
- Page loading uses Skeleton Loading. Submission uses Button Loading.
- Empty states use Lucide icon, title, description, and an approved primary CTA; never an illustration.
- Financial values update immediately and never animate.
- Default persistent surfaces and financial panels use borders rather than shadow. Elevation is reserved for interactive hover and temporary overlays.
- Every keyboard-focus treatment uses the tokenized `:focus-visible` strategy.
- Every visual value references `docs/18-design-tokens.md`.
- Reusable state behavior references `docs/20-interaction-states.md`.

## 3. Student List

### 3.1 User Goal

Find and open a Student quickly, or create the first/new Student.

### 3.2 Screen Purpose

Student List is the operational home of the MVP. It supports alphabetical discovery, immediate partial search, Balance scanning, and access to the Create Student overlay.

References: FR-3.1.1–FR-3.1.3; NFR-4.2–4.3; User Flows Sections 4–6 and 13.1; Wireframes Sections 6–7.

### 3.3 Screen Anatomy

```text
StudentListScreen
├── ScreenHeader
│   ├── ScreenTitle: "Siswa"
│   └── AddStudentButton: "Tambah siswa"
├── StudentSearch
│   ├── VisibleLabel: "Cari siswa"
│   ├── SearchInput
│   └── ClearSearchButton, when query exists
├── StudentListState
│   ├── StudentList
│   │   └── StudentRow *
│   ├── LoadingState
│   ├── EmptyStudentsState
│   ├── EmptySearchState
│   └── ErrorState
└── CreateStudentOverlay
```

### 3.4 Layout Hierarchy

1. Screen title and Add Student action.
2. Search field.
3. Current list state.

Use `screen.header.*` for the header, `screen.student-list.section-gap` between header/search/list, and `student-row.*` for rows. The page owns vertical scrolling. Header and search remain in document flow and do not become sticky.

Each Student row is one full-width navigation target. Name is primary; Balance is secondary but aligned for scanning. Long names wrap. Rows use neutral surfaces and border separation; primary blue is reserved for actions and focus. An optional hover shadow may use `student-row.elevation-hover` on pointer devices only. No avatar, menu, identifier, grade, or status is displayed.

### 3.5 Responsive Behavior

- Mobile and installed PWA: full available column width with `screen.shell.gutter-mobile`.
- Wider viewports: centered column with `screen.shell.gutter-wide` and `screen.shell.content-max`.
- Header actions remain inline while content fits; at text zoom, title and action may wrap into two rows without truncation.
- Student rows retain the same content and order at every width.
- No table conversion or sidebar appears on desktop.

### 3.6 Loading State

- Preserve the header and search geometry.
- Render a stable list skeleton using `skeleton.*` and Student-row geometry.
- Do not render invented names or Balances.
- Search and Add Student remain unavailable only when their required data contract is unavailable; disabled reason must be clear.
- Accessibility follows Interaction State `Loading`.

### 3.7 Empty State

#### No Students

- Lucide icon: `Users`.
- Title: `Belum ada siswa`.
- Description: `Tambahkan siswa untuk mulai mencatat dana titipan.`
- Primary CTA: `Tambah siswa`.

#### No Search Results

- Lucide icon: `SearchX`.
- Title: `Siswa tidak ditemukan`.
- Description: `Ubah atau hapus kata pencarian.`
- Primary CTA: `Hapus pencarian`.
- Do not offer Student creation inside search results.

Use `screen.empty.max-width` and `empty-state.*` tokens.

### 3.8 Error State

- Replace only the list-state region when initial loading fails.
- Title: `Daftar siswa tidak dapat dimuat`.
- Description: `Periksa koneksi lalu coba lagi.`
- Primary action: `Coba lagi`.
- Do not display an unverified stale list as current.

### 3.9 Offline State

- If initial data is unavailable, use the Offline master pattern.
- State explicitly that current data cannot be loaded while offline.
- Do not imply offline synchronization.
- Add Student is unavailable when persistence cannot be reached.

### 3.10 Populated State

- Sort Students alphabetically using normalized names.
- Show normalized Student name and authoritative current Balance.
- Format Balance as whole Rupiah using `id-ID`.
- Tapping or activating a row navigates to Student Detail.
- Search filters after every input change without a submit action.

### 3.11 Success State

After Create Student succeeds:

- Close the overlay.
- Navigate to the new Student Detail screen.
- Do not insert a separate success screen.
- A polite supplemental success announcement may say `Siswa berhasil ditambahkan`.

### 3.12 Interactive Behaviors

- Add Student opens a centered Dialog on desktop/web and a bottom Sheet in mobile browser/PWA.
- Both overlay presentations share one form state and interaction contract.
- Initial focus moves to Name.
- Confirm uses Button Loading and prevents repeated submission.
- Validation remains inline and preserves input.
- Cancel and browser Back close the overlay without creating a Student.
- Closing returns focus to Add Student.
- Search clear restores the full alphabetical list and focus remains predictable.

### 3.13 Token References

`screen.shell.*`, `screen.header.*`, `screen.student-list.*`, `student-row.*`, `input.*`, `button.*`, `empty-state.*`, `alert.*`, `overlay.*`, `skeleton.*`, `type.screen-title`, `type.body`, `type.money`.

## 4. Student Detail

### 4.1 User Goal

Understand one Student's authoritative financial position, review immutable history, and start a Deposit or Withdrawal.

### 4.2 Screen Purpose

Student Detail is the financial trust surface. It presents Student identity, complete-history Balance, equal Deposit/Withdrawal actions, and newest-first Transaction history.

References: FR-3.1.4, FR-3.2.3, FR-3.3.1; NFR-3.1–3.3, NFR-4.1; BR-BAL-001–005, BR-UI-001–003; User Flows Sections 7, 10, 12.3, 13.2–13.3; Wireframes Section 8.

### 4.3 Screen Anatomy

```text
StudentDetailScreen
├── ScreenHeader
│   ├── BackButton
│   └── ScreenTitle: Student name
├── BalancePanel
│   ├── Label: "Saldo"
│   └── AuthoritativeBalance
├── TransactionActionGroup
│   ├── DepositButton: "Setor"
│   └── WithdrawalButton: "Tarik"
└── TransactionHistorySection
    ├── SectionTitle: "Riwayat transaksi"
    ├── TransactionList
    │   └── TransactionItem *
    ├── EmptyHistoryState
    ├── HistoryLoadingState
    ├── HistoryErrorState
    └── LoadOlderButton
```

### 4.4 Layout Hierarchy

1. Back navigation and Student identity.
2. Authoritative Balance panel.
3. Equal Deposit and Withdrawal actions.
4. Transaction history.

Use `screen.student-detail.section-gap`. Balance is the dominant type role and consumes `balance-panel.*` with `type.balance`. The panel relies on its neutral surface and border, not shadow. Actions use equal width and `screen.student-detail.action-gap`. History is a ledger list separated by `transaction-item.*`, not a card grid. Whitespace and alignment keep the financial information primary.

### 4.5 Responsive Behavior

- Single column at every width.
- Deposit and Withdrawal remain side by side when each retains `control.height.minimum` and readable text; at high zoom they stack with equal prominence.
- Balance text wraps only as a last resort and must never clip or reduce below its approved type role without an explicit responsive token.
- Desktop centers the same hierarchy and does not add summary cards, charts, or side panels.

### 4.6 Loading State

- Preserve header, Balance panel, actions, and first history rows with stable skeleton geometry.
- Do not show a provisional Balance or `Rp 0` while the authoritative value is unknown.
- Disable Deposit and Withdrawal until Student identity and authoritative Balance are available.
- Older-history loading affects only the history footer; existing Balance and rows remain visible.

### 4.7 Empty State

When the Student has no Transactions:

- Keep the authoritative `Saldo` value `Rp 0` visible in BalancePanel.
- Lucide icon: `ReceiptText`.
- Title: `Belum ada transaksi`.
- Description: `Catat setoran pertama untuk siswa ini.`
- Primary CTA: `Setor`.
- Withdrawal remains available in the action group but any positive amount is rejected by the non-negative Balance rule.
- Do not use an illustration.

### 4.8 Error State

#### Initial Detail Failure

- Title: `Detail siswa tidak dapat dimuat`.
- Description: `Saldo dan riwayat transaksi belum tersedia.`
- Actions: `Coba lagi` and `Kembali`.
- Do not show a provisional Balance.

#### Older History Failure

- Preserve Balance and already loaded history.
- Inline history message: `Transaksi lama tidak dapat dimuat`.
- Action: `Coba lagi`.

### 4.9 Offline State

- If no verified detail is available, show Offline in the main content region.
- Do not enable Deposit or Withdrawal while persistence is unavailable.
- If already loaded content remains visible, label connectivity loss without presenting it as freshly synchronized.
- Never queue a Transaction offline.

### 4.10 Populated State

- Display exact complete-history Balance immediately.
- Show Transactions newest first.
- Each TransactionItem contains type, explicit direction, whole-Rupiah amount, and Indonesian date plus 24-hour time.
- Deposit uses `color.deposit.*`; Withdrawal uses `color.withdrawal.*`, never error color.
- Do not provide edit, delete, swipe, overflow, or correction actions.
- Show `Muat transaksi lama` while more history exists; remove it when complete.

### 4.11 Success State

After a confirmed Deposit or Withdrawal:

- Return to Student Detail.
- Immediately render the authoritative updated Balance.
- Insert the confirmed Transaction as the newest history item.
- Do not animate Balance or amount values.
- Optional supportive emphasis may apply only to the Balance container or new row using `motion.feedback`.
- Container emphasis guides attention only; it must not imply, count, or stage the financial result.
- A polite announcement identifies the confirmed transaction type and amount.

### 4.12 Interactive Behaviors

- Back returns to Student List using browser history.
- Deposit and Withdrawal navigate to the matching Transaction Entry mode.
- Load Older uses Button Loading local to the history footer.
- Retain existing content and scroll position while older history loads.
- Full-history Balance never depends on visible history pages.

### 4.13 Token References

`screen.shell.*`, `screen.header.*`, `screen.student-detail.*`, `balance-panel.*`, `transaction-item.*`, `button.*`, `empty-state.*`, `alert.*`, `skeleton.*`, `color.deposit.*`, `color.withdrawal.*`, `type.balance`, `type.money`, `motion.feedback`.

## 5. Transaction Entry

### 5.1 User Goal

Record one valid Deposit or Withdrawal quickly, with the financial direction and outcome unambiguous.

### 5.2 Screen Purpose

Transaction Entry is a focused single-field workflow. It collects one positive whole-Rupiah amount, communicates direction before confirmation, prevents duplicate submission, and shows no success until persistence is confirmed.

References: FR-3.2.1–FR-3.2.2, FR-3.3.1; NFR-3.1–3.3, NFR-5.1–5.2; BR-MON-001–003, BR-TXN-001–005, BR-BAL-004–005, BR-UI-001; User Flows Sections 8–9, 11.2, 14–15; Wireframes Section 9.

### 5.3 Screen Anatomy

```text
TransactionEntryScreen
├── ScreenHeader
│   ├── BackButton
│   └── ScreenTitle: "Setor dana" or "Tarik dana"
├── DirectionSummary
│   ├── ModeIcon
│   ├── DirectionTitle
│   └── BalanceEffect
├── CurrentBalance, Withdrawal only
├── AmountField
│   ├── VisibleLabel: "Jumlah"
│   ├── Prefix: "Rp"
│   ├── WholeRupiahInput
│   ├── Hint
│   └── InlineError
├── SubmitState
└── ActionGroup
    ├── ConfirmButton
    └── CancelButton
```

### 5.4 Layout Hierarchy

1. Back navigation and transaction mode.
2. Direction and Balance-effect explanation.
3. Current authoritative Balance for Withdrawal only.
4. Amount field and inline feedback.
5. Confirm and Cancel actions.

Use `screen.transaction.section-gap`. Confirm is the only primary action. Cancel uses the approved secondary variant. The page owns scrolling; actions remain in document flow so the mobile keyboard cannot cover content permanently. Neutral surfaces and clear labels carry the form; color reinforces transaction direction and the primary action rather than decorating the page.

### 5.5 Responsive Behavior

- Single column at every width.
- Amount input and actions use full column width.
- Keep the focused field, error, and Confirm action reachable when the mobile keyboard opens.
- At wider viewports, center the same form; do not add a numeric keypad, side summary, or second column.

### 5.6 Loading State

- Initial route loading uses stable skeletons for direction context and Withdrawal Balance.
- Do not display Transaction controls until Student and mode are known.
- Do not show a provisional Withdrawal Balance.

### 5.7 Empty State

Transaction Entry has no normal empty-data state. If required Student or mode context is missing, treat it as Error rather than inventing an empty workflow.

### 5.8 Error State

#### Validation

- Empty/non-numeric: `Masukkan jumlah yang valid`.
- Zero/negative: `Jumlah harus lebih dari nol`.
- Decimal: `Jumlah harus berupa Rupiah utuh`.
- Unsupported range: `Jumlah di luar batas yang didukung`.
- Insufficient Balance: `Saldo tidak mencukupi`.
- Preserve Amount and focus the field.

#### System Failure

- Preserve mode and Amount.
- Message: `Transaksi tidak dapat disimpan`.
- Actions: `Coba lagi` when safe and `Ubah jumlah`.
- Never expose database internals or imply success.

### 5.9 Offline State

- Message: `Tidak ada koneksi. Transaksi belum disimpan.`
- Preserve Amount.
- Disable unsafe submission until online or provide an approved safe Retry after connectivity returns.
- Do not queue the Transaction.

### 5.10 Populated State

#### Deposit

- Title: `Setor dana`.
- Direction: `Dana dititipkan kepada siswa`.
- Effect: `Saldo bertambah`.
- Confirm: `Konfirmasi setoran`.
- Use `color.deposit.*` only as reinforcement.

#### Withdrawal

- Title: `Tarik dana`.
- Direction: `Dana dikembalikan oleh siswa`.
- Effect: `Saldo berkurang`.
- Show current authoritative Balance.
- Confirm: `Konfirmasi penarikan`.
- Use `color.withdrawal.*` only as reinforcement.

### 5.11 Success State

- Success exists only after persistence commit is confirmed.
- Navigate to Student Detail.
- Immediately show authoritative Balance and newest Transaction.
- Do not show a separate success screen.
- Do not animate Balance, Amount, or totals.

### 5.12 Interactive Behaviors

- Mode is fixed by the originating Student Detail action and cannot switch inside the form.
- Use a numeric mobile keyboard without relying on it for validation.
- Normalize formatting for `id-ID` without accepting decimals.
- Confirm uses Button Loading and becomes unavailable immediately after activation.
- Cancel and browser Back return to Student Detail without financial effect.
- Insufficient Balance is authoritative only after the atomic server operation.
- Unknown commit outcome transitions to the master Unknown Transaction Outcome state and reuses the original Transaction UUID.

### 5.13 Token References

`screen.shell.*`, `screen.header.*`, `screen.transaction.*`, `input.*`, `button.*`, `alert.*`, `skeleton.*`, `color.deposit.*`, `color.withdrawal.*`, `type.screen-title`, `type.body`, `type.money`, `motion.feedback`.

## 6. Screen Verification Gate

Every implementation must demonstrate all applicable states at 320px, 390px, 480px, and a centered desktop viewport; keyboard-only operation; mobile keyboard behavior; 200% text zoom; reduced motion; and screen-reader announcements. Financial truth and scope checks remain governed by `docs/17-design-review-checklist.md`.
