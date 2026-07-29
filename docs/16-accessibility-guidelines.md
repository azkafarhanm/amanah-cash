# Amanah Cash — Accessibility Guidelines

**Version:** 1.3

**Status:** Approved

**Owner:** Project Owner
**Last Updated:** 2026-07-29

---

## 1. Purpose and Standard

Amanah Cash targets WCAG 2.2 Level AA for all approved workflows. Accessibility is a release requirement, not later polish. Where project rules are stricter—such as 44px touch targets—the stricter rule applies.

## 2. Semantic Structure

- Use landmarks for header, navigation where present, main, and footer where present.
- Every screen has one clear level-one heading; section headings follow a logical hierarchy.
- Use real buttons for actions, links for navigation, labels for inputs, and list/table semantics where the content is truly a list/table.
- Do not add ARIA where native semantics already express behavior.
- Dynamic status, alert, and progress announcements must be concise and not duplicate visible content excessively.

## 3. Keyboard and Focus

- All functionality is operable with keyboard alone.
- Focus order follows the visual and task order.
- Focus is always visible with a contrast-compliant indicator that is not clipped.
- No keyboard trap exists except a correctly implemented modal overlay, which supports Escape when dismissal is safe.
- Opening an overlay moves focus to its heading or first useful field; closing returns focus to the trigger.
- After navigation, focus moves predictably to the new screen heading or retained browser position according to the tested routing strategy.
- Loading and disabled states do not strand focus.

## 4. Touch, Pointer, and Mobile

- Interactive targets are at least 44px by 44px with adequate spacing.
- Core behavior does not rely on hover, fine pointer precision, multi-touch, drag, swipe, or long press.
- Content works at 320px width and with 200% text zoom without loss of meaning or function.
- Inputs remain visible when the mobile keyboard opens; safe-area insets are honored.
- Orientation is not locked unless a future approved requirement makes it essential.

## 5. Color and Contrast

- Normal text has at least 4.5:1 contrast; large text has at least 3:1.
- UI components, boundaries needed to identify controls, focus indicators, and meaningful graphics have at least 3:1 against adjacent colors.
- Color never acts alone. Deposit/Withdrawal, errors, success, selection, and disabled states also use text, icon, shape, or position.
- Validate every semantic token combination, including hover, focus, disabled, error, and any approved dark theme.

## 6. Typography and Readability

- Default body and input text is 16px or larger on mobile.
- Text can resize without clipping, overlap, or hidden actions.
- Avoid justified text, all-caps passages, low-contrast placeholders, and overly light font weights.
- Keep instructions short and place them before the action they govern.
- Use Bahasa Indonesia only for MVP interface copy and declare the document language accordingly.
- Use `id-ID` Rupiah formatting, Indonesian date formatting, and 24-hour time consistently; do not rely on visual alignment alone to convey amount meaning.
- Multilingual support and runtime language switching are out of scope.

## 7. Forms and Validation

- Every input has a persistent visible label.
- Required status, format, and consequence are communicated before submission where useful.
- Errors identify the field and correction in text, remain visible until resolved, and are programmatically associated with the input.
- On failed submit, focus moves to an error summary or the first invalid field in a predictable manner.
- Valid input is preserved after correctable failure.
- Do not disable Confirm without making the reason clear; submission-time disabling prevents duplicates and must announce busy state.
- Autocomplete attributes are used only when semantically correct; do not invent personal-data collection.

## 8. Financial Meaning

- Always state Deposit and Withdrawal by name and direction.
- Screen readers receive the complete amount with currency and direction, not an isolated plus/minus sign.
- The Balance label is associated with its exact value and state.
- Loading Balance is announced as loading; failure does not expose a provisional number.
- Transaction timestamps have understandable accessible names even if visually abbreviated.
- Edit, soft delete, and restore controls must have explicit accessible names, state, reason requirements, and Balance-effect warnings; soft delete must never be announced as permanent removal.

## 9. Dynamic States

### Search

Announce settled result count changes politely without announcing every keystroke verbosely. Debounced live search must cancel or supersede pending work so an older query cannot replace newer results. The clear control has an accessible name. No-results copy is visible and programmatically discoverable.

### Loading

Prefer Skeleton Loading for pages and page sections, and Button Loading during submission. Avoid unnecessary global spinners. Busy regions expose appropriate status without repeatedly stealing focus. Skeletons are hidden from accessibility APIs unless they contain meaningful status text.

### Success

Confirmed outcomes appear in persistent screen content; transient notification is supplemental. Do not move focus unexpectedly merely to announce success.

### Error and Retry

Errors use an alert or associated message appropriate to urgency. Retry has a specific accessible name when multiple sections could fail. Existing content remains available when only older history fails.

### Report Export

Report export uses native text buttons for CSV, Excel, and PDF. Enter and Space activation have identical native behavior. The initiating control keeps focus, the format group exposes busy state, and one stable live region announces only state transitions: preparing once, then download started or failure once. Re-renders must not repeat announcements. Failure guidance remains visible with alert semantics, Retry starts a clean attempt, and no message claims that the browser saved or opened a file.

### Unknown Transaction Outcome

Announce that the application is checking whether the Transaction was saved. Disable unsafe duplicate action and provide no false success language.

### Financial Audit Detail

Audit timeline entries are semantic dialog triggers for the platform
`ContextDetailDrawer`. The drawer exposes a programmatic title and description,
makes background content inert, contains focus while modal, supports Escape
and an explicitly named close control, returns focus to the exact selected
entry, announces loading once, exposes a specific Retry action, and presents
unsupported schemas as unavailable without invented values.

### Context Detail Drawer

- Desktop/tablet inline-end and mobile full-screen presentations expose the
  same name, description, content, states, controls, and outcomes.
- Focus moves synchronously to the heading or first useful control and never
  waits for motion.
- The sticky header and close control remain reachable at 200% zoom.
- Only drawer content scrolls; the background is inert and scroll-locked.
- Native scrollbars remain available, overscroll is contained, and reflow does
  not introduce core horizontal scrolling.
- The close control has a visible Lucide icon, a specific accessible name, and
  at least the approved minimum target.
- Loading shapes are hidden from accessibility APIs while one polite status
  communicates loading.
- Known load failure uses an appropriate alert and contextual Retry.
- Unavailable read-only detail is a status, not an urgent error.
- Browser Back behavior is not assumed by the component; any history
  integration requires a Technical Design or Routing ADR.

## 10. Motion and Media

- Follow `docs/15-motion-guidelines.md` and the user's reduced-motion preference.
- No essential information depends on animation.
- Balance values, money counting, and financial totals never animate; authoritative financial values update immediately.
- MVP empty states do not use illustrations. Their Lucide icons are decorative unless they convey meaning not already present in the title and description.
- Do not autoplay audio or video. No flashing content is permitted.

## 11. Component Accessibility Expectations

- Use proven accessible primitives, but verify them in the actual composition.
- Icon-only controls have accessible names; decorative icons are hidden.
- Dialog, Sheet, and Context Detail Drawer expose name, description where
  needed, modality, focus containment, focus return, and safe dismissal.
- The centered desktop Dialog and mobile/PWA bottom Sheet expose the same accessible name, description, controls, validation, focus behavior, and outcomes.
- Toasts do not contain the only copy of critical information.
- Lists and rows expose one coherent navigation target rather than nested competing controls.
- Reports tables include captions/labels, header associations, sortable-heading state, and a responsive alternative that preserves relationships. Any secondary row disclosure retains an explicit summary and keeps notes, revision, actor, and audit evidence available to keyboard and screen-reader users.
- Charts, if ever approved, require a text summary and equivalent data table.

## 12. Language and Cognitive Accessibility

- Use plain, consistent domain terminology.
- One screen and one form should have one primary goal.
- Confirmations explain financial consequence, not technical implementation.
- Errors say what happened and what the operator can do next.
- Avoid jargon, unexplained abbreviations, ambiguous icons, and time-limited interaction.
- Authentication uses one clearly named Google action and must not present password, Sign Up, Forgot Password, or password-reset controls.
- Authentication loading, denial, expired-session, and retry states are announced without exposing sensitive technical details.
- The unregistered-account message clearly directs the visitor to contact Platform Admin.

## 13. Verification Matrix

Each UI change must include:

- automated semantic/accessibility checks where applicable;
- keyboard-only walkthrough;
- focus order and focus return review;
- screen-reader smoke test for the changed workflow;
- contrast validation for all changed states;
- 320px width, 200% zoom, and mobile keyboard verification;
- reduced-motion verification;
- touch-target measurement;
- error, loading, empty, success, and retry state review.
- Chrome, Edge, Firefox, mobile-browser, and installed-PWA export behavior where export presentation changes.

Automated tools do not replace manual testing. Record browser, assistive technology, viewport, command/tool, result, and known limitation.

## 14. Human Decisions Required

- Supported browser and assistive-technology test matrix.
- Primary screen readers for release verification.
- Whether a formal accessibility conformance report is required.
- Final contrast-tested brand palette and any approved dark theme.
