# Amanah Cash — Landing Page Strategy

**Version:** 1.0

**Status:** Approved

**Owner:** Project Owner
**Last Updated:** 2026-07-18

---

## 1. Purpose and Authority

This document is the single source of truth for the Amanah Cash Landing Page strategy before UI blueprint, visual design, copy finalization, asset creation, or implementation begins.

It defines positioning, audience, value, storytelling, visual character, motion intent, and writing direction. It does not define a wireframe, mockup, component tree, final copy, animation implementation, or new application capability.

The Landing Page must remain truthful to the approved product. It may explain current capabilities and outcomes, but it must not imply that unapproved modules, security controls, integrations, roles, reports, offline transactions, or other future features already exist.

## 2. Strategic Boundary

### 2.1 Product Scope

Amanah Cash is a financial transaction management application for schools. It helps teachers and school operators record and understand student financial activity through clear balances and traceable transaction history.

The positioning is intentionally broader than student pocket money or boarding money. Boarding administrators are an important audience, but Amanah Cash is not a boarding-only product.

Preferred product terminology:

- transaksi keuangan siswa;
- pemasukan;
- pengeluaran;
- saldo;
- riwayat transaksi;
- pencatatan keuangan siswa;
- transparansi transaksi.

The cross-layer terminology contract in `docs/04-domain-model.md` Section 4.6 governs meaning. In public narrative, `pemasukan` maps to Deposit/Setoran and `pengeluaran` maps to Withdrawal/Penarikan from the perspective of movement into or out of the tracked Student Balance, not the operator's accounting revenue, expense, or cash position.

Avoid making `uang titipan`, `uang saku boarding`, or equivalent boarding-specific phrases the primary product definition. Such language may appear only when a specific, approved example genuinely requires it.

### 2.2 Landing Page Scope

The Landing Page has one strategic job: help a school stakeholder quickly understand what Amanah Cash is, why it matters, how it works at a high level, and what safe next step to take.

It must not become:

- a replacement for product documentation;
- a feature roadmap;
- a speculative future-product showcase;
- a technical architecture page;
- a startup-hype narrative;
- an ornamental marketing experience that obscures the product.

## 3. Positioning Foundation

### 3.1 Positioning Statement

The Landing Page must communicate this meaning consistently:

> Amanah Cash helps teachers manage student financial transactions simply, transparently, and confidently.

This sentence defines the message, not the final headline.

### 3.2 Positioning Pillars

| Pillar | Meaning | Proof direction |
|--------|---------|-----------------|
| Simple | Frequent financial recording is focused and understandable | Direct student search, focused transaction entry, clear actions |
| Transparent | Financial activity can be followed through transaction history | Traceable entries, explicit transaction direction, visible timestamps |
| Confident | Operators can understand the current financial position without reconstructing records manually | Authoritative Balance, explicit outcomes, consistent history |
| School-oriented | The product supports people responsible for student financial administration | Teacher-centered language and school-operational scenarios |

### 3.3 Emotional Outcome

The desired emotional progression is:

```text
Concern about incomplete records
        ↓
Recognition of a familiar daily problem
        ↓
Understanding of a simpler, traceable workflow
        ↓
Confidence in financial visibility
        ↓
Readiness to explore or use Amanah Cash
```

Across the full narrative, this progression should be experienced as:

```text
Curiosity
    ↓
Recognition
    ↓
Relief
    ↓
Confidence
    ↓
Trust
    ↓
Action
```

The Hero creates curiosity without hype. Problems Teachers Face creates recognition. How Amanah Cash Solves It and How It Works create relief by making the workflow feel manageable. Application Preview and Core Features build confidence through genuine product evidence. Security & Trust and Frequently Asked Questions establish trust through verified, restrained claims. The Final CTA turns earned trust into action. No section should interrupt, skip, or artificially accelerate this emotional sequence.

The Landing Page should leave visitors with three impressions:

1. Teachers no longer need to worry that transaction records are scattered or difficult to verify.
2. Financial activity can be understood quickly.
3. Schools can establish better transparency through clearer records.

### 3.4 Positioning Guardrails

- Lead with teacher and school outcomes, not technology.
- Describe current product behavior rather than making broad platform claims.
- Do not position the product as banking, investment, payment processing, or cryptocurrency software.
- Do not imply that Amanah Cash holds, transfers, or guarantees funds unless an approved requirement explicitly establishes that capability.
- Do not use fear, urgency, or shame to persuade teachers.
- Do not claim absolute security, zero errors, complete institutional control, or regulatory compliance without evidence.
- Keep boarding contexts secondary to the broader school-finance message.

## 4. Target Audience

### 4.1 Primary Audiences

#### Teachers

**Goals**

- Record student financial activity quickly during a busy school day.
- Understand a Student's current Balance without manual calculation.
- Answer questions about a Transaction with clear evidence.

**Frustrations**

- Notes split across books, messages, spreadsheets, or memory.
- Repetitive arithmetic and unclear corrections.
- Difficulty finding the latest entry when time is limited.
- Anxiety about explaining inconsistent records.

**Expectations**

- Minimal learning effort.
- Fast mobile interaction.
- Clear Bahasa Indonesia.
- Predictable results and visible history.

#### Homeroom Teachers

**Goals**

- Maintain an understandable record for Students under their responsibility.
- Respond confidently when Students, parents, or school staff ask about activity.
- Reduce administrative effort alongside teaching duties.

**Frustrations**

- Financial administration competes with teaching time.
- A record may be understandable only to the person who created it.
- Manual summaries become difficult as activity grows.

**Expectations**

- Information organized by Student.
- Quick search and direct entry.
- A calm interface that does not resemble accounting software for specialists.

#### School Treasurers

**Goals**

- Improve consistency and transparency in Student-level transaction records.
- Review activity without asking another person to reconstruct it.
- Reduce ambiguity between recorded money entering and leaving.

**Frustrations**

- Different recording habits across staff.
- Missing context, inconsistent formatting, or unclear transaction direction.
- Time spent checking totals against individual entries.

**Expectations**

- Exact whole-Rupiah amounts.
- Explicit pemasukan/pengeluaran meaning.
- Traceable, ordered history and reliable outcomes.

### 4.2 Secondary Audiences

#### School Principals

**Goals:** understand the operational value, accountability benefit, and adoption simplicity.

**Frustrations:** tools that add complexity, require extensive training, or promise more than they deliver.

**Expectations:** clear institutional relevance, credible claims, and evidence of transparency.

#### Boarding Administrators

**Goals:** manage frequent Student transactions efficiently in a residential-school context.

**Frustrations:** high-frequency manual entries, repeated Balance questions, and difficult record tracing.

**Expectations:** fast mobile workflows and dependable Student-level history.

Boarding administrators must feel included without making other school contexts feel secondary or unsupported.

### 4.3 Audience Priority Rule

When a message cannot address every audience equally, prioritize the daily operator first, the school decision-maker second. Explain practical workflow value before institutional benefit.

## 5. Value Proposition

### 5.1 Core Value

Amanah Cash provides one clear place to record and understand Student financial transactions.

### 5.2 Functional Value

- Find a Student quickly.
- Record pemasukan or pengeluaran through a focused workflow.
- See the authoritative current Balance.
- Review transaction history with amount, direction, and time.
- Understand explicit success or failure outcomes.

These points describe the existing product direction. The Landing Page must not expand them into unsupported features.

### 5.3 Emotional Value

- Less anxiety about incomplete or unclear transaction records.
- Greater confidence when reviewing or explaining financial activity.
- A calmer daily administrative experience.
- Trust built through visible, understandable history.

### 5.4 Business Value

- More consistent transaction-recording practices.
- Better transparency at Student level.
- Less time spent searching, recalculating, and reconstructing records.
- A stronger operational foundation for school financial administration.

Business value must be presented as a practical outcome, not an unverified performance statistic.

### 5.5 Difference from Manual Bookkeeping

| Manual bookkeeping challenge | Amanah Cash value direction |
|------------------------------|-----------------------------|
| Records may be scattered or dependent on one person's method | One consistent Student-centered transaction record |
| Balance may require repeated manual arithmetic | Balance derived from complete transaction history |
| Transaction direction can be unclear | Explicit pemasukan and pengeluaran meaning |
| Finding an old entry may take time | Ordered, searchable context and transaction history |
| Failures or corrections can be ambiguous | Explicit operation outcomes and append-only history |

The comparison must respect existing manual processes and the people using them. Do not describe teachers as careless or outdated.

## 6. Landing Page Storytelling Model

The page should move from recognition to understanding to trust to action:

```text
Hero
  ↓
Problems Teachers Face
  ↓
How Amanah Cash Solves It
  ↓
How It Works
  ↓
Application Preview
  ↓
Core Features
  ↓
Security & Trust
  ↓
Frequently Asked Questions
  ↓
Final CTA
  ↓
Footer
```

This order is strategic rather than a wireframe. UI Blueprint may refine presentation within this sequence but must preserve its narrative logic.

## 7. Information Architecture

### 7.1 Hero

**Purpose:** Establish relevance, product category, primary benefit, and next action within the first view.

The visitor should understand that Amanah Cash helps teachers manage Student financial transactions—not merely money in a boarding context and not an abstract fintech platform.

**Must communicate:** audience, task, simplicity, transparency, and confidence.

**Must avoid:** feature lists, statistics without evidence, multiple competing messages, and boarding-only framing.

### 7.2 Problems Teachers Face

**Purpose:** Create recognition through credible daily operational problems.

Focus on scattered records, repeated calculation, slow lookup, unclear transaction direction, and difficulty explaining activity. Use respectful language. The goal is empathy, not alarm.

### 7.3 How Amanah Cash Solves It

**Purpose:** Connect each recognized problem to a clear product principle.

Organize around one place to record, authoritative Balance, explicit pemasukan/pengeluaran, and traceable history. Show cause and effect rather than presenting disconnected feature cards.

### 7.4 How It Works

**Purpose:** Reduce perceived learning and adoption effort.

Explain the core journey at a conceptual level:

1. Find or select a Student.
2. Record pemasukan or pengeluaran.
3. Review updated Balance and history.

Do not turn this section into a technical tutorial or add unapproved workflow steps.

### 7.5 Application Preview

**Purpose:** Provide visual evidence that the product is real, focused, mobile-first, and understandable.

The real application is the primary marketing asset. The future UI Blueprint should prioritize authentic approved screenshots, real approved workflows, genuine product interactions, and truthful application states. Abstract marketing illustration may support the composition only when necessary; it must not replace available product evidence.

Preview content must not show invented features, fake analytics, dashboard charts, accounts, reports, or settings. Financial values in a preview must be clearly illustrative and must not animate as financial truth.

### 7.6 Core Features

**Purpose:** Make the current value scannable after the visitor understands the workflow.

Feature themes should remain outcome-led:

- Student discovery and search;
- clear pemasukan and pengeluaran recording;
- authoritative Balance;
- traceable transaction history;
- mobile-first PWA access;
- explicit operation outcomes.

Do not inflate small behaviors into separate platform capabilities.

### 7.7 Security & Trust

**Purpose:** Explain why financial information can be understood and trusted without making unsupported cybersecurity claims.

Lead with approved integrity principles:

- Balance is derived from complete transaction history.
- Transactions form traceable financial records.
- Pemasukan and pengeluaran directions are explicit.
- A Transaction is shown as successful only after persistence is confirmed.
- Failure states are explicit.

Do not claim encryption, authentication, access controls, backups, certifications, compliance, fraud prevention, or institutional security guarantees unless they are implemented and verified before copy approval.

### 7.8 Frequently Asked Questions

**Purpose:** Resolve adoption uncertainty and clarify scope before the visitor takes action.

Strategic FAQ topics:

- who Amanah Cash is for;
- which Student transactions it helps record;
- how Balance is determined;
- whether it works on mobile;
- what happens when connectivity fails;
- what is and is not included in the current product;
- how a school can evaluate or begin using it.

FAQ answers must be generated from approved product documentation at copywriting time.

### 7.9 Final CTA

**Purpose:** Convert accumulated understanding and trust into one clear next step.

Restate the outcome rather than introducing a new promise. Use one primary CTA and, only when necessary, one lower-emphasis alternative. The CTA must match a real available destination or process.

### 7.10 Footer

**Purpose:** Close the experience with orientation, credibility, and essential navigation.

Include only verified identity, product, support/contact, legal, and navigation destinations. Do not fill the Footer with empty social icons, fictitious company links, or unapproved product categories.

## 8. Hero Strategy

### 8.1 Headline Philosophy

The headline should express a teacher-centered outcome in plain language. It should combine the task category with the primary benefit without listing features.

The final headline should be:

- understandable without supporting context;
- relevant to teachers and school financial operators;
- broad enough for Student financial transactions across school contexts;
- specific enough to distinguish the product from generic bookkeeping.

Do not finalize headline copy in the strategy phase.

### 8.2 Subheadline Philosophy

The subheadline should explain how Amanah Cash creates the outcome: simpler recording, clearer Balance, and transparent history. It should add evidence and scope rather than repeat the headline.

Keep it concise enough for mobile and avoid technical terminology, exaggerated transformation, or multiple subordinate claims.

### 8.3 Primary CTA

The primary CTA should represent the shortest real path to product evaluation or use. Its strategy is action-oriented, specific, and low ambiguity.

The exact CTA label and destination must be approved after the product entry flow is confirmed. Do not use `Mulai gratis`, `Daftar sekarang`, or equivalent acquisition language unless signup and pricing behavior actually exist.

### 8.4 Secondary CTA

The secondary CTA should support visitors who need evidence before committing. Preferred strategic roles are viewing the application preview or understanding the workflow.

It must not compete visually with the primary CTA or introduce a second conversion goal.

### 8.5 Visual Direction

The Hero should balance strong typography, generous whitespace, a restrained product preview, and a small number of layered supporting elements. The product remains the evidence; abstract decoration remains secondary.

Avoid:

- full-screen gradients with weak content hierarchy;
- floating currency symbols or coins;
- fake financial charts;
- glass panels layered for decoration;
- oversized claims or statistics;
- visual metaphors associated with trading, crypto, or banking wealth.

## 9. Visual Direction

### 9.1 Desired Character

| Attribute | Visual characteristic |
|-----------|-----------------------|
| Premium | Deliberate spacing, controlled scale, refined typography, precise alignment |
| Modern | Clear responsive composition, contemporary type, purposeful interaction |
| Minimal | Few simultaneous messages, disciplined surfaces, no ornamental clutter |
| Friendly | Human language, approachable pacing, soft but controlled visual rhythm |
| Trustworthy | Authentic product evidence, stable hierarchy, readable contrast, restrained claims |
| Elegant | Balanced composition, visual continuity, subtle depth, intentional negative space |

The brand personality should feel calm, trustworthy, organized, responsible, helpful, human, and professional. These characteristics govern both visual expression and content presentation: clarity should feel supportive, and order should communicate care rather than institutional distance.

The brand must never feel corporate and cold, bureaucratic, childish, flashy, or overly technical. Professionalism should come from composure, precision, and truthful evidence—not formality, jargon, or visual severity.

### 9.2 Relationship to the Application Design System

The Landing Page should feel related to the application through Geist typography, neutral-first palette, calm professional blue, clear focus treatment, and truthful motion. It may use more expressive composition and storytelling rhythm than the application, but it must not redefine the application's operational components or financial semantics.

Any Landing Page-specific tokens must be proposed during UI Blueprint as extensions beneath the approved token architecture. Do not hardcode visual values or alter application tokens to accommodate marketing decoration.

### 9.3 Composition Principles

- Alternate dense evidence with generous breathing room.
- Use a strong vertical narrative rather than a collection of interchangeable cards.
- Prefer one dominant idea per section.
- Use product previews as proof, not background decoration.
- Create rhythm through spacing, alignment, type scale, and controlled contrast.
- Use color to focus attention; do not distribute accent color evenly across every section.
- Let mobile order determine the content hierarchy before desktop composition expands.

### 9.4 Prohibited Visual Language

- neon accents;
- crypto or trading motifs;
- excessive glassmorphism;
- gaming-style glow, particle, or achievement treatment;
- decorative financial charts;
- fake dashboards or misleading product UI;
- fabricated testimonials, endorsements, or statistics;
- generic business, finance, or school stock illustrations;
- startup-style logo walls without genuine references;
- noisy gradient meshes;
- multiple competing card styles;
- unnecessary effects that do not strengthen hierarchy, comprehension, or storytelling;
- visual effects that reduce legibility or credibility.

## 10. Motion Strategy

### 10.1 Motion Philosophy

Landing Page motion supports storytelling, attention, hierarchy, and spatial continuity. It should make the narrative feel smooth and considered without becoming the main attraction.

Every motion proposal must answer:

1. What should the visitor notice?
2. What relationship or sequence does the motion clarify?
3. Does the section remain complete and understandable without motion?

Motion never:

- implies product success before evidence;
- animates Balance, Amount, totals, or Transaction values;
- creates artificial trust through spectacle;
- blocks reading, scrolling, CTA activation, or navigation;
- overrides reduced-motion preferences.

### 10.2 Hero Motion

**Potential treatments:** restrained mouse parallax, staggered text entrance, and slow floating supporting elements.

**Strategic purpose:** establish depth, guide the eye from message to CTA to product evidence, and create a premium first impression.

**Constraints:**

- Parallax is pointer-only enhancement and absent on touch devices.
- Movement remains low amplitude and stops when off-screen.
- Text stagger preserves reading order and never delays CTA availability.
- Floating elements are abstract or structural; they do not show changing money or fake data.

### 10.3 Feature Cards

**Potential treatment:** scroll reveal.

**Strategic purpose:** pace information and help visitors process one benefit group at a time.

**Constraints:** use short fade/translation, avoid cascading spectacle, and render content immediately under reduced motion.

### 10.4 Workflow

**Potential treatment:** progressive reveal.

**Strategic purpose:** clarify the order from Student selection to Transaction entry to updated record.

**Constraints:** the sequence must remain visible and understandable without animation. Financial results appear immediately rather than counting into place.

### 10.5 Application Preview

**Potential treatment:** device entrance, controlled perspective, or transition between approved screens.

**Strategic purpose:** connect the story to tangible product evidence and demonstrate mobile-first continuity.

**Constraints:** do not fabricate interactions, autoplay a long demo, animate financial values, or hide information behind hover.

### 10.6 Footer

**Potential treatment:** subtle gradient motion.

**Strategic purpose:** provide a quiet sense of closure and continuity.

**Constraints:** near-static amplitude, no loss of text contrast, no continuous GPU-heavy effect, and a static reduced-motion equivalent.

### 10.7 Motion Performance and Accessibility

- Respect `prefers-reduced-motion` globally.
- Prefer opacity and transform for optional motion.
- Avoid scroll-jacking, pinned narrative sections that trap users, and layout animation that causes instability.
- Test on representative mobile hardware and touch input.
- Load meaningful content independently of animation libraries.
- Do not make pointer position, hover, or motion necessary to understand or operate the page.

## 11. Copywriting Guidelines

### 11.1 Tone

Landing Page copy is:

- simple;
- professional;
- human;
- confident;
- benefit-focused;
- respectful of teachers' time and responsibility.

Confidence comes from clarity and evidence, not superlatives.

### 11.2 Writing Rules

- Lead with the visitor's task or outcome.
- Use short sentences and concrete verbs.
- Explain one main idea per heading.
- Translate product behavior into practical benefit.
- Use Bahasa Indonesia that sounds natural to school operators, not literal technical translation.
- Keep `transaksi keuangan siswa`, `pemasukan`, `pengeluaran`, `saldo`, and `riwayat transaksi` consistent.
- Use current capabilities as proof.
- Qualify claims when evidence is limited.

### 11.3 Avoid

- `revolusioner`;
- `mengubah segalanya`;
- `solusi terbaik`;
- `platform nomor satu`;
- `tanpa risiko`;
- `100% aman`;
- `semua kebutuhan sekolah`;
- `kelola keuangan dengan sekali klik`;
- generic phrases such as `masa depan keuangan sekolah` without concrete meaning;
- urgency language unsupported by a real deadline;
- repeated boarding-only terminology.

### 11.4 Claim Standard

Every claim must be classified before final copy approval:

| Claim type | Required support |
|------------|------------------|
| Product behavior | Approved requirement and verified implementation |
| Usability | Approved workflow plus testing evidence |
| Performance | Recorded measurement and test baseline |
| Security | Implemented control and verification evidence |
| Institutional outcome | Qualified language or documented customer evidence |
| Testimonial/statistic | Authentic source and permission |

If evidence does not exist, rewrite the claim as a product intention or remove it.

## 12. Conversion Strategy

### 12.1 Conversion Principle

Trust precedes conversion. The page should earn action through recognition, product clarity, credible evidence, and low ambiguity—not pressure or repeated CTA placement.

### 12.2 CTA Hierarchy

- One primary conversion action across the page.
- One evidence-oriented secondary action where needed.
- Repeated primary CTA instances must keep the same label and destination.
- Never present disabled, fictitious, or placeholder conversion paths.

### 12.3 CTA Placement Logic

- Hero: immediate action for already-motivated visitors.
- After product evidence: action after understanding.
- Final CTA: decisive close after trust and FAQ concerns are addressed.

Placement describes narrative opportunity, not a wireframe or mandatory button count.

## 13. Future Scalability

### 13.1 Positioning Architecture

Use a stable brand-level umbrella:

> Simple, transparent financial administration for schools.

Current Student-financial-transaction capability and positioning sit beneath that umbrella. Future approved modules may extend the proof and navigation without changing the fundamental school audience, trust promise, or narrative model.

### 13.2 Scalable Content Model

- Position the brand around clear school financial activity, not one transaction scenario.
- Keep audience language broad enough for teachers, treasurers, and school administrators.
- Organize features by user outcome rather than database entity or temporary roadmap milestone.
- Keep Application Preview modular so approved screens can evolve without rebuilding the page narrative.
- Keep FAQ and Footer structures able to accept verified topics without pre-populating future claims.

### 13.3 Scalability Guardrail

Future readiness does not authorize future features. The Landing Page may be structurally reusable, but published content must describe only approved and implemented capabilities.

## 14. Measurement Strategy

The strategy should later be evaluated with evidence, but no metric target is approved here.

Potential measures after a real analytics and privacy decision exists:

- primary CTA engagement;
- secondary evidence-action engagement;
- progression to Application Preview and FAQ;
- mobile completion and abandonment patterns;
- qualitative comprehension among teachers and school staff;
- whether visitors can accurately explain the product after viewing the page.

Do not add analytics, tracking, cookies, or consent behavior without separate approval.

## 15. Risks

### 15.1 Positioning Risks

- Boarding-specific examples may unintentionally narrow the perceived market.
- Overly broad school-finance language may imply features beyond Student transactions.
- Generic simplicity claims may fail to differentiate the product.
- Teacher-focused messaging may underrepresent treasurer and principal concerns if institutional value is omitted.

### 15.2 Trust Risks

- Unsupported security language can damage credibility.
- Decorative fake data can make authentic product evidence feel unreliable.
- Animated financial values can conflict with the application's immediate-financial-truth principle.
- Overstating automation can obscure the operator's real responsibility.

### 15.3 Design Risks

- Premium may be misinterpreted as visual excess.
- Motion may become spectacle rather than narrative support.
- Desktop composition may weaken the mobile-first reading order.
- Too many cards can turn the page into a generic startup template.
- Landing-specific styling may drift away from the approved product identity.

### 15.4 Conversion Risks

- The primary CTA may be selected before a real access path exists.
- Multiple CTAs may split intent.
- Product Preview may reveal incomplete or non-production UI.
- FAQ may promise support or capabilities that are not operationally available.

## 16. Required Decisions Before UI Blueprint

The UI Blueprint must not begin until the Project Owner approves:

1. The real primary CTA action, label direction, and destination.
2. The secondary CTA role and whether it is necessary.
3. The exact set of implemented capabilities safe to present as current.
4. The approved product screenshots or states available for Application Preview.
5. The final Landing Page token-extension boundary.
6. The brand asset set: logo, wordmark, PWA/product mark, and any permitted abstract assets.
7. The final FAQ scope and ownership of answers.
8. Verified security and trust claims.
9. Contact, legal, support, and Footer destinations.
10. Whether analytics is permitted and, if so, its privacy requirements.

## 17. UI Blueprint Handoff Requirements

The future UI Blueprint should produce:

- section-level content hierarchy;
- responsive layout behavior;
- approved component and section anatomy;
- Landing Page-specific token proposals;
- content-length constraints;
- motion map with reduced-motion equivalents;
- Application Preview asset plan;
- accessibility acceptance criteria;
- performance budget;
- final-copy inputs and proof references.

It must not revisit the positioning, audience priority, storytelling sequence, trust guardrails, or future-scalability principles without explicit Project Owner approval.

## 18. Strategy Acceptance Checklist

- [ ] Amanah Cash is positioned as a school Student-financial-transaction application, not boarding-only.
- [ ] Teachers and Homeroom Teachers remain the primary daily-user narrative.
- [ ] School Treasurers receive clear transparency and consistency value.
- [ ] Principals and Boarding Administrators remain visible secondary audiences.
- [ ] Positioning communicates simple, transparent, and confident management.
- [ ] Manual bookkeeping is treated respectfully.
- [ ] The page tells one coherent recognition-to-action story.
- [ ] Hero strategy defines message roles without finalizing copy.
- [ ] Product Preview uses only approved product evidence.
- [ ] Security & Trust claims are evidence-gated.
- [ ] Motion supports storytelling and respects reduced motion.
- [ ] Financial values never animate.
- [ ] Visual direction is premium through typography, whitespace, hierarchy, motion, and composition—not overload.
- [ ] Copy avoids hype, clichés, and unsupported absolutes.
- [ ] CTA destinations are real before publication.
- [ ] Future scalability does not imply future capability.
