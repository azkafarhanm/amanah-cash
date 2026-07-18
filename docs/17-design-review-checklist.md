# Amanah Cash — Design Review Checklist

**Version:** 1.0

**Status:** Approved

**Owner:** Project Owner
**Last Updated:** 2026-07-18

---

## 1. Purpose

This checklist is the approval gate for every future Amanah Cash UI design and implementation. A reviewer must record evidence, not merely tick boxes. Any failed blocking item prevents approval.

## 2. Review Record

| Field | Value |
|-------|-------|
| Change / screen | |
| Reviewer | |
| Date | |
| Design artifact | |
| Implementation / PR | |
| Governing FR/NFR/BR | |
| Viewports tested | |
| Accessibility tools / AT | |
| Decision | Approved / Changes required / Rejected |

## 3. Authority and Scope — Blocking

- [ ] The change cites approved Product Principles and requirement/rule IDs.
- [ ] It fits the approved screen and user-flow inventory.
- [ ] It introduces no unapproved feature, field, action, role, report, setting, or navigation layer.
- [ ] Dashboard, Reports, and Settings are absent from MVP implementation unless requirements were formally approved first.
- [ ] External inspiration did not override project documentation.
- [ ] Any product ambiguity was escalated instead of guessed.
- [ ] Documentation impact and traceability are recorded.

## 4. Product Truth and Financial Integrity — Blocking

- [ ] Balance is visibly authoritative and based on complete persisted history.
- [ ] No partial, cached, optimistic, or displayed-page Balance is presented as authoritative.
- [ ] Deposit says money entrusted to the Student and Balance increases.
- [ ] Withdrawal says money returned by the Student and Balance decreases.
- [ ] Whole-IDR formatting is exact and has no decimal affordance.
- [ ] Transactions have no edit, delete, or soft-delete affordance.
- [ ] Success appears only after persistence is confirmed.
- [ ] Unknown outcomes are resolved safely and never imply success.
- [ ] Offline/network failure does not imply queued or saved Transactions.

## 5. Design Philosophy

- [ ] The result feels calm, premium, clean, modern, professional, and trustworthy.
- [ ] Hierarchy is created mainly through typography, spacing, and tone.
- [ ] Decorative effects are minimal and have a stated purpose.
- [ ] The design does not resemble an admin template, Material clone, crypto dashboard, gaming UI, or portfolio.
- [ ] Cards, gradients, shadows, and icons are used only where they improve comprehension.
- [ ] The interface still works and looks intentional with motion removed.

## 6. Layout and Responsive Behavior — Blocking

- [ ] Designed and verified first at 320px, then representative widths through 480px.
- [ ] No core horizontal scrolling, clipped text, overlap, or hidden action.
- [ ] Primary content uses one clear vertical hierarchy.
- [ ] Every MVP screen uses a single-column layout.
- [ ] Tablet/desktop preserve the same functionality and hierarchy in a centered content area.
- [ ] No desktop sidebar or admin-template layout exists.
- [ ] Safe-area insets and installed-PWA frame are considered.
- [ ] The mobile keyboard does not hide the active field, error, or required action.
- [ ] Loading/error content does not cause harmful layout shift.
- [ ] Every touch target is at least 44px by 44px.

## 7. Typography, Color, and Iconography

- [ ] Approved tokens are used; no unexplained one-off values exist.
- [ ] Colors, spacing, radii, typography, and shadows are never hardcoded.
- [ ] Body and input text remain readable without zoom.
- [ ] Money uses tabular numerals and consistent Rupiah formatting.
- [ ] Contrast meets WCAG 2.2 AA for text, controls, focus, and states.
- [ ] Color is not the only carrier of meaning.
- [ ] Icons come from the approved system where possible and use consistent sizing/stroke.
- [ ] Essential actions and financial directions have visible text labels.

## 8. Components and Content

- [ ] Semantic HTML was selected before a library abstraction.
- [ ] Component variants are limited to documented semantic needs.
- [ ] Component states include rest, focus, disabled, loading, and error as applicable.
- [ ] Copy uses approved domain terms consistently.
- [ ] Buttons use clear action labels.
- [ ] Form labels remain visible; placeholders are not labels.
- [ ] Long Student names, large valid amounts, and localized timestamps were tested.
- [ ] No demo content, demo styling, speculative prop, or hidden gesture remains.
- [ ] All MVP interface copy is Bahasa Indonesia using `id-ID`, Indonesian date formatting, and 24-hour time.

## 9. Screen-Specific Checks

### Student List

- [ ] Search is reachable with one tap and filters after input changes.
- [ ] Students are alphabetical and each row shows name and Balance.
- [ ] The complete row is a clear navigation target.
- [ ] First-time, no-results, loading, and failure states are distinct.
- [ ] No-results does not confuse search with Student creation.

### Student Detail

- [ ] Student identity and authoritative Balance lead the hierarchy.
- [ ] Deposit and Withdrawal are equally prominent.
- [ ] History is newest first with type, direction, amount, and timestamp.
- [ ] Load Older, loading-older, history error, and end state are clear.
- [ ] Existing Balance and history remain visible during sectional retry.

### Transaction Entry

- [ ] Mode and direction are unmistakable before entry.
- [ ] Withdrawal shows current full-history Balance as informative context.
- [ ] Amount input supports whole Rupiah and appropriate mobile keyboard.
- [ ] Confirm names the transaction type; repeated submission is prevented.
- [ ] Invalid, insufficient, submitting, system-failure, and unknown-outcome states preserve safe context.
- [ ] Cancel and browser Back create no financial effect.

### Overlay

- [ ] Create Student uses a centered Dialog on desktop/web.
- [ ] Create Student uses a bottom Sheet in mobile browsers and installed PWA mode.
- [ ] Both presentations preserve the identical interaction, validation, focus, dismissal, and outcome contract.

### Future Dashboard, Reports, Settings

- [ ] Formal approved requirements exist before review proceeds.
- [ ] Dashboard avoids ornamental widgets and speculative metrics.
- [ ] Reports define data meaning, filters, accessible tables, and chart purpose.
- [ ] Settings never expose financial invariants as preferences.

## 10. Motion — Blocking Where Applicable

- [ ] Every animation has a documented usability purpose.
- [ ] Durations and easing use approved tokens.
- [ ] No bounce, parallax, continuous loop, count-up-from-zero, or celebratory effect exists.
- [ ] Motion never delays input, navigation, confirmation, retry, or error reading.
- [ ] Motion never animates or communicates Balance values, money counting, or financial totals.
- [ ] Authoritative Balance updates immediately after successful persistence.
- [ ] `prefers-reduced-motion` is respected and verified.
- [ ] Search, scrolling, and workflow performance remain within documented usability targets.

## 11. Accessibility — Blocking

- [ ] Keyboard-only operation succeeds with logical order and no trap.
- [ ] Focus is visible, not clipped, and restored correctly after overlays.
- [ ] Screen structure, headings, names, roles, values, and descriptions are correct.
- [ ] Errors are associated with fields and describe correction.
- [ ] Status changes are announced without excessive repetition.
- [ ] 200% text zoom remains usable.
- [ ] Screen-reader smoke test covers the changed workflow.
- [ ] Reduced-motion and touch-target checks pass.
- [ ] Automated findings are resolved or explicitly justified, and manual review is complete.

## 12. States and Failure Handling — Blocking

- [ ] Initial loading, empty, populated, validation, submitting, success, system failure, retry, and offline states are covered as applicable.
- [ ] Page and page-section loading prefer Skeleton Loading.
- [ ] Submission uses Button Loading, and no unnecessary global spinner is present.
- [ ] Every applicable MVP empty state uses a Lucide icon, title, description, and approved primary CTA.
- [ ] No empty-state illustration is present.
- [ ] Partial-section failure does not erase valid surrounding content.
- [ ] Correctable input remains preserved.
- [ ] Retry is offered only when safe and is specifically labeled.
- [ ] No stale or invented financial value appears during loading or failure.
- [ ] Error copy is actionable and does not expose internals.

## 13. Technical and Dependency Review

- [ ] shadcn/ui primitives were adapted rather than accepted as visual defaults.
- [ ] Tailwind styles consume semantic tokens and avoid unexplained arbitrary values.
- [ ] Components reference Design Tokens for colors, spacing, radii, typography, and shadows.
- [ ] Motion for React is used only when CSS is insufficient.
- [ ] Lucide icons are imported efficiently.
- [ ] 21st.dev, Magic UI, or Aceternity-derived work passed the reference selection test.
- [ ] Package version, license, bundle impact, and maintenance ownership are recorded.
- [ ] No UI component owns business logic or authoritative financial state.

## 14. Verification Evidence — Blocking

- [ ] Automated tests for changed presentation states pass.
- [ ] Relevant end-to-end workflow passes.
- [ ] Exact commands and results are recorded.
- [ ] Manual viewports, browsers, devices, keyboard, screen reader, zoom, and reduced-motion results are recorded.
- [ ] Visual regression evidence covers key states where tooling exists.
- [ ] The final diff contains only intended files and no generated demo artifacts.
- [ ] Documentation, `AI_CONTEXT.md`, and `CHANGELOG.md` are updated when applicable.

## 15. Approval Outcomes

- **Approved:** every blocking item passes; non-blocking exceptions have an owner and rationale.
- **Changes required:** the concept is valid but one or more blocking items fail.
- **Rejected:** the design conflicts with approved behavior, scope, integrity, or design philosophy.

Review comments must identify the governing document and concrete correction. Personal preference alone is not a blocking reason unless the Project Owner is deciding an explicitly open design choice.

## 16. Pre-Implementation Human Approval Gate

Before the first production UI implementation, obtain explicit approval for:

- this six-document UI pack and its authority order;
- final palette, typography, logo/app icon, radii, elevation, and content width;
- selected framework/package versions and migration approach;
- supported browser and assistive-technology matrix;
- dark-mode decision;
- the continued exclusion or formal requirements for Dashboard, Reports, and Settings.
