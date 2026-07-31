# Amanah Cash — Design System Foundation (Phase 1)

**Version:** 1.0

**Status:** Draft

**Owner:** Project Owner

**Last Updated:** 2026-07-31

---

## 1. Brand Personality

### 1.1 Core Identity

Amanah Cash is a financial management application for Islamic boarding schools (pesantren). It manages entrusted money (amanah) for students — deposits, withdrawals, and balance tracking. It is not a bank, not a fintech product, and not a trading platform.

The word "Amanah" means trust. Every design decision must reinforce that the operator's work is respected, the student's money is accounted for, and the institution's integrity is visible.

### 1.2 Personality Traits

| Trait | Expression | Avoid |
|-------|-----------|-------|
| **Trustworthy** | Exact numbers, clear audit trail, no ambiguity | Vague summaries, estimated values, hidden states |
| **Professional** | Disciplined typography, consistent spacing, restrained color | Playful illustrations, gamification, celebratory effects |
| **Calm** | Quiet surfaces, stable layouts, slow breath rhythm | Alert fatigue, flashing indicators, urgent decoration |
| **Premium** | Generous whitespace, refined proportions, thoughtful details | Cluttered grids, dense sidebars, template aesthetics |
| **Human-centered** | Clear language, accessible controls, forgiving flows | Jargon, technical error messages, punishing validation |
| **Transparent** | Every amount has a source, every change has a reason | Black-box calculations, silent modifications |

### 1.3 Islamic Values Through Design

Islamic values are expressed through behavior, not decoration:

- **Honesty (الصدق):** Financial values are always exact, never rounded or estimated. The audit trail is immutable.
- **Trust (الأمانة):** The interface never hides information. Every action has a clear consequence explained before confirmation.
- **Accountability (المساءلة):** Every transaction records who did what, when, and why. The audit timeline is permanent.
- **Transparency (الشفافية):** No dark patterns, no hidden fees, no ambiguous states. What you see is what happened.
- **Simplicity (البساطة):** The interface removes unnecessary complexity so operators can focus on their duty.

No calligraphic ornaments, geometric Islamic patterns, crescent motifs, or decorative Arabic script. The values live in the product's integrity.

### 1.4 Voice and Tone

- Direct, not terse
- Respectful, not formal
- Clear, not simplified
- Confident, not arrogant
- Indonesian language (`id-ID`) for all interface copy
- Sentence case, active voice
- Financial terms use the approved domain vocabulary from `docs/04-domain-model.md`

---

## 2. Moodboard

### 2.1 Reference Direction

| Reference | What to take | What to leave |
|-----------|-------------|---------------|
| **Linear** | Clean hierarchy, restrained accent, sidebar discipline, calm dark surfaces | Ticket-centric workflow, keyboard-heavy paradigm |
| **Stripe Dashboard** | Financial clarity, data table polish, restrained color, professional spacing | Payment-processing context, developer-first density |
| **Raycast** | Command surface elegance, glass as accent (not foundation), dark palette refinement | Launcher paradigm, macOS dependency |
| **Apple (Settings, Music)** | Spacing rhythm, quiet surfaces, system-level consistency | iOS patterns, media-centric layouts |
| **Modern Finance (Dribbble)** | Card hierarchy, KPI presentation, chart restraint | Decorative gradients, stock-trading context, neon accents |

### 2.2 Anti-References

- Bootstrap admin templates (dense, generic, template-driven)
- Crypto dashboards (neon, volatile, gamified)
- Trading platforms (red/green anxiety, ticker noise)
- Marketing landing pages (promotional, illustration-heavy)
- Gaming UI (dark-with-neon, achievement-driven)
- Material Dashboard clones (card-heavy grids, color-washed surfaces)

### 2.3 Mood Keywords

```
spacious · quiet · structured · precise · breathable · confident · restrained · warm-dark · soft-light · ledger-clear
```

### 2.4 Visual Mood

The interface should feel like a well-organized office: clean desk, good lighting, everything in its place. Not a trading floor, not a gaming rig, not a marketing stage.

Light theme: a calm morning in a professional workspace. Warm whites, soft shadows, one quiet accent.

Dark theme: a late-evening review session. Deep navy, gentle contrast, focused attention. Not a nightclub.

---

## 3. Color Palette

### 3.1 Philosophy

Color is semantic first, decorative never. The neutral palette carries 90% of the interface. Color appears only to communicate: action, status, direction, focus, or meaning.

### 3.2 Primitive Palette

#### Neutral (Light theme foundation)

| Token | Hex | Use |
|-------|-----|-----|
| `color.neutral.0` | `#FFFFFF` | Pure white — surfaces only |
| `color.neutral.25` | `#FAFBFC` | Warm white — subtle distinction |
| `color.neutral.50` | `#F6F8FA` | Canvas background |
| `color.neutral.100` | `#F0F2F5` | Secondary surfaces, table stripes |
| `color.neutral.200` | `#E2E5EA` | Borders, dividers |
| `color.neutral.300` | `#CDD1D9` | Strong borders, disabled states |
| `color.neutral.400` | `#9DA3B0` | Tertiary text, placeholders |
| `color.neutral.500` | `#6E7585` | Secondary text |
| `color.neutral.600` | `#525A6B` | Body text on surfaces |
| `color.neutral.700` | `#3A4252` | Primary text |
| `color.neutral.800` | `#252D3D` | Headings, emphasis |
| `color.neutral.900` | `#161C2A` | Maximum contrast text |
| `color.neutral.950` | `#0C111B` | Near-black (sparingly) |

#### Navy (Dark theme foundation)

| Token | Hex | Use |
|-------|-----|-----|
| `color.navy.950` | `#0A0F1E` | Canvas — deepest surface |
| `color.navy.900` | `#0F1629` | Primary surface |
| `color.navy.800` | `#151D35` | Secondary surface |
| `color.navy.700` | `#1C2544` | Elevated surface, cards |
| `color.navy.600` | `#253052` | Borders, subtle separation |
| `color.navy.500` | `#3A4568` | Strong borders |
| `color.navy.400` | `#5A6585` | Tertiary text |
| `color.navy.300` | `#8891A8` | Secondary text |
| `color.navy.200` | `#B0B8CC` | Body text |
| `color.navy.100` | `#D8DDE8` | Primary text |
| `color.navy.50` | `#ECEEF3` | High-emphasis text |

#### Teal (Primary accent)

| Token | Hex | Use |
|-------|-----|-----|
| `color.teal.50` | `#F0FDFA` | Light subtle surface |
| `color.teal.100` | `#CCFBF1` | Light accent surface |
| `color.teal.200` | `#99F6E4` | Light accent border |
| `color.teal.300` | `#5EEAD4` | Dark theme accent hover |
| `color.teal.400` | `#2DD4BF` | Dark theme primary accent |
| `color.teal.500` | `#14B8A6` | Primary accent |
| `color.teal.600` | `#0D9488` | Light theme primary action |
| `color.teal.700` | `#0F766E` | Light theme hover |
| `color.teal.800` | `#115E59` | Light theme active |
| `color.teal.900` | `#134E4A` | Deep accent |

#### Emerald (Deposit / Success)

| Token | Hex | Use |
|-------|-----|-----|
| `color.emerald.50` | `#ECFDF5` | Deposit surface (light) |
| `color.emerald.100` | `#D1FAE5` | Deposit subtle |
| `color.emerald.200` | `#A7F3D0` | Deposit border |
| `color.emerald.400` | `#34D399` | Deposit icon (dark) |
| `color.emerald.500` | `#10B981` | Deposit accent |
| `color.emerald.600` | `#059669` | Deposit text (light) |
| `color.emerald.700` | `#047857` | Deposit emphasis |
| `color.emerald.800` | `#065F46` | Deposit text on surface |
| `color.emerald.900` | `#064E3B` | Deposit surface (dark) |

#### Blue (Withdrawal / Information)

| Token | Hex | Use |
|-------|-----|-----|
| `color.blue.50` | `#EFF6FF` | Withdrawal surface (light) |
| `color.blue.100` | `#DBEAFE` | Withdrawal subtle |
| `color.blue.200` | `#BFDBFE` | Withdrawal border |
| `color.blue.400` | `#60A5FA` | Withdrawal icon (dark) |
| `color.blue.500` | `#3B82F6` | Withdrawal accent |
| `color.blue.600` | `#2563EB` | Withdrawal text (light) |
| `color.blue.700` | `#1D4ED8` | Withdrawal emphasis |
| `color.blue.800` | `#1E40AF` | Withdrawal text on surface |
| `color.blue.900` | `#1E3A5F` | Withdrawal surface (dark) |

#### Amber (Warning)

| Token | Hex | Use |
|-------|-----|-----|
| `color.amber.50` | `#FFFBEB` | Warning surface (light) |
| `color.amber.100` | `#FEF3C7` | Warning subtle |
| `color.amber.400` | `#FBBF24` | Warning icon |
| `color.amber.500` | `#F59E0B` | Warning accent |
| `color.amber.600` | `#D97706` | Warning text |
| `color.amber.700` | `#B45309` | Warning emphasis |
| `color.amber.800` | `#92400E` | Warning text on surface |
| `color.amber.900` | `#78350F` | Warning surface (dark) |

#### Red (Error / Destructive)

| Token | Hex | Use |
|-------|-----|-----|
| `color.red.50` | `#FEF2F2` | Error surface (light) |
| `color.red.100` | `#FEE2E2` | Error subtle |
| `color.red.400` | `#F87171` | Error icon (dark) |
| `color.red.500` | `#EF4444` | Error accent |
| `color.red.600` | `#DC2626` | Error text (light) |
| `color.red.700` | `#B91C1C` | Error emphasis |
| `color.red.800` | `#991B1B` | Error text on surface |
| `color.red.900` | `#7F1D1D` | Error surface (dark) |

### 3.3 Semantic Mapping

| Semantic Token | Light | Dark | Purpose |
|---------------|-------|------|---------|
| `color.background.canvas` | `neutral.50` | `navy.950` | Page background |
| `color.background.surface` | `neutral.0` | `navy.900` | Cards, panels, dialogs |
| `color.background.elevated` | `neutral.0` | `navy.800` | Hover cards, dropdowns |
| `color.background.subtle` | `neutral.100` | `navy.800` | Table stripes, grouped areas |
| `color.background.scrim` | `rgba(0,0,0,0.45)` | `rgba(0,0,0,0.60)` | Modal backdrop |
| `color.text.primary` | `neutral.800` | `navy.50` | Primary content |
| `color.text.secondary` | `neutral.600` | `navy.300` | Supporting content |
| `color.text.tertiary` | `neutral.400` | `navy.400` | Metadata, placeholders |
| `color.text.inverse` | `neutral.0` | `navy.950` | Text on accent fills |
| `color.border.default` | `neutral.200` | `navy.600` | Structural borders |
| `color.border.strong` | `neutral.300` | `navy.500` | Emphasized borders |
| `color.border.subtle` | `neutral.100` | `navy.700` | Quiet separators |
| `color.action.primary` | `teal.600` | `teal.400` | Primary actions |
| `color.action.primary.hover` | `teal.700` | `teal.300` | Primary hover |
| `color.action.primary.active` | `teal.800` | `teal.200` | Primary pressed |
| `color.action.primary.subtle` | `teal.50` | `navy.700` | Selection surface |
| `color.deposit.text` | `emerald.700` | `emerald.300` | Deposit amount text |
| `color.deposit.surface` | `emerald.50` | `emerald.900` | Deposit badge/row |
| `color.deposit.icon` | `emerald.600` | `emerald.400` | Deposit direction icon |
| `color.withdrawal.text` | `blue.700` | `blue.300` | Withdrawal amount text |
| `color.withdrawal.surface` | `blue.50` | `blue.900` | Withdrawal badge/row |
| `color.withdrawal.icon` | `blue.600` | `blue.400` | Withdrawal direction icon |
| `color.success.text` | `emerald.800` | `emerald.200` | Success message |
| `color.success.surface` | `emerald.50` | `emerald.900` | Success container |
| `color.warning.text` | `amber.800` | `amber.200` | Warning message |
| `color.warning.surface` | `amber.50` | `amber.900` | Warning container |
| `color.error.text` | `red.700` | `red.200` | Error message |
| `color.error.surface` | `red.50` | `red.900` | Error container |
| `color.disabled.text` | `neutral.400` | `navy.400` | Disabled content |
| `color.disabled.surface` | `neutral.100` | `navy.700` | Disabled surface |

### 3.4 Glass Surface Tokens

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `color.glass.background` | `rgba(255,255,255,0.72)` | `rgba(15,22,41,0.72)` | Glass panel fill |
| `color.glass.border` | `rgba(255,255,255,0.40)` | `rgba(255,255,255,0.08)` | Glass edge |
| `color.glass.highlight` | `rgba(255,255,255,0.50)` | `rgba(255,255,255,0.10)` | Glass top-edge light |
| `color.glass.shadow` | `rgba(0,0,0,0.06)` | `rgba(0,0,0,0.20)` | Glass depth shadow |
| `glass.blur` | `16px` | `20px` | Backdrop blur radius |
| `glass.saturate` | `1.8` | `1.8` | Saturation boost |

---

## 4. Typography System

### 4.1 Typeface

**Primary:** Geist — chosen for its neutral forms, clear numerals, compact headings, and high screen legibility. It supports the information-first financial interface without adding promotional or editorial personality.

**Monospace:** Geist Mono — for audit codes, transaction IDs, and technical values where character distinction matters.

**Fallback stack:**

```
Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

### 4.2 Type Scale

The scale follows a modular ratio optimized for screen readability. Financial numbers use tabular numerals (`font-variant-numeric: tabular-nums`) and tight letter-spacing for column alignment.

| Token | Size | Line Height | Weight | Tracking | Use |
|-------|------|-------------|--------|----------|-----|
| `type.display` | 48px / 3rem | 1.1 | 700 | -0.02em | Hero numbers, login headline |
| `type.h1` | 32px / 2rem | 1.2 | 700 | -0.015em | Page titles |
| `type.h2` | 24px / 1.5rem | 1.25 | 600 | -0.01em | Section titles |
| `type.h3` | 20px / 1.25rem | 1.3 | 600 | -0.005em | Card titles |
| `type.h4` | 18px / 1.125rem | 1.35 | 600 | 0 | Subsection titles |
| `type.h5` | 16px / 1rem | 1.4 | 600 | 0 | Group labels |
| `type.h6` | 14px / 0.875rem | 1.4 | 600 | 0.01em | Small headings, table headers |
| `type.body` | 16px / 1rem | 1.5 | 400 | 0 | Default readable text |
| `type.body-strong` | 16px / 1rem | 1.5 | 600 | 0 | Emphasized body |
| `type.body-small` | 14px / 0.875rem | 1.5 | 400 | 0 | Supporting text, descriptions |
| `type.caption` | 12px / 0.75rem | 1.5 | 500 | 0.01em | Timestamps, metadata, labels |
| `type.overline` | 11px / 0.6875rem | 1.5 | 600 | 0.05em | Category labels, badges |
| `type.button` | 14px / 0.875rem | 1 | 600 | 0 | Button labels |
| `type.button-large` | 16px / 1rem | 1 | 600 | 0 | Prominent button labels |

### 4.3 Numeric Styles

Financial numbers require special treatment for readability:

| Token | Size | Line Height | Weight | Tracking | Features | Use |
|-------|------|-------------|--------|----------|----------|-----|
| `type.balance-display` | 40px / 2.5rem | 1.1 | 700 | -0.01em | `tabular-nums`, `font-feature-settings: "tnum"` | Dashboard hero balance |
| `type.balance-card` | 28px / 1.75rem | 1.2 | 600 | -0.005em | `tabular-nums` | KPI card values |
| `type.balance-row` | 16px / 1rem | 1.4 | 600 | 0 | `tabular-nums` | Transaction list amounts |
| `type.balance-inline` | 14px / 0.875rem | 1.4 | 500 | 0 | `tabular-nums` | Inline amounts, summaries |
| `type.stat-delta` | 13px / 0.8125rem | 1.4 | 600 | 0 | `tabular-nums` | Change indicators (+/-) |

### 4.4 Typography Rules

1. **Never use all caps** for headings or status text. Sentence case only.
2. **Tabular numerals** for all financial values, tables, and aligned columns.
3. **Minimum 16px** for form inputs to prevent mobile browser zoom.
4. **Heading line-height tightens** as size increases (display: 1.1, h1: 1.2, h2: 1.25).
5. **Body text** uses 1.5 line-height for comfortable reading.
6. **No text on animated, translucent, or image-backed surfaces** for financial data.
7. **Rp prefix** is visually associated with its amount; no awkward line breaks.
8. **Indonesian formatting** for all numbers: `Rp 1.250.000` (dot grouping, no decimals).

---

## 5. Shadow System

### 5.1 Philosophy

Shadows create depth hierarchy. In a financial application, excessive shadows make data feel detached and untrustworthy. Use shadows sparingly — prefer borders and spacing for structure.

### 5.2 Shadow Tokens

| Token | Value | Use |
|-------|-------|-----|
| `shadow.none` | `none` | Default cards, tables, persistent surfaces |
| `shadow.xs` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle input hover, quiet lift |
| `shadow.sm` | `0 2px 4px rgba(0,0,0,0.06)` | Dropdown menus, tooltips |
| `shadow.md` | `0 4px 12px rgba(0,0,0,0.08)` | Elevated cards on hover, popovers |
| `shadow.lg` | `0 8px 24px rgba(0,0,0,0.10)` | Dialogs, sheets, floating panels |
| `shadow.xl` | `0 16px 48px rgba(0,0,0,0.14)` | Major overlays, glass dialogs |
| `shadow.focus` | `0 0 0 3px rgba(20,184,166,0.25)` | Focus ring (teal) |
| `shadow.focus-error` | `0 0 0 3px rgba(239,68,68,0.25)` | Error focus ring |
| `shadow.glass` | `0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.10)` | Glass panels |

### 5.3 Dark Theme Shadows

Dark theme uses reduced shadow opacity and slightly larger blur radii. Surfaces separate through color, not shadow:

| Token | Value | Use |
|-------|-------|-----|
| `shadow.dark.none` | `none` | Default surfaces |
| `shadow.dark.sm` | `0 2px 8px rgba(0,0,0,0.20)` | Dropdowns, tooltips |
| `shadow.dark.md` | `0 4px 16px rgba(0,0,0,0.25)` | Hover elevation |
| `shadow.dark.lg` | `0 8px 32px rgba(0,0,0,0.30)` | Dialogs, sheets |
| `shadow.dark.xl` | `0 16px 48px rgba(0,0,0,0.35)` | Major overlays |
| `shadow.dark.glass` | `0 8px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.05)` | Glass panels |

### 5.4 Shadow Rules

1. **Persistent data surfaces** (cards, tables, panels) use `shadow.none` with borders.
2. **Hover elevation** uses `shadow.sm` or `shadow.md` to indicate interactivity.
3. **Overlays** (dialogs, sheets, dropdowns) use `shadow.lg` or `shadow.xl`.
4. **Glass surfaces** use `shadow.glass` for depth without heaviness.
5. **Never use shadows for decoration** — every shadow communicates elevation or focus.
6. **Financial data surfaces are never elevated** — they sit flat with borders for stability.

---

## 6. Radius System

### 6.1 Radius Tokens

| Token | Value | Use |
|-------|-------|-----|
| `radius.none` | `0` | Tables (sharp data grid) |
| `radius.sm` | `4px` | Badges, small chips, inline tags |
| `radius.md` | `8px` | Buttons, inputs, small cards, select |
| `radius.lg` | `12px` | Cards, panels, sidebar, data tables |
| `radius.xl` | `16px` | Dialogs, sheets, hero cards, glass panels |
| `radius.2xl` | `20px` | Login card, featured glass surface |
| `radius.full` | `9999px` | Avatars, status dots, circular buttons |

### 6.2 Nested Radius Rule

When a child element sits inside a parent with rounded corners, the child's radius must be smaller than the parent's to maintain visual hierarchy:

- Parent `radius.lg` (12px) → Child `radius.md` (8px)
- Parent `radius.xl` (16px) → Child `radius.lg` (12px)

### 6.3 Radius Philosophy

- **Data-heavy surfaces** (tables, lists) use smaller or no radius for readability.
- **Interactive surfaces** (buttons, inputs) use `radius.md` for a modern feel.
- **Containment surfaces** (cards, panels) use `radius.lg` for softness.
- **Overlay surfaces** (dialogs, glass) use `radius.xl` for premium feel.
- **Never use pill shapes** for primary actions unless it's a floating action button or avatar.

---

## 7. Motion Principles

### 7.1 Core Principles

| Principle | Meaning |
|-----------|---------|
| **Purposeful** | Every animation has a stated usability reason |
| **Fast** | Interaction feedback begins immediately, completes within 200ms for most transitions |
| **Subtle** | Small distance (4–8px), restrained easing, low amplitude |
| **Interruptible** | Navigation and input are never blocked by animation |
| **Truthful** | Animation follows confirmed state; it never simulates success |
| **Non-financial** | Balance values, money counting, and financial totals never animate |
| **Accessible** | `prefers-reduced-motion` is respected globally |

### 7.2 Duration Tokens

| Token | Value | Use |
|-------|-------|-----|
| `motion.duration.instant` | `60ms` | Press feedback, focus ring |
| `motion.duration.fast` | `120ms` | Color transitions, opacity, small state changes |
| `motion.duration.standard` | `200ms` | Overlay enter/exit, content presence |
| `motion.duration.deliberate` | `280ms` | Sidebar collapse, panel transitions |
| `motion.duration.slow` | `350ms` | Page-level transitions (rare) |
| `motion.duration.none` | `0ms` | Reduced motion |

### 7.3 Easing Tokens

| Token | Value | Use |
|-------|-------|-----|
| `motion.ease.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default — smooth deceleration |
| `motion.ease.in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `motion.ease.out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `motion.ease.spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful accents only (sidebar hover, not financial) |

### 7.4 Distance Tokens

| Token | Value | Use |
|-------|-------|-----|
| `motion.distance.xs` | `2px` | Micro-shifts, focus ring |
| `motion.distance.sm` | `4px` | Button press, hover lift |
| `motion.distance.md` | `8px` | Overlay slide, content enter |
| `motion.distance.lg` | `16px` | Panel slide, sidebar collapse |

### 7.5 Allowed Motion

- Button press feedback (scale 0.98, 60ms)
- Focus ring appearance (opacity fade, 60ms)
- Hover elevation change (shadow transition, 120ms)
- Dialog/sheet fade-in with small positional shift (200ms)
- Sidebar collapse/expand (width transition, 280ms)
- Toast enter from bottom, exit to bottom (200ms)
- Skeleton-to-content crossfade (120ms)
- Tab/segment indicator slide (200ms)
- KPI card number fade-in on load (not counting animation)
- Dropdown menu stagger (20ms per item, max 5 items)

### 7.6 Prohibited Motion

- Balance counting animation (counting from 0 to value)
- Number interpolation between old and new values
- Parallax, scroll-jacking, auto-playing carousels
- Confetti, fireworks, celebration effects
- Continuous pulsing of balances, buttons, or indicators
- Animated reordering of transaction lists
- Swipe-only or drag-only core actions
- Shimmer on financial data that could be mistaken for live change
- Motion that delays form submission or error reading

### 7.7 Reduced Motion

When `prefers-reduced-motion: reduce` is active:
- All transforms are removed
- Durations collapse to `motion.duration.none` or brief opacity (60ms max)
- Skeletons are static (no shimmer)
- Overlay transitions are immediate
- The product must remain fully understandable with all motion removed

---

## 8. Iconography Guidelines

### 8.1 Icon System

**Default source:** Lucide React

Import icons individually. Do not bundle the entire icon library.

### 8.2 Icon Sizes

| Token | Size | Use |
|-------|------|-----|
| `icon.size.xs` | 14px | Inline text icons, badges |
| `icon.size.sm` | 16px | Button icons, form field icons |
| `icon.size.md` | 20px | Navigation items, list icons |
| `icon.size.lg` | 24px | Section headers, prominent actions |
| `icon.size.xl` | 32px | Empty states, feature highlights |
| `icon.size.2xl` | 40px | Dashboard KPI icons, hero accents |

### 8.3 Icon Stroke

| Token | Value | Use |
|-------|-------|-----|
| `icon.stroke.default` | 1.5px | Default for 16–20px icons |
| `icon.stroke.emphasis` | 2px | Active states, selected navigation |
| `icon.stroke.light` | 1px | Large display icons (32px+) |

### 8.4 Icon Rules

1. **Icons reinforce labels, never replace them.** Transaction direction, status, and financial meaning must always be expressed in text.
2. **Consistent stroke weight** across all icons in a view.
3. **Decorative icons** are hidden from assistive technology (`aria-hidden="true"`).
4. **Icon-only buttons** require an accessible name (`aria-label`) and visible tooltip on hover.
5. **Never use ambiguous arrows alone** for Deposit or Withdrawal. Pair with explicit text.
6. **Status icons** use semantic colors: check-circle for success, alert-triangle for warning, x-circle for error, info for information.
7. **Direction icons:** arrow-down-left for Deposit (money coming in), arrow-up-right for Withdrawal (money going out).
8. **Navigation icons:** layout-dashboard for Dashboard, users for Students, arrow-right-left for Transactions, bar-chart-3 for Reports, settings for Settings.

### 8.5 Recommended Icon Mapping

| Concept | Lucide Icon | Notes |
|---------|------------|-------|
| Dashboard | `LayoutDashboard` | |
| Students | `Users` | |
| Student (single) | `User` | |
| Transactions | `ArrowRightLeft` | |
| Deposit | `ArrowDownLeft` | Money arriving |
| Withdrawal | `ArrowUpRight` | Money departing |
| Reports | `BarChart3` | |
| Settings | `Settings` | |
| Search | `Search` | |
| Add | `Plus` | |
| Edit | `Pencil` | |
| Delete | `Trash2` | Use cautiously, always with confirmation |
| Success | `CheckCircle2` | |
| Warning | `AlertTriangle` | |
| Error | `XCircle` | |
| Info | `Info` | |
| Close | `X` | |
| Back | `ArrowLeft` | |
| Menu | `Menu` | Mobile hamburger |
| Collapse | `PanelLeftClose` | Sidebar collapse |
| Expand | `PanelLeftOpen` | Sidebar expand |
| Export | `Download` | |
| Filter | `Filter` | |
| Calendar | `Calendar` | |
| Money | `Banknote` | Decorative only, not for amounts |
| Audit | `ScrollText` | |
| Balance | `Wallet` | KPI icon only |

---

## 9. Glass Usage Guidelines

### 9.1 What is Liquid Glass

Liquid Glass is a surface treatment that uses backdrop blur, subtle transparency, and edge highlights to create a frosted-glass appearance. It adds visual hierarchy and premium feel when used sparingly.

### 9.2 Allowed Usage

| Surface | Glass Level | Justification |
|---------|------------|---------------|
| **Login card** | Full glass | First impression, premium feel, sets brand tone |
| **Dialog overlays** | Subtle glass | Distinguishes overlay from content, adds depth |
| **Hero KPI cards** (dashboard) | Accent glass | Draws attention to key metrics, premium treatment |
| **Floating panels** (command palette, search) | Subtle glass | Feels detached from content, intentional |
| **Sidebar on dark theme** | Very subtle glass | Adds depth without heavy shadow |

### 9.3 Prohibited Usage

| Surface | Why Not |
|---------|---------|
| **Data tables** | Readability is paramount; glass reduces legibility |
| **Form surfaces** | Inputs must be solid for focus clarity |
| **Transaction lists** | Dense financial data needs maximum contrast |
| **Regular cards** | Overuse dilutes the premium effect |
| **Navigation items** | Must be instantly recognizable, not decorative |
| **Settings pages** | Functional, not experiential |
| **Report surfaces** | Data clarity is non-negotiable |
| **Sidebar navigation items** | Active/hover states use solid backgrounds |

### 9.4 Glass Token Specification

| Token | Light | Dark |
|-------|-------|------|
| `glass.background` | `rgba(255,255,255,0.72)` | `rgba(15,22,41,0.72)` |
| `glass.border` | `rgba(255,255,255,0.40)` | `rgba(255,255,255,0.08)` |
| `glass.highlight` | `linear-gradient(180deg, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.00) 100%)` | `linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 100%)` |
| `glass.blur` | `16px` | `20px` |
| `glass.saturate` | `1.8` | `1.8` |
| `glass.shadow` | `shadow.glass` | `shadow.dark.glass` |
| `glass.radius` | `radius.xl` | `radius.xl` |

### 9.5 Glass Rules

1. **Glass is accent, not foundation.** Maximum 1–2 glass surfaces per viewport.
2. **Always provide a solid fallback** for environments without backdrop-filter support.
3. **Glass surfaces must maintain WCAG AA contrast** for all text content.
4. **Never place financial data directly on glass** without a solid inner container.
5. **Glass borders** use a 1px semi-transparent white line at the top edge for the light effect.
6. **Glass shadow** is essential — it separates the surface from the background.
7. **Test glass on both themes** — it should feel natural in both light and dark modes.
8. **Performance:** backdrop-filter is GPU-accelerated but can be expensive on mobile. Limit blur radius to 20px.

---

## 10. Component Guidelines

### 10.1 Cards

**Anatomy:**
```
Card
├── Optional Header (title, action)
├── Content
└── Optional Footer
```

**Specification:**

| Property | Value |
|----------|-------|
| Background | `color.background.surface` |
| Border | `1px solid color.border.default` |
| Radius | `radius.lg` (12px) |
| Padding | `space.5` (20px) — desktop, `space.4` (16px) — mobile |
| Shadow | `shadow.none` (default), `shadow.md` (hover, if interactive) |
| Gap between cards | `space.4` (16px) |

**Variants:**

| Variant | Description |
|---------|-------------|
| **Default** | Solid surface, border, no shadow |
| **Interactive** | Hover: `shadow.sm`, cursor pointer, border color subtle shift |
| **Glass** | Glass tokens, reserved for hero KPI cards only |
| **Flush** | No border, no shadow — for list containers |

**Rules:**
- Cards are not nested. Use sections and dividers for grouping.
- Financial data cards use solid backgrounds, never glass.
- KPI cards on the dashboard may use glass treatment as an accent.
- Cards do not animate financial values.

### 10.2 Buttons

**Anatomy:**
```
Button
├── Optional LeadingIcon
├── Label
└── Optional TrailingIcon
```

**Specification:**

| Property | Default | Large |
|----------|---------|-------|
| Height | `40px` | `48px` |
| Padding | `0 16px` | `0 20px` |
| Radius | `radius.md` (8px) | `radius.md` (8px) |
| Font | `type.button` (14px/600) | `type.button-large` (16px/600) |
| Icon size | `icon.size.sm` (16px) | `icon.size.md` (20px) |

**Variants:**

| Variant | Background | Text | Border | Use |
|---------|-----------|------|--------|-----|
| **Primary** | `color.action.primary` | `color.text.inverse` | none | Main actions |
| **Secondary** | `color.background.surface` | `color.text.primary` | `border.control` | Secondary actions |
| **Ghost** | transparent | `color.text.secondary` | none | Tertiary, navigation |
| **Danger** | `color.error.surface` | `color.error.text` | `1px solid color.error.text` | Destructive actions |
| **Deposit** | `color.deposit.surface` | `color.deposit.text` | `1px solid color.deposit.text` | Deposit-specific |
| **Withdrawal** | `color.withdrawal.surface` | `color.withdrawal.text` | `1px solid color.withdrawal.text` | Withdrawal-specific |

**States:**

| State | Change |
|-------|--------|
| Hover | Background darkens (light) or lightens (dark), `shadow.xs` |
| Active | Background further darkens, scale(0.98) |
| Focus | `shadow.focus` ring |
| Disabled | `color.disabled.surface`, `color.disabled.text`, cursor not-allowed |
| Loading | Spinner replaces icon, label persists, pointer-events none |

**Rules:**
- Verb-specific labels: "Tambah Siswa", "Konfirmasi Setoran", not "Submit" or "OK".
- Minimum touch target: 44px in both dimensions.
- Icon-only buttons require `aria-label` and tooltip.
- Full-width on mobile for primary actions.

### 10.3 Inputs

**Anatomy:**
```
Input
├── Label (required)
├── InputField
│   ├── Optional LeadingAdornment (Rp prefix, icon)
│   ├── Value / Placeholder
│   └── Optional TrailingAdornment (clear, unit)
├── Optional Hint
└── Optional Error
```

**Specification:**

| Property | Value |
|----------|-------|
| Height | `40px` |
| Padding | `0 12px` |
| Radius | `radius.md` (8px) |
| Background | `color.background.surface` |
| Border | `1px solid color.border.default` |
| Font | `type.body` (16px, prevents mobile zoom) |
| Placeholder color | `color.text.tertiary` |

**States:**

| State | Border | Background | Shadow |
|-------|--------|------------|--------|
| Rest | `color.border.default` | `color.background.surface` | none |
| Hover | `color.border.strong` | `color.background.surface` | none |
| Focus | `color.action.primary` | `color.background.surface` | `shadow.focus` |
| Error | `color.error.text` | `color.error.surface` (subtle) | `shadow.focus-error` |
| Disabled | `color.border.subtle` | `color.disabled.surface` | none |

**Rupiah Input specifics:**
- `Rp` prefix as a non-editable leading adornment
- Numeric keyboard on mobile (`inputmode="numeric"`)
- Whole numbers only — no decimal affordances
- Thousand separators added as the user types (e.g., `1.250.000`)
- Validation message appears below the input, not as a toast

### 10.4 Selects

**Specification:**

Same dimensions and states as Inputs.

| Property | Value |
|----------|-------|
| Trigger | Looks like Input with trailing chevron icon |
| Dropdown | `color.background.elevated`, `radius.md`, `shadow.md` |
| Option | `40px` height, `padding: 0 12px` |
| Option hover | `color.action.primary.subtle` |
| Option selected | `color.action.primary.subtle` + check icon |
| Dropdown border | `1px solid color.border.default` |

### 10.5 Badges

**Specification:**

| Property | Value |
|----------|-------|
| Height | `24px` (default), `20px` (compact) |
| Padding | `0 8px` (default), `0 6px` (compact) |
| Radius | `radius.sm` (4px) |
| Font | `type.overline` (11px/600) or `type.caption` (12px/500) |

**Variants:**

| Variant | Background | Text | Use |
|---------|-----------|------|-----|
| Neutral | `color.background.subtle` | `color.text.secondary` | Default |
| Success | `color.success.surface` | `color.success.text` | Active, confirmed |
| Warning | `color.warning.surface` | `color.warning.text` | Pending, attention |
| Error | `color.error.surface` | `color.error.text` | Inactive, error |
| Deposit | `color.deposit.surface` | `color.deposit.text` | Deposit indicator |
| Withdrawal | `color.withdrawal.surface` | `color.withdrawal.text` | Withdrawal indicator |

### 10.6 Dialogs

**Specification:**

| Property | Value |
|----------|-------|
| Max width | `480px` (form), `560px` (information) |
| Radius | `radius.xl` (16px) |
| Padding | `space.6` (24px) |
| Background | `color.background.surface` |
| Border | `1px solid color.border.default` |
| Shadow | `shadow.lg` |
| Scrim | `color.background.scrim` |

**Anatomy:**
```
Dialog
├── Header
│   ├── Title
│   └── CloseButton
├── Body
└── Footer
    ├── CancelButton (secondary)
    └── ConfirmButton (primary)
```

**Variants:**

| Variant | Description |
|---------|-------------|
| **Standard** | Solid surface, border, shadow |
| **Glass** | Glass tokens, reserved for login or hero moments |
| **Danger** | Red-tinted header or border for destructive confirmations |

**Rules:**
- Focus trapped within dialog while open.
- Escape closes (unless data would be lost without confirmation).
- Confirm button label names the action: "Hapus Siswa", not "OK".
- Mobile: bottom sheet presentation with same content contract.

### 10.7 Tables

**Specification:**

| Property | Value |
|----------|-------|
| Header background | `color.background.subtle` |
| Header font | `type.h6` (14px/600) |
| Row height | `48px` (default), `40px` (compact) |
| Cell padding | `12px 16px` |
| Border | `1px solid color.border.subtle` (horizontal only) |
| Row hover | `color.background.subtle` (no shadow) |
| Row selected | `color.action.primary.subtle` |
| Zebra stripe | `color.background.subtle` (optional) |
| Radius | `radius.lg` (12px) on outer container |

**Rules:**
- Tables are solid, never glass.
- Financial columns use `type.balance-row` with tabular numerals.
- Right-align numeric columns, left-align text columns.
- Sticky header on scroll for long tables.
- Empty state: icon + title + description + action (not a blank row).
- Mobile: cards replace table rows, maintaining the same data hierarchy.

### 10.8 Sidebar

**Anatomy:**
```
Sidebar
├── Brand / Logo
├── Navigation
│   ├── NavSection (group label)
│   ├── NavItem (icon, label, optional badge)
│   └── NavItem (active indicator)
├── Spacer
├── UserInfo
│   ├── Avatar
│   ├── Name
│   └── Role badge
└── CollapseTrigger
```

**Specification:**

| Property | Value |
|----------|-------|
| Width (expanded) | `240px` |
| Width (collapsed) | `64px` |
| Background | `color.background.surface` |
| Border | `1px solid color.border.default` (right edge) |
| Padding | `space.4` (16px) top/bottom, `space.3` (12px) sides |
| Radius | none (flush with viewport) |

**Navigation Item:**

| Property | Value |
|----------|-------|
| Height | `40px` |
| Padding | `0 12px` |
| Radius | `radius.md` (8px) |
| Gap | `space.3` (12px) between icon and label |
| Icon size | `icon.size.md` (20px) |
| Font | `type.body-small` (14px) |

**States:**

| State | Background | Text | Icon | Indicator |
|-------|-----------|------|------|-----------|
| Rest | transparent | `color.text.secondary` | `color.text.tertiary` | none |
| Hover | `color.background.subtle` | `color.text.primary` | `color.text.secondary` | none |
| Active | `color.action.primary.subtle` | `color.action.primary` | `color.action.primary` | 3px left bar, `color.action.primary`, `radius.full` |
| Disabled | transparent | `color.disabled.text` | `color.disabled.text` | none |

**User Info Section:**

| Element | Specification |
|---------|--------------|
| Avatar | `36px`, `radius.full`, with fallback initials |
| Name | `type.body-small` (14px), `color.text.primary` |
| Role | Badge: "Admin" or "Operator", neutral variant |

**Collapse Behavior:**
- Collapsed mode shows icons only, centered.
- Active indicator remains visible as a left bar.
- Tooltip shows label on hover in collapsed mode.
- Transition: width change over `motion.duration.deliberate` (280ms).
- State persists in user preferences.

**Dark Theme Variation:**
- Background: `color.background.surface` (navy.900)
- Border: `color.border.default` (navy.600)
- Active state uses teal accent with navy.700 subtle background

### 10.9 Navbar (Top Bar)

**Anatomy:**
```
Navbar
├── SidebarToggle (mobile/collapsed sidebar)
├── Breadcrumb / PageTitle
├── Spacer
├── SearchTrigger (optional)
├── ThemeToggle
└── UserMenu (avatar dropdown)
```

**Specification:**

| Property | Value |
|----------|-------|
| Height | `56px` |
| Background | `color.background.surface` |
| Border | `1px solid color.border.default` (bottom) |
| Padding | `0 space.5` (20px) |
| Sticky | Yes, `z.sticky` (20) |

**Rules:**
- Navbar does not contain financial data.
- Search is a trigger that opens a command palette or search overlay.
- User menu contains: Profile, Settings, Logout.
- Theme toggle cycles: Light → Dark → System.

---

## 11. Dashboard Layout Proposal

### 11.1 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Navbar (56px, sticky)                                   │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │  Content Area                                │
│ (240px)  │  ┌────────────────────────────────────────┐  │
│          │  │ Page Header (title, date range, export) │  │
│          │  ├────────────────────────────────────────┤  │
│          │  │ KPI Row (4 cards)                      │  │
│          │  ├──────────────────┬─────────────────────┤  │
│          │  │ Recent Activity  │ Balance Distribution│  │
│          │  │ (table)          │ (chart)             │  │
│          │  ├──────────────────┴─────────────────────┤  │
│          │  │ Monthly Trends (chart)                 │  │
│          │  └────────────────────────────────────────┘  │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 11.2 KPI Row

Four cards in a horizontal row, responsive to 2×2 grid on mobile.

| Card | Icon | Value | Subtitle | Glass? |
|------|------|-------|----------|--------|
| **Total Entrusted Money** | `Wallet` | Hero balance (`type.balance-display`) | "Saldo keseluruhan" | Yes (accent) |
| **Today's Deposits** | `ArrowDownLeft` | Count + amount | "Setoran hari ini" | No (solid, deposit tint) |
| **Today's Withdrawals** | `ArrowUpRight` | Count + amount | "Penarikan hari ini" | No (solid, withdrawal tint) |
| **Active Students** | `Users` | Count | "Siswa aktif" | No (solid) |

**Total Entrusted Money** receives the glass treatment as the primary metric. The other three are solid cards with subtle semantic tinting.

### 11.3 Recent Activity

A table showing the latest 10 transactions:

| Column | Width | Alignment |
|--------|-------|-----------|
| Student | Auto | Left |
| Type (Deposit/Withdrawal) | Badge | Center |
| Amount | Fixed | Right |
| Time | Fixed | Right |
| Operator | Auto | Left |

- Newest first
- "Lihat semua" link at bottom → navigates to Transactions page
- Deposit amounts in emerald, Withdrawal amounts in blue
- Each row is clickable → opens context detail drawer

### 11.4 Balance Distribution

A simple horizontal bar chart or donut showing:
- Total deposits vs total withdrawals (proportion)
- Or: number of students by balance range

Minimal, no axis labels, just proportion and legend. Uses emerald and blue semantic colors only.

### 11.5 Monthly Trends

A line or area chart showing:
- X-axis: last 6 months
- Y-axis: total transaction volume (deposits + withdrawals)
- Two lines: deposits (emerald) and withdrawals (blue)

Chart rules:
- No gridlines, minimal axes
- Tabular numerals on Y-axis
- Tooltip on hover with exact values
- No animation on data points
- Accessible data table alternative

### 11.6 Mobile Dashboard

On mobile (<768px):
- Sidebar collapses to bottom navigation or hamburger
- KPI cards stack vertically (2×2 grid)
- Recent Activity becomes a card list (not table)
- Charts collapse below the fold
- Single column layout

---

## 12. Settings Page Proposal

### 12.1 Layout

```
┌─────────────────────────────────────────┐
│ Settings                                │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Appearance                      │    │
│  │  Theme: [Light] [Dark] [System] │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Display                         │    │
│  │  Items per page: [10 ▾]         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Account                         │    │
│  │  Name, Email, Role (read-only)  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ About                           │    │
│  │  Version, Changelog link        │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### 12.2 Settings Groups

| Group | Settings | Notes |
|-------|---------|-------|
| **Appearance** | Theme (Light / Dark / System) | Immediate preview, saved per-user |
| **Display** | Items per page (10 / 25 / 50) | Affects all list views |
| **Account** | Name, Email, Role | Read-only, managed by admin |
| **About** | Version, Changelog, System status | Informational |

### 12.3 Theme Selector

Three-segment control: Light, Dark, System

- Each segment shows a small preview swatch
- Selection applies immediately (no save button)
- Persisted to user preferences in database
- System follows `prefers-color-scheme`

### 12.4 Rules

- No settings for rules that must remain invariant (e.g., financial invariants).
- Settings changes apply immediately where safe.
- Destructive settings (if any) require confirmation.
- Settings page uses solid surfaces, never glass.

---

## 13. Dark Theme Strategy

### 13.1 Direction

Modern Tech & Finance: calm blue-slate surfaces, soft near-white content, restrained teal accent. Not cyberpunk, not gaming, not neon.

### 13.2 Surface Hierarchy

```
Canvas (navy.950) ← deepest background
  └── Sidebar (navy.900) ← primary surface
      └── Cards (navy.900 with border) ← same level as sidebar
          └── Elevated (navy.800) ← hover, dropdowns
              └── Glass (navy.900/72% + blur) ← accent only
```

### 13.3 Text Hierarchy

| Level | Token | Color |
|-------|-------|-------|
| Primary | `color.text.primary` | `navy.50` (#ECEEF3) |
| Secondary | `color.text.secondary` | `navy.300` (#8891A8) |
| Tertiary | `color.text.tertiary` | `navy.400` (#5A6585) |
| Inverse | `color.text.inverse` | `navy.950` (#0A0F1E) |

### 13.4 Accent Usage

Teal (`teal.400` #2DD4BF) is the primary accent:
- Primary buttons
- Active navigation items
- Focus rings
- Links
- Selected states

It is NOT used for:
- Large decorative fills
- Card backgrounds
- Sidebar background
- Table headers
- Chart fills (use emerald/blue for data)

### 13.5 Financial Colors in Dark

| Semantic | Color | Surface |
|----------|-------|---------|
| Deposit text | `emerald.300` (#5EEAD4) | — |
| Deposit surface | `emerald.900` (#064E3B) | Badge, row highlight |
| Withdrawal text | `blue.300` (#93C5FD) | — |
| Withdrawal surface | `blue.900` (#1E3A5F) | Badge, row highlight |

These are intentionally muted to avoid the "crypto dashboard" trap. They read as semantic indicators, not excitement signals.

### 13.6 Dark Theme Rules

1. **No pure black** (`#000000`) anywhere. Navy.950 is the darkest.
2. **No pure white** (`#FFFFFF`) for large surfaces. Navy.50 is the lightest text.
3. **Borders are essential** — they replace shadows for surface separation.
4. **Elevation through color**, not shadow — higher surfaces are lighter navy.
5. **Test all glass surfaces** in dark mode — they need stronger blur for the same effect.
6. **Charts use muted tones** — avoid saturated fills that dominate the viewport.
7. **Status colors remain consistent** — emerald for success, amber for warning, red for error.
8. **Focus rings use teal** — consistent with the accent, visible on all surfaces.

---

## 14. Light Theme Strategy

### 14.1 Direction

Calm Financial: warm white canvas, white surfaces, soft blue-gray separation, desaturated teal interaction emphasis. Not sterile, not colorful.

### 14.2 Surface Hierarchy

```
Canvas (neutral.50) ← warm off-white background
  └── Sidebar (neutral.0) ← white, bordered
      └── Cards (neutral.0 with border) ← white, bordered
          └── Subtle (neutral.100) ← table stripes, grouped areas
              └── Glass (white/72% + blur) ← accent only
```

### 14.3 Text Hierarchy

| Level | Token | Color |
|-------|-------|-------|
| Primary | `color.text.primary` | `neutral.800` (#252D3D) |
| Secondary | `color.text.secondary` | `neutral.600` (#525A6B) |
| Tertiary | `color.text.tertiary` | `neutral.400` (#9DA3B0) |
| Inverse | `color.text.inverse` | `neutral.0` (#FFFFFF) |

### 14.4 Accent Usage

Teal (`teal.600` #0D9488) is the primary accent:
- Primary buttons
- Active navigation items (with teal.50 subtle background)
- Focus rings
- Links
- Selected states

### 14.5 Light Theme Rules

1. **Canvas is warm white** (`neutral.50`), not pure white — reduces eye strain.
2. **Surfaces are white** (`neutral.0`) — creates clear elevation from canvas.
3. **Borders are quiet** (`neutral.200`) — structure without heaviness.
4. **Shadows are subtle** — `shadow.none` for most surfaces, `shadow.sm` for hover.
5. **No excessive color** — teal accent appears only on interactive elements and active states.
6. **Financial colors are clear** — emerald for deposits, blue for withdrawals, never competing with the accent.
7. **Charts use soft tones** — avoid saturated fills that dominate.
8. **Focus rings use teal** — visible on white and light-gray surfaces.

### 14.6 Theme Switching

When switching themes:
- All semantic tokens re-map instantly
- No transition animation for the switch itself (content may have brief opacity fade)
- Financial values remain exactly the same
- Component structure, spacing, and typography are identical
- Only color mappings change

---

## Appendix A: Spacing System (8px Grid)

### Base Rhythm

The base rhythm is 8px. All spacing values are multiples or fractions of 8.

| Token | Pixels | Rem | Use |
|-------|--------|-----|-----|
| `space.0` | 0 | 0 | No spacing |
| `space.0.5` | 2 | 0.125rem | Tight micro-spacing |
| `space.1` | 4 | 0.25rem | Icon-to-label gap, inline elements |
| `space.1.5` | 6 | 0.375rem | Control internal padding |
| `space.2` | 8 | 0.5rem | Related element gap |
| `space.3` | 12 | 0.75rem | Card internal padding (compact) |
| `space.4` | 16 | 1rem | Card padding, section gap |
| `space.5` | 20 | 1.25rem | Card padding (comfortable) |
| `space.6` | 24 | 1.5rem | Section padding, dialog padding |
| `space.8` | 32 | 2rem | Major section gap |
| `space.10` | 40 | 2.5rem | Page section spacing |
| `space.12` | 48 | 3rem | Large section gap |
| `space.16` | 64 | 4rem | Page-level spacing |
| `space.20` | 80 | 5rem | Hero section spacing |
| `space.24` | 96 | 6rem | Landing page sections |

### Application

| Context | Spacing |
|---------|---------|
| Between related inline elements | `space.1` to `space.2` |
| Between form field and label | `space.1.5` |
| Between form fields | `space.4` |
| Card internal padding | `space.4` to `space.5` |
| Between cards | `space.4` |
| Between sections | `space.6` to `space.8` |
| Page edge padding (mobile) | `space.4` |
| Page edge padding (desktop) | `space.6` |
| Sidebar internal padding | `space.3` to `space.4` |
| Navbar height | `space.14` (56px) |
| Sidebar width (expanded) | `space.60` (240px) |
| Sidebar width (collapsed) | `space.16` (64px) |

---

## Appendix B: Z-Index Scale

| Token | Value | Use |
|-------|-------|-----|
| `z.base` | 0 | Default stacking |
| `z.raised` | 10 | Sticky elements, navbar |
| `z.sidebar` | 20 | Sidebar navigation |
| `z.dropdown` | 30 | Dropdown menus, popovers |
| `z.scrim` | 40 | Modal backdrop |
| `z.overlay` | 50 | Dialogs, sheets, drawers |
| `z.toast` | 60 | Toast notifications |
| `z.tooltip` | 70 | Tooltips |

---

## Appendix C: Breakpoints

| Token | Value | Use |
|-------|-------|-----|
| `breakpoint.sm` | 640px | Small tablets |
| `breakpoint.md` | 768px | Tablets, sidebar collapses |
| `breakpoint.lg` | 1024px | Desktop, sidebar visible |
| `breakpoint.xl` | 1280px | Wide desktop, content max-width |
| `breakpoint.2xl` | 1536px | Ultra-wide, centered content |

---

## Appendix D: Student Photo Integration

### Layout Considerations

Student profile photos appear in:
- Student list rows (32px avatar)
- Student detail header (48px avatar)
- Transaction history context (24px avatar)
- Dashboard recent activity (24px avatar)

### Avatar Specification

| Property | Value |
|----------|-------|
| Small | 24px, `radius.full` |
| Default | 32px, `radius.full` |
| Medium | 40px, `radius.full` |
| Large | 48px, `radius.full` |
| XL | 64px, `radius.full` (profile page) |

### Fallback

When no photo is available:
- Show initials on a colored background
- Background color: deterministic from student name hash, using muted teal/emerald/blue tones
- Font: `type.body-small`, `font-weight.semibold`
- Text color: white

### Performance

- Photos are lazy-loaded below the fold
- Use `loading="lazy"` and `decoding="async"`
- Serve at 2× resolution for retina displays (48px avatar → 96px image)
- Use WebP format with JPEG fallback
- Placeholder: initials or neutral gray circle

---

## Appendix E: Implementation Notes

### Token Delivery

Design tokens will be implemented as:
- CSS custom properties (`--color-*`, `--space-*`, etc.)
- Tailwind CSS v4 theme extension
- TypeScript constants for programmatic access

### Component Library

Components will be built on:
- **shadcn/ui** primitives (accessible, customizable)
- **Tailwind CSS v4** for styling
- **Motion for React** for interaction animations
- **Lucide React** for icons

### Theme Implementation

- CSS custom properties remap on `[data-theme="dark"]` or `.dark` class
- System theme via `prefers-color-scheme` media query
- No JavaScript color manipulation — all values are pre-defined tokens

### Glass Implementation

- CSS `backdrop-filter: blur() saturate()`
- Fallback: solid background with reduced opacity border
- Feature detection: `@supports (backdrop-filter: blur(1px))`

---

## Enhancement 1 — Semantic Design Tokens

### 1.1 Purpose

Components must never reference palette colors directly. A semantic token layer sits between the primitive palette (Section 3.2) and component consumption. This separation ensures that:

- **Theme switching is mechanical.** Changing a semantic mapping updates every component that consumes it. No component code changes.
- **Intent is explicit.** `color.action.primary` communicates purpose; `teal.600` does not.
- **Consistency is enforced.** Two components cannot accidentally use different blues for the same meaning.
- **Maintenance is scalable.** A palette refinement requires updating only the semantic mapping, not every component file.

### 1.2 Semantic Token Categories

#### Brand

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `color.brand` | `teal.600` | `teal.400` | Primary brand color |
| `color.brand.hover` | `teal.700` | `teal.300` | Brand hover state |
| `color.brand.active` | `teal.800` | `teal.200` | Brand pressed state |
| `color.brand.subtle` | `teal.50` | `navy.700` | Brand selection surface |
| `color.brand.text` | `neutral.0` | `navy.950` | Text on brand fill |

#### Surface

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `surface.canvas` | `neutral.50` | `navy.950` | Page background |
| `surface.default` | `neutral.0` | `navy.900` | Cards, panels, sidebar |
| `surface.elevated` | `neutral.0` | `navy.800` | Dropdowns, hover cards, popovers |
| `surface.subtle` | `neutral.100` | `navy.800` | Table stripes, grouped areas |
| `surface.sunken` | `neutral.100` | `navy.950` | Inset areas, wells |
| `surface.glass` | `rgba(255,255,255,0.72)` | `rgba(15,22,41,0.72)` | Glass accent panels |
| `surface.overlay` | `neutral.0` | `navy.800` | Dialog, sheet content |
| `surface.scrim` | `rgba(0,0,0,0.45)` | `rgba(0,0,0,0.60)` | Modal backdrop |

#### Text

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `text.primary` | `neutral.800` | `navy.50` | Headings, body copy |
| `text.secondary` | `neutral.600` | `navy.300` | Descriptions, labels |
| `text.muted` | `neutral.400` | `navy.400` | Placeholders, timestamps |
| `text.disabled` | `neutral.300` | `navy.500` | Disabled controls |
| `text.inverse` | `neutral.0` | `navy.950` | Text on accent fills |
| `text.link` | `teal.600` | `teal.400` | Inline links |
| `text.link.hover` | `teal.700` | `teal.300` | Link hover |

#### Border

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `border.default` | `neutral.200` | `navy.600` | Card, input, table borders |
| `border.muted` | `neutral.100` | `navy.700` | Quiet separators, dividers |
| `border.strong` | `neutral.300` | `navy.500` | Emphasized boundaries |
| `border.focus` | `teal.600` | `teal.400` | Keyboard focus ring |
| `border.error` | `red.500` | `red.400` | Error state border |
| `border.success` | `emerald.500` | `emerald.400` | Success state border |

#### Financial

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `financial.income` | `emerald.600` | `emerald.300` | Deposit amount text |
| `financial.income.surface` | `emerald.50` | `emerald.900` | Deposit badge, row |
| `financial.income.icon` | `emerald.600` | `emerald.400` | Deposit direction icon |
| `financial.expense` | `blue.600` | `blue.300` | Withdrawal amount text |
| `financial.expense.surface` | `blue.50` | `blue.900` | Withdrawal badge, row |
| `financial.expense.icon` | `blue.600` | `blue.400` | Withdrawal direction icon |
| `financial.balance` | `neutral.800` | `navy.50` | Balance display text |
| `financial.balance.surface` | `neutral.50` | `navy.800` | Balance panel background |
| `financial.correction` | `amber.600` | `amber.300` | Correction indicator |
| `financial.correction.surface` | `amber.50` | `amber.900` | Correction badge |

#### Feedback

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `feedback.success` | `emerald.600` | `emerald.400` | Success icon, text |
| `feedback.success.surface` | `emerald.50` | `emerald.900` | Success container |
| `feedback.success.border` | `emerald.200` | `emerald.700` | Success border |
| `feedback.info` | `blue.600` | `blue.400` | Information icon, text |
| `feedback.info.surface` | `blue.50` | `blue.900` | Information container |
| `feedback.info.border` | `blue.200` | `blue.700` | Information border |
| `feedback.warning` | `amber.600` | `amber.400` | Warning icon, text |
| `feedback.warning.surface` | `amber.50` | `amber.900` | Warning container |
| `feedback.warning.border` | `amber.200` | `amber.700` | Warning border |
| `feedback.danger` | `red.600` | `red.400` | Error icon, text |
| `feedback.danger.surface` | `red.50` | `red.900` | Error container |
| `feedback.danger.border` | `red.200` | `red.700` | Error border |

### 1.3 Token Resolution Chain

```text
Primitive palette (Section 3.2)
        ↓
Semantic tokens (this section)
        ↓
Component tokens (Section 10)
        ↓
Screen composition
```

No component may skip the semantic layer. If a required semantic token does not exist, propose it through the Token Governance process rather than referencing a primitive directly.

### 1.4 Naming Convention

All semantic tokens use dot notation: `category.property.variant`.

- CSS custom properties: `--color-brand-hover`, `--surface-elevated`, `--text-muted`
- Tailwind aliases: `bg-surface-default`, `text-text-primary`, `border-border-focus`
- TypeScript: `color.brand.hover`, `surface.elevated`, `text.muted`

---

## Enhancement 2 — Spacing System

### 2.1 Global Spacing Scale

The base rhythm is 8px. All spacing values derive from this grid.

| Token | Pixels | Rem | Use |
|-------|--------|-----|-----|
| `space.1` | 4 | 0.25rem | Icon-to-label, inline micro-gap |
| `space.2` | 8 | 0.5rem | Related element gap, compact internal padding |
| `space.3` | 12 | 0.75rem | Control padding, sidebar internal |
| `space.4` | 16 | 1rem | Card padding, form field gap |
| `space.5` | 20 | 1.25rem | Card padding (comfortable), navbar padding |
| `space.6` | 24 | 1.5rem | Section padding, dialog padding |
| `space.8` | 32 | 2rem | Major section gap, page section divider |
| `space.10` | 40 | 2.5rem | Large section gap |
| `space.12` | 48 | 3rem | Page section spacing |
| `space.16` | 64 | 4rem | Page-level spacing, hero sections |

### 2.2 Padding Rules

| Context | Token | Value |
|---------|-------|-------|
| Button horizontal | `space.4` | 16px |
| Button vertical | `space.2` | 8px |
| Input horizontal | `space.3` | 12px |
| Input vertical | `space.2` | 8px |
| Card internal | `space.5` | 20px |
| Card internal (compact) | `space.4` | 16px |
| Dialog internal | `space.6` | 24px |
| Sidebar item | `space.3` | 12px |
| Table cell | `space.3` horizontal, `space.3` vertical | 12px |
| Badge horizontal | `space.2` | 8px |
| Page edge (mobile) | `space.4` | 16px |
| Page edge (desktop) | `space.6` | 24px |

### 2.3 Margin Rules

Margins are used sparingly. Prefer gap-based layouts (flexbox gap, grid gap) over margin.

| Context | Token | Value |
|---------|-------|-------|
| Section title to content | `space.3` | 12px |
| Between form fields | `space.4` | 16px |
| Between cards | `space.4` | 16px |
| Between page sections | `space.8` | 32px |
| Between major page regions | `space.10` | 40px |

### 2.4 Component Gap Rules

| Context | Token | Value |
|---------|-------|-------|
| Icon to label (inline) | `space.2` | 8px |
| Badge to text | `space.1` | 4px |
| Button group gap | `space.3` | 12px |
| Card header to body | `space.4` | 16px |
| KPI icon to value | `space.3` | 12px |
| Sidebar nav items | `space.1` | 4px |
| Navbar items | `space.4` | 16px |
| Table row internal | `space.3` | 12px |

### 2.5 Section Spacing

| Context | Token | Value |
|---------|-------|-------|
| Dashboard KPI row to chart | `space.6` | 24px |
| Chart to chart | `space.6` | 24px |
| Page header to content | `space.6` | 24px |
| Settings group gap | `space.6` | 24px |
| Sidebar to content | `space.0` (border handles separation) | 0 |

### 2.6 Dashboard Spacing

| Context | Token | Value |
|---------|-------|-------|
| KPI card gap | `space.4` | 16px |
| KPI card internal | `space.5` | 20px |
| Recent Activity to Balance Distribution | `space.4` | 16px |
| Dashboard section gap | `space.6` | 24px |
| Page header padding | `space.5` vertical | 20px |

### 2.7 Rules

1. **All layouts consume spacing tokens only.** No arbitrary pixel values.
2. **Use gap over margin** for component and layout spacing.
3. **Consistent rhythm** — the same relationship uses the same token everywhere.
4. **Mobile reduces by one step** where the token exceeds `space.6` (e.g., section gap becomes `space.4` on mobile).
5. **Never use negative margins** for layout adjustments.

---

## Enhancement 3 — Elevation System

### 3.1 Purpose

Elevation communicates hierarchy and interaction depth. It is distinct from shadow — elevation is a semantic concept; shadow is one implementation technique. In dark mode, elevation is primarily communicated through surface color rather than shadow.

### 3.2 Elevation Levels

| Level | Name | Token | Light | Dark | Use |
|-------|------|-------|-------|------|-----|
| 0 | Flat | `elevation.flat` | `surface.canvas`, no shadow | `navy.950`, no shadow | Page background, sidebar |
| 1 | Raised | `elevation.raised` | `surface.default`, `shadow.xs` | `navy.900`, no shadow | Cards, panels, inputs |
| 2 | Elevated | `elevation.elevated` | `surface.default`, `shadow.md` | `navy.800`, `shadow.dark.sm` | Hover cards, dropdowns, popovers |
| 3 | Overlay | `elevation.overlay` | `surface.overlay`, `shadow.lg` | `navy.800`, `shadow.dark.lg` | Dialogs, sheets, drawers |
| 4 | Glass | `elevation.glass` | `surface.glass`, `shadow.glass` | `surface.glass`, `shadow.dark.glass` | Premium floating surfaces |

### 3.3 Light Mode Elevation

Light mode communicates elevation through a combination of surface color, border, and shadow:

```
Level 0 (Flat):     canvas bg, no border, no shadow
Level 1 (Raised):   white bg, border, no shadow
Level 2 (Elevated): white bg, border, shadow.md
Level 3 (Overlay):  white bg, border, shadow.lg
Level 4 (Glass):    glass bg, glass border, shadow.glass
```

Shadows increase in blur and opacity as elevation rises. Borders remain consistent.

### 3.4 Dark Mode Elevation

Dark mode communicates elevation primarily through surface color step, not shadow. Surfaces become progressively lighter (higher navy step) as they rise:

```
Level 0 (Flat):     navy.950, no shadow
Level 1 (Raised):   navy.900, subtle border (navy.600)
Level 2 (Elevated): navy.800, subtle border (navy.600), shadow.dark.sm
Level 3 (Overlay):  navy.800, border (navy.500), shadow.dark.lg
Level 4 (Glass):    navy.900/72%, glass border, shadow.dark.glass
```

Shadows are softer and less prominent in dark mode. The surface color step is the primary elevation signal.

### 3.5 Elevation Rules

1. **Persistent data surfaces** (cards, tables, panels) use Level 1. They sit flat with borders.
2. **Interactive hover** uses Level 2. Hover lifts a surface to indicate interactivity.
3. **Overlays** (dialogs, sheets, dropdowns) use Level 3. They float above content.
4. **Glass** uses Level 4. Reserved for approved accent surfaces only.
5. **Financial data surfaces are never elevated beyond Level 1.** Stability communicates trust.
6. **Never use shadow alone** to communicate elevation in dark mode — pair with surface color.
7. **Z-index must match elevation intent.** A Level 3 overlay always has a higher z-index than Level 2 content.

---

## Enhancement 4 — Z-Index Scale

### 4.1 Global Z-Index Hierarchy

| Token | Value | Use |
|-------|-------|-----|
| `z.base` | 0 | Default stacking context |
| `z.raised` | 10 | Sticky elements (navbar, sticky table headers) |
| `z.sidebar` | 20 | Sidebar navigation |
| `z.dropdown` | 30 | Dropdown menus, selects, popovers |
| `z.popover` | 35 | Popovers, tooltips attached to triggers |
| `z.tooltip` | 40 | Tooltips, hover cards |
| `z.scrim` | 50 | Modal backdrop |
| `z.overlay` | 60 | Dialogs, sheets, drawers |
| `z.toast` | 70 | Toast notifications, snackbar |
| `z.loading` | 80 | Full-page loading overlay |

### 4.2 Rules

1. **No arbitrary z-index values.** Every z-index must reference a token.
2. **Scrim always sits below overlay.** The backdrop is `z.scrim` (50); the dialog is `z.overlay` (60).
3. **Tooltips above dropdowns.** A tooltip on a dropdown item must remain visible: `z.tooltip` (40) > `z.dropdown` (30).
4. **Toast above everything except loading.** Toasts must be visible over all other surfaces.
5. **Loading overlay is the highest.** It blocks interaction during critical operations.
6. **Sidebar is above content but below dropdowns.** A dropdown from the navbar must overlap the sidebar.
7. **Sticky headers are above scrolling content** but below dropdowns and overlays.
8. **Each new stacking context** (e.g., a dialog) resets internal z-indices but inherits the parent's level.

### 4.3 Stacking Context Boundaries

A new stacking context is created by:
- `position: relative/absolute/fixed/sticky` with z-index
- `opacity` less than 1
- `transform`, `filter`, `backdrop-filter`
- `isolation: isolate`

Components that create stacking contexts must document their z-index consumption to prevent conflicts.

---

## Enhancement 5 — Universal Component States

### 5.1 State Definitions

Every interactive component (button, input, select, link, nav item, card action) must define behavior for all applicable states.

| State | Token | Visual Change | Behavioral Requirement |
|-------|-------|--------------|----------------------|
| **Default** | `state.default` | Resting appearance, no interaction | Component is visible and interactive |
| **Hover** | `state.hover` | Subtle background shift, cursor changes to pointer | Only on pointer devices; never the sole affordance for interactivity |
| **Focus** | `state.focus` | Focus ring (`border.focus`, `shadow.focus`) | Visible on keyboard navigation; uses `:focus-visible` |
| **Active** | `state.active` | Deeper background shift, slight scale (0.98) | Appears during click/tap; brief duration |
| **Disabled** | `state.disabled` | Muted text, muted background, `cursor: not-allowed` | Not interactive; `aria-disabled="true"` or `disabled` attribute |
| **Loading** | `state.loading` | Spinner or skeleton, label preserved | Not interactive during operation; `aria-busy="true"` |
| **Error** | `state.error` | Error border, error background tint | Inline error message adjacent to component; `aria-invalid="true"` |
| **Success** | `state.success` | Success border or icon | Brief confirmation; auto-clears or persists based on context |
| **Readonly** | `state.readonly` | Resting appearance, `cursor: default` | Content visible but not editable; `aria-readonly="true"` |

### 5.2 State Specifications by Component

#### Button

| State | Background | Text | Border | Shadow | Scale |
|-------|-----------|------|--------|--------|-------|
| Default | `color.brand` | `text.inverse` | none | none | 1 |
| Hover | `color.brand.hover` | `text.inverse` | none | `shadow.xs` | 1 |
| Focus | `color.brand` | `text.inverse` | `border.focus` | `shadow.focus` | 1 |
| Active | `color.brand.active` | `text.inverse` | none | none | 0.98 |
| Disabled | `surface.sunken` | `text.disabled` | none | none | 1 |
| Loading | `color.brand` (dimmed 0.7) | `text.inverse` | none | none | 1 |

#### Input

| State | Border | Background | Shadow | Cursor |
|-------|--------|-----------|--------|--------|
| Default | `border.default` | `surface.default` | none | text |
| Hover | `border.strong` | `surface.default` | none | text |
| Focus | `border.focus` | `surface.default` | `shadow.focus` | text |
| Error | `border.error` | `feedback.danger.surface` (subtle) | `shadow.focus-error` | text |
| Disabled | `border.muted` | `surface.sunken` | none | not-allowed |
| Readonly | `border.default` | `surface.default` | none | default |

#### Navigation Item (Sidebar)

| State | Background | Text | Icon | Indicator |
|-------|-----------|------|------|-----------|
| Default | transparent | `text.secondary` | `text.muted` | none |
| Hover | `surface.subtle` | `text.primary` | `text.secondary` | none |
| Active | `color.brand.subtle` | `color.brand` | `color.brand` | 3px left bar |
| Focus | `surface.subtle` | `text.primary` | `text.secondary` | focus ring |
| Disabled | transparent | `text.disabled` | `text.disabled` | none |

### 5.3 Transition Durations

| State Change | Duration | Easing |
|-------------|----------|--------|
| Default → Hover | `motion.duration.fast` (120ms) | `motion.ease.standard` |
| Hover → Default | `motion.duration.fast` (120ms) | `motion.ease.standard` |
| Default → Focus | `motion.duration.instant` (60ms) | `motion.ease.standard` |
| Default → Active | `motion.duration.instant` (60ms) | `motion.ease.in` |
| Default → Disabled | `motion.duration.fast` (120ms) | `motion.ease.standard` |

### 5.4 Rules

1. **Hover is never the sole indicator of interactivity.** Visual affordance (cursor, shape, context) must exist independently.
2. **Focus is always visible.** Use `:focus-visible` with `shadow.focus` ring. Never remove focus outlines without an accessible replacement.
3. **Disabled components must explain why** when the reason is not obvious. Pair with a tooltip or inline message.
4. **Loading preserves layout.** The component must not shift surrounding content when entering or exiting loading state.
5. **Error state includes an inline message.** The message is adjacent to the component, associated via `aria-describedby`.
6. **Success state is brief.** It auto-clears after 2–3 seconds or on the next user interaction.
7. **Readonly looks like default** but with `cursor: default` and no interactive affordances.

---

## Enhancement 6 — Empty / Loading / Error Patterns

### 6.1 Loading Skeleton

**Anatomy:**

```
SkeletonContainer
├── SkeletonBlock (title area)
├── SkeletonBlock (content area)
└── SkeletonBlock (action area)
```

**Specification:**

| Property | Value |
|----------|-------|
| Background | `neutral.200` (light), `navy.700` (dark) |
| Animation | Shimmer gradient moving left-to-right, 1.5s loop |
| Radius | Matches the element it replaces |
| Duration | Shimmer runs until content loads, then crossfades |

**Rules:**
- Skeleton shape approximates final content geometry to minimize layout shift.
- Never skeletonize a financial value that could be mistaken for a real amount.
- Shimmer is disabled under `prefers-reduced-motion`.
- Crossfade from skeleton to content: `motion.duration.fast` (120ms).

### 6.2 Empty State

**Anatomy:**

```
EmptyState
├── Icon (Lucide, 40px, muted color)
├── Title (type.h4, text.primary)
├── Description (type.body-small, text.secondary)
└── Action (primary button, optional)
```

**Specification:**

| Property | Value |
|----------|-------|
| Padding | `space.12` vertical, `space.6` horizontal |
| Max width | `400px` |
| Alignment | Center |
| Icon color | `text.muted` |

**Contextual Empty States:**

| Context | Icon | Title | Description | Action |
|---------|------|-------|-------------|--------|
| No students | `Users` | "Belum ada siswa" | "Tambah siswa untuk mulai mengelola dana titipan." | "Tambah siswa" |
| No transactions | `ArrowRightLeft` | "Belum ada transaksi" | "Transaksi akan muncul di sini setelah setoran atau penarikan pertama." | — |
| No search results | `Search` | "Tidak ditemukan" | "Coba kata kunci lain atau hapus filter." | "Hapus pencarian" |
| No permission | `ShieldX` | "Akses terbatas" | "Anda tidak memiliki izin untuk melihat halaman ini." | — |
| Financial data unavailable | `AlertTriangle` | "Data tidak tersedia" | "Terjadi kesalahan saat memuat data keuangan. Coba lagi." | "Coba lagi" |

### 6.3 Error State

**Anatomy:**

```
ErrorState
├── Icon (XCircle or AlertTriangle, 40px)
├── Title (type.h4, text.primary)
├── Description (type.body-small, feedback.danger.text)
└── Action (secondary button: "Coba lagi")
```

**Specification:**

| Property | Value |
|----------|-------|
| Icon color | `feedback.danger` |
| Background | `feedback.danger.surface` (optional container) |
| Border | `1px solid feedback.danger.border` (optional) |
| Radius | `radius.lg` |

**Contextual Error States:**

| Context | Title | Description | Action |
|---------|-------|-------------|--------|
| Network error | "Koneksi terputus" | "Periksa koneksi internet Anda dan coba lagi." | "Coba lagi" |
| Server error | "Kesalahan server" | "Terjadi masalah di server. Tim kami telah diberitahu." | "Coba lagi" |
| Not found | "Data tidak ditemukan" | "Data yang Anda cari tidak tersedia atau telah dihapus." | "Kembali" |
| Unknown error | "Terjadi kesalahan" | "Silakan coba lagi. Jika masalah berlanjut, hubungi administrator." | "Coba lagi" |

### 6.4 Offline State

**Specification:**

| Property | Value |
|----------|-------|
| Banner | Fixed at top of content area, below navbar |
| Background | `feedback.warning.surface` |
| Text | `feedback.warning.text` |
| Icon | `WifiOff` (Lucide) |
| Message | "Anda sedang offline. Data yang ditampilkan mungkin tidak terbaru." |
| Dismissible | No — persists until connection is restored |

### 6.5 Loading Overlay

**Specification:**

| Property | Value |
|----------|-------|
| Background | `surface.scrim` |
| Content | Centered spinner + message |
| Spinner color | `color.brand` |
| Message | Context-specific (e.g., "Menyimpan transaksi...") |
| Z-index | `z.loading` (80) |

**Rules:**
- Loading overlay blocks interaction during critical financial operations.
- Message must describe what is happening, not just "Loading..."
- Auto-dismiss on success or error; never hang indefinitely.
- Provide a timeout mechanism (30s) with an error state if the operation does not complete.

### 6.6 Financial Data Unavailable

When financial data cannot be loaded:

1. **Balance area** shows "—" (em-dash), not `Rp 0` (which implies zero balance).
2. **Transaction list** shows the Error State with "Coba lagi" action.
3. **KPI cards** show skeleton or "—" — never stale or fabricated values.
4. **No partial display** — if the balance is unavailable, do not show transactions without context.

### 6.7 Pattern Rules

1. **Every page must handle** loading, empty, error, and success states.
2. **Empty states are intentional**, not an afterthought. They guide the user to the next action.
3. **Error messages are specific**, not generic. "Gagal menyimpan" is better than "Terjadi kesalahan."
4. **Loading states preserve layout.** The page structure remains stable while content loads.
5. **Financial data never shows placeholder values.** Use skeleton, em-dash, or explicit error.
6. **Offline state is always visible** when detected. Do not silently serve stale data.
7. **All patterns work in both themes** and at all breakpoints.

---

## Enhancement 7 — Data Visualization Guidelines

### 7.1 Chart Philosophy

Charts in Amanah Cash exist to answer specific questions about entrusted money. They are tools, not decoration. Every chart must have a clear purpose, readable data, and an accessible alternative.

### 7.2 Color Palette for Charts

Maximum 5–6 colors per chart. Use semantic financial colors:

| Data Series | Color | Light | Dark |
|-------------|-------|-------|------|
| Deposits | `financial.income` | `emerald.600` | `emerald.300` |
| Withdrawals | `financial.expense` | `blue.600` | `blue.300` |
| Balance | `financial.balance` | `neutral.800` | `navy.50` |
| Corrections | `financial.correction` | `amber.600` | `amber.300` |
| Neutral/Other | `text.secondary` | `neutral.500` | `navy.300` |
| Reference line | `border.default` | `neutral.200` | `navy.600` |

### 7.3 Chart Types

| Chart Type | Use | Rules |
|-----------|-----|-------|
| **Line chart** | Monthly trends, balance over time | Max 3 lines, use area fill only for single series |
| **Bar chart** | Comparison (deposits vs withdrawals by period) | Grouped or stacked, never 3D |
| **Donut chart** | Proportion (deposit/withdrawal ratio) | Max 4 segments, center label shows total |
| **Horizontal bar** | Distribution (students by balance range) | Sort by value, label directly on bar |

### 7.4 Chart Specification

| Property | Value |
|----------|-------|
| Gridlines | None or very subtle (`border.muted`) |
| Axis labels | `type.caption` (12px), `text.muted` |
| Data labels | `type.balance-inline` (14px), tabular-nums |
| Tooltip | `surface.elevated`, `shadow.sm`, `radius.md`, `space.3` padding |
| Legend | Below chart, `type.caption`, horizontal layout |
| Max height | `300px` (dashboard), `400px` (reports) |
| Animation | None on data points; optional fade-in on initial load |

### 7.5 KPI Display

| Property | Value |
|----------|-------|
| Value font | `type.balance-display` (40px) or `type.balance-card` (28px) |
| Label font | `type.caption` (12px), `text.secondary` |
| Trend indicator | Arrow up/down + percentage, `type.stat-delta` |
| Trend color | Positive: `financial.income`, Negative: `financial.expense` |
| Icon | `icon.size.2xl` (40px), `text.muted` |

### 7.6 Progress Indicators

| Type | Use | Specification |
|------|-----|--------------|
| Progress bar | Determinate progress (e.g., export) | Height: 4px, `radius.full`, `color.brand` fill |
| Spinner | Indeterminate loading | 20px, `color.brand`, 1s rotation |
| Skeleton | Content loading | Section 6.1 specification |

### 7.7 Accessibility

1. **Every chart has an accessible data table** alternative, hidden visually but available to screen readers.
2. **Chart tooltips** are keyboard-accessible (focusable data points).
3. **Color is never the only differentiator.** Use patterns, labels, or shapes in addition to color.
4. **Sufficient contrast** between data series and background (WCAG AA minimum).
5. **Chart title** describes the chart's purpose in plain language.
6. **Axis labels** use Indonesian locale and Rupiah formatting where applicable.

### 7.8 Rules

1. **No decorative gradients** inside chart areas. Solid fills only.
2. **No 3D charts.** Flat, 2D representations only.
3. **No animated data transitions.** Numbers do not count up or interpolate.
4. **No chartjunk.** Remove unnecessary gridlines, borders, and labels.
5. **Financial values in tooltips** use `type.balance-inline` with tabular-nums.
6. **Charts respect reduced motion.** Disable all animation under `prefers-reduced-motion`.
7. **Responsive charts** reflow to single-column on mobile with preserved readability.

---

## Enhancement 8 — Responsive Layout Rules

### 8.1 Breakpoints

| Token | Value | Name | Layout Behavior |
|-------|-------|------|----------------|
| `breakpoint.sm` | 640px | Small tablet | Single column, sidebar hidden |
| `breakpoint.md` | 768px | Tablet | Sidebar collapses to icon mode |
| `breakpoint.lg` | 1024px | Desktop | Sidebar expanded, content beside sidebar |
| `breakpoint.xl` | 1280px | Wide | Content max-width applied, centered |
| `breakpoint.2xl` | 1536px | Ultra-wide | Further centering, no new columns |

### 8.2 Sidebar Behavior

| Breakpoint | Sidebar State |
|-----------|--------------|
| < 768px | Hidden. Hamburger menu in navbar opens sidebar as overlay sheet. |
| 768px–1023px | Collapsed (64px, icons only). Toggle to expand as overlay. |
| >= 1024px | Expanded (240px). Toggle to collapse to 64px. |

Sidebar overlay on mobile:
- Slides in from left
- Scrim behind (`z.scrim`)
- Dismiss on scrim tap or nav item tap
- Width: 280px (slightly wider than desktop for touch targets)

### 8.3 Card Wrapping

| Breakpoint | KPI Cards | Content Cards |
|-----------|-----------|---------------|
| < 640px | 1 column, full width | 1 column |
| 640px–1023px | 2×2 grid | 1 column |
| >= 1024px | 4-column row | 2-column (activity + chart) |

### 8.4 Table Overflow

| Breakpoint | Behavior |
|-----------|----------|
| < 768px | Tables convert to card layout. Each row becomes a card with stacked fields. |
| >= 768px | Standard table. Horizontal scroll with `overflow-x: auto` if columns exceed width. |

Mobile card layout for table rows:

```
┌─────────────────────────────┐
│ Student Name          [Badge]│
│ Rp 150.000                  │
│ Setoran · 31 Jul 2026 10:30 │
│ Operator: Ahmad             │
└─────────────────────────────┘
```

### 8.5 Mobile Navigation

| Element | Behavior |
|---------|----------|
| Sidebar | Hidden. Accessible via hamburger or swipe gesture. |
| Navbar | Sticky. Shows hamburger, page title, user avatar. |
| Bottom navigation | Optional: 4 main items (Dashboard, Students, Transactions, Settings) in a bottom bar. |
| Search | Full-screen overlay triggered from navbar search icon. |

### 8.6 Dashboard Stacking

| Breakpoint | Layout |
|-----------|--------|
| < 640px | Single column: KPIs (1 per row) → Recent Activity → Charts |
| 640px–1023px | KPIs 2×2 → Recent Activity full width → Charts side by side |
| >= 1024px | KPIs 4-column → Activity + Distribution side by side → Trends full width |

### 8.7 Dialog Sizing

| Breakpoint | Behavior |
|-----------|----------|
| < 640px | Full-width bottom sheet, `radius.xl` top corners only |
| 640px–1023px | Centered dialog, max-width 480px |
| >= 1024px | Centered dialog, max-width 480px (form) or 560px (info) |

### 8.8 Touch Spacing

| Context | Minimum Spacing |
|---------|----------------|
| Between interactive elements | `space.2` (8px) minimum |
| Touch target size | 44px × 44px minimum |
| Primary action button | Full width on mobile, auto on desktop |
| Form field height | 40px minimum (44px preferred on mobile) |

### 8.9 Responsive Rules

1. **Design mobile-first.** Start at 320px and enhance upward.
2. **Content reflows, not just shrinks.** Layouts change structure at breakpoints, not just scale.
3. **No horizontal scrolling** for primary content. Tables are the exception with explicit overflow.
4. **Touch targets are 44px minimum** in both dimensions on mobile.
5. **Hover is an enhancement.** No functionality depends on hover.
6. **Test at 320px, 360px, 390px, 480px, 768px, 1024px, 1280px.** These are the verification widths.
7. **Safe-area insets** are respected in installed PWA mode.

---

## Enhancement 9 — Accessibility Standards

### 9.1 Compliance Target

**WCAG 2.2 Level AA** is the minimum target for all surfaces, components, and interactions.

### 9.2 Contrast Requirements

| Element | Minimum Ratio | Token Pair Examples |
|---------|--------------|-------------------|
| Normal text (< 18px) | 4.5:1 | `text.primary` on `surface.default` |
| Large text (>= 18px bold, >= 24px) | 3:1 | `type.h2` on `surface.default` |
| UI components and states | 3:1 | Input borders, focus rings, icons |
| Financial data text | 4.5:1 | Balance amounts, transaction values |
| Decorative elements | No requirement | Illustrations, decorative icons |

### 9.3 Focus Management

1. **`:focus-visible`** is the required focus strategy. It provides a visible ring on keyboard navigation without cluttering pointer interactions.
2. **Focus ring specification:** `2px solid border.focus` + `shadow.focus` (3px offset).
3. **Focus order** follows logical reading order (left-to-right, top-to-bottom).
4. **Focus is trapped** within modals (dialogs, sheets) while open.
5. **Focus returns** to the trigger element when a modal closes.
6. **Skip-to-content link** is available for keyboard users at the top of each page.
7. **No focus traps** outside of modals. Users must be able to tab out of any component.

### 9.4 Keyboard Navigation

| Action | Key |
|--------|-----|
| Navigate forward | `Tab` |
| Navigate backward | `Shift + Tab` |
| Activate button/link | `Enter` or `Space` |
| Close dialog/dismiss | `Escape` |
| Navigate dropdown options | `Arrow Up/Down` |
| Select dropdown option | `Enter` |
| Open select/dropdown | `Enter` or `Space` |
| Navigate tabs | `Arrow Left/Right` |
| Navigate sidebar | `Arrow Up/Down` |

### 9.5 Reduced Motion

When `prefers-reduced-motion: reduce` is active:

| Element | Behavior |
|---------|----------|
| Transitions | Duration collapses to 0ms or 60ms maximum |
| Animations | Removed entirely |
| Skeleton shimmer | Static placeholder, no shimmer |
| Overlay entrance | Immediate appearance, no slide |
| Sidebar collapse | Instant width change |
| Chart animation | Disabled |
| Number transitions | Never animated in any mode |

### 9.6 ARIA Guidance

| Pattern | ARIA Attributes |
|---------|----------------|
| Sidebar navigation | `role="navigation"`, `aria-label="Navigasi utama"` |
| Navbar | `role="banner"` |
| Main content | `role="main"`, `aria-label="Konten utama"` |
| Dialog | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Dropdown | `role="listbox"`, `aria-expanded`, `aria-activedescendant` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Toast | `role="status"`, `aria-live="polite"` |
| Error alert | `role="alert"`, `aria-live="assertive"` |
| Loading | `aria-busy="true"` |
| Disabled | `aria-disabled="true"` (preferred over `disabled` for custom components) |
| Current page | `aria-current="page"` on active sidebar item |
| Sort indicator | `aria-sort="ascending"/"descending"` on table headers |

### 9.7 Screen Reader Labels

| Element | Label Strategy |
|---------|---------------|
| Icon-only button | `aria-label="[action]"` (e.g., "Tambah siswa") |
| Decorative icon | `aria-hidden="true"` |
| Avatar | `aria-label="[Nama Siswa]"` or `alt="[Nama Siswa]"` |
| Badge | Text is readable; no `aria-label` needed if text is visible |
| Chart | `aria-label="[chart description]"` + linked data table |
| Balance display | "Saldo: Rp [amount]" — includes unit |
| Transaction direction | Text label always visible; not color-only |

### 9.8 Minimum Touch Targets

| Element | Minimum Size |
|---------|-------------|
| Button | 44px × 44px |
| Link (inline) | No minimum, but line-height provides tap area |
| Link (standalone) | 44px × 44px |
| Input | 40px height (44px preferred on mobile) |
| Checkbox/Radio | 24px × 24px (44px tap area with padding) |
| Nav item | 40px height, full row width |
| Avatar | 24px minimum (small), 44px for interactive |

### 9.9 Accessible Charts

1. **Data table alternative:** Every chart has a visually hidden `<table>` with the same data.
2. **Chart description:** `aria-label` summarizes the chart's key insight.
3. **Keyboard navigation:** Data points are focusable; arrow keys move between points.
4. **Tooltip on focus:** Same tooltip appears on keyboard focus as on hover.
5. **Color independence:** Patterns, labels, or shapes supplement color coding.
6. **High contrast mode:** Charts remain readable in Windows High Contrast Mode.

### 9.10 Language and Localization

| Attribute | Value |
|-----------|-------|
| `lang` attribute | `id` on `<html>` element |
| Number formatting | `id-ID` locale, Rupiah (`Rp`) |
| Date formatting | Indonesian format (e.g., "31 Juli 2026") |
| Time format | 24-hour (e.g., "14:30") |
| Text direction | LTR |

---

## Enhancement 10 — Design Principles

### 10.1 Foundational Principles

These principles govern every design decision in Amanah Cash. They are non-negotiable.

#### 1. Clarity Over Decoration

Every visual element must serve comprehension. If removing an element does not reduce understanding, remove it. Decorative gradients, illustrations on operational screens, animated backgrounds, and ornamental borders add visual weight without informational value.

#### 2. Financial Information Has Highest Priority

Balance, amounts, transaction direction, and timestamps are the primary content. They occupy the most prominent position, use the largest appropriate typography, and are never obscured by overlays, glass, or decorative elements. When in doubt, make the number more readable.

#### 3. Motion Must Never Change Financial Meaning

A balance that animates from Rp 500.000 to Rp 750.000 implies a process — counting, transferring, arriving. Financial values are facts, not transitions. They appear instantly after confirmation. Motion may emphasize the container; it must never animate the value.

#### 4. Consistency Over Creativity

The same action looks the same everywhere. A deposit button in the student detail page looks identical to a deposit button on the dashboard. Consistency reduces cognitive load, builds trust, and accelerates daily use. Novelty is for marketing, not for financial software.

#### 5. Whitespace Is a Feature

Empty space is not wasted space. It creates breathing room, establishes hierarchy, and reduces cognitive load. Crowded interfaces feel anxious — the opposite of the calm trust Amanah Cash must communicate. When in doubt, add space, not elements.

#### 6. Glass Is an Accent, Not a Layout System

Liquid Glass is a premium treatment for specific moments: login, hero KPI cards, important dialogs. It is not a surface strategy. Tables, forms, lists, and regular cards remain solid. Overusing glass dilutes its impact and reduces readability.

#### 7. Premium Through Restraint, Not Complexity

Premium quality comes from disciplined typography, consistent spacing, refined proportions, and thoughtful details — not from adding more effects. A single well-designed card is more premium than five cards with gradients, shadows, and animations.

#### 8. Every Component Must Justify Its Visual Weight

Before adding a card, ask: does this need a border and shadow? Before adding a color, ask: does this need to be colored? Before adding an icon, ask: does this need an icon? The default answer is no. Add visual weight only when it improves comprehension.

#### 9. The Interface Should Feel Calm, Trustworthy, and Effortless

The operator sits with this application for hours. It should feel like a quiet, well-organized workspace — not a trading floor, not a gaming dashboard, not a marketing page. Calm surfaces, stable layouts, predictable feedback, and generous breathing room.

### 10.2 Decision Framework

When facing a design decision, apply these tests in order:

1. **Does it serve financial clarity?** If not, reconsider.
2. **Does it work at 320px?** If not, simplify.
3. **Does it work without color?** If not, add a non-color indicator.
4. **Does it work without motion?** If not, the motion is carrying too much meaning.
5. **Does it work in both themes?** If not, the design is too dependent on specific colors.
6. **Does it work with keyboard only?** If not, it is not accessible.
7. **Does it reduce cognitive load?** If not, it is adding noise.

If a decision fails any test, redesign until it passes.

### 10.3 Anti-Patterns

The following are explicitly rejected:

| Anti-Pattern | Why |
|-------------|-----|
| Dashboard widget grid with no hierarchy | Creates visual noise, no clear next action |
| Animated balance counting up | Implies a process; financial values are facts |
| Glass on every surface | Dilutes premium effect, reduces readability |
| Neon accents on dark theme | Signals gaming/crypto, not financial trust |
| Dense sidebar with 20+ items | Overwhelming; prefer progressive disclosure |
| Illustrations on empty states | Adds visual weight without operational value |
| Confetti on successful transaction | Gamifies financial work; inappropriate for the context |
| Percentage deltas on all KPIs | Not all changes are meaningful; show only when relevant |
| Pure black background | Too harsh; navy.950 provides the same depth with warmth |
| Pure white text on dark | Too stark; navy.50 is gentler for extended reading |

### 10.4 Principle Application

These principles apply at every level:

- **Token level:** Semantic tokens enforce meaning over arbitrary values.
- **Component level:** Components justify their existence and visual treatment.
- **Screen level:** Screens have one clear purpose and a primary next action.
- **System level:** The design system is a living document that grows through justified additions, not speculative expansion.

---

## Appendix F: Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-31 | Initial design system foundation document |
| 1.1 | 2026-07-31 | Added Enhancements 1–10: semantic tokens, spacing rules, elevation system, z-index scale, universal component states, empty/loading/error patterns, data visualization, responsive layout, accessibility standards, design principles |

---

## Document Cross-References

| Document | Relationship |
|----------|-------------|
| `docs/12-ui-design-system.md` | Superseded for dashboard/SaaS layout; foundational philosophy retained |
| `docs/13-design-references.md` | Updated reference direction; anti-references expanded |
| `docs/14-component-guidelines.md` | Component contracts extended for sidebar, navbar, dashboard |
| `docs/15-motion-guidelines.md` | Motion tokens expanded; principles retained |
| `docs/16-accessibility-guidelines.md` | Accessibility requirements unchanged |
| `docs/17-design-review-checklist.md` | Review criteria extended for new components |
| `docs/18-design-tokens.md` | Token architecture extended; existing primitives retained |
