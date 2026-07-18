# Amanah Cash — Master Interaction States

**Version:** 1.0

**Status:** Approved

**Owner:** Project Owner
**Last Updated:** 2026-07-18

---

## 1. Purpose

This document defines reusable master interaction patterns for Amanah Cash. Screens reference these patterns instead of inventing state behavior. Product meaning remains governed by approved requirements, Business Rules, User Flows, and Wireframes.

## 2. Global State Rules

- Apply Calm Before Color: neutral grayscale is the default, and semantic color appears only for action, focus, direction, warning, error, or confirmed status.
- Apply Information Before Decoration: state title, description, verified data, and next action precede visual effects.
- Communicate Quiet Confidence through stable layout, exact language, border-led surfaces, restrained elevation, and predictable feedback.
- Use Bahasa Indonesia and `id-ID` formatting.
- Use tokens from `docs/18-design-tokens.md`; no state may hardcode a visual value.
- Preserve valid content and input whenever safe.
- Communicate state with text and semantics, never color or motion alone.
- Motion is supportive only. It never communicates financial truth.
- Motion guides attention, reinforces hierarchy, or clarifies a transition; it never manufactures confidence or implies success before persistence.
- Balance values, money counting, Transaction amounts, and financial totals never animate.
- Page loading prefers Skeleton Loading. Submission prefers Button Loading.
- Avoid unnecessary global spinners.
- Empty states use Lucide icon, title, description, and approved primary CTA; never illustrations.
- Success is shown only after the authoritative operation succeeds.
- Offline behavior never implies queued or synchronized Transactions.
- Persistent state containers use borders by default. Medium shadow is limited to meaningful hover elevation; large shadow is limited to Dialogs and Sheets.
- Interactive focus uses `:focus-visible` with the `focus.visible` token. Do not suppress focus without this replacement.

## 3. State Transition Model

```text
Idle
 ├── read request ───────────────> Loading ── success ──> Populated / Empty
 │                                      └── failure ──> Error / Offline
 └── write request ──────────────> Button Loading
                                        ├── confirmed ──> Success
                                        ├── rejected ───> Error
                                        ├── offline ────> Offline
                                        └── uncertain ──> Unknown Transaction Outcome
```

Transitions update semantics immediately. Any fade, opacity, elevation, or container emphasis is supplemental, uses approved motion tokens, and cannot change the meaning or timing of financial truth.

## 4. Loading

### Purpose

Indicate that required page or section data is being retrieved without inventing content or financial values.

### Visual Composition

- Preserve final layout geometry with `skeleton.*` tokens.
- Skeleton only the region whose data is unavailable.
- Retain stable header and already verified surrounding content.
- Use a short visible status when a skeleton alone would not communicate the operation.

### Interaction Rules

- Disable only actions that depend on unavailable data.
- Do not block browser Back.
- Existing verified Balance and history remain visible during sectional loading.
- Never use `Rp 0` as a Balance placeholder.

### Accessibility

- Mark the affected region busy.
- Provide a concise polite status such as `Memuat data`.
- Hide purely visual skeleton shapes from accessibility APIs.
- Do not move focus when loading begins or ends.

### Transition Rules

- Loading → Populated when data exists.
- Loading → Empty when the confirmed result is empty.
- Loading → Error for a system failure.
- Loading → Offline when connectivity prevents retrieval.

### Developer Implementation Rules

- Prefer component-shaped Skeleton Loading.
- Do not use an application-wide spinner when stable structure is known.
- Prevent stale requests from replacing newer results.
- Balance becomes visible only when the complete-history value is authoritative.

### Motion Constraints

- Optional skeleton-to-content opacity uses `motion.presence`.
- Reduced motion uses `motion.reduced`.
- No shimmer is required; financial placeholders must never resemble changing values.

## 5. Button Loading

### Purpose

Indicate that one button-initiated operation is in progress and prevent repeated activation.

### Visual Composition

- Keep button dimensions and primary label context stable.
- Show a compact progress indicator and loading label, for example `Menyimpan`.
- Use the existing button variant and `button.*` tokens.

### Interaction Rules

- Disable repeat activation immediately.
- Preserve input and surrounding context.
- Cancel is disabled only when leaving would make the outcome unsafe or unclear.
- Other unrelated actions remain available where safe.

### Accessibility

- Expose busy and disabled state programmatically.
- Announce the operation once without repeatedly announcing progress.
- Keep focus on the initiating button unless the resulting transition requires documented focus movement.

### Transition Rules

- Button Loading → Success after confirmed persistence.
- Button Loading → Error after known rejection/failure.
- Button Loading → Offline when the request was not persisted because connectivity failed.
- Button Loading → Unknown Transaction Outcome when commit status cannot be determined.

### Developer Implementation Rules

- Use one in-flight logical submission identity.
- Transaction retry reuses the original Transaction UUID.
- Button Loading must not be simulated with a fixed delay.

### Motion Constraints

- Progress rotation may indicate activity but never financial progress or completion percentage.
- Button label/indicator presence may use `motion.feedback`.
- Do not animate Amount or Balance.

## 6. Empty

### Purpose

Explain a confirmed absence of content and offer the single approved next action.

### Visual Composition

Required order:

1. Lucide icon.
2. Title.
3. Description.
4. Primary CTA when an approved next action exists.

Use `empty-state.*` and `screen.empty.max-width`. Do not use illustrations.

### Interaction Rules

- Offer only the next action authorized by the screen specification.
- Do not confuse an empty search result with an empty dataset.
- Do not add secondary promotional actions.

### Accessibility

- Treat the icon as decorative when title and description contain the meaning.
- Place the state in the normal reading order.
- CTA uses a specific accessible name.

### Transition Rules

- Empty → Loading when the user retries or changes a query.
- Empty → overlay/form when the user activates an approved creation CTA.
- Empty → Populated after confirmed creation or a matching result appears.

### Developer Implementation Rules

- Render Empty only after the data source confirms no records/result.
- Do not use Empty while a request is still loading.
- Use screen-approved Bahasa Indonesia copy.

### Motion Constraints

- Optional container fade uses `motion.presence`.
- Do not animate the icon continuously.

## 7. Error

### Purpose

Communicate a known validation, read, or system failure with a safe corrective action.

### Visual Composition

- Validation: message adjacent to the field.
- Page failure: `alert.*` composition with title, description, and safe action.
- Section failure: local alert that preserves verified surrounding content.
- Use `color.error.*` only for actual errors, never ordinary Withdrawal meaning.

### Interaction Rules

- Preserve valid input and verified content.
- Explain what the operator can do next.
- Do not expose database, stack, or transport internals.
- Do not claim a Transaction failed when its outcome is unknown; use Unknown Transaction Outcome.

### Accessibility

- Associate field errors with their input.
- Use alert semantics for urgent failures and status semantics for non-urgent contextual failures.
- Move focus to the first invalid field for single-field MVP forms.
- Retry controls include context in their accessible name when multiple retries exist.

### Transition Rules

- Error → Idle when the operator edits invalid input.
- Error → Loading/Button Loading when Retry begins.
- Error → Populated after successful recovery.

### Developer Implementation Rules

- Map known server outcomes to approved Bahasa Indonesia copy.
- Roll back partial writes before returning a failure.
- Log diagnostics outside operator-facing content.

### Motion Constraints

- Error presence may use opacity with `motion.feedback`.
- Do not shake fields, flash the screen, or animate money.

## 8. Retry

### Purpose

Allow a failed operation to be attempted again only when retry is safe.

### Visual Composition

- Specific action label: `Coba lagi` or context-specific equivalent.
- Retain the Error or Offline explanation until Retry begins.
- Use primary or secondary button hierarchy according to the screen specification.

### Interaction Rules

- Reads may retry the failed request.
- Transaction writes reuse the original logical Transaction UUID.
- Unknown outcomes must be resolved before allowing a write retry.
- Disable repeated Retry while the request is active.

### Accessibility

- Accessible name identifies the failed region when necessary.
- Announce the new loading state once.
- Keep focus stable unless navigation succeeds.

### Transition Rules

- Retry → Loading for reads.
- Retry → Button Loading for writes.
- Retry → Error/Offline if it fails again.
- Retry → Populated/Success after recovery.

### Developer Implementation Rules

- Retry must be idempotent where required.
- Do not create a new Transaction UUID for the same logical submission.
- Do not offer Retry when it could duplicate or corrupt an operation.

### Motion Constraints

- Use ordinary button feedback only.
- No progress animation may imply financial completion.

## 9. Offline

### Purpose

State that current server-backed behavior is unavailable because the device cannot reach the application service.

### Visual Composition

- Lucide icon: `WifiOff`.
- Clear title and description.
- Safe Retry or reconnect guidance.
- Preserve already verified content when it remains useful, while indicating it is not newly synchronized.

### Interaction Rules

- Never queue Deposit or Withdrawal.
- Never report an operation as saved offline.
- Preserve form input when safe.
- Disable server-dependent confirmation until connectivity returns or Retry is explicitly initiated.

### Accessibility

- Announce connectivity loss once as a status unless it invalidates an active financial submission, where an alert is appropriate.
- Do not repeatedly announce network polling.

### Transition Rules

- Offline → Loading after connectivity returns and Retry begins.
- Offline → Button Loading for a safe preserved submission retry.
- Offline → Populated after verified refresh.

### Developer Implementation Rules

- Service-worker presence must not be treated as offline data support.
- Distinguish known not-saved from unknown commit outcome.
- Do not automatically resubmit financial writes when connectivity returns.

### Motion Constraints

- No continuous pulsing connectivity indicator.
- Optional status-container fade uses `motion.presence`.

## 10. Permission

### Purpose

Explain that a browser/platform permission required by a future approved interaction is unavailable. The MVP has no authentication, roles, or application-level permission model.

### Visual Composition

- Lucide icon appropriate to the platform capability.
- Title, consequence, and one approved recovery action.
- Do not imitate an operating-system permission prompt.

### Interaction Rules

- Use only when an approved MVP platform capability genuinely requires permission.
- Do not introduce account, role, or authorization UI.
- Provide manual guidance if the browser cannot reopen its native prompt.

### Accessibility

- Explain the permission and consequence in text.
- Do not rely on an icon or browser-specific terminology alone.

### Transition Rules

- Permission → Loading after access is granted and the action is retried.
- Permission → prior safe screen when the operator declines.

### Developer Implementation Rules

- Feature-detect the platform capability.
- Treat denied, dismissed, and unsupported outcomes distinctly when they require different guidance.
- If no approved capability requires permission, do not render this pattern.

### Motion Constraints

- No attention-seeking pulse or repeated prompt animation.

## 11. Success

### Purpose

Confirm an operation only after its authoritative success condition is met.

### Visual Composition

- Persistent updated destination content is the primary confirmation.
- Optional supplemental status/toast uses `color.success.*` and `alert.*` composition.
- No separate success screen for MVP workflows.

### Interaction Rules

- Student creation navigates to the new Student Detail.
- Deposit/Withdrawal returns to Student Detail with authoritative Balance and newest Transaction.
- Success feedback never blocks the next action.

### Accessibility

- Announce a concise polite confirmation once.
- Include transaction type and formatted amount when confirming a financial event.
- Do not move focus solely to announce a toast.

### Transition Rules

- Button Loading → Success only after confirmed persistence.
- Success → normal Populated state immediately; supplemental feedback may expire without removing persistent evidence.

### Developer Implementation Rules

- The server response or verified follow-up read is authoritative.
- Do not use optimistic financial success.
- Ensure the updated Balance uses complete persisted history.

### Motion Constraints

- Balance, Amount, and totals update immediately with no animation.
- Optional one-time fade, elevation, opacity, or container emphasis uses `motion.feedback`.
- Container emphasis begins only after persistence is confirmed and the authoritative value is already present.
- No confetti, counting, bounce, flash, or celebratory motion.

## 12. Unknown Transaction Outcome

### Purpose

Protect financial integrity when the client cannot determine whether a submitted Transaction committed.

### Visual Composition

- Persistent warning/information container using `alert.*`.
- Title: `Status transaksi sedang diperiksa`.
- Description: `Jangan kirim ulang sampai pemeriksaan selesai.`
- Stable Button Loading or resolving status; no success/error styling until known.

### Interaction Rules

- Disable Confirm and duplicate Retry.
- Preserve mode, Amount, Student context, and original Transaction UUID.
- Query the server for the original UUID.
- Do not allow editing that could disguise the same logical submission while resolution is active.

### Accessibility

- Announce the resolving state once as a status.
- If resolution takes longer, update only when the outcome changes; do not announce polling.
- Keep focus stable and expose busy state.

### Transition Rules

- Unknown → Success when the original Transaction exists and is committed.
- Unknown → Error/Retry only when the server confirms it did not commit or rolled back.
- Unknown → Offline when resolution itself cannot reach the server, while retaining the same UUID and unresolved meaning.

### Developer Implementation Rules

- Resolve by original Transaction UUID before any retry.
- Reuse the same UUID if a confirmed-not-committed operation is retried.
- Never infer failure from timeout alone.
- Never show an optimistic Balance.

### Motion Constraints

- Use a stable busy indicator only.
- Motion must not suggest progress toward success or failure.
- Financial values remain unchanged until the authoritative result is known, then update immediately without animation.

## 13. State Implementation Checklist

- [ ] State is authorized by a screen specification.
- [ ] Purpose and copy are specific to the operation.
- [ ] Visual values reference Design Tokens.
- [ ] Verified content and valid input are preserved where safe.
- [ ] Accessible name, role, busy state, focus, and announcement are correct.
- [ ] Retry is safe and idempotent where required.
- [ ] Offline behavior does not queue financial writes.
- [ ] Unknown outcome is not mislabeled as Error.
- [ ] Success follows confirmed persistence.
- [ ] Balance, Amount, money counting, and totals never animate.
- [ ] Reduced-motion behavior is verified.
