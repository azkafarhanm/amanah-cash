# Amanah Cash — Design References

**Version:** 1.4

**Status:** Approved

**Owner:** Project Owner
**Last Updated:** 2026-07-30

---

## 1. Purpose

This document governs how external UI libraries and examples may influence Amanah Cash. References are ingredients, not design authority. Copying a complete external composition is prohibited unless it has been deliberately adapted to the approved product rules and reviewed.

## 2. Reference Hierarchy

1. **shadcn/ui** — preferred accessible component foundation and ownership model.
2. **Tailwind CSS** — preferred token-driven styling system.
3. **Motion for React (formerly Framer Motion)** — purposeful interaction motion.
4. **Lucide** — default icon system.
5. **21st.dev** — component-composition inspiration, reviewed case by case.
6. **Magic UI** — rare premium treatment where it improves comprehension.
7. **Aceternity UI** — optional compositional inspiration only.

The project must pin and record actual package versions at implementation time. This document does not authorize installation.

## 3. Selection Test

Before adopting a reference, answer yes to all:

- Does it support an approved screen, state, or workflow?
- Is it usable at 320px without hidden actions or horizontal scrolling?
- Does it meet keyboard, focus, semantic, contrast, and reduced-motion rules?
- Can it use Amanah Cash tokens without fighting its defaults?
- Does it remain calm and banking-grade with animation removed?
- Is the dependency and bundle cost proportionate to the value?
- Can the team understand, test, and maintain the resulting code?
- Does it avoid introducing new product behavior?

If any answer is no, reject or redesign it.

## 4. Foundation Guidance

### 4.1 shadcn/ui

Use primitives such as Button, Input, Label, Dialog or Sheet, Alert, Skeleton, Separator, Tooltip, and visually hidden utilities where they fit. Treat generated code as project-owned code: review semantics, variants, focus behavior, and tokens. Do not accept default styling as the Amanah Cash identity.

Prefer the least complex primitive that provides correct behavior. A native semantic element is better than a composite component when no composite behavior is needed.

### 4.2 Tailwind CSS

Map utilities to semantic design tokens. Repeated arbitrary values indicate a missing token or component rule. Keep responsive behavior mobile-first and minimize breakpoint-specific rearrangement. Avoid long one-off class compositions that obscure component state.

### 4.3 Motion for React

Use only for supportive state continuity, feedback, or spatial orientation. Motion must never communicate financial truth or animate Balance values, money counting, or financial totals. Respect the user's reduced-motion preference globally. CSS transitions are preferred for simple color, opacity, elevation, container emphasis, and focus changes; a motion dependency is justified only for coordinated presence/layout behavior.

### 4.4 Lucide

Import icons individually. Use consistent size and stroke. Icons must not become the sole carrier of a label, transaction direction, or status.

### 4.5 Contextual Detail Surfaces

Stripe-style contextual extension surfaces, Notion-style side peek, and
similar record inspectors may inform the platform Context Detail Drawer only
at the level of reusable principles: preserve source orientation, isolate
scrolling, maintain stable overlay chrome, and expose explicit states. Do not
copy another product's dimensions, navigation, density, styling, or action
model. Amanah Cash tokens, privacy rules, mobile behavior, and component
selection criteria remain authoritative.

## 5. Inspiration Boundaries

### 5.1 21st.dev

Good candidates: polished input composition, empty states, command surfaces, mobile action layout, and data-row treatments. Reject examples built around excessive gradients, floating glass panels, desktop-only hover, or marketing-site spectacle.

### 5.2 Magic UI

Allowed only when the effect remains subtle, performant, accessible, and semantically useful. Potentially acceptable: quiet container emphasis after confirmed persistence. Not acceptable: number transitions, animated Balance or financial totals, money counting, particles, beams, marquees, animated borders, shimmer on financial data, background grids, or continuous motion.

### 5.3 Aceternity UI

Use for structural ideas only. Marketing hero treatments, parallax, spotlight cursors, 3D cards, animated backgrounds, and high-contrast neon styling do not fit Amanah Cash.

## 6. Reference Mood

Seek references with:

- strong typographic hierarchy and generous whitespace;
- quiet neutral surfaces and one restrained brand accent;
- ledger-like clarity for financial history;
- clear focus, loading, failure, and empty states;
- plain language and visible outcomes;
- mobile-native reachability without imitating a specific operating system.

For Dark theme, use Modern Tech & Finance as the primary visual reference.
Linear, GitHub, Stripe Dashboard, and modern banking products are directional
benchmarks for calm hierarchy, restrained accents, readable data density, and
subtle surface elevation. They are not templates to copy. Amanah Cash's product
rules, financial semantics, mobile-first layouts, and token system remain
authoritative.

Dark references must demonstrate comfortable extended reading, clear separation
between canvas and surfaces, accessible semantic states, and stronger clarity
for balances, transactions, tables, and reports than for decorative elements.
Reject cyberpunk, gaming, high-contrast, neon, color-inverted, gradient-heavy,
or shadow-heavy examples even when their individual components appear polished.

For Light theme, use the Calm Financial token direction in
`docs/18-design-tokens.md`. Reference mature banking, accounting, and
productivity products for neutral-dominant surfaces, clear hierarchy, compact
and legible controls, restrained ink-blue interaction emphasis, and predictable
feedback. References inform principles, not copied layouts or arbitrary color
sampling.

Color decisions must be justified by semantic role, measured WCAG contrast, and
cross-theme token consistency. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) is the
accessibility authority; professional token systems such as
[Atlassian Design System](https://atlassian.design/foundations/color-new/)
provide directional evidence for separating semantic roles from theme values.

Reject Light references that fill whole screens with brand color, use
marketing-style colored panel grids, turn operational screens into illustrated
experiences, or allow gradients, badges, and decorative accents to compete with
financial information.

MVP empty-state references must use a Lucide icon, title, description, and primary call to action. Do not adopt illustrations.

Reject references that resemble:

- Bootstrap demos or generic admin templates;
- Material dashboard clones;
- crypto, trading, or gaming interfaces;
- portfolios and marketing landing pages;
- dense enterprise ERP tables on mobile;
- novelty glassmorphism, skeuomorphism, or ornamental data visualization.

## 7. Screen-Specific Reference Briefs

### Dashboard

Reference calm banking summaries, not trading dashboards. Use a clear snapshot and next actions; avoid market charts, percentage deltas, promotional banners, and widget grids. This screen is not approved for MVP.

### Student List

Reference mobile contact lists and banking beneficiary lists: search at the top, high-scan rows, name first, balance second, full-row tap target. Avoid avatars unless real identity data is approved; generated initials add visual noise without operational value.

### Student Detail

Reference account-detail and ledger views: identity, authoritative balance, paired money actions, chronological events. Avoid credit-card visuals, decorative account numbers, spending categories, and balance trend charts.

### Transaction

Reference high-trust transfer forms: mode and direction at the top, large amount input, short explanatory copy, explicit confirmation. Avoid calculator gimmicks, preset amounts unless approved, swipe-to-confirm, or celebratory animations.

### Reports

Reference audit and statement views with strong filters, totals, and tables. A chart must answer an approved question and have an accessible data equivalent. Reports are excluded from MVP.

### Settings

Reference restrained native preference pages with grouped rows and plain
consequences. Settings is approved under
`docs/21-mvp-settings-specification.md`; references may inform hierarchy and
control clarity only. Do not copy account-profile, organization, integration,
notification, branding, or enterprise-administration patterns. Never expose
financial invariants as toggles.

## 8. Reference Capture Template

Every proposed external reference should record:

| Field | Required content |
|-------|------------------|
| Source | Direct URL and capture date |
| Intended use | Screen/component/state it informs |
| Approved behavior | Governing requirement or rule |
| Elements adopted | Specific hierarchy, pattern, or treatment |
| Elements rejected | Styling or behavior that does not fit |
| Accessibility review | Keyboard, focus, contrast, motion, semantics |
| Performance impact | Dependency and expected bundle/runtime cost |
| Approval | Reviewer and decision date |

## 9. Official Technical References

- shadcn/ui documentation: `https://ui.shadcn.com/docs`
- Tailwind CSS documentation: `https://tailwindcss.com/docs`
- Motion for React documentation: `https://motion.dev/docs/react`
- Motion accessibility guidance: `https://motion.dev/docs/react-accessibility`
- Lucide guide: `https://lucide.dev/guide/`
- 21st.dev: `https://21st.dev/`
- Magic UI: `https://magicui.design/`
- Aceternity UI: `https://ui.aceternity.com/`

External documentation changes over time. Verify current APIs, licenses, accessibility behavior, and package names during implementation.
