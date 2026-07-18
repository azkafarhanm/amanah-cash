# Amanah Cash — Design Tokens

**Version:** 1.1

**Status:** Approved

**Owner:** Project Owner
**Last Updated:** 2026-07-18

---

## 1. Purpose and Authority

This document defines the Mini Design System token architecture for Amanah Cash. It extends `docs/12-ui-design-system.md` and is the single source of truth for every visual value used by the MVP interface and Landing Page.

Amanah Cash is a daily financial management application for boarding school operators. It is information-first, mobile-first, PWA-first, calm, professional, minimal, and trust-oriented. It must not resemble a startup landing page, marketing website, crypto dashboard, or flashy fintech product.

No screen, component, utility class, inline style, animation, or third-party component may introduce a visual value directly. Implementation must resolve every visual decision through this hierarchy:

```text
Primitive tokens
      ↓
Semantic tokens
      ↓
Component tokens
      ↓
Screen tokens
```

Only Primitive tokens contain raw values. Semantic tokens assign meaning. Component tokens define reusable UI contracts. Screen tokens compose components for a specific approved screen. A higher layer must reference a lower layer; it must not copy its raw value.

## 2. Product Identity Principles

### 2.1 Calm Before Color

Neutral grayscale carries most of the interface. Color communicates action, direction, focus, warning, error, or confirmed status. It is never applied merely to decorate a surface or make the product appear more energetic.

### 2.2 Information Before Decoration

Student identity, Balance, transaction direction, Amount, timestamp, and outcome are the primary visual content. Whitespace, typography, alignment, and borders establish hierarchy before cards, color, effects, or shadow.

### 2.3 Financial Truth Is Immediate

Balance, Amount, totals, and Transaction values are authoritative. After successful persistence they update immediately. They never count, interpolate, crossfade between numbers, or use motion to suggest financial change. Motion may briefly emphasize a containing surface after the value is already correct.

### 2.4 Motion Supports Attention

Motion guides attention, reinforces hierarchy, and clarifies non-financial transitions. It never implies success before persistence, never creates artificial confidence, and never substitutes animation for a clear state or message.

### 2.5 Quiet Confidence

Reliability comes from consistent structure, legible type, exact values, restrained color, and predictable feedback. Playful, trendy, glossy, ornamental, or novelty effects are outside the Amanah Cash visual language.

## 3. Naming and Implementation Rules

- Use dot notation in documentation and platform-appropriate aliases in code, for example `color.neutral.900` → `--color-neutral-900`.
- Components consume Component or Semantic tokens. Screens consume Screen, Component, or Semantic tokens.
- Raw hexadecimal colors, pixel values, font declarations, shadows, opacity, z-index, and timing values are prohibited outside the Primitive layer.
- Tailwind configuration and shadcn/ui variables must alias these tokens rather than create a parallel system.
- A missing visual value requires a token proposal and review. Do not use an arbitrary value.
- Dark mode is not defined. Only the approved light theme may be implemented.
- Financial values never use animation tokens to interpolate, count, or transition between numbers.

## 4. Primitive Tokens

### 4.1 Color Primitives

#### Neutral grayscale

| Token | Value |
|-------|-------|
| `color.neutral.0` | `#FFFFFF` |
| `color.neutral.25` | `#FCFCFD` |
| `color.neutral.50` | `#F9FAFB` |
| `color.neutral.100` | `#F3F4F6` |
| `color.neutral.200` | `#E5E7EB` |
| `color.neutral.300` | `#D1D5DB` |
| `color.neutral.400` | `#9CA3AF` |
| `color.neutral.500` | `#6B7280` |
| `color.neutral.600` | `#4B5563` |
| `color.neutral.700` | `#374151` |
| `color.neutral.800` | `#1F2937` |
| `color.neutral.900` | `#111827` |
| `color.neutral.950` | `#030712` |

#### Emerald success and Deposit

| Token | Value |
|-------|-------|
| `color.emerald.50` | `#ECFDF5` |
| `color.emerald.100` | `#D1FAE5` |
| `color.emerald.200` | `#A7F3D0` |
| `color.emerald.500` | `#10B981` |
| `color.emerald.600` | `#059669` |
| `color.emerald.700` | `#047857` |
| `color.emerald.800` | `#065F46` |
| `color.emerald.900` | `#064E3B` |

#### Professional blue primary, Withdrawal, and information

| Token | Value |
|-------|-------|
| `color.blue.50` | `#EFF6FF` |
| `color.blue.100` | `#DBEAFE` |
| `color.blue.500` | `#3B82F6` |
| `color.blue.600` | `#2563EB` |
| `color.blue.700` | `#1D4ED8` |
| `color.blue.800` | `#1E40AF` |

`color.blue.600` is the primary action color and `color.blue.700` is its hover state. This blue is calm and familiar without the high saturation or glow treatments associated with startup and crypto interfaces. It supports operational confidence while allowing financial content to remain visually dominant.

#### Amber warning

| Token | Value |
|-------|-------|
| `color.amber.50` | `#FFFBEB` |
| `color.amber.100` | `#FEF3C7` |
| `color.amber.500` | `#F59E0B` |
| `color.amber.700` | `#B45309` |
| `color.amber.800` | `#92400E` |

#### Red error

| Token | Value |
|-------|-------|
| `color.red.50` | `#FEF2F2` |
| `color.red.100` | `#FEE2E2` |
| `color.red.500` | `#EF4444` |
| `color.red.600` | `#DC2626` |
| `color.red.700` | `#B91C1C` |
| `color.red.800` | `#991B1B` |

#### Transparent

| Token | Value |
|-------|-------|
| `color.transparent` | `transparent` |
| `color.overlay.scrim` | `rgba(3, 7, 18, 0.48)` |

### 4.2 Typography Primitives

| Token | Value |
|-------|-------|
| `font.family.sans` | `Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| `font.family.mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` |
| `font.weight.regular` | `400` |
| `font.weight.medium` | `500` |
| `font.weight.semibold` | `600` |
| `font.weight.bold` | `700` |
| `font.size.12` | `0.75rem` |
| `font.size.14` | `0.875rem` |
| `font.size.16` | `1rem` |
| `font.size.18` | `1.125rem` |
| `font.size.20` | `1.25rem` |
| `font.size.24` | `1.5rem` |
| `font.size.32` | `2rem` |
| `font.size.40` | `2.5rem` |
| `font.size.48` | `3rem` |
| `font.size.56` | `3.5rem` |
| `line.height.16` | `1rem` |
| `line.height.20` | `1.25rem` |
| `line.height.24` | `1.5rem` |
| `line.height.28` | `1.75rem` |
| `line.height.32` | `2rem` |
| `line.height.40` | `2.5rem` |
| `line.height.48` | `3rem` |
| `line.height.56` | `3.5rem` |
| `line.height.64` | `4rem` |
| `line.height.heading-tight` | `1.1` |
| `line.height.heading` | `1.2` |
| `line.height.body` | `1.5` |
| `letter.spacing.normal` | `0` |
| `letter.spacing.tight` | `-0.01em` |

Geist is the primary typeface because its neutral forms, clear numerals, compact headings, and high screen legibility support an information-first financial interface without adding a promotional or editorial personality. Headings use 110–120% line-height; body and supporting copy use 150% line-height for repeated daily reading.

### 4.3 Spacing Primitives

The base rhythm is 8 points. Intermediate 4-, 6-, 12-, and 20-point values exist only for control anatomy and fine alignment.

| Token | Value |
|-------|-------|
| `space.0` | `0` |
| `space.0_5` | `0.125rem` / 2px |
| `space.1` | `0.25rem` / 4px |
| `space.1_5` | `0.375rem` / 6px |
| `space.2` | `0.5rem` / 8px |
| `space.3` | `0.75rem` / 12px |
| `space.4` | `1rem` / 16px |
| `space.5` | `1.25rem` / 20px |
| `space.6` | `1.5rem` / 24px |
| `space.8` | `2rem` / 32px |
| `space.10` | `2.5rem` / 40px |
| `space.12` | `3rem` / 48px |
| `space.16` | `4rem` / 64px |
| `space.24` | `6rem` / 96px |

### 4.4 Size Primitives

| Token | Value |
|-------|-------|
| `size.4` | `1rem` / 16px |
| `size.5` | `1.25rem` / 20px |
| `size.6` | `1.5rem` / 24px |
| `size.10` | `2.5rem` / 40px |
| `size.11` | `2.75rem` / 44px |
| `size.12` | `3rem` / 48px |
| `size.14` | `3.5rem` / 56px |
| `size.content.80` | `20rem` / 320px |
| `size.content.160` | `40rem` / 640px |
| `size.content.192` | `48rem` / 768px |
| `size.content.240` | `60rem` / 960px |
| `size.content.300` | `75rem` / 1200px |

### 4.5 Radius Primitives

| Token | Value |
|-------|-------|
| `radius.none` | `0` |
| `radius.sm` | `0.25rem` / 4px |
| `radius.md` | `0.5rem` / 8px |
| `radius.lg` | `0.75rem` / 12px |
| `radius.xl` | `1rem` / 16px |
| `radius.full` | `9999px` |

The nested radius system is deliberate: Inputs and Buttons use `radius.md` (8px), Cards and persistent grouped surfaces use `radius.lg` (12px), and Dialogs/Sheets use `radius.xl` (16px). Increasing radius with containment makes hierarchy understandable without playful pill shapes or decorative framing.

### 4.6 Border Primitives

| Token | Value |
|-------|-------|
| `border.width.none` | `0` |
| `border.width.default` | `1px` |
| `border.width.emphasis` | `2px` |
| `border.style.default` | `solid` |

### 4.7 Elevation and Shadow Primitives

| Token | Value |
|-------|-------|
| `elevation.base` | `0` |
| `elevation.raised` | `1` |
| `elevation.overlay` | `2` |
| `shadow.none` | `none` |
| `shadow.medium` | `0 8px 24px rgba(17, 24, 39, 0.10)` |
| `shadow.large` | `0 20px 48px rgba(17, 24, 39, 0.18)` |
| `shadow.focus` | `0 0 0 3px rgba(37, 99, 235, 0.28)` |

Default Cards and persistent financial surfaces use `shadow.none` with `color.border.default`. `shadow.medium` is reserved for an interactive hover state where elevation clarifies that a surface can be acted on. `shadow.large` is reserved for Dialogs and Sheets above a scrim. Excessive shadows make persistent information appear detached, layered, or promotional; that ambiguity weakens trust in financial software.

### 4.8 Opacity Primitives

| Token | Value |
|-------|-------|
| `opacity.0` | `0` |
| `opacity.40` | `0.40` |
| `opacity.60` | `0.60` |
| `opacity.80` | `0.80` |
| `opacity.100` | `1` |

### 4.9 Z-Index Primitives

| Token | Value |
|-------|-------|
| `z.base` | `0` |
| `z.raised` | `10` |
| `z.sticky` | `20` |
| `z.scrim` | `40` |
| `z.overlay` | `50` |
| `z.toast` | `60` |

### 4.10 Animation Primitives

| Token | Value |
|-------|-------|
| `motion.duration.none` | `0ms` |
| `motion.duration.instant` | `80ms` |
| `motion.duration.fast` | `140ms` |
| `motion.duration.standard` | `200ms` |
| `motion.duration.deliberate` | `280ms` |
| `motion.ease.standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `motion.ease.exit` | `cubic-bezier(0.4, 0, 1, 1)` |
| `motion.distance.small` | `0.25rem` / 4px |
| `motion.distance.medium` | `0.5rem` / 8px |

### 4.11 Breakpoint Primitives

Breakpoints express composition changes, not device detection.

| Token | Value |
|-------|-------|
| `breakpoint.tablet` | `48rem` / 768px |
| `breakpoint.desktop` | `64rem` / 1024px |
| `breakpoint.wide` | `80rem` / 1280px |

## 5. Semantic Tokens

### 5.1 Color Semantics

| Token | References | Meaning |
|-------|------------|---------|
| `color.background.canvas` | `color.neutral.50` | Application background |
| `color.background.surface` | `color.neutral.0` | Primary surface |
| `color.background.subtle` | `color.neutral.100` | Quiet grouped surface |
| `color.background.scrim` | `color.overlay.scrim` | Modal backdrop |
| `color.text.primary` | `color.neutral.900` | Primary content |
| `color.text.secondary` | `color.neutral.600` | Supporting content |
| `color.text.tertiary` | `color.neutral.500` | Low-emphasis metadata |
| `color.text.inverse` | `color.neutral.0` | Text on strong fills |
| `color.border.default` | `color.neutral.200` | Standard boundary |
| `color.border.strong` | `color.neutral.300` | Emphasized boundary |
| `color.border.focus` | `color.blue.600` | Keyboard focus |
| `color.action.primary` | `color.blue.600` | Calm professional primary action |
| `color.action.primary.hover` | `color.blue.700` | Primary hover |
| `color.action.primary.subtle` | `color.blue.50` | Quiet action surface |
| `color.status.success` | `color.emerald.500` | Success indicator (`#10B981` at Primitive layer) |
| `color.status.warning` | `color.amber.500` | Warning indicator (`#F59E0B` at Primitive layer) |
| `color.status.error` | `color.red.500` | Error indicator (`#EF4444` at Primitive layer) |
| `color.deposit.foreground` | `color.emerald.800` | Deposit meaning |
| `color.deposit.background` | `color.emerald.50` | Deposit surface |
| `color.withdrawal.foreground` | `color.blue.800` | Withdrawal meaning, never danger |
| `color.withdrawal.background` | `color.blue.50` | Withdrawal surface |
| `color.success.foreground` | `color.emerald.800` | Confirmed success |
| `color.success.background` | `color.emerald.50` | Confirmed success surface |
| `color.warning.foreground` | `color.amber.800` | Recoverable attention |
| `color.warning.background` | `color.amber.50` | Warning surface |
| `color.error.foreground` | `color.red.700` | Error content |
| `color.error.background` | `color.red.50` | Error surface |
| `color.disabled.foreground` | `color.neutral.400` | Disabled content |
| `color.disabled.background` | `color.neutral.100` | Disabled surface |

### 5.2 Typography Semantics

| Token | Family / size / line / weight / tracking |
|-------|-------------------------------------------|
| `type.balance` | `font.family.sans` / `font.size.40` / `line.height.heading` / `font.weight.bold` / `letter.spacing.tight` |
| `type.screen-title` | `font.family.sans` / `font.size.24` / `line.height.heading` / `font.weight.bold` / `letter.spacing.tight` |
| `type.section-title` | `font.family.sans` / `font.size.18` / `line.height.heading` / `font.weight.semibold` / `letter.spacing.normal` |
| `type.body` | `font.family.sans` / `font.size.16` / `line.height.body` / `font.weight.regular` / `letter.spacing.normal` |
| `type.body-strong` | `font.family.sans` / `font.size.16` / `line.height.body` / `font.weight.semibold` / `letter.spacing.normal` |
| `type.label` | `font.family.sans` / `font.size.14` / `line.height.body` / `font.weight.semibold` / `letter.spacing.normal` |
| `type.supporting` | `font.family.sans` / `font.size.14` / `line.height.body` / `font.weight.regular` / `letter.spacing.normal` |
| `type.caption` | `font.family.sans` / `font.size.12` / `line.height.body` / `font.weight.medium` / `letter.spacing.normal` |
| `type.button` | `font.family.sans` / `font.size.16` / `line.height.20` / `font.weight.semibold` / `letter.spacing.normal` |
| `type.money` | `font.family.sans` with tabular numerals / `font.size.16` / `line.height.24` / `font.weight.semibold` / `letter.spacing.normal` |

### 5.3 Layout, Shape, and Motion Semantics

| Token | References |
|-------|------------|
| `layout.gutter.mobile` | `space.4` |
| `layout.gutter.wide` | `space.6` |
| `layout.content.max` | `size.content.160` |
| `layout.section.gap` | `space.8` |
| `layout.related.gap` | `space.4` |
| `layout.inline.gap` | `space.2` |
| `control.height.minimum` | `size.11` |
| `control.height.default` | `size.12` |
| `control.height.prominent` | `size.14` |
| `shape.control` | `radius.md` |
| `shape.container` | `radius.lg` |
| `shape.overlay` | `radius.xl` |
| `border.control` | `border.width.default` + `border.style.default` + `color.border.default` |
| `focus.visible` | `border.width.emphasis` + `color.border.focus` + `shadow.focus` |
| `elevation.surface` | `elevation.base` + `shadow.none` |
| `elevation.hover` | `elevation.raised` + `shadow.medium` |
| `elevation.temporary` | `elevation.overlay` + `shadow.large` |
| `motion.feedback` | `motion.duration.fast` + `motion.ease.standard` |
| `motion.presence` | `motion.duration.standard` + `motion.ease.standard` |
| `motion.exit` | `motion.duration.fast` + `motion.ease.exit` |
| `motion.reduced` | `motion.duration.none` |

`:focus-visible` is the required focus strategy. It gives keyboard and assistive-technology users a strong, consistent location cue without adding persistent focus decoration to pointer interactions. Do not remove the browser focus outline unless `focus.visible` is applied as an accessible replacement.

### 5.4 Landing Page Semantics

| Token | References | Use |
|-------|------------|-----|
| `landing.canvas` | `color.background.canvas` | Page background |
| `landing.surface` | `color.background.surface` | Evidence and content surface |
| `landing.surface-subtle` | `color.background.subtle` | Quiet section separation |
| `landing.content.max` | `size.content.300` | Main page container |
| `landing.copy.max` | `size.content.160` | Long-form readable copy |
| `landing.copy.narrow` | `size.content.80` | Short supporting copy |
| `landing.section.padding-mobile` | `space.12` | Mobile section padding |
| `landing.section.padding-tablet` | `space.16` | Tablet section padding |
| `landing.section.padding-desktop` | `space.24` | Desktop section padding |
| `landing.section.gap` | `space.8` | Major internal groups |
| `landing.content.gap` | `space.4` | Related content |
| `landing.grid.gap` | `space.6` | Columns and cards |
| `landing.hero.title-mobile` | `font.family.sans` / `font.size.40` / `line.height.heading-tight` / `font.weight.bold` / `letter.spacing.tight` | Mobile Hero title |
| `landing.hero.title-tablet` | `font.family.sans` / `font.size.48` / `line.height.56` / `font.weight.bold` / `letter.spacing.tight` | Tablet Hero title |
| `landing.hero.title-desktop` | `font.family.sans` / `font.size.56` / `line.height.64` / `font.weight.bold` / `letter.spacing.tight` | Desktop Hero title |
| `landing.section.title` | `font.family.sans` / `font.size.32` / `line.height.heading` / `font.weight.bold` / `letter.spacing.tight` | Section headings |
| `landing.lead` | `font.family.sans` / `font.size.18` / `line.height.body` / `font.weight.regular` / `letter.spacing.normal` | Hero and section lead |
| `landing.eyebrow` | `type.label` + `color.text.secondary` | Optional section context, never decorative jargon |
| `landing.focus` | `focus.visible` | All interactive focus |
| `landing.reveal` | `motion.duration.standard` + `motion.ease.standard` + `motion.distance.medium` | Scroll reveal ceiling |

## 6. Component Tokens

| Component token | References |
|-----------------|------------|
| `button.primary.background` | `color.action.primary` |
| `button.primary.background-hover` | `color.action.primary.hover` |
| `button.primary.foreground` | `color.text.inverse` |
| `button.secondary.background` | `color.background.surface` |
| `button.secondary.foreground` | `color.text.primary` |
| `button.secondary.border` | `border.control` |
| `button.disabled.background` | `color.disabled.background` |
| `button.disabled.foreground` | `color.disabled.foreground` |
| `button.height.default` | `control.height.default` |
| `button.height.prominent` | `control.height.prominent` |
| `button.padding-inline` | `space.4` |
| `button.gap` | `space.2` |
| `button.radius` | `shape.control` |
| `button.focus-visible` | `focus.visible` |
| `input.background` | `color.background.surface` |
| `input.foreground` | `color.text.primary` |
| `input.placeholder` | `color.text.tertiary` |
| `input.border` | `border.control` |
| `input.focus-visible` | `focus.visible` |
| `input.height` | `control.height.default` |
| `input.padding-inline` | `space.3` |
| `input.radius` | `shape.control` |
| `student-row.background` | `color.background.surface` |
| `student-row.border` | `border.control` |
| `student-row.padding-block` | `space.4` |
| `student-row.padding-inline` | `space.0` |
| `student-row.content-gap` | `space.2` |
| `student-row.elevation-default` | `elevation.surface` |
| `student-row.elevation-hover` | `elevation.hover` |
| `transaction-item.padding-block` | `space.4` |
| `transaction-item.gap` | `space.3` |
| `balance-panel.background` | `color.background.subtle` |
| `balance-panel.padding` | `space.6` |
| `balance-panel.radius` | `shape.container` |
| `balance-panel.border` | `border.control` |
| `balance-panel.elevation` | `elevation.surface` |
| `empty-state.icon-size` | `size.6` |
| `empty-state.gap` | `space.3` |
| `empty-state.padding-block` | `space.12` |
| `alert.padding` | `space.4` |
| `alert.gap` | `space.3` |
| `alert.radius` | `shape.control` |
| `overlay.scrim` | `color.background.scrim` |
| `overlay.background` | `color.background.surface` |
| `overlay.radius` | `shape.overlay` |
| `overlay.padding` | `space.6` |
| `overlay.elevation` | `elevation.temporary` |
| `skeleton.background` | `color.neutral.200` |
| `skeleton.radius` | `radius.sm` |
| `landing.nav.height` | `size.14` |
| `landing.nav.background` | `landing.canvas` |
| `landing.nav.border` | `border.control` |
| `landing.cta.height` | `button.height.prominent` |
| `landing.cta.radius` | `button.radius` |
| `landing.card.background` | `landing.surface` |
| `landing.card.border` | `border.control` |
| `landing.card.radius` | `shape.container` |
| `landing.card.padding` | `space.6` |
| `landing.card.elevation` | `elevation.surface` |
| `landing.card.elevation-hover` | `elevation.hover` |
| `landing.preview.background` | `landing.surface` |
| `landing.preview.border` | `border.control` |
| `landing.preview.radius` | `shape.container` |
| `landing.preview.padding-mobile` | `space.2` |
| `landing.preview.padding-wide` | `space.4` |
| `landing.faq.divider` | `border.control` |
| `landing.footer.border` | `border.control` |

## 7. Screen Tokens

| Screen token | References |
|--------------|------------|
| `screen.shell.background` | `color.background.canvas` |
| `screen.shell.content-max` | `layout.content.max` |
| `screen.shell.gutter-mobile` | `layout.gutter.mobile` |
| `screen.shell.gutter-wide` | `layout.gutter.wide` |
| `screen.header.padding-block` | `space.5` |
| `screen.header.content-gap` | `space.3` |
| `screen.student-list.section-gap` | `space.6` |
| `screen.student-list.row-gap` | `space.0` |
| `screen.student-detail.section-gap` | `layout.section.gap` |
| `screen.student-detail.action-gap` | `space.3` |
| `screen.transaction.section-gap` | `space.6` |
| `screen.transaction.action-gap` | `space.3` |
| `screen.empty.max-width` | `size.content.80` |
| `screen.overlay.desktop.max-width` | `size.content.80` |
| `screen.overlay.mobile.radius-top` | `shape.overlay` |
| `landing.screen.background` | `landing.canvas` |
| `landing.screen.content-max` | `landing.content.max` |
| `landing.screen.gutter-mobile` | `layout.gutter.mobile` |
| `landing.screen.gutter-wide` | `layout.gutter.wide` |
| `landing.preview.max-width` | `size.content.240` |
| `landing.faq.max-width` | `size.content.192` |
| `landing.final-cta.max-width` | `size.content.192` |

## 8. Responsive Token Application

- At 320px–480px, use `screen.shell.gutter-mobile`.
- Above 480px, use `screen.shell.gutter-wide` while retaining one column.
- Content never exceeds `screen.shell.content-max` and remains centered.
- Desktop does not introduce sidebar, dashboard grid, or multi-column workflow.
- Mobile browser and installed PWA overlays use the bottom-Sheet screen tokens. Desktop/web overlays use the centered-Dialog screen tokens.

## 9. Token Governance

Before adding or changing a token, verify:

1. An existing token cannot express the need.
2. The value serves more than an isolated styling preference, or it is an approved Screen token.
3. Semantic meaning remains separate from the Primitive value.
4. Contrast and accessibility remain valid.
5. All affected Component and Screen aliases are identified.
6. Visual regression coverage is updated.

Deprecated tokens must be aliased during migration and removed only after no consumer remains.
