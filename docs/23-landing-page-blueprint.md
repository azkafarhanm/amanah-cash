# Amanah Cash — Landing Page Blueprint

**Version:** 1.0

**Status:** Implementation Specification

**Owner:** Project Owner
**Last Updated:** 2026-07-18

---

## 1. Purpose and Authority

This document translates the approved Landing Page Strategy into the visual and interaction specification for design and implementation. It defines composition, responsive behavior, component roles, token usage, motion, accessibility, and section-level implementation rules. It does not finalize copy, create assets, authorize product capabilities, or replace product requirements.

Authority order:

1. approved product requirements and Business Rules;
2. `docs/22-landing-page-strategy.md` for positioning, audience, narrative, claims, and strategic guardrails;
3. `docs/18-design-tokens.md` for visual values;
4. `docs/15-motion-guidelines.md`, `docs/16-accessibility-guidelines.md`, and `docs/20-interaction-states.md` for behavior;
5. this blueprint for Landing Page composition.

If this document conflicts with a higher authority, the higher authority wins. Designers and developers must not resolve a conflict by inventing copy, product behavior, evidence, or visual values.

## 2. Blueprint Principles

- Preserve the narrative sequence: curiosity, recognition, relief, confidence, trust, action.
- Make the product understandable before asking for action.
- Use authentic product evidence as the primary marketing asset.
- Apply Calm Before Color and Information Before Decoration.
- Establish premium character through spacing, Geist typography, composition, hierarchy, and restrained motion.
- Encourage exploration, product understanding, and real usage. Do not introduce purchase-oriented journeys or commercial sections.
- Use one dominant idea and one primary action per section.
- Keep all claims, screenshots, workflows, and destinations truthful to the implemented product.
- Never animate Balance, Amount, totals, transaction values, or any financial truth.
- No visual value may bypass the approved token architecture.

## 3. Approved Landing Page Token References

All Landing Page Primitive, Semantic, Component, and Screen tokens are approved and defined only in `docs/18-design-tokens.md`. This Blueprint consumes those canonical tokens and does not define visual values or a parallel extension registry.

The Landing Page uses the canonical Primitive additions `size.content.192`, `size.content.240`, `size.content.300`, `font.size.48`, `font.size.56`, `line.height.56`, `line.height.64`, `space.24`, `breakpoint.tablet`, `breakpoint.desktop`, and `breakpoint.wide`. Every Landing Page Semantic, Component, and Screen alias is referenced explicitly by name in the section specifications and defined only in `docs/18-design-tokens.md`. If a Blueprint requirement cannot be expressed with an existing approved token, implementation must stop and follow Design Tokens Section 9; it must not introduce a local constant.

## 4. Global Page Anatomy

```text
Skip link
Header / primary navigation
Main
 ├─ Hero
 ├─ Problems
 ├─ Solution
 ├─ Workflow
 ├─ Application Preview
 ├─ Features
 ├─ Security & Trust
 ├─ FAQ
 └─ Final CTA
Footer
```

The page is a single narrative, not an admin layout. It has no sidebar. Use a centered content area with one-column reading order; desktop uses the section-specific column layouts defined in Section 6 without changing semantic order.

### 4.1 Header and Navigation

- Desktop navigation uses one product identity link, in-page links to Workflow, Features, and FAQ in that order, and one primary CTA.
- Tablet and mobile navigation use one product identity link and one primary CTA. In-page links are omitted; no disclosure menu or modal menu is used.
- Keep the header in normal flow by default. Sticky behavior requires evidence that it improves navigation and must use `z.sticky`, `landing.nav.background`, and `landing.nav.border`.
- Anchor navigation must account for the header, move focus predictably, and preserve browser history behavior.
- CTA labels and destinations remain subject to Project Owner approval.

### 4.2 Shared Section Composition

- Each section uses one `h2`, optional eyebrow, concise lead, and evidence/content region.
- Section wrappers use `landing.section.padding-mobile`, `landing.section.padding-tablet`, and `landing.section.padding-desktop` at their corresponding breakpoints; inner containers use `landing.screen.content-max`, `landing.screen.gutter-mobile`, and `landing.screen.gutter-wide`.
- Persistent cards use borders, not default shadows. Hover elevation is allowed only for genuinely interactive cards.
- Icons come from Lucide and support—not replace—labels.
- Decorative elements are CSS/token-driven structural shapes. No coins, currency symbols, fake charts, stock imagery, or ornamental illustrations.

Section surfaces are fixed:

| Page area | Surface token |
|-----------|---------------|
| Header and Hero | `landing.canvas` |
| Problems | `landing.surface-subtle` |
| Solution | `landing.canvas` |
| Workflow | `landing.surface` |
| Application Preview | `landing.surface-subtle` |
| Features | `landing.canvas` |
| Security & Trust | `landing.surface-subtle` |
| FAQ | `landing.canvas` |
| Final CTA | `landing.surface-subtle` |
| Footer | `landing.canvas` |

## 5. Responsive Blueprint

### 5.1 Mobile: Below `breakpoint.tablet`

- Design source order first; all sections use one column.
- Use `landing.screen.gutter-mobile` and `landing.section.padding-mobile`.
- CTA groups stack full-width; the primary action precedes the secondary action.
- Product screenshots remain fully legible without horizontal page scrolling. Mobile product previews use the vertical stack defined in Section 6.5.
- Hide purely decorative supporting shapes before reducing content or product evidence.
- Maintain `control.height.minimum` for every target and at least `space.2` between adjacent targets.

### 5.2 Tablet: `breakpoint.tablet` to Below `breakpoint.desktop`

- Use `landing.screen.gutter-wide` and `landing.section.padding-tablet`.
- Preserve single-column narrative flow. Problems and Features use two-column grids; Solution pairs and Workflow remain stacked.
- Hero content remains above the preview.
- An unmatched final grid item spans the full row.

### 5.3 Desktop: `breakpoint.desktop` and Above

- Center content within `landing.screen.content-max`; use `landing.screen.gutter-wide`.
- Hero uses a balanced copy/preview split. Copy remains the first semantic and visual entry point.
- Problem/Solution comparisons use two columns, Workflow uses three columns, and Features uses three columns. Do not create dashboard-style grids.
- Keep paragraphs constrained by `landing.copy.max`; wide containers are for composition, not long line lengths.
- `breakpoint.wide` changes outer breathing room only; it must not add content or alter narrative order.

### 5.4 Reflow and Zoom

- Support 320px CSS width and 200% zoom without loss of content, action, or meaning.
- No section depends on fixed height, absolute text placement, or viewport-locked animation.
- Browser text resizing must not clip navigation, CTAs, FAQ answers, or mockup captions.
- Landscape and mobile browser chrome changes must not hide primary actions.

## 6. Section Specifications

### 6.1 Hero

**Purpose:** Establish product category, teacher relevance, primary benefit, and the safest next action in the first view.

**User Goal:** Determine quickly what Amanah Cash does, whether it is relevant, and where to learn more or begin.

**Visual Hierarchy:** Product identity/navigation → optional factual eyebrow → outcome-led `h1` → explanatory lead → primary CTA → secondary evidence CTA → authentic product preview. Do not place statistics, badges, or a feature list above the preview.

**Desktop Layout:** Two-column composition. Copy occupies the calmer leading column; the product preview remains fully within the evidence column with one quiet structural background shape behind it. Align the CTA group beneath the lead. Keep the preview subordinate to the headline but large enough to read.

**Tablet Layout:** Stack copy above the preview.

**Mobile Layout:** One column: headline, lead, CTA group, preview. Primary CTA is full-width; secondary CTA follows with lower emphasis. Decorative elements are hidden.

**Spacing:** Use `landing.section.padding-mobile`, `landing.section.padding-tablet`, and `landing.section.padding-desktop` at their corresponding breakpoints; title-to-lead uses `landing.content.gap`; lead-to-actions uses `space.6`; actions use `layout.inline.gap`; actions-to-preview uses `landing.section.gap` when stacked.

**Components:** Header, eyebrow text, heading, lead, primary Button, secondary Button or text action, approved screenshot frame, optional Lucide directional icon, decorative tokenized shape.

**Design Tokens:** `landing.hero.title-mobile`, `landing.hero.title-tablet`, `landing.hero.title-desktop`, `landing.cta.height`, `landing.cta.radius`, `landing.preview.background`, `landing.preview.border`, `landing.preview.radius`, `landing.preview.padding-mobile`, `landing.preview.padding-wide`, `landing.canvas`, `color.text.primary`, `color.text.secondary`, `button.primary.background`, `button.primary.background-hover`, `button.primary.foreground`, `button.secondary.background`, `button.secondary.foreground`, `button.secondary.border`, `landing.focus`.

**Motion:** Optional text groups reveal in reading order with `landing.reveal`; CTAs are available immediately. The preview may use one fade with a short translation using `landing.reveal`. Decorative elements remain static.

**Accessibility:** One `h1`; visible skip link precedes navigation; CTA names describe destinations; screenshot has meaningful alt text or adjacent caption when informative; decoration is hidden from accessibility APIs.

**Interaction Rules:** Primary CTA follows the approved product entry flow. Secondary CTA moves to Workflow or Application Preview. No auto-scroll, forced focus, autoplay, or purchase-oriented action.

**Implementation Notes:** Do not finalize copy in this document. The Hero is content-driven and has no fixed viewport height. Reserve screenshot geometry to avoid layout shift. Render meaningful content without JavaScript; enhancement may add motion afterward.

### 6.2 Problems

**Purpose:** Create recognition through respectful, familiar operational difficulties.

**User Goal:** See that the product understands scattered records, repeated calculation, slow lookup, unclear direction, and difficult explanation.

**Visual Hierarchy:** Section heading → empathetic lead → three to five concise problem statements → optional factual transition to Solution.

**Desktop Layout:** Two-column composition with section introduction in one column and a vertical problem list in the other. Avoid a wall of identical cards.

**Tablet Layout:** Introduction above a two-column problem grid.

**Mobile Layout:** One vertical list. Each item uses icon, short title, and one supporting statement.

**Spacing:** Section padding uses `landing.section.padding-mobile`, `landing.section.padding-tablet`, and `landing.section.padding-desktop`; items use `landing.card.padding` and `landing.grid.gap`; icon-to-text uses `space.3`.

**Components:** Section header, problem list, Lucide icons, bordered list items or separators.

**Design Tokens:** `landing.surface-subtle`, `landing.card.background`, `landing.card.border`, `landing.card.radius`, `landing.card.padding`, `landing.card.elevation`, `landing.section.title`, `type.body`, `color.text.primary`, `color.text.secondary`.

**Motion:** One restrained list reveal per group. Do not stagger so slowly that later problems wait for visibility.

**Accessibility:** Use a semantic list. Icons are decorative when titles carry meaning. Do not use color or motion to imply severity.

**Interaction Rules:** Problems are non-interactive unless a real contextual link exists. No carousels, hover-only explanations, fear prompts, or urgency devices.

**Implementation Notes:** Problem wording must respect manual processes and operators. Do not imply carelessness or invent institutional pain points.

### 6.3 Solution

**Purpose:** Connect recognized problems to approved product principles and outcomes.

**User Goal:** Understand how one record, authoritative Balance, explicit transaction direction, and traceable history reduce the stated problems.

**Visual Hierarchy:** Section heading → concise principle statement → problem-to-solution pairs → transition to workflow.

**Desktop Layout:** Use a paired two-column sequence: problem context followed by corresponding product response. Maintain a single top-to-bottom reading path.

**Tablet Layout:** Stack each problem immediately before its corresponding solution.

**Mobile Layout:** Stack each problem immediately before its solution. Never separate all problems from all answers.

**Spacing:** Pair gap uses `landing.grid.gap`; internal text gap uses `landing.content.gap`; pair groups use `landing.section.gap`.

**Components:** Paired content rows, Lucide connector or check icon, optional approved product detail crop.

**Design Tokens:** `landing.canvas`, `landing.card.background`, `landing.card.border`, `landing.card.radius`, `landing.card.padding`, `landing.card.elevation`, `color.action.primary.subtle`, `type.section-title`, `type.body`.

**Motion:** Reveal each pair as one container. Motion emphasizes the relationship, not a claimed transformation.

**Accessibility:** Pair headings and descriptions programmatically. Connector graphics are decorative. Reading order remains problem then response.

**Interaction Rules:** No interactive comparison slider. Product detail crops may open the approved full preview only when keyboard and focus behavior are defined.

**Implementation Notes:** Every response must map to an implemented capability. Do not convert minor behaviors into platform claims.

### 6.4 Workflow

**Purpose:** Reduce perceived learning effort by showing the approved three-step journey.

**User Goal:** Understand the sequence: select a Student, record pemasukan or pengeluaran, review updated Balance and history.

**Visual Hierarchy:** Heading → short reassurance → ordered steps 1–3 → evidence-oriented CTA when approved.

**Desktop Layout:** Three connected steps in one row. Connection lines indicate order only, never completion status.

**Tablet Layout:** Vertical ordered sequence. Avoid compressed labels.

**Mobile Layout:** Vertical ordered list with a continuous alignment guide. Each step remains visible without interaction.

**Spacing:** Step grid uses `landing.grid.gap`; step container uses `landing.card.padding`; number-to-content uses `space.3`.

**Components:** Ordered list, numbered markers, step title, description, optional approved screenshot crop, optional secondary CTA.

**Design Tokens:** `landing.card.background`, `landing.card.border`, `landing.card.radius`, `landing.card.padding`, `landing.card.elevation`, `shape.control`, `color.action.primary.subtle`, `color.text.primary`, `color.text.secondary`, `landing.reveal`.

**Motion:** Progressive reveal follows step order. The complete sequence is present in the DOM and immediately understandable without animation. No progress meter or simulated transaction completion.

**Accessibility:** Use an ordered list. Visible step numbers have matching accessible text. Connection lines are hidden from accessibility APIs.

**Interaction Rules:** Steps are informational by default. If selectable previews are approved, use buttons with selected state and ensure all content remains reachable by keyboard.

**Implementation Notes:** Do not add signup, account setup, approval, synchronization, or other unapproved steps.

### 6.5 Application Preview

**Purpose:** Prove that the product is real, focused, mobile-first, and understandable.

**User Goal:** Inspect genuine interfaces and recognize the approved workflow before using the product.

**Visual Hierarchy:** Heading → authenticity statement → primary approved screenshot/workflow frame → concise annotations or captions → optional exploration action.

**Desktop Layout:** One dominant preview within `landing.preview.max-width`, paired with a short annotation rail. Secondary screenshots support the main workflow and never resemble analytics tiles.

**Tablet Layout:** Dominant frame remains centered with annotations below it.

**Mobile Layout:** Show mobile screenshots as a vertical stack at legible scale; never shrink an entire desktop interface into unreadable decoration.

**Spacing:** Frame uses `landing.preview.padding-mobile` on mobile and `landing.preview.padding-wide` on tablet and desktop; caption gap uses `space.3`; separate workflow states with `landing.grid.gap`.

**Components:** Approved screenshot assets, semantic figure/figcaption, optional tab list or previous/next controls, annotation list.

**Design Tokens:** `landing.preview.background`, `landing.preview.border`, `landing.preview.radius`, `landing.preview.padding-mobile`, `landing.preview.padding-wide`, `landing.preview.max-width`, `landing.surface-subtle`, `landing.focus`, `color.border.default`, `elevation.surface`.

**Motion:** Device reveal uses `landing.reveal`. Approved screen transitions may crossfade containers; financial values do not interpolate, count, slide, or morph. Reduced motion shows the final frame immediately.

**Accessibility:** Every informative screenshot has contextual alt text describing the interface purpose, not every visible word. Complex information receives a nearby text summary. Tabs/carousels, if used, follow established keyboard patterns and never auto-advance.

**Interaction Rules:** Use authentic screenshots, real approved workflows, and realistic clearly illustrative transaction examples. Never show fake dashboards, statistics, notifications, accounts, reports, settings, or speculative features.

**Implementation Notes:** Assets require Project Owner approval and a record of source screen, product version, viewport, state, and redaction. Do not expose real personal or financial data. Preserve asset aspect ratio and reserve dimensions to prevent layout shift.

### 6.6 Features

**Purpose:** Make current product value scannable after visitors understand the workflow.

**User Goal:** Confirm that the product supports the core tasks relevant to daily Student financial recording.

**Visual Hierarchy:** Heading → short outcome-led lead → grouped feature set → optional product evidence link.

**Desktop Layout:** Three columns of equal-priority feature cards. Group by user outcome, not technical subsystem.

**Tablet Layout:** Two-column grid; an unmatched final item spans the full row.

**Mobile Layout:** One-column card list. Preserve concise titles and avoid nested disclosures.

**Spacing:** Grid uses `landing.grid.gap`; cards use `landing.card.padding`; title-to-description uses `space.2`.

**Components:** Feature list/cards, Lucide icons, optional text link to relevant preview.

**Design Tokens:** `landing.card.background`, `landing.card.border`, `landing.card.radius`, `landing.card.padding`, `landing.card.elevation`, `landing.card.elevation-hover`, `landing.section.title`, `type.body`, `color.action.primary`, `color.text.primary`, `color.text.secondary`.

**Motion:** Cards reveal by row/group with `landing.reveal`. Hover elevation uses `landing.card.elevation-hover` only when the whole card is a real link.

**Accessibility:** Use a semantic list. Linked cards expose one coherent target; avoid nested links. Icons do not carry the feature name alone.

**Interaction Rules:** Non-linked cards have no hover lift or pointer cursor. Feature links must lead to existing evidence or documentation.

**Implementation Notes:** Approved themes are Student discovery, transaction recording, authoritative Balance, traceable history, mobile-first PWA access, and explicit outcomes. Do not inflate or speculate.

### 6.7 Security & Trust

**Purpose:** Establish confidence through verified financial-integrity behavior and transparent boundaries.

**User Goal:** Understand why records and outcomes are comprehensible without being asked to accept unsupported assurances.

**Visual Hierarchy:** Heading → restrained trust statement → verified integrity principles → boundary or clarification note → FAQ transition.

**Desktop Layout:** Introductory copy beside a vertical proof list. Do not use badge walls.

**Tablet Layout:** One vertical proof list below the introductory copy.

**Mobile Layout:** One-column proof list with stable icon/text alignment.

**Spacing:** Proof groups use `landing.grid.gap`; items use `landing.card.padding`; internal gap uses `space.3`.

**Components:** Verified principle list, Lucide icons, optional neutral information alert, documentation link if a real destination exists.

**Design Tokens:** `landing.surface-subtle`, `landing.card.background`, `landing.card.border`, `landing.card.radius`, `landing.card.padding`, `landing.card.elevation`, `alert.padding`, `alert.gap`, `alert.radius`, `color.text.primary`, `color.text.secondary`, `color.action.primary.subtle`.

**Motion:** Container presence only. Do not animate shields, locks, checks, or financial proof. No motion may manufacture trust.

**Accessibility:** Principles use text, not icon/color alone. Claims are plain-language and readable. Links identify their destination.

**Interaction Rules:** No trust counters, certification tooltips, animated badges, or unsupported security claims.

**Implementation Notes:** Use only verified integrity principles from the Strategy. Security, compliance, authentication, backup, or institutional guarantees require separate evidence and approval.

### 6.8 FAQ

**Purpose:** Resolve adoption uncertainty and clarify current scope before action.

**User Goal:** Find concise, authoritative answers about audience, transactions, Balance, mobile use, connectivity, current scope, and product entry.

**Visual Hierarchy:** Heading → short orientation → categorized or ordered questions → contextual CTA only if necessary.

**Desktop Layout:** Center a single FAQ column within `landing.faq.max-width`. Do not split answers into competing columns.

**Tablet Layout:** Same single-column composition.

**Mobile Layout:** Full-width accordion within mobile gutters; question text wraps without colliding with the disclosure icon.

**Spacing:** Rows use `space.5` block spacing and `landing.faq.divider`; answer content uses `space.3` and `type.body`.

**Components:** Accessible Accordion, question heading/button, answer region, optional verified inline link.

**Design Tokens:** `landing.faq.divider`, `landing.faq.max-width`, `landing.focus`, `type.body-strong`, `type.body`, `color.text.primary`, `color.text.secondary`.

**Motion:** Disclosure height/opacity may use `motion.presence` only when content is not clipped and reduced motion is immediate. Icon rotation is supplemental.

**Accessibility:** Each question is a native button inside the appropriate heading level with expanded state and controlled-region relationship. Keyboard activation uses Enter and Space. Focus remains on the trigger.

**Interaction Rules:** Allow multiple questions open unless research demonstrates a need for single-open behavior. Deep links to questions are optional but must produce visible focus and expanded content.

**Implementation Notes:** Answers must be generated and approved from current product documentation. Do not use FAQ content to introduce future features or unsupported claims.

### 6.9 Final CTA

**Purpose:** Convert earned understanding and trust into one clear exploration or product-use action.

**User Goal:** Take the next real step without encountering a new promise or decision.

**Visual Hierarchy:** Outcome restatement → brief supporting line → primary CTA → optional lower-emphasis alternative.

**Desktop Layout:** Centered composition within `landing.final-cta.max-width`. Use whitespace and type hierarchy rather than a promotional visual effect.

**Tablet Layout:** Same centered composition with constrained line length.

**Mobile Layout:** One column; primary CTA full-width and secondary action below.

**Spacing:** Section uses `landing.section.padding-mobile`, `landing.section.padding-tablet`, and `landing.section.padding-desktop`; heading-to-support uses `landing.content.gap`; support-to-actions uses `space.6`; actions use `layout.inline.gap`.

**Components:** Heading, supporting text, primary Button, optional secondary Button/text action.

**Design Tokens:** `landing.surface-subtle`, `landing.final-cta.max-width`, `landing.cta.height`, `landing.cta.radius`, `button.primary.background`, `button.primary.background-hover`, `button.primary.foreground`, `button.secondary.background`, `button.secondary.foreground`, `button.secondary.border`, `landing.focus`.

**Motion:** One container reveal using `landing.reveal`. No pulsing CTA, countdown, urgency animation, confetti, or artificial success treatment.

**Accessibility:** CTA has a specific destination-oriented name. Contrast and focus meet approved rules. The section does not duplicate the `h1`.

**Interaction Rules:** Encourage exploration or use through an approved action such as viewing a demo, workflow, features, or beginning use. Do not create purchase-oriented behavior.

**Implementation Notes:** The CTA must match the Hero's primary goal and a real available destination. Final label and destination require Project Owner approval.

### 6.10 Footer

**Purpose:** Close the page with orientation, verified identity, and essential destinations.

**User Goal:** Confirm product identity and reach available product, support/contact, legal, or documentation destinations.

**Visual Hierarchy:** Product identity/brief descriptor → grouped verified links → legal/copyright information.

**Desktop Layout:** Two-part grid: identity block and compact link groups. Bottom row contains legal/copyright content.

**Tablet Layout:** Identity above a two-column link-group grid; an unmatched final group spans the full row. The bottom row follows beneath the grid.

**Mobile Layout:** One column. Link groups use headings and comfortable touch spacing. Do not collapse essential links behind accordions.

**Spacing:** Top border uses `landing.footer.border`; section padding uses `landing.section.padding-mobile`, `landing.section.padding-tablet`, and `landing.section.padding-desktop` at their corresponding breakpoints; link rows use `space.3`; groups use `space.6`.

**Components:** Product identity link, brief descriptor, navigation lists, legal text, optional verified contact link.

**Design Tokens:** `landing.footer.border`, `landing.canvas`, `type.supporting`, `type.label`, `color.text.primary`, `color.text.secondary`, `landing.focus`.

**Motion:** Footer content and background remain static.

**Accessibility:** Use `footer` landmark and titled navigation groups. Link text is descriptive. Maintain target size and visible focus. Do not repeat empty or unavailable destinations.

**Interaction Rules:** No fictitious social links, newsletter capture, empty company pages, or unrelated conversion actions.

**Implementation Notes:** Render only verified destinations. Copyright year may be generated without blocking content rendering.

## 7. Motion Blueprint

### 7.1 Motion Map

| Area | Treatment | Trigger | Constraint | Reduced motion |
|------|-----------|---------|------------|----------------|
| Hero copy | Grouped stagger | Initial render | Reading order; CTA never delayed | Immediate |
| Hero preview | Fade/short translation | Initial render | No financial-value animation | Immediate |
| Hero decoration | None | — | Remains static | Static |
| Problems | Group reveal | First meaningful viewport entry | Once; short stagger | Immediate |
| Solution | Pair reveal | Viewport entry | Pair moves as one unit | Immediate |
| Workflow | Progressive reveal | Viewport entry | Sequence remains visible without motion | Immediate |
| Preview | Device/container reveal | Viewport entry | Values remain static and authoritative | Immediate |
| Features | Row reveal | Viewport entry | No decorative looping | Immediate |
| Trust | Container presence | Viewport entry | No trust-manufacturing animation | Immediate |
| FAQ | Disclosure transition | User action | Focus remains stable | Immediate |
| Final CTA | Container reveal | Viewport entry | No pulse or urgency | Immediate |
| Footer | None | — | Content and background remain static | Static |

### 7.2 Motion Implementation Rules

- Use opacity and transform only; avoid layout-triggering animation.
- Use Intersection Observer or equivalent once-per-section activation; content remains rendered and readable before enhancement.
- Maximum reveal travel is `motion.distance.medium`; interactive feedback uses `motion.feedback`.
- No autoplay sequence may delay reading, interaction, or navigation.
- Disable nonessential animation for `prefers-reduced-motion: reduce`; use `motion.reduced`.
- Do not animate financial values, simulate saving, imply success before persistence, or transition between fabricated product states.
- Motion failure must leave the final, usable layout—not invisible content.

## 8. Accessibility Blueprint

### 8.1 Semantic and Heading Structure

- Use one `header`, one `main`, one `footer`, and labeled `nav` landmarks.
- Use exactly one `h1`. Every major section begins with an `h2`; card titles use `h3` only when they create real subsections.
- Preserve semantic source order across breakpoints; CSS may change visual columns but not narrative meaning.
- Provide a visible-on-focus skip link to `main`.

### 8.2 Keyboard and Focus

- Every action works with keyboard alone in a logical top-to-bottom order.
- Apply `:focus-visible` through `landing.focus`; never suppress focus without replacement.
- Anchor navigation places the target heading at a visible position and allows focus to follow when needed for orientation.
- FAQ, preview controls, and mobile navigation use established accessible primitives and return focus predictably.
- No hover-only content or pointer-only action.

### 8.3 Contrast and Meaning

- Body text, headings, links, controls, icons, borders essential to perception, and focus indicators must meet the contrast rules in `docs/16-accessibility-guidelines.md`.
- Color never carries section meaning, status, transaction direction, or interactivity alone.
- Decorative gradients or shapes cannot reduce text or focus contrast.

### 8.4 Touch and Responsive Access

- Interactive targets use at least `control.height.minimum` in both dimensions.
- Adjacent controls use at least `layout.inline.gap`.
- Support 320px width, 200% zoom, text resizing, orientation change, and mobile keyboard appearance.
- Do not use swipe as the only preview or navigation mechanism.

### 8.5 Media and Reduced Motion

- Do not autoplay audio or video.
- Informative screenshots receive contextual alternatives; decorative assets are hidden.
- Honor reduced motion before initial animation state is applied to prevent flashes or invisible content.
- No flashing, rapid pulsing, continuous attention animation, or animated financial information.

## 9. Interaction and State Rules

- The Landing Page is content-first and must render meaningful content without client-side interaction.
- Links navigate; buttons perform actions or control disclosure. Do not style one as the other without matching semantics.
- Hover treatment is supplemental. Default state must already communicate interactivity.
- Loading for optional enhanced content is local and uses approved Skeleton behavior. Never replace the whole page with a spinner.
- Failed optional preview media shows a stable text fallback and Retry only when Retry is useful.
- Missing or unapproved evidence removes the dependent composition; it must not be replaced by fake content.
- CTA activation gives immediate native feedback and follows the real destination. Do not simulate success.
- External destinations, downloads, and new-tab behavior must be explicit and consistent.
- Analytics, cookies, consent, forms, and tracking are not authorized by this blueprint.

## 10. Performance and Implementation Constraints

- Render critical headline, lead, CTAs, and initial product evidence in the server/static document path where the architecture permits.
- Reserve dimensions for fonts, screenshots, and preview frames to minimize layout shift.
- Load Geist through an approved, privacy-reviewed source and use the documented fallback stack.
- Use responsive image sources and modern formats for screenshots; do not upscale beyond source quality.
- Lazy-load below-the-fold screenshots while preserving accessible captions and fallback content.
- Progressive enhancement is required: navigation, reading, links, and FAQ content must remain available if motion code fails. FAQ answers may default open without enhancement.
- Avoid large animation libraries for effects achievable through existing approved tooling and tokens. Any Framer Motion use must justify bundle cost and respect reduced motion.
- No production implementation may hardcode color, spacing, radius, typography, shadow, opacity, z-index, or animation values.
- Do not import visual patterns that conflict with the approved component and accessibility contracts.

## 11. Content and Asset Handoff Contract

Before implementation, the content/asset package must provide:

- approved final Bahasa Indonesia headline, subheadline, section copy, CTA labels, FAQ answers, and legal text;
- verified CTA destinations and behavior;
- approved capability-to-claim matrix;
- approved screenshots with product version, viewport, state, alt-text intent, and confirmation that personal data is fictional or safely redacted;
- approved brand mark, wordmark, favicon/PWA relationship, and usage rules;
- verified support, documentation, contact, and legal destinations;
- explicit approval for any Landing Page-specific token extensions.

Placeholders may be used during design review but must be visibly marked and cannot ship.

## 12. Design and Implementation Acceptance Checklist

### Strategy and Credibility

- [ ] Narrative sequence remains Hero → Problems → Solution → Workflow → Application Preview → Features → Security & Trust → FAQ → Final CTA → Footer.
- [ ] The page communicates teacher-centered Student financial transaction management.
- [ ] Boarding context does not become the primary positioning.
- [ ] Every claim maps to implemented, verified product behavior.
- [ ] Product screenshots and workflows are authentic and approved.
- [ ] No fake dashboard, statistic, notification, testimonial, trust badge, or speculative feature appears.
- [ ] No purchase-oriented section or interaction is introduced.

### Visual System

- [ ] All visual values resolve through approved tokens.
- [ ] Landing Page token extensions are approved and promoted to the token source.
- [ ] Geist, neutral-first color, calm blue action, border-led cards, and nested radii are consistent.
- [ ] Premium character comes from composition, spacing, type, hierarchy, and restrained motion.
- [ ] Decorative elements remain secondary to content and product evidence.

### Responsive and Accessibility

- [ ] Mobile source order is complete and logical.
- [ ] Layout is verified below, at, and above each breakpoint token.
- [ ] 320px width and 200% zoom preserve all content and actions.
- [ ] Heading hierarchy, landmarks, alt text, focus order, and `:focus-visible` are correct.
- [ ] Touch targets, contrast, keyboard operation, and screen-reader labels pass review.
- [ ] Reduced motion produces a complete, stable page.

### Motion and Performance

- [ ] Motion supports attention or hierarchy and has a documented purpose.
- [ ] Financial values never animate.
- [ ] No motion implies persistence, success, security, or trust.
- [ ] Content remains available if enhancement fails.
- [ ] Screenshot dimensions, responsive assets, font loading, and below-fold loading are performance-safe.

## 13. Open Questions Before Implementation

The following require Project Owner approval and must not be guessed:

1. What exact action, label, and destination define the primary CTA?
2. Is a secondary CTA required, and should it target Workflow, Application Preview, demo access, or documentation?
3. Which implemented capabilities are approved for public claims at launch?
4. Which authentic screenshots and product states are approved, and what illustrative data may they contain?
5. Are the Landing Page primitive and alias token extensions in Section 3 approved for promotion into `docs/18-design-tokens.md` and implementation?
6. Which brand assets are final, and may any abstract structural assets be used?
7. What are the approved FAQ questions and source-backed answers?
8. Which integrity, security, and trust statements have verified evidence for publication?
9. Which support, documentation, contact, privacy, legal, and Footer destinations exist at launch?
10. Should the header remain static or become sticky after usability testing?
11. Is an interactive preview necessary, or will a static sequence of approved screenshots provide clearer and faster evidence?
12. What browser and assistive-technology matrix is required for release acceptance?

Until resolved, these items remain explicit handoff dependencies—not permission to invent a default.
