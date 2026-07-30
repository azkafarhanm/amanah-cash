# Amanah Cash — Settings UI/UX Review and Design Proposal

**Version:** 1.2  
**Status:** Approved Decision Record — incorporated into the final specification  
**Owner:** Product Owner  
**Review Date:** 2026-07-30
**Approved:** 2026-07-30
**Micro-interaction Addendum:** Approved 2026-07-30

---

## 1. Purpose and Approval Boundary

This document records the review and Product Owner decision that established a
calmer, leaner MVP direction. The final, authoritative contract is
`docs/21-mvp-settings-specification.md`, supported by
`docs/18-design-tokens.md`, `docs/15-motion-guidelines.md`, and
`docs/19-screen-specifications.md`.

Approval authorizes documentation reconciliation only. It does not authorize
implementation; application work requires a separate implementation instruction.

## 2. Review Evidence and Current State

The review used the current Settings routes, components, theme mappings, shell
navigation, and the Product Owner's recorded observations as UX evidence. The
screen-recording attachment was not available as a readable workspace artifact,
so recording-specific timing and frame-by-frame observations remain a Product
Owner review gate rather than inferred facts.

The current implementation:

- renders Appearance and Preferences for both Platform Admin and Operator;
- offers Light, Dark, System, and Time theme choices;
- applies theme changes optimistically and persists them per user;
- offers default page size and administrative delete-confirmation preferences;
- does not yet render Data, Security, or About;
- uses a single responsive content column with bordered Settings sections; and
- relies on normal route replacement with immediate content changes. The shell
  animates only the mobile sidebar, while Settings content has no transition or
  pending-state continuity.

The current Light mapping is white-dominant with teal actions and a cyan subtle
surface. Repeated use of teal for active navigation, links, focus, radio
selection, and controls makes the accent more visually prominent than intended.
The Dark mapping already uses independently selected blue-slate surface steps
and a restrained sky interaction accent; it is not a mechanical inversion.

## 3. Proposed Experience Direction

Settings should feel like a short, trustworthy control panel, not a
customization center. Use one page, five clearly titled groups, short supporting
copy, immediate row-level feedback, and no decorative content. Structure,
typography, whitespace, and neutral surfaces should carry the hierarchy; color
should identify action, focus, status, or financial meaning only.

### 3.1 Light Theme

Replace the “Tropical Sunrise” authenticated-app direction with a calm
neutral-and-ink-blue direction. The exact accessible values require contrast
validation before approval, but the proposed reference set is:

| Role | Proposed direction |
|---|---|
| Primary action/focus | Desaturated ink blue; reference `#315E7D` |
| Primary hover | Deeper ink blue; reference `#274C66` |
| Primary active | Dark ink blue; reference `#203F55` |
| Canvas | Cool off-white; reference `#F6F8FA` |
| Primary surface | White; reference `#FFFFFF` |
| Subtle/selected surface | Neutral blue-gray; reference `#F1F4F7` |
| Elevated surface | White with quiet border and, only when needed, subtle shadow |
| Primary text | Deep blue-gray; reference `#1F2937` |
| Secondary text | Muted slate; reference `#52606D` |
| Default/strong border | Cool neutral gray; references `#DDE3E8` / `#C8D1DA` |

Composition rules:

- Neutral colors should occupy most of every authenticated screen.
- Use the primary family only for the main action, active navigation,
  interactive text, focus, and selected controls.
- Do not tint every card or Settings group. Use white surfaces, quiet borders,
  spacing, and at most one neutral selected fill.
- Remove cyan, teal, orange, and yellow as decorative authenticated-app
  accents. They may remain only where an approved semantic state requires them.
- Keep success emerald, warning amber, error muted red, Deposit emerald, and
  Withdrawal blue. Never use the primary accent to replace those meanings.
- Do not use accent-colored paragraph text, large fills, gradients, or repeated
  colored outlines.
- Validate text, icons, controls, hover, focus, disabled, and selected pairings
  against `docs/16-accessibility-guidelines.md` before token approval.

This direction reduces saturation and color competition without making the
interface sterile. It also separates product interaction emphasis from
financial/status meaning more clearly than the current teal-heavy mapping.

### 3.2 Dark Theme

Retain the current Modern Tech & Finance direction with only these checks:

- preserve separate canvas (`slate.900`), grouped surface (`slate.800`), and
  selected/subtle surface (`slate.700`) roles;
- reserve sky for action, focus, links, and selection rather than broad fills;
- verify adjacent surfaces through borders and spacing before adding shadow;
- keep soft near-white primary text and slate secondary text instead of pure
  white; and
- validate native controls, disabled states, overlays, and focus rings in Dark
  independently.

No broad Dark redesign is proposed.

## 4. Settings Navigation and Motion

### 4.1 Information Movement

Keep all MVP groups on one responsive page. Do not create nested Settings routes,
multi-level menus, or a permanent secondary sidebar. On long mobile pages, an
optional compact “Jump to section” control may use native in-page anchors only
if usability testing shows that scrolling is a recurring problem.

Navigation from the application shell into Settings and any internal Changelog
view should preserve the shell and content geometry. The outgoing page must not
slide away. New content may enter with:

- opacity from `0.96` to `1`; and
- an optional `4px` downward-to-rest shift on capable devices.

Use the existing standard duration range, targeting `180ms`, with the calm
standard ease-out. The transition must be interruptible. Under
`prefers-reduced-motion: reduce`, remove translation and either use an
effectively instant replacement or a very brief opacity change.

### 4.2 Immediate Feedback

- Begin pressed, hover, focus, and active-navigation feedback immediately,
  completing in the Fast range (`120–160ms`).
- Change only opacity, color, border color, background color, or a small
  transform. Never animate layout dimensions or scroll position.
- Keep keyboard focus visible throughout navigation.
- For preference changes, update only the selected row, show `Menyimpan…`
  locally, prevent duplicate submission for that row, and retain other controls'
  responsiveness.
- Announce committed success or failure once. A failed optimistic change returns
  to the last committed value without moving the page.

### 4.3 Perceived Performance

- Treat immediate local response—not additional animation—as the primary source
  of perceived quality.
- Preserve the app shell, page title position, group widths, and expected row
  geometry while content resolves.
- Show a route-level pending state only when navigation does not complete
  immediately; avoid flashing a skeleton for fast responses.
- If needed, delay the pending indicator by roughly `100ms`, then keep it
  layout-stable. Never delay actual navigation to make an animation visible.
- Load or mutate each Settings group independently where the data boundary
  allows it; one row save must not disable the whole page.
- Prefer server-rendered committed values and small client interactions. Do not
  add an animation library solely for this transition.

#### Core Settings Perceived-Responsiveness Principle

Every Settings interaction follows this contract:

1. reflect a valid selected value immediately in the affected control;
2. persist in the background whenever the operation is safe to present
   optimistically;
3. block duplicate activation only at the narrowest affected control;
4. keep the page, Settings group, and unrelated controls interactive;
5. preserve unrelated rendered content and component identity;
6. show pending feedback only when useful, in preallocated geometry; and
7. reconcile success or failure locally without page reload, section reload,
   scroll movement, or layout shift.

Full-page loading, whole-Settings disabling, whole-section disabling, and
unrelated Settings rerendering are prohibited for ordinary preference changes.
Motion never compensates for delayed state presentation. A preference can feel
polished with no animation when selection is immediate, geometry is stable, and
persistence feedback is quiet and truthful.

Destructive Restore remains a deliberate exception: its approved maintenance
window may block the page because concurrent interaction would be unsafe.

### 4.4 Preferences Control Micro-interaction Addendum

This addendum addresses control interaction inside Preferences only. It does not
change or extend the approved page-navigation transition.

#### Current Interaction Finding

The current page-size control changes the selected option immediately, disables
the preference controls during persistence, inserts and removes saving copy, and
then introduces a separate success or error message. The operation is fast, but
the combination of border/fill replacement, disabled-state redraw, and changing
feedback content can feel abrupt.

The final interaction preserves immediate input response. A short visual
settling interval is optional and secondary to stable geometry and background
persistence.

#### Select or Dropdown Opening and Closing

- Prefer the platform-native `select` popup when its behavior and styling meet
  the final design. The operating system or browser owns its opening/closing
  motion; do not wrap it in a second animation or delay its response.
- If a custom listbox is justified, render its option panel as an overlay so
  opening and closing never moves surrounding Settings content.
- A custom panel may enter over `150ms` with opacity and no more than `2–4px`
  vertical movement. Exit completes in `120–150ms`. Use the standard calm
  easing with no spring, overshoot, scale bounce, or stagger.
- The trigger retains exactly the same width, height, label position, and chevron
  position in closed, open, saving, success, and error states.
- Opening starts on activation. Closing starts immediately after selection,
  `Escape`, outside interaction, or focus dismissal. Motion never delays option
  availability, selection, or dismissal.
- After selection, keyboard focus returns to or remains on the trigger. Reopening
  places active focus on the committed option.

#### Focus Transition

- Focus is visible synchronously; it must never fade in from an invisible state.
- Border color, background color, and any supplemental focus shadow may settle
  over `120–150ms`, but the required focus indicator is present from the first
  focused frame.
- Opening a listbox moves active focus predictably into its options. Closing
  restores trigger focus without scroll movement.
- Pointer hover, keyboard focus, open, selected, and disabled states must remain
  visually distinct without relying on motion or color alone.

#### Value Change and Persistence Feedback

- Update the displayed value immediately after a valid selection.
- The selected state is correct in the first response frame. Border, fill,
  checkmark, or chevron color may settle over `150–180ms` when that improves
  continuity, but no animation is required. Do not crossfade or slide the value
  text itself.
- Persist in the background and disable only the page-size control against
  duplicate submission. Other Settings rows remain interactive.
- Reserve one fixed-height feedback slot next to or directly below the control.
  `Menyimpan…`, committed confirmation, and error copy reuse that slot; they do
  not insert new document flow.
- Keep feedback width stable. Prefer a fixed-position status icon plus concise
  text rather than replacing the control label or adding text inside only one
  option.
- For nearly instantaneous success, avoid a one-frame saving flash. Show saving
  feedback only if the operation remains pending for approximately `100ms`.
- On success, keep the selected value stable. A quiet check/status may appear
  through opacity over `150ms` and remain long enough to be understood; no
  celebratory motion is used.
- On failure, restore the last committed value without moving the control.
  Replace the reserved feedback slot with the error and Retry path. Do not shake,
  bounce, or flash the field.
- Accessible status announcements remain immediate and truthful even when visual
  feedback is delayed to prevent flicker.

#### Layout Stability

- Allocate final control height, feedback height, and error capacity before the
  interaction begins.
- Do not conditionally add margins, borders, rows, or helper blocks during save.
- A border-width change must not alter the control's outer dimensions. Use
  color, outline, or an inset effect within the existing geometry.
- Do not change font weight if it changes text measurement. Selection emphasis
  uses color, checkmark, or background within reserved space.
- The option panel overlays content and is positioned from the stable trigger;
  it does not push the following Settings groups downward.
- No automatic scroll, focus-induced scroll jump, or full-group redraw follows a
  successful preference change.

#### Motion and Responsiveness Contract

| Interaction | Timing | Required behavior |
|---|---:|---|
| Press/focus response | Immediate; settle within `120–150ms` | Visible from first frame |
| Custom panel enter | `150ms` | Opacity plus optional `2–4px` movement |
| Custom panel exit | `120–150ms` | Faster than or equal to entry |
| Selected-state settle | `150–180ms` | Color/border/background only |
| Saving-indicator threshold | About `100ms` | Prevents a flash on fast saves |
| Success/error presence | About `150ms` opacity | Uses reserved geometry |

Every animation is optional and interruptible. A second valid interaction
supersedes visual settling without queuing animation, subject to the
duplicate-submission safety rule. Reduced motion removes translation and makes
panel/state changes immediate or uses only a brief opacity change. The control
remains fully understandable and equally responsive with all animation removed.

#### Acceptance Review

Before implementation approval, a control prototype or recording should
demonstrate:

1. no measurable layout shift from open through committed success or failure;
2. stable trigger, label, helper text, and following-section positions;
3. immediate pointer and keyboard feedback;
4. correct focus return and no scroll jump;
5. no saving-indicator flash for fast responses;
6. one truthful status announcement per outcome;
7. consistent Light, Dark, and reduced-motion behavior; and
8. equivalent stability for native-select and custom-listbox decisions;
9. no page, section, or unrelated-control disabling; and
10. no reload or remount of unrelated Settings content.

## 5. MVP Settings Scope Review

### 5.1 Recommended Information Architecture

| Group | MVP content | Role | Decision |
|---|---|---|---|
| Appearance | Light, Dark, System | Both | Keep, simplify |
| Preferences | Default items per page: 10, 20, 50 | Both | Keep |
| Data | Backup and Restore | Platform Admin only | Missing; add after approval |
| Security | Google-managed account/password handoff and sign-out clarity | Both | Missing; add after approval |
| About | Version and sanitized in-app Changelog | Both | Missing; add after approval |

### 5.2 Remove or Simplify

**Remove Time theme from MVP.** System already supplies a useful automatic
choice. A clock-based second automatic mode increases explanation, scheduling,
testing, and edge cases without a strong recurring benefit.

**Remove the delete-confirmation preference.** Disabling a safety prompt provides
limited day-to-day value in a financial administration product and creates an
inconsistent deletion model. Use a consistent confirmation policy based on the
consequence of the action. Financial and domain safeguards remain mandatory in
all cases.

**Present theme choices compactly.** Use one mutually exclusive control with
three choices and one short explanation for System. Avoid four large,
individually tinted cards.

**Keep page-size preference narrow.** Retain only 10, 20, and 50 with a default
of 20. Do not add per-screen page sizes, custom numeric entry, density controls,
or export-limit settings.

**Keep Backup and Restore as one Data group.** Do not add scheduling, cloud
providers, browsing, partial restore, encryption claims, or retention controls
to the MVP.

**Keep Security truthful.** Amanah Cash does not manage passwords. The group
should explain Google ownership and provide only a clear external account action
where an approved destination exists. Do not imply local password settings,
sessions dashboards, MFA controls, or security policy administration.

**Keep About read-only.** Show one authoritative version and a sanitized
Changelog. Do not add update checks, telemetry preferences, feedback systems,
support portals, or promotional content.

### 5.3 Missing States

The complete MVP requires:

- layout-stable loading and group-level failure/retry;
- row-local saving, committed success, and rollback on failure;
- Backup preparing, ready, download-started, and failure states;
- Restore unselected, validating, invalid, confirmed, replacing,
  session-ended, and atomic-failure states;
- truthful external-navigation treatment for Google-managed Security; and
- About/Changelog loaded, empty, and failure states.

## 6. Product Owner Decisions Requested

The Product Owner approved the following package on 2026-07-30:

1. replace the Light authenticated-app direction with the proposed calm
   neutral-and-ink-blue system;
2. retain Dark with only the focused validation checks in Section 3.2;
3. approve the `180ms` restrained content entrance and immediate control
   feedback contract;
4. keep Settings as one grouped page without nested navigation;
5. remove Time theme and delete-confirmation customization from MVP;
6. retain default page size as the only general Preferences control; and
7. complete the missing Data, Security, and About groups within the existing
   role boundaries.

The Product Owner additionally directed that Light-theme color selection be
grounded in professional UI references and accessibility rather than personal
preference. The authoritative documents were reconciled on 2026-07-30. No
roadmap or application-code change is authorized by this decision record.
