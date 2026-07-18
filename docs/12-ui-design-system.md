# Amanah Cash — UI Design System

**Version:** 1.1

**Status:** Approved

**Owner:** Project Owner
**Last Updated:** 2026-07-18

---

## 1. Purpose

This document is the visual foundation for every Amanah Cash interface. It translates the approved Product Principles, requirements, Business Rules, User Flows, Wireframes, architecture, roadmap, Engineering Rules, and Development Workflow into a shared visual language. It does not authorize new product behavior.

The UI documentation pack, `docs/12-ui-design-system.md` through `docs/20-interaction-states.md`, forms the UI source of truth. Existing approved product documents remain authoritative for scope and behavior. Within the pack, `docs/18-design-tokens.md` is the single source of truth for every visual value.

## 2. Design Authority

When sources conflict, use this order:

1. Approved Functional Requirements, Non-Functional Requirements, and Business Rules.
2. Approved Product Principles, User Flows, Wireframes, and System Architecture.
3. Approved Development Roadmap, Engineering Rules, and Development Workflow.
4. Approved Screen Specifications and Interaction States for screen and state behavior.
5. Approved Motion and Accessibility Guidelines for motion and access requirements.
6. `docs/18-design-tokens.md` for every visual value; its Primitive, Semantic, Component, and Screen tokens override any earlier provisional value or recommendation in the UI pack.
7. UI Design System, Design References, Component Guidelines, and Design Review Checklist for philosophy, selection, composition, and review guidance.
8. External libraries and inspiration.

External examples never override Amanah Cash rules. An AI agent must stop and request approval if a design needs a new screen, field, action, business rule, or dependency outside the approved plan.

## 3. Design Philosophy

Amanah Cash should feel premium, modern, clean, calm, professional, banking-grade, fast, and trustworthy. Premium means disciplined typography, spacing, hierarchy, and feedback—not ornamental complexity.

The interface must communicate:

- **Trust:** every amount, direction, state, and outcome is explicit.
- **Calm:** neutral surfaces, limited accent color, stable layouts, and restrained motion.
- **Speed:** frequent actions are easy to find and require minimal interaction.
- **Focus:** each screen has one clear purpose and only contextual actions.
- **Precision:** whole-IDR values, timestamps, labels, validation, and statuses are unambiguous.

Avoid template-like dashboards, excessive cards, gradients used as decoration, glassmorphism, neon, crypto-market language, dense sidebars, ornamental charts, animated backgrounds, and novelty interaction.

## 4. Visual Language

### 4.1 Surfaces and Depth

- Use a quiet neutral application background and solid content surfaces.
- Prefer spacing, borders, and tonal separation over shadows.
- Use `elevation.surface` for default persistent surfaces, `elevation.hover` only where hover clarifies interactivity, and `elevation.temporary` for dialogs or sheets.
- Do not nest cards merely to group content; use sections and dividers first.
- Border radii should feel refined, not playful: a small control radius and a slightly larger container radius.
- Keep financial data visually stable; do not place balances on animated, translucent, or image-backed surfaces.

### 4.2 Density

- Mobile is compact but never cramped.
- Preserve at least `layout.gutter.mobile` page-edge spacing at the 320px verification width.
- Use the approved `space.*` Primitive scale through Semantic, Component, or Screen aliases.
- Use `layout.related.gap` between related content and `layout.section.gap` between major regions unless a more specific approved token applies.
- Rows may be information-dense only when name, amount, and supporting metadata remain scannable.

### 4.3 Iconography

- Lucide is the default icon source.
- Use icons to reinforce a visible label, not replace essential financial meaning.
- Keep a consistent stroke weight and use `size.4` inline, `size.5` in controls, and `size.6` for prominent action icons through approved component aliases.
- Decorative icons are hidden from assistive technology. Icon-only buttons require an accessible name and visible tooltip where hover is available.
- Never use ambiguous arrows alone for Deposit or Withdrawal. Pair direction with explicit text.

## 5. Typography

### 5.1 Typeface

Use `font.family.sans`, whose approved primary typeface is **Geist** with the documented system fallback. Font files and loading must preserve that token contract.

### 5.2 Type Roles

| Role | Authoritative token | Use |
|------|---------------------|-----|
| Display balance | `type.balance` | One authoritative balance |
| Screen title | `type.screen-title` | Current screen identity |
| Section title | `type.section-title` | Major content region |
| Body | `type.body` | Default readable content |
| Label | `type.label` | Inputs and metadata labels |
| Supporting text | `type.supporting` | Timestamps and explanations |
| Button | `type.button` | Action labels |

Form input typography must resolve to an approved token with at least `font.size.16` to prevent mobile browser zoom. Use `type.money` for tabular monetary numerals and aligned financial columns. Do not use all caps for headings or status text.

### 5.3 Monetary Formatting

- The MVP interface uses Bahasa Indonesia only with the `id-ID` locale. Multilingual support and runtime language switching are out of scope.
- Display Indonesian Rupiah consistently using Indonesian grouping, for example `Rp 75.000`.
- Do not imply decimals.
- Keep `Rp` visually associated with its amount and prevent awkward line breaks.
- Use a minus sign only where the approved UI explicitly communicates direction; the authoritative Balance cannot be negative.
- Pair transaction amounts with Deposit/Withdrawal text and direction, never color alone.
- Display time using the 24-hour system and dates using Indonesian date formatting.

## 6. Color Philosophy

Color tokens must be semantic rather than hard-coded in components.

| Approved token family | Purpose |
|-----------------------|---------|
| `color.background.canvas`, `color.background.surface`, `color.background.subtle` | Page and grouped content |
| `color.text.primary`, `color.text.secondary`, `color.text.tertiary` | Primary and supporting text |
| `color.border.default`, `input.border`, `focus.visible` | Structure and interaction |
| `color.action.primary`, `color.action.primary.hover`, `color.text.inverse` | Main brand/action emphasis |
| `color.success.foreground`, `color.success.background` | Confirmed success only |
| `color.warning.foreground`, `color.warning.background` | Attention and recoverable risk |
| `color.error.foreground`, `color.error.background` | Errors and destructive meaning |
| `color.deposit.foreground`, `color.deposit.background`, `color.withdrawal.foreground`, `color.withdrawal.background` | Transaction-direction reinforcement |

The approved palette is defined only in `docs/18-design-tokens.md`: neutral grayscale carries the interface, `color.action.primary` provides calm professional blue action emphasis, and Deposit and Withdrawal use their explicit semantic token families. Text and iconography carry transaction meaning; color only reinforces it.

Rules:

- Meet the contrast requirements in `docs/16-accessibility-guidelines.md`.
- Reserve saturated color for actions, focus, and meaningful status.
- Do not use pure black against pure white as the default theme if a calmer neutral pair meets contrast.
- Do not use red for ordinary Withdrawal presentation; red is reserved for errors or genuinely dangerous states.
- A dark theme is not approved by this document. Do not implement it until the palette and use case are approved.

## 7. Layout Principles

- Design and verify at 320px first, then 360px, 390px, 480px, tablet, and desktop.
- Use one vertical content column for the MVP screens.
- At wider viewports, center the same hierarchy in a readable content area; do not introduce sidebars, admin-template layouts, or new functionality.
- Operational content uses `layout.content.max`.
- Respect safe-area insets in installed PWA mode.
- Keep primary actions reachable without covering content or the mobile keyboard.
- Avoid horizontal scrolling for core content.
- Reserve space for loading and validation messages to reduce layout shift.

## 8. Responsive and Mobile-First Rules

- Touch targets use at least `control.height.minimum` in both dimensions; primary actions use `control.height.default` or `control.height.prominent` as specified.
- Primary form controls use the full available width.
- Deposit and Withdrawal have equal visual prominence on Student Detail.
- Do not rely on hover. Hover is an enhancement on pointer devices only.
- Place the most frequent action in the easiest thumb-reach zone when this does not obscure content.
- Use the numeric mobile keyboard for whole-IDR input while retaining authoritative validation.
- Desktop adaptations may increase whitespace or line length control, but not information density, features, or navigation layers.

## 9. Core Design Tokens

`docs/18-design-tokens.md` defines the approved tokens for color, typography, spacing, size, radius, border, elevation, opacity, z-index, animation, focus, content width, and control height. Components consume those tokens rather than one-off values.

Implementation code must never hardcode colors, spacing, radii, typography, or shadows. Every such value must reference an approved Design Token, including component states and responsive variants.

No provisional scale in this document may supplement or override the approved token hierarchy. A missing value follows the Token Governance process in `docs/18-design-tokens.md`; it is never improvised locally.

## 10. Navigation Philosophy

The approved MVP uses Student List → Student Detail → Transaction Entry and standard browser back/forward behavior. Screen headers identify current context. Do not add a persistent sidebar, tab bar, global dashboard navigation, breadcrumbs, command palette, or floating dock to the MVP without approved requirements.

Back and Cancel are distinct: Back follows navigation history; Cancel abandons an uncommitted form and returns to the documented parent. Neither creates financial effects.

## 11. Screen Design Directions

| Screen | Direction | Why it fits | Scope status |
|--------|-----------|-------------|--------------|
| Dashboard | A calm operational snapshot with one primary next action, restrained summary values, and no speculative charts. For MVP, Student List is the operational home and must not be relabeled or expanded into a Dashboard. | Preserves focus and banking-grade clarity without becoming a generic admin template. | Future/reference only; human approval required |
| Student List | Search-first directory with alphabetical rows, clear balances, generous tap areas, and a quiet Add Student action. Avoid card-per-student styling. | Supports under-three-second search/open target and low cognitive load. | Approved MVP |
| Student Detail | Student identity, authoritative Balance as the visual anchor, equal Deposit/Withdrawal actions, then newest-first ledger history. | Makes trust and financial traceability immediately visible. | Approved MVP |
| Transaction | Focused single-purpose entry screen with direction explanation, large whole-IDR input, current Balance for Withdrawal, and one explicit confirmation action. | Reduces error risk and supports the under-five-second target. | Approved MVP |
| Reports | Evidence-led, filterable summaries with plain tables and minimal charts only when a reporting requirement defines the question and source data. | Maintains auditability and avoids ornamental analytics. | Explicitly excluded from MVP; future/reference only |
| Settings | Sparse grouped preferences with immediate explanations and safe defaults; no settings for rules that must remain invariant. | Prevents operational configuration from weakening financial integrity. | Not approved for MVP; future/reference only |

## 12. AI Implementation Rules

An AI implementing UI must:

1. Cite the governing FR/NFR/Business Rule and screen flow before changing a screen.
2. Use the approved screen inventory and state inventory; never infer missing product behavior from a component library.
3. Start from semantic tokens and primitive components, not a copied page template.
4. Keep business logic, authoritative Balance, and concurrency decisions out of UI components.
5. Implement loading, empty, validation, success, failure, unknown-outcome, and reduced-motion behavior where applicable.
6. Preserve whole-IDR formatting and explicit transaction direction.
7. Verify 320px–480px behavior and keyboard interaction before desktop polish.
8. Use third-party effects only after passing the selection rules in `docs/13-design-references.md` and `docs/14-component-guidelines.md`.
9. Do not add a dependency, theme, screen, chart, field, action, or navigation pattern without approval.
10. Record any deviation as a design decision; do not silently improvise.
11. Never hardcode colors, spacing, radii, typography, or shadows; use approved Design Tokens exclusively.
12. Render all MVP interface copy in Bahasa Indonesia using `id-ID`, 24-hour time, and Indonesian date formatting.

## 13. Decisions Requiring Approval

- Contrast verification for approved color pairings.
- Geist font-file delivery and loading strategy without changing `font.family.sans`.
- Brand mark and app icon.
- Whether dark mode is required.
- Whether Dashboard, Reports, or Settings will enter a future approved scope.
- Whether the recommended React/Tailwind UI stack replaces or coexists with the current implementation foundation.
