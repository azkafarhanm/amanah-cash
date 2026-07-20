# Amanah Cash Foundation Review

> Historical review notice (2026-07-20): this document records the pre-Transaction-Foundation review. Its derived-Balance, append-only Transaction, no-actor, and no-soft-delete conclusions are superseded by ADR-004 and the Transaction Foundation TDS. Authentication, authorization, privacy, PWA, and foundation findings remain historical evidence; this file is not an active financial architecture authority.

**Status:** Foundation Audit  
**Audit date:** 18 July 2026  
**Scope:** Approved product, engineering, application UI, and landing-page foundation documentation

## Executive Summary

The Amanah Cash foundation is coherent at the product and domain level. Product principles, functional requirements, business rules, domain definitions, user flows, database design, system architecture, engineering rules, screen specifications, and interaction states consistently preserve the essential financial invariants:

- Balance is derived from the complete append-only transaction history.
- Deposits increase Balance and Withdrawals decrease Balance.
- Monetary amounts are positive whole Rupiah values.
- Withdrawals must be validated and persisted atomically and must never produce a negative Balance.
- Financial truth appears immediately after confirmed persistence and is never conveyed by animation.
- Offline financial writes are blocked rather than queued.
- The MVP remains a local, unauthenticated, three-screen application with progressive history disclosure.

The application UI direction is also substantially implementation-ready. The approved single-column responsive model, overlay behavior, loading and empty-state patterns, accessibility baseline, token architecture, and interaction-state contracts agree across the governing documents. The landing-page Blueprint and Content Specification follow the approved product-first, trust-oriented positioning and avoid unsupported commercial patterns.

Development should proceed only after a small set of targeted revisions resolves competing authorities and one database implementation contract. None requires redesigning the product or adding a feature. The most consequential issue is that the architecture assumes per-Student database row locking and database-role permissions, while the selected SQLite foundation does not provide those mechanisms as described. The project must define an equivalent SQLite-compatible transaction and serialization contract before implementing financial writes.

## Documents Reviewed

### Product and domain foundation

- `00-product-principles.md` — product purpose, trust model, and financial invariants.
- `01-functional-requirements.md` — MVP capabilities and acceptance behavior.
- `02-non-functional-requirements.md` — performance, reliability, accessibility, and PWA constraints.
- `03-business-rules.md` — authoritative validation and transaction rules.
- `04-domain-model.md` — Student, Transaction, Balance, and monetary vocabulary.
- `05-user-flow.md` — Dashboard, Student Detail, Deposit, and Withdrawal flows.
- `06-wireframe.md` — structural screen hierarchy and state placement.

### Engineering foundation

- `07-database-design.md` — logical schema, indexes, append-only policy, and transaction boundaries.
- `08-system-architecture.md` — system boundaries, layers, write sequencing, and concurrency model.
- `09-development-roadmap.md` — milestone order and acceptance gates.
- `10-engineering-rules.md` — mandatory implementation constraints.
- `11-development-workflow.md` — delivery, review, and documentation workflow.

### Application UI foundation

- `12-ui-design-system.md` — application visual language and design authority.
- `13-design-references.md` — reference-use constraints and screen directions.
- `14-component-guidelines.md` — component selection and composition rules.
- `15-motion-guidelines.md` — approved motion vocabulary and prohibitions.
- `16-accessibility-guidelines.md` — WCAG 2.2 AA implementation contract.
- `17-design-review-checklist.md` — design and implementation review gates.
- `18-design-tokens.md` — four-layer visual-token source of truth.
- `19-screen-specifications.md` — implementation-ready MVP screen behavior.
- `20-interaction-states.md` — reusable loading, error, offline, success, and uncertainty states.

### Landing-page foundation

- `22-landing-page-strategy.md` — positioning, narrative, audience, and product-first strategy.
- `23-landing-page-blueprint.md` — responsive visual and interaction specification.
- `24-landing-page-content.md` — final visible copy, CTAs, screenshot requirements, and metadata.

### Supporting evidence checked

- `README.md`, `AI_CONTEXT.md`, and `CHANGELOG.md` for repository orientation and implementation status.
- `migrations/001_initial_schema.sql`, `src/persistence/database.js`, and the database tests for alignment between the documented database contract and the selected SQLite foundation.

All local Markdown document references inspected during the audit resolve to existing files. The missing number `21` is a numbering gap, not a broken dependency. External inspiration links are non-authoritative and were not treated as implementation dependencies.

## Findings

### F-01 — Core product and financial rules are consistent

**Classification:** Confirmed strength

The governing documents use the same formula, transaction directions, validation rules, write ordering, and failure behavior. The database schema also preserves positive integer amounts, approved transaction types, Student referential integrity, and deterministic history ordering. No conflicting business rule or Balance definition was found.

The repeated statements about derived Balance, append-only history, nonnegative Balance, and offline-write prohibition are intentional cross-layer traceability rather than harmful duplication. Their repetition is useful because each document applies the same invariant at a different implementation boundary.

### F-02 — The selected database does not match two assumed enforcement mechanisms

**Classification:** Required fix; financial-write implementation blocker

The database and architecture documents require each financial write to lock the selected Student row and describe database-role permissions that allow inserts but prevent transaction updates and deletes. The current foundation selects SQLite, whose locking and permission model does not provide per-row locks or table-level role grants as described. The current schema has no trigger preventing direct transaction update or deletion; its foreign key only prevents deleting a Student who has referenced transactions.

This does not invalidate the business rules. It leaves the implementation mechanism unspecified. Before Deposit and Withdrawal use cases are built, the documentation must approve one SQLite-compatible contract covering:

- the exact transaction mode used for financial writes;
- serialization behavior for concurrent writes to the same Student;
- whether the deployment is restricted to one application process;
- busy handling and retry behavior;
- atomic Balance validation and transaction insertion; and
- the enforcement boundary for append-only transactions when database grants are unavailable.

The contract must continue to satisfy `BR-BAL-004`, `BR-BAL-005`, `BR-TXN-003`, `BR-TXN-004`, and the governing architecture sequence. Selecting an equivalent mechanism is an engineering clarification, not a new product capability.

### F-03 — UI authority ordering preserves superseded recommendations

**Classification:** Required fix; UI implementation blocker

The approved Design Tokens specify Geist, a calm blue primary palette, exact radii, border-first cards, and defined elevation tokens. The older UI Design System still recommends Inter pending approval, a deep emerald primary, and a more restrictive shadow rule. It also places the UI Documentation Pack above approved project tokens in its authority order.

Because both documents are Approved, an implementer cannot determine whether to obey the older visual recommendations or the exact token source of truth. The UI Design System also lists palette, typeface, radius, shadow, and content width as unresolved even though the Design Tokens already resolve them.

The governing order must explicitly make `18-design-tokens.md` authoritative for visual values and mark the superseded recommendations and resolved decision list in `12-ui-design-system.md` accordingly. The approved token values themselves do not need redesign.

### F-04 — Landing motion strategy contains treatments prohibited globally

**Classification:** Required fix; conflicting guidance

The Motion Guidelines prohibit parallax and animated gradients. The Landing Page Strategy still lists restrained mouse parallax for the Hero and subtle gradient motion for the Footer as candidate treatments. The approved Blueprint correctly omits both, but its authority chain includes the Strategy, so the source conflict remains available to future implementers.

The Strategy must defer explicitly to the Motion Guidelines and remove or mark those two treatments as prohibited. The Blueprint's current static decoration and standard reveal behavior are the compliant implementation direction and should remain unchanged.

### F-05 — Landing-specific visual tokens are outside the declared token source of truth

**Classification:** Required fix; landing implementation blocker

The Blueprint defines landing-specific primitive, semantic, component, and screen tokens, including content widths, large display typography, spacing, breakpoints, and section tokens. The Design Tokens declare that every visual value must originate from that document as the single source of truth, but these landing extensions do not exist there.

Before landing-page implementation, the approved landing extensions must be promoted into the canonical token registry, or the token document must formally designate the Blueprint's token table as an approved extension namespace. A developer must not have to copy values between competing registries or decide which registry governs.

### F-06 — Domain, application, and public terminology lack an explicit mapping

**Classification:** Required clarification

The domain and persistence layers consistently use `Deposit`/`deposit` and `Withdrawal`/`withdrawal`. Application screen specifications use the Indonesian actions `Setor` and `Tarik`, while landing content also uses `pemasukan`, `pengeluaran`, `setoran`, and `penarikan`. These words can describe different accounting perspectives unless their relationship is explicit.

The older flow, wireframe, and component documents also contain English visible labels, while the approved MVP language decision requires Bahasa Indonesia and the Screen Specifications provide final application labels. The documents do not explicitly identify those English strings as semantic placeholders.

A canonical terminology matrix must identify the approved term for each layer and its perspective without changing the domain meaning. It must also state that `19-screen-specifications.md` governs production application copy and `24-landing-page-content.md` governs landing-page copy; earlier English labels are structural, not final visible content.

### F-07 — Product positioning needs a scope boundary, not a positioning change

**Classification:** Required clarification

The landing documents correctly position Amanah Cash broadly as a student financial transaction management application for schools. The current functional scope remains the narrower Deposit, Withdrawal, Balance, and transaction-history model, and one token document still describes the operators specifically as boarding-school operators.

The broad positioning is compatible with future expansion, but the foundation should state once that positioning breadth does not imply capabilities beyond the approved MVP. References to the operating audience in application design guidance should use the approved school-wide audience consistently. This prevents future agents from either narrowing the brand to boarding use or expanding the MVP from marketing language.

### F-08 — Foundation discovery and approval metadata are stale

**Classification:** Required maintenance fix

The repository documentation maps in `README.md` and `AI_CONTEXT.md` stop at document `11`, so agents following the official entry points will not discover the approved UI and landing-page authorities. In addition, the user-approved Blueprint and Content Specification are labeled `Implementation Specification` and `Content Specification` rather than `Approved`, unlike the rest of the approved pack.

The repository map and authority guidance must include documents `12` through `24`, and the status metadata for documents `23` and `24` must reflect their approved state. This is a governance correction; no document content or structure needs rewriting.

### F-09 — Landing content describes target capabilities ahead of live implementation

**Classification:** Publication dependency; not a core-development blocker

The repository currently identifies only the foundation milestone as implemented, while the landing content describes Student search, transaction entry, derived balances, history, offline behavior, installation, and other target MVP behavior as available product capabilities. Those claims are consistent with approved requirements, but they are not all supported by the current implementation yet.

The content may remain the target launch specification, but the foundation must establish a publication gate: every visible product claim and every authentic screenshot must be verified against the release candidate before the landing page is published. This preserves the Strategy's product-first and no-misleading-UI rules without weakening the approved copy.

### F-10 — Accessibility rules are consistent, with validation evidence still pending

**Classification:** Open verification dependency

The WCAG 2.2 AA target, semantic structure, keyboard behavior, `:focus-visible` requirement, touch-target rules, live-region guidance, error identification, and reduced-motion behavior are aligned across Accessibility Guidelines, Design Tokens, Screen Specifications, Interaction States, and the Landing Blueprint.

The token palette defines candidate foreground and status colors, but the foundation does not include a completed contrast matrix for every permitted foreground/background pairing. The Accessibility Guidelines already identify final contrast testing and a supported browser/assistive-technology matrix as human decisions. These must be completed before production visual acceptance, but they do not require a design-system change unless a pairing fails.

### F-11 — Responsive, state, overlay, and motion contracts are aligned

**Classification:** Confirmed strength

The application documents consistently require a single-column centered shell, no desktop sidebar, Dialog on desktop, Bottom Sheet on mobile browser and installed PWA, Skeleton loading for page structure, Button Loading for submission, and icon-led empty states without illustrations. The landing page may use responsive multi-column compositions because it is a separate storytelling surface; this does not conflict with the application's single-column operational shell.

The financial-motion rule is also consistent in every implementation-level document: authoritative money values update immediately after persistence and are never counted, interpolated, or animated. Container emphasis may support attention but cannot signal financial truth or premature success.

## Required Fixes

The following revisions are required before the affected implementation work begins. They are deliberately narrow and do not alter approved product behavior.

| ID | Required revision | Must be complete before |
|---|---|---|
| RF-01 | Define the SQLite-compatible financial-write serialization, atomicity, busy handling, process-boundary, and append-only enforcement contract. | Deposit and Withdrawal implementation |
| RF-02 | Make Design Tokens authoritative over provisional visual recommendations; retire stale Inter, emerald-primary, shadow, and unresolved-token guidance in the UI Design System. | Production application UI implementation |
| RF-03 | Remove or explicitly prohibit landing parallax and animated-gradient candidates in the Strategy so it fully defers to Motion Guidelines. | Landing animation implementation |
| RF-04 | Promote or formally register all approved landing token extensions within the token source-of-truth contract. | Landing visual implementation |
| RF-05 | Approve a terminology matrix for domain, persistence, application UI, and public copy; identify the documents governing final visible copy. | Production copy and UI implementation |
| RF-06 | State that broad school-oriented positioning does not expand approved MVP capabilities and align the audience description in the design foundation. | Public-facing implementation review |
| RF-07 | Add documents `12`–`24` to repository discovery and authority guidance, and mark documents `23` and `24` as Approved. | AI-agent implementation handoff |
| RF-08 | Establish a release-candidate verification gate for landing claims and screenshots. | Landing-page publication |

## Open Decisions

These decisions remain unresolved but have different deadlines. They should be settled at the stated gate rather than expanding the foundation indefinitely.

### Must be decided before application UI implementation

- **Frontend implementation stack:** approve whether the current vanilla web foundation will be retained or replaced/extended with the preferred Tailwind CSS, shadcn/ui, Framer Motion, and Lucide stack. Documentation names preferred technologies but does not authorize a migration or define coexistence.
- **Canonical terminology matrix:** approve the user-facing relationship among Deposit, Withdrawal, Setor, Tarik, pemasukan, pengeluaran, setoran, and penarikan, including the accounting perspective represented by each.
- **Contrast and compatibility verification:** approve the final contrast-tested token pairing matrix and the supported browser, keyboard, screen-reader, and PWA test matrix.

### Must be decided before financial-write implementation

- **SQLite concurrency boundary:** approve the mechanism described in RF-01 and whether the supported deployment is limited to a single application process.
- **Append-only enforcement boundary:** approve whether immutability is enforced through SQLite triggers, an application-owned data-access boundary, or another documented mechanism compatible with the selected database.

### Must be decided before landing-page implementation or publication

- **CTA destinations:** resolve the Header identity link, primary product-entry destination, and Documentation destination currently marked `Pending Product Decision`.
- **Authentic product assets:** approve the deterministic synthetic dataset, capture viewport, final screenshot set, redaction review, and brand mark.
- **Publishing metadata assets:** approve the canonical public URL and Open Graph image.
- **Capability verification:** confirm that every visible claim and workflow in `24-landing-page-content.md` exists in the release candidate before publication.

The absent document number `21`, future dark mode, future modules, support/legal links, and future commercial models are not current implementation blockers. They should remain out of scope until separately approved.

## Overall Readiness

The Product Foundation is structurally sound and does not require a product redesign. The business model, financial invariants, primary user flows, logical data model, interaction states, and approved visual direction are sufficiently defined for development. The remaining work is a focused consistency pass plus one explicit SQLite enforcement contract.

Development readiness by workstream is therefore:

- **Non-financial foundation and Student work:** ready under the current roadmap and rules.
- **Deposit and Withdrawal work:** ready after RF-01 and the related concurrency and append-only decisions are approved.
- **Production application UI:** ready after RF-02, RF-05, the frontend stack decision, and accessibility verification criteria are resolved.
- **Landing-page implementation:** ready after RF-03, RF-04, and CTA/asset decisions; publication additionally requires RF-08.

READY FOR DEVELOPMENT AFTER MINOR REVISIONS
