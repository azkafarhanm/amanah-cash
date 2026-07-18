# Amanah Cash — Landing Page Implementation Plan

**Version:** 1.2
**Status:** Implementation Plan
**Owner:** Project Owner
**Last Updated:** 2026-07-18

---

## 1. Purpose

This document converts the approved Landing Page Strategy, Blueprint, Content Specification, and UI foundation into an incremental development sequence. It defines implementation boundaries, dependencies, component ownership, milestone order, verification tasks, and objective completion criteria.

All implementation must follow the approved project documentation. This plan does not replace Product Requirements, Business Rules, the UI Design System, Design Tokens, the Landing Page Blueprint, or the Landing Page Content Specification. It does not authorize new copy, layouts, routes, assets, interactions, technologies, product claims, or capabilities.

When implementation cannot proceed without an unresolved item, development must preserve the approved structure and stop at the relevant dependency gate. Developers must not make a design or product decision to keep a milestone moving.

The current **Sprint 1 — Project Bootstrap** precedes every Landing Page milestone in this document. Sprint 1 prepares only the approved development foundation; it does not implement `LandingPage`, any Landing Page section, shared UI component, motion treatment, screenshot, or visible Landing Page content.

## 2. Implementation Principles

### 2.1 Documentation First

- Trace every section to `docs/23-landing-page-blueprint.md` and `docs/24-landing-page-content.md` before implementation.
- Use the Content Specification verbatim for visible copy, CTA labels, alternative text, metadata, and omissions.
- Use the Blueprint for semantic order, responsive composition, interaction behavior, section surfaces, and motion assignments.
- Resolve conflicts through the authority order in the approved documents; do not resolve them through implementation preference.

### 2.2 Design Tokens Only

- `docs/18-design-tokens.md` is the single visual authority.
- Every color, font, type role, spacing value, size, breakpoint, radius, border, elevation, opacity, z-index, and motion value must resolve through an approved token.
- Tailwind theme aliases and CSS custom properties may translate approved token names for implementation, but may not create a parallel scale.
- Missing values require token governance review before use. No local visual constant is allowed.

### 2.3 Accessibility First

- Establish landmarks, heading order, source order, keyboard behavior, focus behavior, link semantics, image alternatives, and reduced-motion behavior before visual polish.
- React components must render native HTML semantics whenever they satisfy the approved behavior.
- Accessibility is verified within every milestone and audited across the complete page in Milestone 8.

### 2.4 Mobile First

- Implement the complete one-column source order first.
- Add tablet and desktop compositions only at the approved breakpoint tokens.
- Desktop layout must not change content, narrative order, meaning, or available actions.

### 2.5 Progressive Enhancement

- Final copy, navigation, anchors, screenshots, captions, and FAQ answers are rendered by Server Components and remain readable without motion or optional client-side enhancement.
- Client Components may enhance reveal behavior and FAQ disclosure only where required by the approved interaction contract.
- Enhancement failure must leave visible, usable content.

### 2.6 Component Reuse

- Reuse shared containers, headings, action controls, cards, icon-text items, screenshot frames, and focus behavior.
- Reuse must not flatten meaningful semantic differences between sections.
- A component is introduced only when at least two consumers share the same semantic and visual contract, or when the component isolates a required accessible interaction.

### 2.7 No Design Decisions During Development

- Do not modify section order, surface rhythm, copy hierarchy, CTA hierarchy, responsive layouts, icon assignments, screenshot states, or motion treatments.
- Do not add optional Blueprint treatments unless the final Content Specification requires them.
- When the Blueprint permits multiple patterns, use the least interactive approved implementation that satisfies the final content.
- Do not add badges, carousels, tabs, sticky navigation, testimonial blocks, forms, analytics, tracking, decorative illustrations, or marketing routes.

## 3. Technical Assumptions

### 3.1 Approved Technical Baseline

- Frontend framework: Next.js using the App Router.
- UI runtime: React.
- Implementation language: TypeScript.
- Styling: Tailwind CSS mapped to the approved Design Tokens.
- Backend boundary: Next.js Route Handlers under the App Router.
- ORM: Prisma.
- Sprint 1 database: local SQLite, preserving the approved Database Design and financial-write contract.
- Public landing route: `/`.
- Locale: `id-ID`, Bahasa Indonesia, Indonesian date formatting, 24-hour time, and Rupiah.
- Visual authority: `docs/18-design-tokens.md` implemented as the canonical Tailwind/CSS token layer.
- Icon authority: approved Lucide icons named in the Content Specification.

Auth.js with the Database Session Strategy remains the approved long-term authentication solution. Authentication implementation is deferred to a dedicated Authentication Sprint and is not part of the Sprint 1 technical baseline. Sprint 1 must not install Auth.js or create `User`, `Account`, `Session`, `VerificationToken`, or any authentication schema.

Sprint 1 targets Local Development only. It does not deploy to Vercel or select a production hosting or persistence operations strategy. Production deployment decisions are deferred to the Deployment phase; no external database or persistence-architecture change is authorized by this plan.

### 3.2 Next.js and React Boundaries

- `app/layout.tsx` owns the root HTML structure, document language, Geist font integration, shared token styles, and metadata defaults.
- `app/page.tsx` owns the `/` Landing Page route and composes the approved section hierarchy.
- Landing sections are React Server Components by default.
- A component includes the `'use client'` boundary only when it requires browser state, event handling, Intersection Observer, or an approved disclosure interaction.
- FAQ disclosure and motion reveal boundaries are the expected Client Components. Static section content, navigation links, figures, cards, and Footer remain Server Components.
- Next.js Route Handlers live in `app/api/**/route.ts`. They implement approved backend operations only and are not used to generate static Landing Page copy.
- Prisma access remains server-only and must not be imported into Client Components. The public Landing Page does not query or mutate SQLite.
- Sprint 1 contains no authentication boundary, Auth.js dependency, authentication Route Handler, authentication configuration, or authentication schema. Those belong exclusively to the future dedicated Authentication Sprint.
- Sprint 1 validation is local. It may run a local production build for verification, but it does not configure or perform production deployment.
- No technology beyond the approved Sprint 1 baseline and the already approved Lucide icon source is authorized by this plan. Deferred target technologies are not Sprint 1 dependencies.

### 3.3 Rendering, Metadata, and Enhancement Assumptions

- Critical Header, Hero, CTA, and initial preview content render through Server Components in the initial response.
- Static page metadata uses the typed Next.js `Metadata` export in `app/layout.tsx` or `app/page.tsx`. `generateMetadata` is used only if an approved value genuinely depends on runtime or route data.
- `metadataBase`, canonical metadata, Open Graph metadata, robots metadata, and sitemap output remain dependent on approved publication values.
- Section content and FAQ answers remain present in the rendered React tree; Client Components must not fetch or invent landing copy.
- A focused Client Component may use Intersection Observer to activate approved once-only reveals after the server-rendered page is complete.
- `prefers-reduced-motion` switches nonessential animation to the approved immediate state.
- Approved screenshots use `next/image` with known dimensions, responsive `sizes`, meaningful `alt`, and optimized delivery. The Hero asset receives priority only when measurement confirms it is the initial primary image.
- Geist uses `next/font` with the approved source and token-compatible CSS variable/fallback contract.

### 3.4 Approved App Router Project Structure

```text
app/
├── layout.tsx                         # Root HTML, lang, font, tokens, metadata defaults
├── page.tsx                           # Public Landing Page at /
├── globals.css                        # Token declarations and Tailwind entry
├── robots.ts                          # Added after indexing policy approval
├── sitemap.ts                         # Added after canonical origin approval
├── opengraph-image.*                  # Approved asset or metadata file convention
└── api/
    └── .../route.ts                   # Approved product API Route Handlers only
components/
├── landing/
│   ├── landing-page.tsx
│   ├── landing-header.tsx
│   ├── hero-section.tsx
│   ├── problems-section.tsx
│   ├── solution-section.tsx
│   ├── workflow-section.tsx
│   ├── application-preview-section.tsx
│   ├── features-section.tsx
│   ├── security-trust-section.tsx
│   ├── faq-section.tsx
│   ├── final-cta-section.tsx
│   └── landing-footer.tsx
├── shared/                            # Tokenized reusable presentation components
└── client/                            # Minimal FAQ and reveal Client Components
lib/
├── prisma.ts                          # Server-only Prisma client boundary
└── landing-content.ts                 # Typed approved content, no replacement copy
prisma/
└── schema.prisma                      # Local SQLite configuration; no auth models in Sprint 1
public/
└── landing/                           # Approved screenshots and brand assets
```

The structure may use an approved `src/` root consistently, but must not mix root and `src/` conventions. File placement may be consolidated when a component is truly local to one section; the ownership boundaries and milestone order remain unchanged.

This tree is the target organization for the later Landing Page milestones, not a Sprint 1 creation checklist. Sprint 1 creates only the configuration and App Router foundation required to run and validate the project. It does not create the `components/landing/` implementation, Landing Page assets, authentication files, or Prisma models and migrations; an initialized `prisma/schema.prisma`, if required by the approved Prisma setup, contains only the local SQLite datasource and generator configuration.

## 4. Route Structure

### 4.1 Public Route

| Route | App Router file | Purpose | Status |
|-------|-----------------|---------|--------|
| `/` | `app/page.tsx` | Amanah Cash Landing Page | Approved implementation route |

No additional marketing route is authorized.

### 4.2 In-Page Destinations

| Fragment | Section | Consumers |
|----------|---------|-----------|
| `#cara-kerja` | Workflow | Header, Hero secondary CTA, Footer |
| `#pratinjau-aplikasi` | Application Preview | Workflow CTA |
| `#fitur` | Features | Header, Solution CTA, Footer |
| `#tanya-jawab` | FAQ | Header, Footer |

- Fragment identifiers must match `docs/24-landing-page-content.md` exactly.
- Use native fragment destinations or `next/link` without introducing client-side router state for same-page navigation.
- Anchor targets must remain visible below the normal-flow Header and receive predictable focus when navigation requires orientation.
- The product-entry destination, Header identity destination, and Documentation destination remain pending. Do not guess routes for them.
- Replacing the current application shell at `/` requires the approved product-entry destination to be established first so access to the product is not removed.

## 5. Component Hierarchy

```text
LandingPage
├── SkipLink
├── LandingHeader
│   ├── ProductIdentity
│   ├── DesktopPrimaryNavigation
│   └── PrimaryProductAction
├── MainContent
│   ├── HeroSection
│   │   ├── HeroContent
│   │   ├── HeroActions
│   │   └── HeroScreenshot
│   ├── ProblemsSection
│   │   └── ProblemList
│   │       └── ProblemItem × 5
│   ├── SolutionSection
│   │   └── SolutionPairList
│   │       └── SolutionPair × 4
│   ├── WorkflowSection #cara-kerja
│   │   ├── WorkflowStepList
│   │   │   └── WorkflowStep × 3
│   │   └── PreviewAnchorAction
│   ├── ApplicationPreviewSection #pratinjau-aplikasi
│   │   └── ScreenshotGallery
│   │       ├── ScreenshotFigure: Student List
│   │       ├── ScreenshotFigure: Student Detail
│   │       └── ScreenshotFigure: Transaction Entry
│   ├── FeaturesSection #fitur
│   │   └── FeatureList
│   │       └── FeatureItem × 6
│   ├── SecurityTrustSection
│   │   └── TrustPrincipleList
│   │       └── TrustPrinciple × 5
│   ├── FAQSection #tanya-jawab
│   │   └── FAQList
│   │       └── FAQItem × 7
│   └── FinalCTASection
│       └── FinalCTAActions
└── LandingFooter
    ├── FooterIdentity
    ├── FooterProductNavigation
    ├── ConditionalResourceNavigation
    └── Copyright
```

Hierarchy rules:

- Components must preserve the exact semantic and content order above.
- `LandingPage`, Header, Footer, and all static section components are Server Components.
- `FAQItem` and `RevealBoundary` are isolated Client Components; their client boundaries must not wrap the complete page.
- Header remains in normal document flow. Sticky behavior is not implemented.
- Mobile and tablet Header omit in-page navigation and contain only Product Identity plus the primary product action. No mobile menu exists.
- Application Preview is a static semantic gallery; no tabs, carousel, autoplay, or previous/next controls are required.
- FAQ supports multiple simultaneously expanded answers as approved by the Blueprint.
- Conditional Resource Navigation is omitted until the Documentation destination is approved.

## 6. Shared Components

| Shared component | Responsibility | Required consumers | Governing tokens or rules |
|------------------|----------------|--------------------|---------------------------|
| `PageContainer` | Center content and apply approved responsive gutters and maximum width | Header, every section, Footer | `landing.screen.content-max`, `landing.screen.gutter-mobile`, `landing.screen.gutter-wide` |
| `LandingSection` | Apply semantic element, deterministic surface, and breakpoint-specific section padding | Problems through Final CTA | Section surface table; `landing.section.padding-*` |
| `SectionHeading` | Render optional eyebrow, one `h2`, lead, and stable spacing | Every major section | `landing.section.title`, `landing.lead`, `landing.content.gap` |
| `ActionLink` | Render approved internal navigation with `next/link` or native fragment anchors while preserving correct link semantics | Header, Hero, Solution, Workflow, Final CTA | Approved CTA registry; Button tokens; `landing.focus` |
| `ContentCard` | Provide border-led, tokenized grouping without default shadow | Problem, Solution, Workflow, Feature, Trust items where specified | `landing.card.*` |
| `IconTextItem` | Pair an approved decorative Lucide icon with visible title and description | Problems, Solutions, Features, Trust | Content icon registry; icons hidden from accessibility APIs |
| `WorkflowStep` | Render ordered step marker, title, and description | Workflow | Ordered-list semantics; Workflow token references |
| `ScreenshotFigure` | Render an approved screenshot through `next/image` with dimensions, responsive `sizes`, alt text, caption, and annotation | Hero and Application Preview | `landing.preview.*`; Content screenshot contract |
| `FAQItem` | Isolated Client Component for the heading-contained disclosure button, expanded state, and controlled answer region | FAQ | `landing.faq.*`, `landing.focus`, `motion.presence` |
| `RevealBoundary` | Isolated Client Component for only the approved once-only section treatment and reduced-motion fallback | Sections named in Motion Map | `landing.reveal`, `motion.reduced` |

Shared-component constraints:

- There is no generic Badge component because visible badges are not approved.
- `ActionLink` must remain an anchor when it navigates; it must not become a button styled as a link.
- `ContentCard` applies hover elevation only when its entire surface is an actual link. Current static content cards receive no hover elevation.
- `ScreenshotFigure` never alters screenshot labels or financial values.
- Component APIs must accept content from the approved specification without embedding replacement copy.

## 7. Milestone Breakdown

Milestones are sequential. A milestone may begin only when its listed dependencies are available, unless work is limited to non-shipping structural scaffolding that cannot conceal the dependency.

### Milestone 1 — Delivery Foundation, Metadata, Font, and Tokens

**Purpose:** Establish the route, semantic document foundation, canonical token implementation, and critical document metadata before section development.

**Components:**

- `app/layout.tsx` root layout.
- `app/page.tsx` route entry for `/`.
- `LandingPage` shell.
- `SkipLink` target and base landmarks.
- `PageContainer`.
- Canonical Design Token aliases in Tailwind CSS and `app/globals.css`.
- Geist loading through `next/font` with approved fallback behavior.
- Typed Next.js `Metadata` using final approved text.

**Dependencies:**

- Approved Next.js App Router, React, TypeScript, and Tailwind CSS foundation.
- `docs/18-design-tokens.md`.
- Metadata text from `docs/24-landing-page-content.md`.
- Approved font source and privacy review.
- Route coordination with the existing application shell.
- Local SQLite configuration for the approved development environment.

**Completion Criteria:**

- `app/page.tsx` renders `/` through the App Router, and `app/layout.tsx` produces one valid Bahasa Indonesia document with `lang="id-ID"`.
- One `header`, `main`, and `footer` slot exist in correct source order.
- Skip link reaches `main` and is visible on keyboard focus.
- Every implemented visual declaration resolves through an approved token.
- Geist failure uses `font.family.sans` fallbacks without layout breakage.
- Page title, meta description, Open Graph title, and Open Graph description exactly match the Content Specification.
- Next.js production build, TypeScript checking, and approved linting complete without error.
- No technology or dependency outside the approved stack is introduced.

### Milestone 2 — Header, Hero, and Footer Structure

**Purpose:** Implement the page frame, first-view message, navigation composition, initial authentic evidence slot, and closing identity structure.

**Components:**

- `LandingHeader` and its approved desktop/mobile compositions.
- `ProductIdentity`.
- `DesktopPrimaryNavigation`.
- `HeroSection`, `HeroContent`, `HeroActions`, and `HeroScreenshot`.
- `LandingFooter`, `FooterIdentity`, and `FooterProductNavigation`.

These components remain Server Components. Navigation uses Next.js internal-link conventions without adding client state.

**Dependencies:**

- Milestone 1.
- Final Header, Hero, and Footer copy.
- Primary product-entry and Product Identity destinations for complete action wiring.
- Approved brand mark if it will render.
- Approved Student Detail screenshot for the Hero.

**Completion Criteria:**

- Header composition exactly matches the Blueprint at mobile, tablet, and desktop.
- Header is not sticky and no mobile disclosure menu exists.
- Hero copy is verbatim, uses the page's only `h1`, and preserves approved hierarchy.
- `Lihat cara kerja` reaches `#cara-kerja`.
- Hero screenshot uses the required approved state, alternative text, intrinsic dimensions, and no real data.
- Footer renders only verified link groups; the Resource group remains absent while its destination is pending.
- No badge, statistic, customer logo, login link, pricing link, or unsupported navigation is present.

### Milestone 3 — Problems, Solution, and Workflow

**Purpose:** Implement the recognition-to-relief narrative and the complete three-step operating sequence.

**Components:**

- `ProblemsSection`, `ProblemList`, and five `ProblemItem` instances.
- `SolutionSection`, `SolutionPairList`, and four `SolutionPair` instances.
- `WorkflowSection`, `WorkflowStepList`, and three `WorkflowStep` instances.
- Approved in-page actions to Features and Application Preview.

**Dependencies:**

- Milestones 1–2 shared primitives.
- Final icons and copy from the Content Specification.
- Approved breakpoint and section-surface tokens.

**Completion Criteria:**

- All list counts, ordering, titles, descriptions, and icons exactly match the Content Specification.
- Problems use one semantic list; icons are decorative.
- Every Solution pair preserves problem-before-response reading order at all breakpoints.
- Workflow is an ordered list with visible markers `1`, `2`, and `3`.
- `Jelajahi fitur` reaches `#fitur`; `Lihat tampilan aplikasi` reaches `#pratinjau-aplikasi`.
- No account, approval, synchronization, configuration, interactive comparison, or selectable workflow behavior is added.

### Milestone 4 — Application Preview, Features, and Security & Trust

**Purpose:** Implement authentic product evidence, the approved feature inventory, and verified financial-integrity explanations.

**Components:**

- `ApplicationPreviewSection`, `ScreenshotGallery`, and three `ScreenshotFigure` instances.
- `FeaturesSection`, `FeatureList`, and six `FeatureItem` instances.
- `SecurityTrustSection`, `TrustPrincipleList`, and five `TrustPrinciple` instances.

**Dependencies:**

- Milestones 1–3.
- Approved screenshot dataset, capture viewport, source version, state, and redaction record.
- Final Student List, Student Detail, and Transaction Entry assets.
- Approved Lucide icon set named by Content Specification.

**Completion Criteria:**

- Screenshot A, B, and C use exactly the required screens, data conditions, and states.
- Student Detail synthetic Balance reconciles against its complete synthetic history.
- Screenshots render as semantic figures with exact approved alternative text and captions.
- Page content remains understandable when screenshots fail to load.
- Feature and Trust counts, order, copy, and icons match the specification.
- Static cards have no hover lift or pointer cursor.
- No fake interface, statistic, notification, badge, certification, or unsupported security claim appears.

### Milestone 5 — FAQ, Final CTA, and Footer Completion

**Purpose:** Complete adoption questions, the final action, and all verified closing destinations.

**Components:**

- `FAQSection`, `FAQList`, and seven `FAQItem` instances.
- `FinalCTASection` and `FinalCTAActions`.
- Final Footer link groups and copyright year.

Only FAQ disclosure state crosses a Client Component boundary; Final CTA and Footer remain Server Components.

**Dependencies:**

- Milestones 1–4.
- Primary product-entry destination.
- Product Identity destination.
- Documentation destination if the Resource group will render.

**Completion Criteria:**

- All seven FAQ questions and answers are present verbatim and in approved order.
- FAQ triggers are native buttons inside the correct heading level, expose expanded state and controlled-region relationships, and allow multiple answers open.
- FAQ works with keyboard and without motion.
- Final CTA labels and destinations match Hero actions exactly where required.
- Pending destinations are neither guessed nor represented by broken links.
- Footer renders the current four-digit year and only verified destinations.

### Milestone 6 — Responsive Integration

**Purpose:** Apply and verify the approved compositions across mobile, tablet, desktop, and ultra-wide viewports without changing content or source order.

**Components:** All Landing Page components.

**Dependencies:**

- Milestones 1–5 structurally complete.
- Final screenshot dimensions.
- Canonical breakpoint tokens.

**Completion Criteria:**

- Mobile, tablet, desktop, and wide behavior matches Section 5 of the Blueprint exactly.
- The page works at 320px CSS width and 200% zoom without clipping, overlap, hidden content, or horizontal page scrolling.
- All touch targets satisfy `control.height.minimum` and approved spacing.
- Visual columns never alter semantic source order.
- `breakpoint.wide` changes breathing room only.
- Screenshots remain legible, proportional, and contained at every approved composition.

### Milestone 7 — Approved Motion Enhancement

**Purpose:** Add only the motion treatments already assigned by the Motion Guidelines and Blueprint after the static page is complete.

**Components:**

- `RevealBoundary`.
- Hero copy and preview presence.
- Problems group reveal.
- Solution pair reveal.
- Workflow progressive reveal.
- Preview container reveal.
- Feature row reveal.
- Trust container presence.
- FAQ disclosure transition.
- Final CTA container reveal.

`RevealBoundary` is a minimal Client Component composed around server-rendered section content. It must not move copy, screenshots, or whole-page rendering into a client-only tree.

**Dependencies:**

- Milestone 6.
- `docs/15-motion-guidelines.md`.
- Blueprint Motion Map.
- Static fallback verified before enhancement.

**Completion Criteria:**

- Every treatment maps to the Blueprint Motion Map and approved tokens.
- Content is visible and usable before enhancement and if enhancement fails.
- Reveal behavior activates once and never delays access to CTAs.
- Motion uses approved opacity/transform behavior without layout-triggering animation.
- Reduced-motion mode renders the immediate final state.
- Balance, Amount, totals, screenshot financial values, trust proof, and persistence outcomes never animate.
- Header and Footer remain static.

### Milestone 8 — Accessibility Verification and Remediation

**Purpose:** Verify the complete page against the approved WCAG 2.2 AA contract and correct implementation defects without changing design.

**Components:** All landmarks, headings, navigation, controls, figures, FAQ disclosures, and motion preferences.

**Dependencies:**

- Milestones 1–7.
- Approved contrast pairings.
- Supported browser and assistive-technology test baseline.

**Completion Criteria:**

- Landmark and heading hierarchy matches the Blueprint.
- Keyboard order follows the visual and semantic narrative.
- Skip link, anchor focus, CTA focus, and FAQ focus behavior pass manual testing.
- Every interactive element has a visible `:focus-visible` treatment.
- Informative screenshots use exact approved alternatives; decorative icons and device chrome are hidden appropriately.
- Text, controls, focus indicators, and meaningful graphical boundaries pass approved contrast requirements.
- Reflow, text resize, 200% zoom, reduced motion, and screen-reader checks pass.
- No ARIA duplicates native semantics or conceals visible content.

### Milestone 9 — SEO, Performance, and Final QA

**Purpose:** Complete deployment-independent publication metadata, asset delivery, performance verification, cross-browser checks, and final documentation traceability, then prepare the verified build for the separate Deployment phase.

**Components:**

- Typed Next.js `Metadata` and social-card fields.
- `metadataBase` and canonical metadata after approval.
- `app/robots.ts` and `app/sitemap.ts` after the deployment origin is known.
- Approved Open Graph image through the Next.js metadata file convention or an approved static asset.
- Responsive screenshots through `next/image`.
- Geist delivery through `next/font`.
- Local Next.js production-build verification.
- Final link and content audit.

**Dependencies:**

- Milestones 1–8.
- Canonical public URL.
- Approved Open Graph image.
- Approved deployment origin and indexing policy from the Deployment phase for origin-dependent metadata; those outputs remain gated until supplied.
- Complete capability-to-claim verification against the release candidate.

**Completion Criteria:**

- Title, description, Open Graph title, and Open Graph description match the Content Specification exactly.
- Canonical and social-image metadata use approved final assets and URLs.
- Twitter/X-compatible card metadata reuses approved Open Graph content; no new marketing copy is introduced.
- Structured data is omitted unless an approved type and fully supported claims are available.
- `app/robots.ts` and `app/sitemap.ts` are implemented only after the Deployment phase approves the deployment origin and indexing policy.
- The local Next.js production build, TypeScript validation, and route generation complete without error.
- Lighthouse and Core Web Vitals measurements are recorded in a production-like environment; avoidable image, font, layout-shift, and script findings are resolved without inventing an unapproved numeric threshold.
- Broken-link, responsive, accessibility, motion, screenshot, token, metadata, and content checks pass.
- No placeholder, pending destination, undefined asset, unsupported claim, or undocumented UI remains in the publication build.

## 8. Responsive Checklist

Implementation and verification order is fixed.

### 8.1 Mobile — Below `breakpoint.tablet`

- [ ] Implement the complete semantic source order as one column.
- [ ] Use `landing.screen.gutter-mobile` and `landing.section.padding-mobile`.
- [ ] Stack Hero and Final CTA action groups full-width, primary first.
- [ ] Show Product Identity and primary action only in Header.
- [ ] Stack all three Application Preview screenshots vertically at legible scale.
- [ ] Use one-column Problems, Solution pairs, Workflow, Features, Trust, FAQ, and Footer.
- [ ] Verify 320px width, mobile browser chrome changes, landscape, and keyboard appearance.

### 8.2 Tablet — `breakpoint.tablet` to Below `breakpoint.desktop`

- [ ] Use `landing.screen.gutter-wide` and `landing.section.padding-tablet`.
- [ ] Keep Hero copy above its screenshot.
- [ ] Use two columns only for Problems and Features.
- [ ] Make unmatched Problem or Feature items span the full row.
- [ ] Keep Solution pairs and Workflow stacked.
- [ ] Place Footer identity above the two-column verified link groups.

### 8.3 Desktop — `breakpoint.desktop` and Above

- [ ] Center content within `landing.screen.content-max`.
- [ ] Use the approved Hero copy/preview split.
- [ ] Use two-column Problem/Solution compositions.
- [ ] Use three-column Workflow and Features compositions.
- [ ] Keep FAQ within `landing.faq.max-width` and Final CTA within `landing.final-cta.max-width`.
- [ ] Render desktop in-page Header navigation in the approved order.
- [ ] Preserve copy line length with `landing.copy.max`.

### 8.4 Ultra-Wide — `breakpoint.wide` and Above

- [ ] Change outer breathing room only.
- [ ] Do not increase content width beyond `landing.screen.content-max`.
- [ ] Do not add columns, content, navigation, decoration, or interactions.

## 9. Motion Checklist

Implementation order follows the static narrative order:

1. Verify the complete page with no motion code.
2. Implement global reduced-motion handling using `motion.reduced`.
3. Add Hero copy and Hero preview presence using `landing.reveal` without delaying CTAs.
4. Add Problems group reveal.
5. Add each Solution pair as one reveal unit.
6. Add Workflow progressive reveal while keeping all steps present in the DOM.
7. Add Application Preview container reveal without changing screenshot financial values.
8. Add Feature row/group reveal and Trust container presence.
9. Add FAQ disclosure transition using `motion.presence` only when content is not clipped.
10. Add Final CTA container reveal.
11. Confirm Header, Hero decoration, Footer, financial values, and trust icons remain static.
12. Re-run keyboard, reduced-motion, performance, and content-visibility checks.

No motion treatment outside the approved Motion Map may be implemented.

## 10. Accessibility Checklist

- [ ] Document language is `id-ID`.
- [ ] One `header`, one `main`, one `footer`, and correctly labeled navigation landmarks exist.
- [ ] The page has exactly one `h1`; each major section begins with `h2`; item headings use `h3` only where structurally valid.
- [ ] A visible-on-focus skip link precedes navigation.
- [ ] Semantic source order remains unchanged across breakpoints.
- [ ] Links navigate and buttons control actions or disclosures.
- [ ] All functionality works with keyboard alone.
- [ ] `:focus-visible` is applied through approved focus tokens.
- [ ] Anchor navigation leaves the destination visible and provides orientation.
- [ ] FAQ buttons expose expanded state and controlled regions; focus remains on the trigger.
- [ ] Informative screenshots use the exact approved alternative text.
- [ ] Decorative Lucide icons, connector lines, structural shapes, and device chrome are hidden from accessibility APIs.
- [ ] Content remains understandable when screenshots are unavailable.
- [ ] Color is never the only carrier of meaning or interactivity.
- [ ] Approved contrast requirements pass for text, controls, focus, and meaningful boundaries.
- [ ] Touch targets meet `control.height.minimum` in both dimensions.
- [ ] 320px reflow, 200% zoom, text resizing, orientation change, and mobile keyboard behavior pass.
- [ ] `prefers-reduced-motion: reduce` produces an immediate, complete page.
- [ ] No flashing, autoplay audio/video, keyboard trap, hover-only content, or pointer-only action exists.

## 11. SEO Checklist

- [ ] Define the exact approved Page Title and Meta Description through a typed Next.js `Metadata` export.
- [ ] Define the exact approved Open Graph title and description through the same metadata contract.
- [ ] Add the approved Open Graph image through the Next.js metadata file convention or approved metadata asset reference only after asset approval.
- [ ] Reuse approved Open Graph wording for Twitter/X-compatible card metadata; do not write new social copy.
- [ ] Set `metadataBase` and canonical metadata only after the Deployment phase approves the public origin.
- [ ] Set `lang="id-ID"` in `app/layout.tsx`; rely on Next.js document handling for standard charset and viewport metadata unless an approved override is required.
- [ ] Confirm one indexable Landing Page route at `/` and no extra marketing routes.
- [ ] Implement `app/robots.ts` only from the approved deployment indexing policy.
- [ ] Implement `app/sitemap.ts` only after the canonical origin is available; include no unapproved route.
- [ ] Omit structured data unless its type and every represented claim are supported and approved.
- [ ] Do not add keywords, locality claims, ratings, reviews, customer data, or organization claims absent from approved content.

## 12. Performance Checklist

- [ ] Render critical Header, Hero copy, CTAs, and initial evidence through Server Components.
- [ ] Keep Client Component boundaries limited to FAQ disclosure and approved reveal behavior.
- [ ] Implement the canonical token layer once through Tailwind aliases and CSS custom properties; do not duplicate generated visual styles.
- [ ] Load Geist through `next/font` from the approved source with the documented fallback contract.
- [ ] Use `next/image` with known dimensions and responsive `sizes` for every screenshot.
- [ ] Generate approved responsive image delivery without upscaling source assets.
- [ ] Give the Hero image priority only when measurement confirms it is the initial primary image; allow `next/image` to defer below-fold preview images.
- [ ] Preserve captions and alternative text independently of image loading.
- [ ] Avoid layout shift from fonts, images, Header actions, and FAQ disclosures.
- [ ] Use Tailwind/CSS for simple state and motion behavior; do not add an animation library for existing approved effects.
- [ ] Keep shipped client JavaScript limited to the required Client Components.
- [ ] Inspect Next.js production-build output and client bundles for unintended client-side dependencies.
- [ ] Measure the local production build in a documented production-like environment; deployment measurements belong to the Deployment phase.
- [ ] Record the measurement environment and results.
- [ ] Resolve avoidable accessibility, image, font, script, and layout-shift findings before publication.
- [ ] Do not invent numeric performance acceptance thresholds absent from the approved deployment baseline.

## 13. Testing Checklist

### 13.1 Structural and Content

- [ ] Section order matches the Blueprint exactly.
- [ ] Visible copy matches the Content Specification exactly.
- [ ] Item counts, order, icons, CTA labels, and omissions match the specification.
- [ ] Heading hierarchy and landmarks are valid.
- [ ] No placeholder or undocumented content exists.

### 13.2 Routes and Links

- [ ] The App Router serves `/` successfully in Local Development and from the local production build.
- [ ] All approved fragments resolve to the correct section.
- [ ] Product-entry, identity, Documentation, canonical, and social-image destinations use approved values.
- [ ] No empty, guessed, or broken link is rendered.

### 13.3 Responsive

- [ ] Mobile behavior passes below `breakpoint.tablet` and at 320px.
- [ ] Tablet behavior passes at and above `breakpoint.tablet` and below `breakpoint.desktop`.
- [ ] Desktop behavior passes at and above `breakpoint.desktop`.
- [ ] Wide behavior passes at and above `breakpoint.wide` without adding layout structure.
- [ ] 200% zoom, text resize, orientation, and long Bahasa Indonesia strings do not clip or overlap.

### 13.4 Accessibility

- [ ] Keyboard-only navigation and FAQ operation pass.
- [ ] Screen-reader landmark, heading, navigation, link, figure, and disclosure output pass the approved test matrix.
- [ ] Focus visibility and order pass.
- [ ] Contrast and non-color meaning pass.
- [ ] Screenshot alternatives and decorative-image handling pass.

### 13.5 Motion

- [ ] Each implemented treatment exists in the Motion Map.
- [ ] Motion runs at most once where specified and does not delay content.
- [ ] Reduced-motion behavior is immediate.
- [ ] No financial value or trust claim animates.
- [ ] Enhancement failure leaves all content visible.

### 13.6 Assets and Credibility

- [ ] Screenshots match the required screens, states, viewport, and synthetic dataset.
- [ ] Balance and transaction history reconcile within the synthetic dataset.
- [ ] Redaction, source version, capture date, and approval are recorded.
- [ ] Brand and social assets are approved.
- [ ] No fabricated interface, claim, statistic, testimonial, badge, or capability appears.

### 13.7 Token and Performance Compliance

- [ ] Automated style review finds no visual constant outside the Primitive token layer.
- [ ] Every component consumes approved Semantic, Component, or Screen tokens.
- [ ] No local breakpoint, shadow, spacing, color, font, radius, or timing value exists.
- [ ] Screenshot dimensions prevent layout shift.
- [ ] Lighthouse and Core Web Vitals results are captured for the publication build.
- [ ] Next.js production build, TypeScript checks, and approved lint checks pass.
- [ ] Server-only Prisma modules are absent from Landing Page client bundles; any Auth.js module introduced by the future Authentication Sprint remains outside this plan and absent from the client bundle.
- [ ] Broken-link and missing-asset checks pass.

## 14. Risks

| Risk | Effect | Required control |
|------|--------|------------------|
| Product-entry and Product Identity destinations remain pending | Header, Hero, and Final CTA cannot ship as complete actions; replacing the existing `/` application shell could remove product access | Resolve both destinations before route cutover and final CTA wiring |
| Approved brand mark is pending | Header and Footer cannot use a final graphical identity | Keep required visible `Amanah Cash` text; do not substitute a Lucide or invented mark |
| Screenshot dataset and viewport are pending | Authentic Hero and Preview assets cannot be captured deterministically | Approve one internally consistent synthetic dataset and capture viewport before Milestone 4 completion |
| Final screenshots and redaction record are pending | Product evidence cannot pass credibility, privacy, or accessibility acceptance | Capture only from the approved implemented UI and record provenance and approval |
| Canonical URL is pending | Canonical, sitemap, and absolute social metadata cannot be finalized | Resolve the public origin before Milestone 9 completion |
| Open Graph image is pending | Social preview metadata remains incomplete | Use no substitute image; add only the approved final asset |
| Documentation destination is pending | Footer Resource group cannot render | Omit the entire group until a verified destination exists |
| Geist source and loading approval are pending | Typography delivery or privacy requirements may block Milestone 1 completion | Approve the source and verify fallback behavior before publication |
| App Router migration changes ownership of `/` while the existing shell currently uses that route | Implementing the Landing Page could displace current product access | Establish the approved product-entry destination before `app/page.tsx` becomes the production Landing Page; do not remove access implicitly |

## 15. Dependencies

### 15.1 Resolved

- Approved Functional Requirements and Business Rules.
- Approved Domain Model and cross-layer terminology contract.
- Approved User Flow and Wireframe.
- Approved Database Design and System Architecture.
- Approved Development Roadmap and Engineering Rules.
- Approved UI Design System and Component Guidelines.
- Approved Accessibility and Motion Guidelines.
- Approved Design Tokens, including all Landing Page tokens.
- Approved Screen Specifications and Interaction States.
- Approved Landing Page Strategy and Blueprint.
- Final Landing Page copy, CTA labels, icon assignments, screenshot requirements, alternatives, and metadata text in `docs/24-landing-page-content.md`.
- Approved Next.js App Router and React frontend.
- Approved TypeScript implementation language and Tailwind CSS styling layer.
- Approved Next.js Route Handler backend boundary.
- Approved Prisma ORM and SQLite database.
- Landing Page route `/` and approved in-page fragment destinations.

### 15.2 Deferred Architecture

- Auth.js with the Database Session Strategy is the approved long-term authentication solution. Installation, configuration, Route Handlers, and authentication schema belong to a dedicated Authentication Sprint and are not Sprint 1 dependencies.
- Production hosting and production persistence operations decisions belong to the Deployment phase. Sprint 1 is Local Development only, uses local SQLite, and does not deploy to Vercel or introduce an external database.

### 15.3 Pending Product Decisions

- Header Product Identity destination.
- Primary `Mulai menggunakan` destination and behavior.
- Documentation destination and Footer Resource-group inclusion.
- Exact synthetic screenshot names, Amounts, dates, and times.
- Screenshot capture viewport.
- Final brand mark and wordmark treatment.
- Canonical public URL.
- Open Graph image.
- Approved Geist source and loading method.
- Supported browser and assistive-technology verification matrix.
- Production deployment origin, indexing policy, and performance measurement baseline for the Deployment phase.

### 15.4 External Assets

- Geist font files or approved font-delivery source.
- Approved brand mark and wordmark files.
- Hero crop derived from approved Screenshot B.
- Screenshot A — Student List.
- Screenshot B — Student Detail.
- Screenshot C — Transaction Entry in `Setor dana` mode.
- Responsive optimized derivatives of approved screenshots.
- Approved Open Graph image.
- Lucide icon assets or approved delivery mechanism for the exact named icons.

## 16. Definition of Done

The Landing Page is complete only when all criteria below are true:

- [ ] The single approved route `/` implements Header, Hero, Problems, Solution, Workflow, Application Preview, Features, Security & Trust, FAQ, Final CTA, and Footer in the approved order.
- [ ] Every visible string, label, alternative, caption, FAQ answer, and metadata value matches `docs/24-landing-page-content.md`.
- [ ] No undocumented section, route, action, claim, asset, interaction, or product capability exists.
- [ ] All CTA and navigation destinations are approved, consistent, functional, and free of placeholders.
- [ ] Every visual value resolves through `docs/18-design-tokens.md`; token compliance is 100%.
- [ ] No raw color, spacing, size, breakpoint, radius, border, shadow, opacity, z-index, typography, or animation value exists outside the Primitive token source.
- [ ] Mobile, tablet, desktop, and ultra-wide checklists pass without changing semantic source order.
- [ ] 320px reflow, 200% zoom, text resizing, orientation, and mobile keyboard checks pass.
- [ ] WCAG 2.2 AA implementation checklist and approved assistive-technology checks pass.
- [ ] Every approved motion treatment and reduced-motion fallback passes; financial values never animate.
- [ ] All screenshots are authentic, approved, internally consistent, privacy-safe, accessible, and delivered without layout shift.
- [ ] Deployment-independent metadata is complete; canonical, robots, and sitemap outputs remain gated until the Deployment phase supplies an approved origin and indexing policy.
- [ ] `app/layout.tsx`, `app/page.tsx`, metadata files, and Landing Page component boundaries follow the approved App Router structure.
- [ ] Static sections remain Server Components; only approved interactive behavior creates Client Component boundaries.
- [ ] Local Next.js production build, TypeScript validation, and approved lint checks pass.
- [ ] Prisma remains server-only; authentication remains outside this Landing Page plan, and any future Auth.js implementation adds no undocumented behavior or client code to the public Landing Page.
- [ ] Lighthouse and Core Web Vitals measurements are recorded and avoidable implementation findings are resolved.
- [ ] No placeholder copy, pending decision marker, broken link, undefined asset, fake evidence, or speculative feature remains.
- [ ] The existing product remains reachable through the approved product-entry flow after `/` becomes the Landing Page.
- [ ] Final QA records trace each acceptance result to the governing documentation.
