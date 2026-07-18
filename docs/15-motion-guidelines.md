# Amanah Cash — Motion Guidelines

**Version:** 1.0

**Status:** Approved

**Owner:** Project Owner
**Last Updated:** 2026-07-18

---

## 1. Purpose

Motion is supportive only. It exists to explain non-financial state change, preserve orientation, and confirm interaction. It must never communicate financial truth, decorate financial data, delay a workflow, imply unconfirmed success, or compete with content.

## 2. Motion Principles

- **Purposeful:** every animation has a stated usability reason.
- **Fast:** interaction feedback begins immediately and completes quickly.
- **Subtle:** small distance, restrained easing, low visual amplitude.
- **Interruptible:** navigation and input are never blocked by nonessential animation.
- **Truthful:** animation follows confirmed state; it does not simulate success.
- **Non-financial:** Balance values, money counting, and financial totals never animate.
- **Accessible:** reduced-motion preference is respected across the application.
- **Stable:** layout movement is minimized around Balance and forms.

## 3. Motion Tokens

Recommended starting values, pending visual review:

| Token | Duration | Use |
|-------|----------|-----|
| Instant | 0–80ms | Press/focus response |
| Fast | 120–160ms | Color, opacity, small control state |
| Standard | 180–240ms | Overlay and local content presence |
| Deliberate | 240–320ms | Rare screen-orientation transition |

Use a calm ease-out for entrances and ease-in for exits. Avoid elastic, springy, overshooting, or bouncing motion in financial workflows. Staggered animation is normally prohibited for operational lists.

## 4. Allowed Motion

- Button press feedback without changing layout.
- Focus, hover, and selected-state color transitions.
- Dialog/sheet fade with a small, non-bouncy positional shift.
- Subtle elevation, opacity, or container emphasis that does not alter financial meaning.
- Inline error reveal that preserves field position.
- Local history-page insertion when older results load, if it does not disturb scroll position.
- Skeleton-to-content crossfade when it reduces abruptness and is disabled or simplified for reduced motion.

## 5. Prohibited Motion

- Parallax, scroll-jacking, auto-playing carousels, marquees, particles, beams, animated gradients, glow loops, and cursor effects.
- Confetti, fireworks, bounce, shake, or gamified rewards for transactions.
- Continuous pulsing of balances, buttons, or status indicators.
- Count-up animation from zero for an existing Balance.
- Any interpolation, transition, or counting animation for Balance values, money, or financial totals.
- Animated reordering that obscures newest-first history.
- Swipe-only or drag-only core actions.
- Animation that delays Confirm, Retry, Back, or error reading.
- Shimmer that could be mistaken for live financial change.

## 6. Interaction Guidance

### Navigation

Use browser navigation without theatrical page transitions. If screen transitions are later approved, use a brief opacity transition or small directional shift that preserves Back/forward orientation. Do not animate both old and new screens across long distances.

### Forms

Focus and validation feedback should be immediate. Do not shake invalid inputs. Error text may fade in over the Fast duration while layout space is managed predictably.

### Overlays

Fade the backdrop and move the surface no more than a small distance. Focus is managed synchronously; users must never wait for entrance animation before typing.

### Loading

Prefer static skeleton blocks or low-contrast opacity changes. Indeterminate spinners need an accessible status. Preserve loaded content during sectional requests.

### Confirmed Transactions

Disable repeated confirmation immediately. During submission, use Button Loading and show a stable busy state. On confirmed success, return to Student Detail and immediately display the authoritative Balance and newest event. A subtle one-time container emphasis may appear, but the Balance value and other financial totals must not animate. Do not celebrate or flash the full screen.

### Failure and Unknown Outcome

Errors appear without dramatic motion. An unknown commit outcome uses calm, persistent status text and disables unsafe repeated actions. Motion must not imply either success or failure until known.

## 7. Reduced Motion

- Respect `prefers-reduced-motion` globally.
- Configure the motion library to use the user's reduced-motion preference.
- Remove transform and layout animation when reduced motion is requested.
- Keep essential state changes immediate; opacity may be used sparingly when it does not delay comprehension.
- Disable shimmer and nonessential progress motion. Financial number interpolation is prohibited in every motion mode.
- The product must remain fully understandable with all motion removed.

## 8. Performance Rules

- Prefer opacity and transform where motion is necessary.
- Avoid animating width, height, top, left, or expensive filters in scrolling lists.
- Do not add Motion for React solely for a hover or color transition that CSS can handle.
- Import only required capabilities and verify bundle impact.
- Test on representative low-to-mid-range mobile hardware, not only desktop development machines.
- No animation may degrade search input, scrolling, keyboard response, or the documented workflow targets.

## 9. Motion Review Record

Every nontrivial animation must record:

- component and trigger;
- user-facing purpose;
- duration/easing/token;
- interruption behavior;
- reduced-motion equivalent;
- effect on focus and screen-reader announcements;
- performance evidence on mobile;
- reviewer approval.

If its purpose cannot be stated in one sentence, remove it.
