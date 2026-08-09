# Authentication Experience — Batch 2 Choreography Specification v2

## Overview

The room wakes up because the user turned on the lamp. Every visual change is a consequence of that single action. Nothing is decorative. Nothing is timed. Everything is caused.

The experience must feel like a real room responding to a real lamp — not a CSS animation sequence playing in order.

**Total duration: ≤ 1800ms from pull to interactive.**

---

## 1. What Changed from v1

| v1 Problem | v2 Fix |
|-----------|--------|
| 2700ms total — too long for a login page | ≤ 1800ms — fast enough for daily use |
| Ignition flash (200ms white burst) — theatrical | Removed — bulb warms from amber to white, no flash |
| Logo lifts 8px — no physical cause | Removed — logo brightens and sharpens in place |
| Border trace 1200ms — decorative, no narrative | Removed — the card has a CSS border already |
| Content stagger — UI convention, not lighting | Removed — content appears with the card |
| Settling period (300ms) — padding | Removed — animations end when they end |
| Same experience for returning users | Returning users: instant load, no sleeping state |
| No reduced motion handling | Reduced motion: skip sleeping state, instant lit state |
| No anticipation on lamp pull | Added 80ms anticipation before bulb responds |

---

## 2. Timeline

All times measured from the moment the lamp pull is detected.

```
0ms ─────────────────────────────────────────── 1800ms

LAMP IGNITION
0ms         Pull detected. Lamp begins to anticipate.
80ms        Bulb filament begins to warm (amber glow at core).
200ms       Filament reaches temperature. Glow spreads.
350ms       Bulb settled to steady warm white.

ROOM TRANSFORMATION
80ms        Veil begins to lift.
80ms        Ambient warmth begins to appear.
200ms       Color temperature shift begins.
500ms       Veil fully lifted.
700ms       Ambient warmth settled.
900ms       Color temperature shift complete.

LOGO REVEAL
300ms       Logo begins to brighten (opacity 0.3 → 1.0).
300ms       Logo begins to sharpen (blur 1px → 0).
800ms       Logo fully settled.

CARD REVEAL
700ms       Card begins to materialize (opacity 0 → 1).
700ms       Card begins to rise (translateY 12px → 0).
700ms       Card shadow begins to deepen.
1300ms      Card fully materialized.

CONTENT + INTERACTIVE
1300ms      Card content visible (no stagger).
1300ms      Buttons become interactive.
1400ms      Focus moves to first interactive element.
```

**Total: 1400ms from pull to interactive.**

The 1800ms is the buffer — the latest anything could still be settling. The user is typing by 1400ms.

---

## 3. Parallel Animation Map

```
TIME    0    300   600   900   1200  1500  1800
        │     │     │     │     │     │     │
LAMP    ██████████▓▓                                  filament warming
        │     │     │     │     │     │     │
VEIL      ██████████████████                          dimness recedes
        │     │     │     │     │     │     │
AMBIENT     ████████████████████                      warm halo
        │     │     │     │     │     │     │
COLOR         ██████████████████████                  cool → warm
        │     │     │     │     │     │     │
LOGO            ██████████████████                    brighten + sharpen
        │     │     │     │     │     │     │
CARD                    ████████████████              materialize + rise
        │     │     │     │     │     │     │
CONTENT                               █               content visible
        │     │     │     │     │     │     │
ACTIVE                                █               buttons enabled
        │     │     │     │     │     │     │
FOCUS                                   █             focus management
```

**Key overlaps:**
- Lamp warming overlaps with veil lift (80ms gap — the light starts before the room fully responds)
- Logo reveal overlaps with ambient spread (brand appears as room brightens)
- Card materializes while the ambient is still settling (the card appears in the illuminated zone)
- Content and buttons activate simultaneously (no stagger — the card is ready)

---

## 4. Physical Lighting Behavior

### 4.1 Anticipation (0–80ms)

The lamp pull has been detected. The lamp does not respond immediately. There is an 80ms pause — the physical delay between pulling a cord and the filament beginning to warm. This pause creates anticipation. The user pulled the lamp and is waiting. The pause makes the subsequent response feel earned, not instant.

During the pause, the lamp cord springs back (existing spring animation). The room is still dark.

### 4.2 Ignition (80–350ms)

The bulb filament warms. There is no flash. Incandescent filaments do not flash — they warm from dark to amber to white over 200-300ms. The existing `bulb-flicker-settle` animation handles this: the glow starts dim and warm, overshoots slightly, then settles to steady state.

The bulb glow is a sphere of warm light. The lamp shade blocks upward and lateral emission. The light exits through the shade's open bottom mouth, directed downward.

### 4.3 Room Brightens (80–900ms)

**Veil lift (80–500ms):**
The dimness recedes from the center outward. The veil lifts quickly — the room was dark, and now it's not. The easing is aggressive: fast onset, gentle settle. The veil is the most impactful visual change and should complete within 500ms.

**Ambient warmth (80–700ms):**
A warm halo appears around the lamp. This is the light's first visible effect on the environment. The halo is soft, continuous, and warm — the feeling of light falling on a surface. The halo extends from the lamp area downward, covering the brand and card zones.

**Color temperature shift (200–900ms):**
The canvas shifts from cool-neutral to warm-neutral. The shift follows the light's falloff — strongest near the lamp, weakest at the edges. The shift is subtle: a hue change, not a brightness change. The user perceives "the room became warmer," not "the room became brighter."

### 4.4 Logo Responds to Light (300–800ms)

The logo was dim and slightly blurred — as if seen in low light. As the ambient warmth reaches the brand area, the logo becomes clear and bright.

- **Brightness** increases: the logo is illuminated. Not a CSS animation — the logo being lit.
- **Blur** decreases: the logo comes into focus as light makes it legible.
- **No movement.** The logo does not lift, slide, or scale. It was always in the right position. Light reveals it where it is.
- **No drop-shadow.** The sleeping state has no glow. The lit state has no glow. The logo is illuminated by the room's ambient light, not by a CSS drop-shadow.

### 4.5 Card Materializes (700–1300ms)

The direct cone light reaches the card area. The card, which was invisible (opacity 0) and slightly below its final position (translateY 12px), becomes visible and rises into place.

- **Opacity** increases: the card becomes visible because light is falling on it.
- **translateY** decreases: the card rises 12px into its final position. This is the card settling into the illuminated zone — not a decorative animation.
- **Shadow** deepens: the card's shadow becomes more defined as the light intensifies. The shadow's warmth increases (the ambient light's color temperature influences the shadow). The card feels three-dimensional.

The card has a CSS border. It is always visible when the card is visible. There is no separate border trace animation.

### 4.6 Content and Interaction (1300ms)

The card's content is visible when the card is visible. There is no stagger animation. The content does not need to "respond to light" — it is part of the card, and the card has been illuminated.

The buttons become interactive at 1300ms. The user can immediately type and click.

---

## 5. Emotional Journey

| Phase | Time | Emotion | Duration |
|-------|------|---------|----------|
| **Pull** | 0ms | Curiosity | 80ms |
| **Anticipation** | 0–80ms | Tension | 80ms |
| **Ignition** | 80–350ms | Surprise | 270ms |
| **Room brightens** | 80–900ms | Warmth | 820ms |
| **Logo appears** | 300–800ms | Recognition | 500ms |
| **Card materializes** | 700–1300ms | Trust | 600ms |
| **Interactive** | 1300ms | Readiness | 0ms |

**Emotional arc:**

```
Curiosity (80ms) → Surprise (270ms) → Warmth + Recognition (500ms) → Trust (600ms) → Readiness (0ms)
```

**What the user feels:**

- **First 500ms:** "The lamp turned on. The room is warm. I can see the logo." — Engagement. The lamp pull was rewarded.
- **500–1300ms:** "The card is appearing. I can see the login form." — Trust. The workspace is being prepared.
- **1300ms:** "I can type now." — Readiness. No waiting. No stagger. The workspace is ready.

**What the user does NOT feel:**
- Waiting for a border to trace
- Watching content items stagger in
- Waiting for animations to finish
- Wondering when they can type

---

## 6. Motion Principles

### Principle 1: Light leads. Everything follows.

No visual change occurs before the light reaches it. The lamp ignites first. The room brightens next. The logo appears as light reaches it. The card appears as light reaches the workspace. The sequence is always: light → response.

### Principle 2: Nothing decorative.

Every animation must have a physical cause. If an animation exists only because it looks cool, remove it. The border trace was removed because light doesn't draw borders. The content stagger was removed because light doesn't reveal list items one by one. The flash was removed because incandescent bulbs don't flash.

### Principle 3: Nothing teleports.

Every position change is smooth and continuous. The card rises 12px. The logo was always in place. No element jumps.

### Principle 4: The user's time is sacred.

Every millisecond of animation must earn its place. If an animation doesn't change the user's understanding or emotional state, it doesn't exist. The total experience is ≤ 1400ms because every remaining animation earns its time.

### Principle 5: Anticipation makes response feel physical.

The lamp has an 80ms anticipation before responding. The user pulls, waits a beat, then the lamp responds. This makes the response feel like a physical process, not a UI trigger.

### Principle 6: Overlap creates fluidity.

Animations overlap. The logo begins appearing while the room is still brightening. The card begins materializing while the ambient is still settling. The overlaps create a single, continuous experience — not a sequence of steps.

### Principle 7: One easing curve.

`cubic-bezier(0.16, 1, 0.3, 1)` for all transitions. Fast onset, gentle settle. Like light flooding a room. Consistency creates cohesion — every element responds with the same physics.

Exception: the card's translateY uses `cubic-bezier(0.25, 0.1, 0.25, 1)` (gentle ease-out) because the card is a heavier object settling into position. Heavier objects decelerate more gradually.

### Principle 8: Nothing competes with the lamp.

During ignition (0–350ms), the lamp is the only thing changing. The room doesn't start brightening until the lamp has responded. The lamp's moment is sacred.

Exception: the veil lift starts at 80ms (20ms before the lamp's first visible change). This is acceptable because the veil lift is imperceptible in the first 100ms — it only becomes visible after 200ms, well after the lamp has started responding.

### Principle 9: The experience adapts to the user.

- **First visit:** Full experience. Lamp pull required. 1400ms from pull to interactive.
- **Returning visit:** No sleeping state. Page loads in lit state. 0ms to interactive.
- **Reduced motion:** No sleeping state. Instant lit state. No animations. 0ms to interactive.

### Principle 10: The room is ready when the card is ready.

The experience ends when the card is materialized and interactive. There is no settling period, no stagger, no delay. The card appears, the content is visible, the buttons work. The room is ready.

---

## 7. Accessibility

### Reduced Motion (`prefers-reduced-motion: reduce`)

- Skip the sleeping state entirely. Page loads in lit state.
- All transitions use 100ms ease (instant for practical purposes).
- No lamp anticipation. No ignition animation. No veil lift.
- Card appears immediately with opacity 1, translateY 0.
- Focus management: focus moves to first interactive element on page load.

### Screen Readers

- Card has `aria-hidden="true"` during sleeping state.
- When card is revealed, `aria-hidden` is removed.
- After card is revealed, announce "Halaman masuk siap digunakan" via live region.
- Focus moves to first interactive element after reveal.

### Keyboard

- Lamp pull cord is focusable (`tabIndex={0}`) and responds to Enter/Space.
- During sleeping state, card is excluded from tab order via `aria-hidden`.
- After card is revealed, tab order includes all card elements.

---

## 8. Returning Users

### Mechanism

- `localStorage` key: `amanah-cash-lamp-seen`
- Value: `"true"`
- Set after: card is fully materialized (1300ms after pull)
- Check: on page load, before rendering

### Behavior

```
IF prefers-reduced-motion: reduce
  → Load in lit state (no sleeping state)

ELSE IF localStorage "amanah-cash-lamp-seen" exists
  → Load in lit state (no sleeping state)
  → Lamp in "illuminated" state
  → Pull cord toggles lamp on/off

ELSE
  → Load in sleeping state
  → Full experience
  → Set flag after card materializes
```

---

## 9. Performance

### Simultaneous Transitions

At peak, 6 CSS transitions run simultaneously (800ms mark):
- Veil opacity
- Ambient opacity
- Logo opacity
- Logo filter (brightness + blur)
- Card opacity
- Card translateY

All transitions use `opacity` and `transform` — GPU-accelerated properties. The transitions are CSS-only, not JavaScript-driven.

### Low-End Devices

If the device cannot maintain 60fps:
- Reduce transition count by combining logo properties into a single opacity transition
- Remove the color temperature shift (most expensive — requires background gradient transition)
- The veil lift and card materialize are the minimum required transitions

---

## 10. What v2 Removed

| Removed | Why |
|---------|-----|
| Ignition flash (200ms white burst) | Theatrical. Real bulbs don't flash. |
| Logo translateY (8px → 0) | No physical cause. Logo should brighten in place. |
| Border trace (1200ms SVG animation) | Decorative. Light doesn't draw borders. The card has a CSS border. |
| Content stagger (60ms per item) | UI convention, not lighting. Content appears with the card. |
| Settling period (300ms) | Padding. Animations end when they end. |
| 10 motion principles | Consolidated to 8. Removed descriptions masquerading as principles. |

## 11. What v2 Added

| Added | Why |
|-------|-----|
| Anticipation (80ms before bulb responds) | Makes the lamp pull feel physical. |
| Returning user strategy (localStorage) | Prevents friction for daily users. |
| Reduced motion handling | Accessibility requirement. |
| Card easing differentiation (gentler ease-out) | Heavy objects settle differently than light. |
| Content appears with card (no stagger) | The card IS the workspace. Content is part of it. |

---

*End of Batch 2 Choreography Specification v2*
