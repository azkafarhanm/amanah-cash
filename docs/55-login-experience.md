# Amanah Cash — Login Experience

**Status:** Current — describes the login screen as implemented
**Last Updated:** 2026-10-16
**Source of truth:** `src/components/auth/login-experience.tsx`, `login-experience.module.css`, `hanging-lamp.tsx`, `device-activation.ts`, `webgl-perimeter-led.tsx`

This document replaces `AUTH_EXPERIENCE_SPEC.md` (v1) and `BATCH2_CHOREOGRAPHY.md` (v2). Those two contradicted each other and, in several places, the code: v2 removed the border trace and the content stagger that the implementation still uses, both named a `localStorage` key that was never shipped, and both promised reduced-motion behaviour that was never built. Where this document and the code disagree, the code wins and this document is wrong.

---

## 1. The Idea

The login screen is a dark room with a pendant lamp. Pulling the lamp's cord wakes the room: the light comes on, the brand appears under it, and the login card materialises in the lit area. The lamp is the only way in on a first visit. There is no auto-ignite, no skip button, and no timeout.

It is a one-time welcome per browser, not a ritual repeated on every visit (§4).

---

## 2. States and Choreography

The screen moves through seven phases (`RevealPhase` in `login-experience.tsx`). All timings are from the moment the lamp reports `illuminated`.

| Time | Phase | What happens |
|---|---|---|
| 0 ms | `igniting` | Bulb warms (`bulb-flicker-settle`). Veil begins to lift, ambient light begins to spread. |
| 500 ms | `spotlight` | Spotlight pool appears; the brand plaque brightens and sharpens in place (opacity 0.3 → 1, blur 1px → 0, 700 ms). |
| 1200 ms | `frame-tracing` | The card's border is traced once, clockwise from top-centre (1200 ms), then becomes a quiet border. |
| 2000 ms | `surface` | The card surface materialises (opacity and a short rise, 600 ms). |
| 2400 ms | `content` | Card contents appear one by one, 60 ms apart (340 ms each). |
| 3200 ms | `ambient` | Final state. The lamp recedes; the card is the destination. |

Room layers and their transitions: veil `opacity 1000ms`, ambient light `1400ms`, spotlight `1200ms`. Everything uses `cubic-bezier(0.16, 1, 0.3, 1)`.

**Teardown.** Pulling the cord again reverses it: card surface fades (0 ms), border un-draws and brand dims (500 ms), room goes dark (1200 ms).

**While dark,** the card is in the DOM at full layout size with `opacity: 0`, `pointer-events: none` and `aria-hidden`. Nothing shifts when it appears.

**Empty slots.** The page passes conditional children (notice, error, development accounts, help text). `Children.toArray` drops the empty ones before they are wrapped in stagger rows; wrapping them used to leave blank grid rows that still took the card's gap.

---

## 3. The Lamp

`hanging-lamp.tsx` has three states: `dark`, `igniting`, `illuminated`.

- **Pull:** drag the cord down, or focus it and press Enter or Space. Its accessible name is "Tarik untuk menyalakan lampu". The cord has `touch-action: none` so a drag on it is not taken as a scroll.
- **Announcement:** a visually hidden `aria-live="polite"` region says "Lampu menyala" or "Lampu padam".
- **Light cone:** a 1040×780 volumetric cone painted from the shade downward. It lights the brand and the card; see §5 for what that costs in contrast.

---

## 4. Returning Browsers

`device-activation.ts` stores `amanah-cash-device-activated = "activated"` in `localStorage` the first time the lamp is lit. On later visits the screen jumps straight to `ambient` **before first paint**: no dark flash, no pull required. The lamp starts illuminated and the cord still toggles it.

This is presentation only. It has nothing to do with the authentication session, which can expire or be signed out independently. Storage access is wrapped so a blocked `localStorage` falls back to the first-visit experience rather than failing.

---

## 5. Brand Plaque and Contrast

The lamp's cone paints over the brand lockup, lifting the ground behind "Cash" in the dark theme to about `rgb(153,158,146)` — roughly the luminance of the accent teal `#00C4B4`. With nothing behind it, "Cash" measured 1.06–1.46:1.

The lockup therefore sits on a **plaque**: a rounded, bordered, frosted surface (dark smoked glass in the dark theme, light glass in the light theme), tokens `--auth-plaque-*`. Alternatives were rendered and measured before this was chosen, and each failed somewhere:

| Tried | Result |
|---|---|
| A brighter teal | Tops out near 2.5:1 against the lit ground |
| Dark ink, as if the lamp lit printed letters | Fails on laptops (2.56:1); the cone is not equally bright at every width |
| Lockup moved inside the card | The card is translucent and also in the cone: 1.84–2.53:1 |
| Borderless radial scrim + text-shadow halo | Cleared 3:1 narrowly and read as a black smudge |

Measured with the plaque, five viewports, both themes: "Cash" 3.96–5.16:1 dark and 4.80–4.97:1 light; the tagline (12–14px, owes 4.5:1) 4.86–5.76:1 dark and 5.27–5.39:1 light.

**Do not** restore contrast by dimming `--auth-spotlight-core` or the cone: that dulls the lamp, which is the point of the screen. Re-measure after touching `--auth-plaque-*`, `--auth-spotlight-*`, `--color-brand-accent`, or the cone:

```
npx tsx scripts/qa-auth-contrast.ts   # needs playwright installed locally and the dev server running
```

---

## 6. Layout

- The screen is exactly one viewport (`100dvh`, `overflow: hidden`) and never scrolls.
- `overscroll-behavior: none` is set on `html` and `body` **only while this screen is mounted** (via `:has()`). Without it, Chrome on Android slid the whole page and sprang it back on a drag. App pages keep their edge bounce and pull-to-refresh.
- A protected zone keeps the lamp from overlapping the brand at every size (`--auth-logo-zone-top`, derived from rod, shade and cord heights). Short and narrow viewports scale the lamp and zone down together.
- On phones the plaque tightens and the tagline is held to one line, so the plaque does not grow and push the card off a 375×553 screen.

---

## 7. Perimeter Light

Once the card is visible, a WebGL "neon tube" light orbits its border: four ribbons, two warm amber and two teal. The full design is in `docs/54-webgl-perimeter-led-specification.md`. If WebGL is unavailable, or the user prefers reduced motion, a static outline is drawn instead.

For comparison during development, `?perimeterLedRenderer=` (`webgl`, `transform`, `svg`, …) and `?perimeterLedGlow=` select other renderers. Production uses the defaults.

---

## 8. Accessibility

| Need | Current behaviour |
|---|---|
| Keyboard | The cord is focusable and works with Enter/Space. The card is out of the tab order while dark. |
| Screen readers | Lamp state announced politely ("Lampu menyala" / "Lampu padam"). The card is `aria-hidden` while dark. |
| Reduced motion | Transitions shorten to ~200 ms or none, the lamp stops swinging and the cord stops springing, and the perimeter light is static. |
| Contrast | §5; every brand measurement clears its floor in both themes. |

**Known gaps, not yet built** (both earlier specs promised them):

- Reduced motion does **not** skip the dark room; a first-time user with reduced motion still pulls the lamp, just without the animation.
- There is no "Halaman masuk siap digunakan" announcement when the card becomes usable, and focus is not moved into the card automatically.

---

## 9. Related

- `docs/54-webgl-perimeter-led-specification.md` — the perimeter light.
- `docs/22-landing-page-strategy.md` §10 — motion rules for the unauthenticated surfaces, which this screen follows rather than `docs/15`.
- `docs/16-accessibility-guidelines.md` §5 — contrast floors used in §5.
