# AMANAH CASH — IDENTITY VALIDATION PROTOCOL v1.0

## 0. Protocol Purpose

This document defines objective, measurable tests to determine whether the Amanah Cash visual identity (Concept 19.9 mark + lockups) is production-ready.

Every test has:
- A **method** (what to do)
- **pass criteria** (measurable threshold)
- **fail criteria** (what disqualifies)
- **sample size** (minimum subjects or observations)

No test relies on subjective preference. All criteria are binary or threshold-based.

---

## PHASE I — RECOGNITION TESTS

### TEST R-1: Monogram Recognition (Unaided)

**Question:** "What letter or symbol do you see?"

**Method:** Display the mark at 96px on white background for 3 seconds. Remove. Ask the question. Record verbatim response.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | ≥70% of subjects say "A" or "triangle" within the first response |
| **CONDITIONAL** | 50–69% say "A" or "triangle" |
| **FAIL** | <50% say "A" or "triangle" |

**Sample size:** 30 subjects (non-designers, mixed demographics, age 22–60).

---

### TEST R-2: A-Discovery (Aided)

**Question:** "There is a letter hidden in this logo. Can you find it?"

**Method:** Display the mark at 96px. No time limit. Record time-to-discovery. Record the letter identified.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | ≥85% identify "A" within 15 seconds |
| **CONDITIONAL** | 70–84% identify "A" within 15 seconds |
| **FAIL** | <70% identify "A" within 15 seconds, or subjects identify a different letter |

**Sample size:** 30 subjects.

---

### TEST R-3: Checkmark Discovery (Aided)

**Question:** "There is a second meaning hidden in this logo — it relates to checking or verification. Can you find it?"

**Method:** Display the mark at 96px. No time limit. Record time-to-discovery. Record what they identify.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | ≥50% identify the chevron as a checkmark-related gesture within 30 seconds |
| **CONDITIONAL** | 30–49% identify it within 30 seconds |
| **FAIL** | <30% identify it within 30 seconds |

**Note:** The checkmark reading is a tertiary discovery. A lower pass threshold is acceptable because the mark's primary identity does not depend on this reading.

**Sample size:** 30 subjects.

---

### TEST R-4: Category Guess (Unaided)

**Question:** "What type of company or product do you think this logo belongs to?"

**Method:** Display the mark + wordmark at presentation size. Record the industry/category guessed.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | ≤20% of subjects guess "crypto," "gaming," "energy drink," or "fashion" |
| **FAIL** | >20% guess any rejected category |

**Sample size:** 30 subjects.

---

## PHASE II — MEMORABILITY TESTS

### TEST M-1: One-Hour Recall (Silhouette)

**Method:** Display the mark at 96px for exactly 1 second. Remove. Wait 60 minutes (fill with unrelated tasks). Ask subjects to sketch the logo from memory on a blank card.

**Scoring:** Two independent judges rate each sketch on a 0–3 scale:
- 0 = No resemblance
- 1 = Correct overall shape (triangle), no internal detail
- 2 = Correct shape + indication of internal feature (slot/V/chevron)
- 3 = Correct shape + correctly placed V-shaped or chevron internal feature

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | Median score ≥2.0 across all subjects |
| **CONDITIONAL** | Median score 1.5–1.9 |
| **FAIL** | Median score <1.5 |

**Sample size:** 30 subjects. Two judges. Inter-rater reliability: Cohen's kappa ≥0.7 required.

---

### TEST M-2: Five-Minute Recognition (Multiple Choice)

**Method:** Display the mark at 96px for 1 second. Remove. Wait 5 minutes. Show a sheet of 12 similar geometric marks (the mark plus 11 distractors — triangles with various internal features). Ask subjects to identify which one they saw.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | ≥80% select the correct mark |
| **CONDITIONAL** | 65–79% select correctly |
| **FAIL** | <65% select correctly |

**Distractor requirements:** Distractors must be triangles with internal horizontal slots, vertical slots, circles, or chevrons at different angles. At least 3 distractors must be visually similar (triangle + downward chevron).

**Sample size:** 30 subjects.

---

### TEST M-3: Confusion Test (Against Generic Triangle)

**Method:** Show subjects the mark and a plain equilateral triangle (both at 96px) side by side for 2 seconds. Remove. Ask: "Were these the same logo or different?"

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | ≥95% say "different" |
| **FAIL** | <95% say "different" |

**Sample size:** 30 subjects.

---

## PHASE III — SCALABILITY TESTS

### TEST S-1: 16px Recognition

**Method:** Render the mark at exactly 16×16px on a white background. Display on a standard 96-DPI monitor (not Retina/HiDPI). Ask 5 subjects: "What is this?" Record verbatim.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | ≥3 of 5 subjects identify it as a recognizable shape (not "a dot" or "nothing") |
| **CONDITIONAL** | 2 of 5 |
| **FAIL** | ≤1 of 5 |

**Additional objective criterion:** Capture a screenshot at 16px. Measure the chevron slot pixel count. The slot must produce ≥3 distinct background-colored pixels (vertically) for the V to register.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | ≥3 distinct background pixels in the chevron region |
| **FAIL** | <3 distinct pixels (chevron is invisible) |

---

### TEST S-2: 16px vs 48px Fidelity

**Method:** Render the mark at 16px and 48px on the same screen. Ask 5 subjects: "Is this the same logo?"

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | All 5 say "yes" |
| **FAIL** | Any subject says "no" |

---

### TEST S-3: Print Scalability

**Method:** Print the mark at 8mm, 12mm, 20mm, and 40mm on uncoated paper using a standard laser printer (600 DPI minimum). Photograph each print at 1:1 with a macro lens. Two judges assess whether the chevron V is visible at each size.

| Criterion | Threshold |
|-----------|-----------|
| **PASS at 12mm** | Both judges confirm V is visible |
| **PASS at 20mm** | Both judges confirm V and corner radii are visible |
| **FAIL at 12mm** | Either judge cannot see the V |

**Acceptable:** Fail at 8mm (below minimum print size).

---

### TEST S-4: Embroidery Reproduction

**Method:** Embroider the mark at 25mm on black pique cotton using white thread, standard 75/11 needle, 0.4mm stitch density. Photograph at 1:1.

Two judges assess: (a) Is the chevron band visible as two distinct thread edges? (b) Is the V shape recognizable? (c) Are the corner radii visible?

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | (a) AND (b) confirmed by both judges |
| **CONDITIONAL** | (b) only — V visible but band edges merge |
| **FAIL** | Neither (a) nor (b) |

---

## PHASE IV — COMPETITOR COMPARISON

### TEST C-1: Category Differentiation (Side-by-Side)

**Method:** Place the mark alongside 6 competitor marks in the same size row (48px each):

1. Stripe (S-curve)
2. Linear (diagonal in circle)
3. Vercel (triangle)
4. Notion (cube-N)
5. Mercury Banking (geometric M)
6. Ramp (geometric R)

Ask 10 subjects: "Which of these logos is the most unique?"

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | The Amanah mark is selected by ≥2 subjects |
| **CONDITIONAL** | Selected by 1 subject |
| **FAIL** | Selected by 0 subjects |

**Note:** This test does not require the mark to "win" — it requires the mark to be perceptually competitive with the category leaders.

---

### TEST C-2: Confusion with Vercel

**Method:** Show the Amanah mark and the Vercel triangle (both at 48px) side by side for 2 seconds. Ask: "Are these the same logo?"

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | ≥90% say "different" |
| **CONDITIONAL** | 80–89% say "different" |
| **FAIL** | <80% say "different" |

**Sample size:** 30 subjects.

---

### TEST C-3: Trademark Conflict Search

**Method:** Conduct a visual trademark search using the USPTO TESS and EUIPO eSearch+ databases. Search criteria: geometric triangle marks with internal features in IC 036 (financial services).

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | No registered mark with visual similarity score >70% in IC 036 |
| **CONDITIONAL** | 1–2 marks with similarity 60–70% — requires legal review |
| **FAIL** | Any mark with similarity >70% that is also a triangle + chevron/slot |

---

## PHASE V — USER PERCEPTION STUDIES

### TEST P-1: Brand Attribute Association (Semantic Differential)

**Method:** Display the mark + wordmark for 10 seconds. Then present a semantic differential scale (7-point) for each attribute pair:

| Pair | Left (1) | Right (7) |
|------|----------|-----------|
| 1 | Cheap | Premium |
| 2 | Amateur | Professional |
| 3 | Untrustworthy | Trustworthy |
| 4 | Complicated | Simple |
| 5 | Outdated | Timeless |
| 6 | Aggressive | Calm |
| 7 | Playful | Serious |
| 8 | Generic | Unique |

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | Mean score ≥5.0 on: Premium, Professional, Trustworthy, Calm |
| **PASS** | Mean score ≥5.0 on: Timeless, Serious |
| **CONDITIONAL** | Mean score 4.0–4.9 on any required attribute |
| **FAIL** | Mean score <4.0 on any of: Trustworthy, Professional, Premium |

**Sample size:** 30 subjects (target audience: finance/education professionals, age 28–55).

---

### TEST P-2: Emotional Response (Open-Ended)

**Method:** Display the mark alone (no wordmark) at 96px for 5 seconds. Ask: "What is the first word that comes to mind?"

Record all responses. Categorize into: Trust/Security, Finance/Banking, Tech/Software, Other, Negative.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | ≥30% of responses fall in Trust/Security or Finance/Banking |
| **CONDITIONAL** | 20–29% |
| **FAIL** | <20%, OR ≥15% of responses are negative words (e.g., "sharp," "weapon," "danger") |

**Sample size:** 30 subjects.

---

### TEST P-3: Polo Shirt Curiosity Test

**Method:** Print the mark (white on black) at 30mm on a polo shirt. Wear the polo in a public setting for 1 hour. Count the number of people who glance at the logo for >1 second (notable visual attention).

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | ≥3 notable glances per hour in a professional environment |
| **CONDITIONAL** | 1–2 glances |
| **FAIL** | 0 glances |

**Note:** This test requires ethical compliance — subjects should not be identifiable. Count only public-space observations. This test is recommended but optional if field conditions are impractical.

---

## PHASE VI — ACCESSIBILITY CHECKS

### TEST A-1: WCAG Color Contrast

**Method:** Measure contrast ratios for all approved color pairings using a color contrast analyzer.

| Pairing | Required Ratio | PASS Threshold |
|---------|---------------|----------------|
| Mark #0F0F0F on #FFFFFF | Normal text (4.5:1) | 4.5:1 ✓ |
| Mark #F5F5F5 on #0F0F0F | Normal text (4.5:1) | 4.5:1 ✓ |
| Mark #14A89B on #FFFFFF | Large text/UI (3:1) | 3.0:1 |
| Mark #FFFFFF on #14A89B | Large text/UI (3:1) | 3.0:1 |

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | All four pairings meet or exceed required ratios |
| **FAIL** | Any pairing below threshold |

---

### TEST A-2: Color Independence (Daltonism)

**Method:** Render the mark in four daltonism simulation modes (Protanopia, Deuteranopia, Tritanopia, Achromatopsia) using a simulation tool (e.g., Sim Daltonism, Coblis).

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | The chevron void remains visible (as a brightness difference) in all four modes |
| **FAIL** | The chevron void becomes indistinguishable from the solid mass in any mode |

**Note:** Because the mark relies on figure-ground (mass vs. void) rather than color differentiation, it should pass inherently. The test confirms this.

---

### TEST A-3: Screen Reader Accessibility

**Method:** Load the mark in a screen reader test environment (NVDA + Firefox, VoiceOver + Safari). Verify that the SVG's `aria-label="Amanah Cash"` and `role="img"` are announced.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | Screen reader announces "Amanah Cash, graphic" on both platforms |
| **FAIL** | Screen reader announces filename, alt text, or nothing |

---

### TEST A-4: Reduced Motion (Animation Context)

**Method:** If the mark appears in any animated context (loading, page transition), verify that `prefers-reduced-motion: reduce` disables all animation. The mark must render in its final state instantly.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | All animation respects `prefers-reduced-motion` |
| **FAIL** | Any animation continues when reduced motion is requested |

---

### TEST A-5: High Contrast Mode (Windows)

**Method:** Enable Windows High Contrast Mode. Load the mark in Chrome and Edge. Verify the mark renders using the system high-contrast colors.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | Mark renders in system foreground color on system background |
| **CONDITIONAL** | Mark renders but loses chevron detail |
| **FAIL** | Mark does not render at all |

---

## PHASE VII — MANUFACTURING VALIDATION

### TEST F-1: Laser Engraving

**Method:** Laser engrave the mark at 20mm on anodized aluminum (Type II, black) using a fiber laser at 20W, 30kHz, 200mm/s. Photograph at 1:1 with raking light.

Two judges assess: (a) Is the chevron void visible? (b) Are the corner radii clean? (c) Is the apex sharp?

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | All three criteria confirmed by both judges |
| **CONDITIONAL** | (a) confirmed, (b) or (c) marginal |
| **FAIL** | (a) not confirmed |

---

### TEST F-2: Blind Deboss

**Method:** Create a magnesium die of the mark at 30mm. Deboss into vegetable-tanned leather (2mm) at 5 tons pressure for 3 seconds. Photograph at 1:1.

Two judges assess: (a) Is the overall triangle recognizable? (b) Is the chevron impression visible? (c) Is the band distinguishable from a single groove?

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | (a) AND (b) confirmed |
| **CONDITIONAL** | (a) confirmed, (b) marginal — band reads as single groove |
| **FAIL** | (a) not confirmed |

---

### TEST F-3: Foil Stamp

**Method:** Foil stamp the mark at 20mm using gold foil on black uncoated cardstock. Photograph at 1:1.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | Chevron void is visible as the cardstock color showing through the gold |
| **CONDITIONAL** | Chevron void is marginal — band edges partially merge |
| **FAIL** | Chevron void is invisible — solid gold triangle only |

---

### TEST F-4: Screen Print (Single Color)

**Method:** Screen print the mark at 40mm using white ink on navy cotton (200gsm). Use a 90T mesh screen. Photograph at 1:1.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | Chevron void is clean — no ink bleed into the slot |
| **CONDITIONAL** | Minor ink bleed at chevron edges — V still recognizable |
| **FAIL** | Ink fills the slot — solid triangle only |

---

### TEST F-5: CNC Routing (Large Format)

**Method:** CNC route the mark at 300mm into 18mm plywood using a 6mm flat bit. Photograph at 1:1 and at distance.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | Chevron void is cleanly routed. Corner radii are smooth (no tear-out). Apex is crisp. |
| **CONDITIONAL** | Minor tear-out at inner vertex — V still recognizable |
| **FAIL** | Tear-out destroys chevron definition |

---

## PHASE VIII — DIGITAL RENDERING

### TEST D-1: Cross-Browser SVG Rendering

**Method:** Load the mark SVG in: Chrome (latest), Firefox (latest), Safari (latest), Edge (latest), Samsung Internet (latest). Screenshot at 48px and 320px. Compare pixel-by-pixel.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | No rendering differences across browsers (anti-aliasing variance ≤1px acceptable) |
| **FAIL** | Any browser shows broken path, missing void, or distortion |

---

### TEST D-2: Subpixel Rendering (Low-DPI)

**Method:** Render the mark at 16px on a 96-DPI Windows display with ClearType enabled. Capture at native resolution (no scaling). Count distinct background pixels in the chevron slot region.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | ≥3 background pixels visible in the V region |
| **CONDITIONAL** | 2 pixels |
| **FAIL** | ≤1 pixel |

---

### TEST D-3: HiDPI / Retina Rendering

**Method:** Render the mark at 16px (logical) / 32px (physical) on a Retina display. Capture at physical resolution. Assess whether the chevron vertex and corner radii resolve cleanly.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | Chevron vertex and r=4 corners are both visible |
| **CONDITIONAL** | Chevron visible, corners sub-pixel |
| **FAIL** | Neither visible |

---

## PHASE IX — LOCKUP INTEGRITY

### TEST L-1: Lockup Proportion Consistency

**Method:** Measure the mark-to-wordmark ratio in every lockup variant (primary, secondary, vertical, horizontal, dark, light). Calculate mark_height / wordmark_cap_height.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | Ratio is between 1.25 and 1.35 across all lockups |
| **FAIL** | Ratio varies by more than ±0.05 between any two lockups |

---

### TEST L-2: Lockup Clear Space

**Method:** Measure the gap between the mark's rightmost edge and the wordmark's leftmost edge in horizontal lockups. Express as a percentage of mark height.

| Criterion | Threshold |
|-----------|-----------|
| **PASS** | Gap is between 20% and 30% of mark height |
| **FAIL** | Gap is <20% (cramped) or >30% (disconnected) |

---

## SCORING SUMMARY

### Production-Ready Criteria

The identity is **PRODUCTION-READY** if ALL of the following are met:

| Category | Required Passes |
|----------|----------------|
| Recognition (Phase I) | R-1 PASS, R-2 PASS, R-4 PASS (R-3 may be CONDITIONAL) |
| Memorability (Phase II) | M-1 PASS, M-2 PASS, M-3 PASS |
| Scalability (Phase III) | S-1 PASS or CONDITIONAL, S-2 PASS, S-3 PASS at 12mm |
| Competitor (Phase IV) | C-2 PASS, C-3 PASS (C-1 may be CONDITIONAL) |
| Perception (Phase V) | P-1 PASS on Trustworthy + Professional + Premium |
| Accessibility (Phase VI) | A-1 PASS, A-2 PASS, A-3 PASS |
| Manufacturing (Phase VII) | F-1 PASS, F-4 PASS (at least 2 of 5 physical tests PASS) |
| Digital (Phase VIII) | D-1 PASS |
| Lockup (Phase IX) | L-1 PASS, L-2 PASS |

### Conditional/Needs-Work Criteria

The identity is **CONDITIONAL** if:
- 1–3 tests are at CONDITIONAL level (none FAIL)
- The failing tests have identified fixes (e.g., pixel-snapped favicon, watermark variant)

### Not-Ready Criteria

The identity is **NOT READY** if:
- Any test in Recognition (R-1, R-2), Memorability (M-1, M-2), or Accessibility (A-1, A-2, A-3) is FAIL
- 4+ tests are at CONDITIONAL level
- Any manufacturing test (F-1 through F-5) is FAIL with no identified fix

---

## APPENDIX: Test Execution Checklist

```
PHASE I — Recognition (Week 1)
☐ R-1: Recruit 30 subjects, prepare display
☐ R-2: Same subject pool
☐ R-3: Same subject pool
☐ R-4: Same subject pool

PHASE II — Memorability (Week 1)
☐ M-1: Prepare distractor sheet (12 marks)
☐ M-2: Same
☐ M-3: Same

PHASE III — Scalability (Week 2)
☐ S-1: 16px render on 96-DPI monitor
☐ S-2: 16px + 48px comparison
☐ S-3: Print test at 4 sizes
☐ S-4: Embroidery order

PHASE IV — Competitor (Week 2)
☐ C-1: Prepare competitor sheet
☐ C-2: Prepare Vercel comparison
☐ C-3: Trademark search

PHASE V — Perception (Week 3)
☐ P-1: Semantic differential survey
☐ P-2: Open-ended response
☐ P-3: Polo shirt field test

PHASE VI — Accessibility (Week 3)
☐ A-1: Color contrast analysis
☐ A-2: Daltonism simulation
☐ A-3: Screen reader test
☐ A-4: Reduced motion test
☐ A-5: Windows high contrast

PHASE VII — Manufacturing (Week 3–4)
☐ F-1: Laser engraving order
☐ F-2: Deboss die + leather
☐ F-3: Foil stamp order
☐ F-4: Screen print order
☐ F-5: CNC routing order

PHASE VIII — Digital (Week 4)
☐ D-1: Cross-browser screenshots
☐ D-2: Subpixel capture
☐ D-3: Retina capture

PHASE IX — Lockup (Week 4)
☐ L-1: Ratio measurement
☐ L-2: Gap measurement
```

---

*End of Validation Protocol v1.0*
