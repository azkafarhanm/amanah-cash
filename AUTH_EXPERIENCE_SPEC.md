# Authentication Experience Specification v1.0

## Overview

This document specifies the complete authentication experience for Amanah Cash — the interaction, lighting, choreography, and accessibility of the login page. It is the authoritative reference for implementation.

The hanging lamp is the central metaphor. Pulling the lamp wakes up the application. The experience should feel like entering a quiet workspace and preparing to begin work.

---

## 1. User Journey

### First-Time Visitor

| Step | What the user sees | What the user does |
|------|-------------------|-------------------|
| 1 | Dim room. Lamp visible. Logo faintly visible (30% opacity). Card invisible. | Looks around. Notices the lamp. |
| 2 | Lamp is the brightest element. Pull cord has a subtle sway animation. | Reaches for the cord. Pulls it. |
| 3 | Lamp ignites. Warm light spreads. Room wakes up. Logo brightens. | Watches the room come alive. |
| 4 | Login card fades in from below. Border traces. | Reads the form. |
| 5 | Buttons become interactive. | Enters credentials. Logs in. |

### Returning Visitor

| Step | What the user sees | What the user does |
|------|-------------------|-------------------|
| 1 | Fully lit room. Card visible. Buttons interactive. | Enters credentials immediately. |

The lamp pull is still available for returning users who want to re-experience it (toggles lamp on/off).

---

## 2. Emotional Journey

### First-Time Visitor

| Phase | Duration | Feeling |
|-------|----------|---------|
| Sleeping state | Until pull | "This is quiet. What do I do?" |
| Lamp discovery | 1-3 seconds | "There's a lamp. I think I should pull it." |
| Ignition | 0-1 second | "Oh — it turned on." |
| Room wakes | 1-2 seconds | "The room feels warm now." |
| Card reveals | 2-3 seconds | "The login form is ready for me." |
| Interactive | 3+ seconds | "I can begin." |

### Returning Visitor

| Phase | Duration | Feeling |
|-------|----------|---------|
| Page load | 0 seconds | "I know where I am. Let me log in." |

The returning visitor should feel that the application is ready and waiting — not that it's asleep.

---

## 3. Animation Timeline

All animations use the signature easing: `cubic-bezier(0.16, 1, 0.3, 1)` — aggressive ease-out that creates the feeling of light flooding a room.

### Sleeping State (before lamp pull)

| Element | State |
|---------|-------|
| Veil | opacity: 0.30 (light) / 0.88 (dark) |
| Ambient light | opacity: 0 |
| Spotlight | opacity: 0 |
| Logo | opacity: 0.3, no glow |
| Card | opacity: 0, translateY: 12px, pointer-events: none |
| Card buttons | pointer-events: none |
| Lamp | visible, unlit, pull cord interactive |
| Pull cord | subtle sway animation (continuous, 1100ms loop) |

### Phase 1: Ignition (0ms)

**Trigger:** Lamp pull (pointer drag ≥ 30px) or keyboard Enter/Space on cord.

| Element | Transition | Duration |
|---------|-----------|----------|
| Lamp bulb | background flicker + box-shadow bloom | 560ms |
| Ignition flash | scale 0.1 → 1.5, opacity 1 → 0 | 460ms |

### Phase 2: Room Wakes (0ms — overlaps with Phase 1)

| Element | From | To | Duration |
|---------|------|-----|----------|
| Veil | opacity 0.30 | opacity 0 | 1000ms |
| Ambient light | opacity 0 | opacity 1 | 1400ms |
| Spotlight | opacity 0 | opacity 1 | 1200ms |
| Canvas color temperature | cool-neutral | warm-neutral | 1000ms |

### Phase 3: Brand Reveals (500ms — overlaps with Phase 2)

| Element | From | To | Duration |
|---------|------|-----|----------|
| Logo opacity | 0.3 | 1 | 700ms |
| Logo drop-shadow | 0 | warm glow | 900ms |
| Brand name | opacity 0, translateY 4px | opacity 1, translateY 0 | 700ms |
| Tagline | opacity 0 | opacity 1 | 700ms (200ms delay) |

### Phase 4: Card Reveals (1000ms — overlaps with Phase 3)

| Element | From | To | Duration |
|---------|------|-----|----------|
| Card opacity | 0 | 1 | 600ms |
| Card translateY | 12px | 0 | 600ms |
| Card shadow | flat | elevated | 600ms |
| Card border | invisible | visible | 600ms |

**No scale animation.** Scale on rectangular UI elements feels artificial.

### Phase 5: Border Traces (1500ms — overlaps with Phase 4)

| Element | From | To | Duration |
|---------|------|-----|----------|
| SVG stroke-dashoffset | 2000 | 0 | 1200ms |

The trace starts from the top-center (under the lamp) and draws clockwise.

### Phase 6: Interactive (2700ms)

| Element | Change |
|---------|--------|
| Card buttons | pointer-events: auto |
| Content items | staggered fade-in (60ms each) |
| Focus | moves to first interactive element |

### Summary Timeline

```
0ms        Ignition (lamp pull)
           ├── Bulb flash (560ms)
           ├── Veil lifts (1000ms)
           ├── Ambient light (1400ms)
           └── Color temperature shift (1000ms)

500ms      Brand reveals
           ├── Logo brightens (700ms)
           ├── Brand name (700ms)
           └── Tagline (700ms, +200ms delay)

1000ms     Card reveals
           ├── Opacity + translateY (600ms)
           └── Shadow transition (600ms)

1500ms     Border traces (1200ms)

2700ms     Interactive
           └── Buttons enabled, focus management

Total: ~2.7 seconds from pull to interactive.
```

---

## 4. Lighting Behavior

### Dark Theme

The current Dark Theme atmosphere is strong. Preserve it. Only improve the choreography:

- Sleeping state: veil at 0.88 (near-darkness), lamp visible
- After ignition: veil lifts, ambient light spreads, spotlight appears
- The light cone creates a volumetric beam effect
- The card appears in the illuminated zone
- **No changes to lighting tokens.** Only changes to reveal timing and sleeping state.

### Light Theme

The Light Theme should feel like a desk lamp in a bright room. Not a spotlight. Not a vignette. A physical light source warming a workspace.

#### Physical Model

The hanging lamp is a pendant lamp at the top-center of the viewport. It emits warm light downward.

**Layer 1 — Direct cone light:**
The lamp shade creates a cone of warm light that falls on the area directly below it. This cone is the brightest zone — approximately 40-50% of the viewport width at the card level. The light is warm-white (cream/amber tones). Intensity is highest directly below the lamp and falls off toward the cone's edges. The falloff is smooth and continuous — no hard boundary.

**Layer 2 — Ambient bounce:**
Light from the cone hits the "desk surface" (the card area) and reflects upward and outward. This bounced light fills the area around the card with a softer, warmer glow. It extends beyond the direct cone but at lower intensity. This creates the "room is warm" feeling — the warmth is not confined to the card area, it spreads naturally.

**Layer 3 — Indirect fill:**
Some bounced light reaches the edges of the viewport. This is the weakest light — subtle, warm, barely perceptible. It creates the feeling that the entire room is gently warm, not just the card area. The edges are slightly warmer than before the lamp turned on, but significantly cooler than the center.

**Layer 4 — Color temperature shift:**
The entire canvas shifts from cool-neutral (#f5f3ef / #eae8e4) to warm-neutral (#f7f4ef / #ede9e3). This is a subtle hue + luminance change, not a brightness increase. The shift is strongest near the lamp (top-center) and weakest at the edges. The shift creates the perception that the room's lighting has changed, not that a filter has been applied.

**Layer 5 — Soft vignette (natural, not applied):**
The edges of the viewport are slightly cooler and darker than the center. This is a natural consequence of the light falloff from Layers 1-3 — not a separate CSS vignette mask. The falloff is continuous from warm-center to cool-edges. There is no hard boundary, no circular mask, no gradient edge.

#### Before vs After

| Element | Before (sleeping) | After (lit) |
|---------|-------------------|-------------|
| Canvas gradient | cool-neutral (#f5f3ef → #eae8e4) | warm-neutral (#f7f4ef → #ede9e3) |
| Ambient light | opacity 0 | opacity 1 — warm radial gradient, centered at top |
| Spotlight | opacity 0 | opacity 1 — warm pool around brand area |
| Veil | opacity 0.30 | opacity 0 |
| Card shadow | flat (standard) | elevated (deeper, warmer) |
| Border trace | no glow | warm drop-shadow |

#### What NOT to do

- No hard-edged spotlight circles
- No vignette mask overlays
- No bright white flash
- No color tint that looks like a filter
- No radial CSS glow that looks like a gaming effect
- No brightness increase — use color temperature, not luminance

---

## 5. Accessibility Considerations

### Reduced Motion

When `prefers-reduced-motion: reduce` is active:

- **Skip the sleeping state entirely.** The page loads in the lit state. No lamp pull required.
- All phase transitions use 200ms ease instead of the signature easing.
- No ignition flash animation.
- No pull cord sway animation.
- Border trace transition is instant (no stroke-dashoffset animation).
- Card appears immediately (opacity 1, translateY 0).

### Screen Readers

- The card has `aria-hidden="true"` during the sleeping state.
- When the card is revealed, remove `aria-hidden` and optionally move focus to the first interactive element.
- The lamp pull cord has `aria-label="Tarik untuk menyalakan lampu"` (existing).
- After the card is revealed, announce "Halaman masuk siap digunakan" (Login page ready) via a live region.

### Keyboard Navigation

- The pull cord is focusable (`tabIndex={0}`) and responds to Enter/Space (existing).
- During the sleeping state, the card is excluded from tab order via `aria-hidden="true"`.
- After the card is revealed, tab order includes all card elements.
- Focus should move to the first interactive element (email input or Google button) after the card is revealed.

### Color Contrast

- All text remains WCAG AA compliant in both sleeping and lit states.
- The sleeping state logo at 30% opacity should still meet contrast requirements against the dimmed background, or be excluded from contrast requirements (decorative).
- The lit state must maintain all existing contrast ratios.

---

## 6. Returning-User Strategy

### Mechanism

**Storage:** `localStorage`
**Key:** `amanah-cash-lamp-seen`
**Value:** `"true"` (string)
**Expiration:** None (the user has seen the experience; they don't need to see it again)

### Logic

```
IF prefers-reduced-motion: reduce
  → Load in lit state (skip sleeping state entirely)

ELSE IF localStorage "amanah-cash-lamp-seen" exists
  → Load in lit state (skip sleeping state)
  → Lamp is in "illuminated" state
  → Pull cord toggles lamp on/off (existing behavior)

ELSE
  → Load in sleeping state
  → Wait for lamp pull
  → After ignition completes, set "amanah-cash-lamp-seen" = "true"
```

### Behavior Details

- The "lit state" for returning users is identical to the final state of the first-time experience: veil lifted, ambient on, spotlight on, logo bright, card visible, buttons interactive.
- The lamp starts in the "illuminated" state (bulb on, glow active).
- The pull cord remains functional — pulling it toggles the lamp off (teardown animation), pulling again toggles it on (reveal animation).
- The teardown animation on return visits is the same as the first-time teardown.

### Clearing the Flag

The flag is never automatically cleared. If a user wants to re-experience the first-time flow, they can:
- Clear localStorage manually
- Use the browser's "clear site data" feature

This is intentional — the experience is a one-time welcome, not a recurring animation.

---

## 7. Risks and Mitigations

### Risk 1: User confusion in sleeping state

**Risk:** First-time users might not understand what to do. The card is hidden. The lamp might not be obviously interactive.

**Mitigation:**
- The lamp is the only clearly visible element in the sleeping state.
- The pull cord has a subtle continuous sway animation (existing: `lamp-sway 1100ms`).
- The cursor changes to `grab` over the cord area (existing).
- The cord knob has a subtle glow on hover (existing).

**Severity:** Medium. If the user doesn't discover the lamp within 5 seconds, they're stuck.

**Fallback:** If no interaction within 8 seconds, consider a very subtle text hint: "Tarik lampu untuk masuk" (Pull the lamp to enter) — but only as a last resort. The lamp should be discoverable without text.

### Risk 2: Layout shift on card reveal

**Risk:** The card transitions from opacity 0 to opacity 1 with translateY. If the card is not in the DOM during the sleeping state, the layout will shift.

**Mitigation:** The card IS in the DOM during the sleeping state. It has `opacity: 0` and `pointer-events: none` but occupies its full layout space. No layout shift occurs.

**Severity:** Low. Already mitigated by design.

### Risk 3: Performance on low-end devices

**Risk:** Multiple simultaneous CSS transitions (veil, ambient, spotlight, logo, card, shadow, border trace) could cause jank on low-end devices.

**Mitigation:**
- All transitions use `opacity` and `transform` only — GPU-accelerated properties.
- The veil, ambient, and spotlight are absolutely positioned and don't affect layout.
- The card's translateY is the only layout-triggering transition, and it's a single element.
- Use `will-change: opacity, transform` on the card during the reveal phase.

**Severity:** Low. The transitions are CSS-only and GPU-accelerated.

### Risk 4: Theme switching during animation

**Risk:** If the user switches between Light and Dark theme while the reveal animation is playing, the lighting tokens change mid-transition, causing a visual glitch.

**Mitigation:**
- Theme switching re-applies CSS custom properties instantly.
- The transition continues using the new token values.
- The visual result is a smooth cross-fade between themes, which is acceptable.

**Severity:** Low. Edge case with acceptable behavior.

### Risk 5: Slow network / large page

**Risk:** If the page loads slowly (large bundle, slow network), the sleeping state might look broken — the lamp might not render, or the CSS might not load.

**Mitigation:**
- The sleeping state uses only CSS — no JavaScript required for the visual state.
- The lamp component renders immediately (no lazy loading).
- The CSS is in the critical path (loaded with the page).

**Severity:** Low. The sleeping state is CSS-only and renders immediately.

### Risk 6: Repeat visit annoyance (if auto-ignite is added later)

**Risk:** If auto-ignite is added as a fallback, returning users would see the animation every time.

**Mitigation:** The returning-user strategy (localStorage flag) prevents this. Auto-ignite is NOT part of this specification.

**Severity:** N/A. Not implemented.

---

## 8. Final Recommendation

### Core Design Decision

The lamp pull is the **only** path to ignition for first-time users. There is no auto-ignite, no skip button, no timeout fallback. The lamp is the signature moment of Amanah Cash. It should be discovered, not bypassed.

For returning users, the experience is skipped entirely. The page loads in the lit state. The lamp is still interactive (toggle on/off), but it's not required to access the login form.

### Implementation Priority

| Priority | Change | Impact |
|----------|--------|--------|
| 1 | Card hidden until lamp ignifies (sleeping state) | Transforms the lamp from decorative to meaningful |
| 2 | Returning-user localStorage strategy | Prevents repeat-visit friction |
| 3 | Light Theme desk-lamp lighting | Fixes the flat Light Theme experience |
| 4 | Overlapping animation choreography | Makes the reveal feel fluid, not staged |
| 5 | Logo dimmed in sleeping state | Establishes the "room is asleep" feeling |
| 6 | Border trace warm glow (Light Theme) | Makes the trace feel illuminated |
| 7 | Button pointer-events during animation | Prevents accidental clicks |

### What NOT to Change

- Logo geometry
- Typography
- Spacing
- Card layout
- Hanging lamp mechanics (rod, shade, cord, swing)
- Dark Theme lighting tokens
- Animation easing curve
- Interaction flow (pull to toggle)

---

## Appendix: Token Changes Summary

### New Tokens (sleeping state)

| Token | Light | Dark |
|-------|-------|------|
| Logo opacity | 0.3 | 0.3 |
| Card opacity | 0 | 0 |
| Card translateY | 12px | 12px |
| Card pointer-events | none | none |
| Card aria-hidden | true | true |

### Modified Tokens (Light Theme — from previous implementation)

These are already implemented and should be preserved:

| Token | Value |
|-------|-------|
| `--auth-veil-strength` | 0.30 |
| `--auth-ambient-warm` | rgba(255, 251, 235, 0.12) |
| `--auth-ambient-teal` | rgba(45, 212, 191, 0.05) |
| `--auth-spotlight-core` | rgba(255, 252, 242, 0.16) |
| `--auth-spotlight-warm` | rgba(254, 243, 199, 0.08) |
| `--auth-spotlight-edge` | rgba(45, 212, 191, 0.05) |
| `--auth-brand-shadow` | rgba(254, 240, 200, 0.18) |
| `--auth-card-shadow` | 0 24px 48px -16px rgba(15, 23, 42, 0.24), 0 6px 16px -10px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.5) |
| `--auth-border-trace-filter` | drop-shadow(0 0 2px rgba(200, 185, 142, 0.25)) |

---

*End of Authentication Experience Specification v1.0*
