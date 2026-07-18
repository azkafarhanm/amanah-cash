# Amanah Cash — Component Guidelines

**Version:** 1.0

**Status:** Approved

**Owner:** Project Owner
**Last Updated:** 2026-07-18

---

## 1. Purpose

This document defines the component model, selection rules, states, and composition boundaries for consistent future UI implementation. Component names express presentation responsibilities only and do not authorize framework choice or product behavior.

## 2. Component Hierarchy

```text
Design tokens
  → semantic primitives
    → controls and feedback
      → domain presentation components
        → screen sections
          → approved screens
```

- **Tokens:** color, spacing, type, radius, elevation, motion, focus.
- **Primitives:** text, surface, divider, icon, stack, inline group.
- **Controls:** button, input, label, dialog/sheet, alert, skeleton.
- **Domain presentation:** BalanceDisplay, StudentRow, TransactionItem, DirectionSummary.
- **Sections:** TransactionHistory, TransactionActions, StudentListState.
- **Screens:** Student List, Student Detail, Transaction Entry.

Do not make a component reusable by adding speculative props. Extract only when semantics or verified repetition justify it.

## 3. Variant Rules

Every interactive component defines only meaningful variants:

- visual intent: primary, secondary, quiet, danger;
- size: compact where safe, default, large financial action;
- state: rest, hover enhancement, focus-visible, active, disabled, loading, error where applicable.

Do not create arbitrary color variants. Deposit and Withdrawal variants reinforce domain direction but remain equal in prominence.

## 4. Core Component Contracts

### 4.1 Application Shell

- Provides page background, safe areas, centered mobile-first content, and route outlet.
- Does not calculate Balance or store authoritative financial state.
- Preserves browser navigation and installed-PWA behavior.

### 4.2 Screen Header

- Identifies current screen and Student context where applicable.
- Supports a semantic heading and optional Back/action controls.
- Avoids brand-heavy mastheads that consume mobile space.

### 4.3 Button

- Uses a verb-specific visible label from the Screen Specifications, for example `Tambah siswa`, `Konfirmasi setoran`, or `Coba lagi`.
- Maintains at least a 44px target.
- Loading disables repeat activation but retains a stable label or accessible loading name.
- Icon-only use is limited to universally understood secondary controls with accessible names.
- Disabled appearance must not be the only explanation; show why when the reason is not obvious.

### 4.4 Text and Search Inputs

- Always have a programmatic label; placeholder text is supplemental.
- Associate hint and error text through accessible descriptions.
- Preserve valid input after correctable failure.
- Search updates after each input change and provides a labeled clear action.
- Name input supports the approved 100-character normalized limit without inventing additional fields.

### 4.5 Rupiah Amount Input

- Presents `Rp` as a clear prefix without making it editable.
- Invokes an appropriate numeric keyboard but accepts only validated whole Rupiah.
- Never uses floating-point formatting or decimal affordances.
- Does not auto-submit.
- Shows exact validation near the input and preserves the entered amount.

### 4.6 Balance Display

- Labels the value as Balance and uses tabular numerals.
- Shows a value only when based on complete persisted history.
- Uses skeleton/loading or explicit error instead of a provisional amount.
- Immediately displays the authoritative value after successful persistence.
- Never animates, interpolates, counts, or transitions between Balance values.
- Does not imply that visible history is the calculation source.

### 4.7 Student Row

- Full row is one keyboard- and touch-operable navigation target.
- Shows Student name and current Balance.
- Supports long names without hiding the balance meaning; wrapping is preferred to destructive truncation at narrow widths.
- Does not add avatar, status, grade, identifier, or menu actions without requirements.

### 4.8 Transaction Item

- Shows Deposit/Withdrawal, explicit direction, whole-IDR amount, and timestamp.
- Uses newest-first ordering provided by the approved data contract.
- Has no edit, delete, overflow, swipe, or correction actions.
- Uses text and icon/shape in addition to color.

### 4.9 Direction Summary

- Deposit: `Dana dititipkan kepada siswa` and `Saldo bertambah`.
- Withdrawal: `Dana dikembalikan oleh siswa` and `Saldo berkurang`.
- Appears before the amount is confirmed.
- Is not reduced to plus/minus iconography.

### 4.10 Dialog or Sheet

- Create Student remains a focused overlay from Student List.
- Desktop/web uses a centered Dialog.
- Mobile browser and installed PWA use a bottom Sheet.
- Dialog and Sheet are two responsive presentations of the same interaction contract, state, validation, actions, focus behavior, and outcome.
- The title, label, Confirm, Cancel, errors, initial focus, focus return, and dismissal behavior are mandatory.
- Accidental outside dismissal must not discard entered data without a deliberate product decision.

### 4.11 Alert and Inline Error

- Inline validation sits adjacent to its field.
- Screen/system failures use an alert or status region with a safe action.
- Error copy is concise, specific, and does not expose internals.
- Color is never the only signal.

### 4.12 Loading and Skeleton

- Prefer Skeleton Loading for initial page and page-section loading.
- Prefer Button Loading during form submission and other button-initiated writes.
- Avoid global spinners unless no stable page structure can be presented and the exception is approved.
- Match the approximate final geometry to limit layout shift.
- Never skeletonize a fake amount that could be interpreted as real.
- Do not use indefinite shimmer under reduced motion.
- Progressive history loading changes only the history footer; existing Balance and history remain visible.

### 4.13 Empty State

- Every MVP empty state uses exactly this hierarchy: Lucide icon, title, description, and primary call to action when an approved next action exists.
- Do not use illustrations.
- Explain what is empty and give only the documented next action.
- No Students: offer Add Student.
- No search result: offer change/clear search, not contextual creation.
- No Transactions: show `Rp 0` and the approved Deposit/Withdrawal actions.

### 4.14 Toasts and Success Feedback

- A toast may reinforce a confirmed outcome but must not be the only confirmation.
- Never report Transaction success before persistence is confirmed.
- Important errors remain visible in context instead of disappearing automatically.
- Avoid celebratory confetti, sound, or haptics without explicit approval.

## 5. Screen Composition

### 5.1 Student List

`ScreenHeader + AddStudentAction + StudentSearchInput + StudentListState + CreateStudentOverlay`.

Search remains immediately reachable. Rows are alphabetical. List loading, first-time empty, search empty, and system failure are mutually clear. Virtualization or infinite scrolling is not introduced without a measured data-volume requirement.

### 5.2 Student Detail

`ScreenHeader + StudentIdentity + BalanceDisplay + TransactionActionGroup + TransactionHistorySection`.

Balance is the dominant information element. Deposit and Withdrawal are paired and equally prominent. History is a ledger list, not a card mosaic. Load Older is explicit; infinite scroll is not assumed.

### 5.3 Transaction Entry

`ScreenHeader + DirectionSummary + CurrentBalance(withdrawal only) + RupiahAmountInput + InlineError + SubmitState + Confirm + Cancel`.

The mode cannot change accidentally within the form. Confirm wording includes the transaction type. Unknown outcome disables repeated actions while resolution occurs.

## 6. Non-MVP Screen Guidance

- Dashboard components must not be added to the MVP shell. If approved later, compose from summary values, tasks, and recent activity rather than generic widgets.
- Reports require approved reporting definitions before Chart, DateRange, Export, or Filter components exist.
- Settings require approved preferences before Switch, Select, or settings navigation components exist.

## 7. Component Selection Rules for AI Agents

1. Identify the semantic HTML element first.
2. Choose a shadcn/ui primitive only when it supplies necessary behavior.
3. Confirm the primitive can represent every documented state.
4. Apply Amanah Cash tokens and copy; remove demo styling and demo behavior.
5. Test keyboard, screen reader naming, focus return, zoom, 320px layout, and reduced motion.
6. Keep server/domain decisions outside the component.
7. Reject components that require hidden gestures, hover, drag, swipe, or continuous animation for core workflows.
8. Record any new variant in the design system before using it repeatedly.

## 8. Copy Rules

- All MVP interface copy uses Bahasa Indonesia only. Multilingual support is out of scope.
- Use the `id-ID` locale, Indonesian date formatting, and 24-hour time.
- Follow the cross-layer terminology contract in `docs/04-domain-model.md` Section 4.6. Preserve English Domain terms in requirements, code, and traceability; use only the approved Bahasa Indonesia UI terms and final strings from `docs/19-screen-specifications.md` for visible interface copy.
- Use sentence case and active voice.
- Buttons name the action; headings name the context.
- Explain consequence before financial confirmation.
- Never use `credit/debit`, `send/receive`, or other synonyms where they could reverse the approved meaning.
- Do not promise success while an outcome is pending or unknown.

## 9. Design Token Enforcement

- Never hardcode colors, spacing, radii, typography, or shadows in a component or screen.
- Reference approved Design Tokens for every visual value, component state, and responsive variant.
- If a required token does not exist, propose it for approval rather than substituting an arbitrary value.
