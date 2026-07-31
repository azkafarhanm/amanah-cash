# Amanah Cash — Landing Page Design & Content Specification

**Version:** 1.1  
**Status:** Implemented  
**Owner:** Product Owner  
**Last Updated:** 2026-07-30

---

## 1. Purpose and Approval Boundary

This document defines the complete product, information architecture, content,
visual direction, interaction, accessibility, and acceptance specification for
the public Amanah Cash Landing Page.

It is a documentation deliverable only. It does not authorize application-code
changes, asset production, route changes, analytics, publication, or deployment.
Implementation must wait for explicit Product Owner approval.

This specification extends the existing Landing Page strategy, blueprint, and content
documents with the current MVP scope and broader institutional positioning. Until
fully synchronized, the currently approved and implemented contracts in
`docs/22-landing-page-strategy.md` through
`docs/25-landing-page-implementation-plan.md` remain authoritative.

If this proposal conflicts with product requirements, business rules, privacy
boundaries, authorization rules, or implemented behavior, those higher
authorities win. The conflicting claim must be removed or corrected before
approval.

## 2. Product Positioning

### 2.1 Product Definition

Amanah Cash is a modern financial-management application for schools, Islamic
boarding schools, foundations, orphanages, and similar institutions that need
student financial administration to be clear, accountable, and easy to operate.

It helps authorized staff manage students, record deposits and withdrawals,
understand current balances, review transaction history, produce reports, and
maintain operational continuity through role-aware administration and backup and
restore.

Amanah Cash is not presented as:

- a bank, digital wallet, payment processor, investment product, or accounting
  suite;
- a system that holds, transfers, or guarantees funds;
- a substitute for institutional policy, supervision, or deployment-level
  security and disaster-recovery procedures; or
- a source of capabilities that are planned but not implemented.

### 2.2 Positioning Statement

> Amanah Cash helps institutions manage student financial activity through one
> simple, traceable, and accountable workflow.

This statement defines the intended meaning, not necessarily the visible hero
headline.

### 2.3 Core Values

| Value | Landing Page meaning | Required evidence |
|---|---|---|
| Simple | Frequent tasks are direct and understandable | Student search, focused transaction entry, clear navigation |
| Fast | Staff can complete common workflows without reconstructing records | Direct deposit/withdrawal flow and immediate committed result |
| Transparent | Financial activity can be followed and explained | Balance, history, reports, and audit evidence |
| Secure | Access and recovery follow defined controls | Role permissions, data-integrity boundary, backup validation |
| Reliable | Recorded outcomes remain consistent and recoverable | Persisted balance, transaction history, explicit outcomes, backup and restore |

“Secure” and “reliable” must always be supported by a concrete behavior. They
must never become claims of absolute security, zero downtime, zero data loss,
regulatory certification, or perfect error prevention.

### 2.4 Audience

**Primary operational audience**

- teachers and homeroom teachers responsible for daily student transactions;
- school or institution treasurers responsible for review and reporting;
- operators responsible for student records and transaction entry.

**Primary decision-making audience**

- school principals;
- foundation and orphanage administrators;
- Islamic boarding school leaders;
- administrators evaluating adoption, accountability, and operational fit.

**Audience priority rule:** explain the daily operator workflow first, then show
the accountability and continuity value needed by decision-makers.

### 2.5 Visitor Questions to Answer

Within the first screen:

1. What is Amanah Cash?
2. Who is it for?
3. What practical problem does it solve?
4. What can I do next?

Before the visitor reaches the final CTA:

1. How does the daily workflow operate?
2. Which capabilities exist now?
3. How are access, data integrity, traceability, and recovery handled?
4. What limitations should an institution understand?

## 3. Experience Goals and Principles

The Landing Page is the public face of Amanah Cash. It should feel more
expressive and premium than the internal application while remaining part of the
same product.

The desired experience is:

- modern, elegant, calm, and memorable;
- spacious, readable, and professionally composed;
- informative before persuasive;
- confident without exaggeration;
- refined through typography, proportion, authentic product evidence, and
  restrained motion rather than decoration.

The emotional progression is:

```text
Recognition of a familiar problem
             ↓
Understanding of a simpler workflow
             ↓
Confidence in implemented capability
             ↓
Trust through concrete controls
             ↓
Readiness to explore Amanah Cash
```

Every section must contribute new information. Do not add testimonials,
customer logos, adoption counts, time-saving percentages, pricing, urgency,
certifications, or decorative statistics unless verified evidence and explicit
approval are later supplied.

## 4. Information Architecture

### 4.1 Approved Narrative Order

```text
Header
  ↓
Hero
  ↓
Operational Problems
  ↓
Practical Solution
  ↓
How It Works
  ↓
Implemented Features
  ↓
Security, Integrity & Trust
  ↓
FAQ
  ↓
Final CTA
  ↓
Footer
```

This order moves from recognition to explanation, proof, trust, and action.
Application screenshots may be embedded in the Hero, Workflow, or Features
sections rather than creating an additional narrative section. A separate
Application Preview section is permitted only when the final asset set provides
meaningful evidence that is not duplicated elsewhere.

### 4.2 Header

**Purpose:** identify the product, support orientation, and provide one
consistent product-entry action.

**Audience:** all visitors.

**Key message:** Amanah Cash is a focused, accessible product—not a complex
corporate site.

**Recommended content:**

- visible product identity: `Amanah Cash`;
- desktop anchors: `Cara kerja`, `Fitur`, `Keamanan`, `Tanya jawab`;
- primary action: `Mulai menggunakan`;
- mobile/tablet: identity and primary action only unless usability testing
  justifies an accessible menu.

**CTA:** `Mulai menggunakan` → `/login`.

The header remains in normal document flow by default. Sticky behavior requires
evidence that it improves navigation and must not reduce the first-screen
content area or obscure anchor targets.

## 5. Section Content Specification

All final visible Landing Page copy uses Bahasa Indonesia, sentence case, and
the `id-ID` locale. Product terminology follows the approved domain language:
`siswa`, `setoran`, `penarikan`, `saldo`, `transaksi`, `riwayat`, `laporan`, and
`jejak audit`.

### 5.1 Hero

**Purpose:** explain what Amanah Cash is, who it serves, and why it is useful
within a few seconds.

**Target audience:** daily operators and institutional decision-makers.

**Key message:** student financial activity can be managed through one clear and
accountable workflow.

**Final headline**

`Kelola keuangan siswa dengan lebih jelas dan terpercaya`

**Final supporting description**

`Amanah Cash membantu sekolah, pesantren, yayasan, dan lembaga sejenis mencatat
setoran dan penarikan, memantau saldo, serta menelusuri aktivitas keuangan siswa
dalam satu aplikasi yang mudah digunakan.`

**Supporting proof line**

`Dirancang untuk pekerjaan harian melalui browser di ponsel maupun komputer.`

**Primary CTA:** `Mulai menggunakan` → `/login`.

**Secondary CTA:** `Lihat cara kerja` → `#cara-kerja`.

**Illustration direction:**

- use an authentic, approved product composition showing a student context,
  balance, transaction actions, and recent history;
- use synthetic Indonesian names and whole-Rupiah values only;
- frame the interface with restrained layered surfaces and one subtle structural
  accent;
- do not fabricate charts, notifications, awards, integrations, or device
  hardware;
- do not use coins, banknotes, cryptocurrency imagery, or generic stock photos;
- keep the product evidence legible and subordinate to the headline.

**Accessibility:** the headline is the page’s only `h1`. The screenshot
alternative describes its purpose, not every visible number. Decorative layers
are hidden from accessibility APIs.

### 5.2 Operational Problems

**Purpose:** show recognition of real administrative friction without blaming
the people doing the work.

**Target audience:** teachers, operators, treasurers, and managers familiar with
manual or fragmented records.

**Key message:** small recording problems accumulate into slow review,
uncertainty, and difficult reporting.

**Final heading**

`Pencatatan manual membuat informasi sulit diikuti`

**Final lead**

`Ketika transaksi tersebar di buku, pesan, atau lembar kerja, saldo dan riwayat
siswa membutuhkan lebih banyak waktu untuk diperiksa.`

**Recommended content**

| Problem | Final description |
|---|---|
| `Catatan tersebar` | `Transaksi dapat tersimpan di beberapa tempat dan mengikuti cara pencatatan yang berbeda.` |
| `Saldo harus dihitung ulang` | `Setiap transaksi baru atau koreksi dapat memerlukan perhitungan manual kembali.` |
| `Riwayat sulit ditelusuri` | `Menemukan transaksi tertentu menjadi lambat ketika urutan dan keterangannya tidak konsisten.` |
| `Laporan menyita waktu` | `Rekap membutuhkan pengumpulan dan pemeriksaan ulang dari catatan yang terpisah.` |
| `Kesalahan manusia sulit ditemukan` | `Salah jumlah, arah transaksi, atau siswa dapat terlambat diketahui tanpa jejak yang jelas.` |

**CTA:** none. This section builds recognition and must not interrupt the
narrative.

**Claim guardrail:** do not claim that manual work always loses money, causes
fraud, or reflects negligence.

### 5.3 Practical Solution

**Purpose:** connect each problem to a real Amanah Cash workflow.

**Target audience:** all visitors, with language accessible to non-technical
decision-makers.

**Key message:** Amanah Cash centralizes daily student financial administration
and makes each recorded outcome easier to review.

**Final heading**

`Satu alur untuk mencatat, memeriksa, dan mempertanggungjawabkan`

**Final lead**

`Data siswa, transaksi, saldo, laporan, dan riwayat perubahan tersedia dalam
konteks yang saling terhubung sehingga pekerjaan harian lebih mudah dipahami.`

**Recommended content**

| Workflow value | Final description |
|---|---|
| `Konteks siswa yang jelas` | `Cari siswa lalu lihat saldo, transaksi, dan tindakan yang tersedia pada konteks yang tepat.` |
| `Pencatatan terarah` | `Setoran dan penarikan menggunakan alur yang membedakan jenis transaksi, jumlah, waktu, dan keterangan.` |
| `Saldo diperbarui dari transaksi` | `Setelah transaksi berhasil disimpan, saldo terbaru dan riwayatnya dapat diperiksa tanpa mengubah saldo secara manual.` |
| `Pelaporan siap ditinjau` | `Ringkasan dan laporan membantu pengguna meninjau aktivitas tanpa menyusun ulang seluruh catatan.` |
| `Perubahan dapat ditelusuri` | `Tindakan penting meninggalkan riwayat yang membantu pemeriksaan dan pertanggungjawaban.` |

**CTA:** `Jelajahi fitur` → `#fitur`.

### 5.4 How It Works

**Purpose:** make the operating model understandable at a glance and reduce
perceived learning effort.

**Target audience:** prospective operators and the people responsible for
onboarding them.

**Key message:** the primary workflow is linear, explicit, and traceable.

**Final heading**

`Cara kerja Amanah Cash`

**Final lead**

`Mulai dari siswa yang tepat, catat aktivitas keuangan, lalu tinjau hasil dan
jejaknya.`

**Visible workflow**

```text
1. Pilih siswa
        ↓
2. Catat setoran atau penarikan
        ↓
3. Saldo diperbarui setelah transaksi tersimpan
        ↓
4. Tinjau laporan dan riwayat transaksi
        ↓
5. Periksa jejak audit bila diperlukan
        ↓
6. Buat backup untuk kebutuhan pemulihan
```

**Step descriptions**

| Step | Final title | Final description |
|---|---|---|
| 1 | `Pilih siswa` | `Cari nama siswa dan buka detail yang tepat sebelum mencatat transaksi.` |
| 2 | `Catat transaksi` | `Pilih Setor atau Tarik, masukkan jumlah Rupiah utuh, waktu, dan keterangan yang diperlukan.` |
| 3 | `Periksa hasil` | `Konfirmasi bahwa transaksi tersimpan dan saldo terbaru tampil sesuai hasil yang dicatat.` |
| 4 | `Tinjau aktivitas` | `Gunakan riwayat dan laporan untuk memahami transaksi siswa atau aktivitas dalam periode tertentu.` |
| 5 | `Telusuri perubahan` | `Gunakan jejak audit untuk memeriksa tindakan penting beserta konteks pelakunya.` |
| 6 | `Jaga keberlanjutan data` | `Admin dapat membuat backup dan menjalankan proses restore yang tervalidasi saat benar-benar diperlukan.` |

**CTA:** `Lihat fitur yang tersedia` → `#fitur`.

**Visual storytelling:**

- desktop may use a horizontal or stepped path with an unambiguous reading
  order;
- mobile uses one vertical ordered list;
- connectors communicate sequence but remain decorative;
- financial values never count up or animate;
- backup is shown as an administrative continuity step, not part of every
  transaction.

### 5.5 Implemented Features

**Purpose:** provide factual proof of current product value.

**Target audience:** evaluators comparing the MVP with their operational needs.

**Key message:** Amanah Cash already covers the core workflow required to manage
student financial records responsibly.

**Final heading**

`Fitur untuk pekerjaan harian yang nyata`

**Final lead**

`Setiap fitur mendukung pencatatan, peninjauan, pengendalian akses, atau
keberlanjutan operasional.`

Only implemented, verified features may appear:

| Feature | Final description |
|---|---|
| `Pengelolaan siswa` | `Tambah, cari, perbarui, dan kelola data siswa sesuai kewenangan pengguna.` |
| `Setoran dan penarikan` | `Catat dana yang masuk atau keluar dari saldo siswa melalui alur transaksi yang terarah.` |
| `Saldo terkini` | `Lihat saldo siswa yang disimpan dan direkonsiliasi dengan riwayat transaksi.` |
| `Riwayat transaksi` | `Tinjau jenis, jumlah, waktu, keterangan, dan status transaksi secara berurutan.` |
| `Laporan dan ekspor` | `Tinjau ringkasan serta hasilkan dokumen yang tersedia untuk kebutuhan pemeriksaan operasional.` |
| `Jejak audit` | `Telusuri tindakan penting dan perubahan yang memengaruhi data keuangan atau kepemilikan operasional.` |
| `Akses berbasis peran` | `Admin dan Operator menerima menu serta tindakan sesuai kewenangan yang ditegakkan di server.` |
| `Backup dan restore` | `Admin dapat membuat backup aplikasi dan memulihkan backup yang kompatibel melalui proses validasi dan konfirmasi.` |
| `Pengaturan` | `Atur tema, jumlah item per halaman, keamanan akun, dan informasi aplikasi sesuai peran.` |
| `Antarmuka responsif` | `Gunakan alur utama melalui browser pada ponsel maupun komputer dengan struktur yang menyesuaikan layar.` |

**CTA:** none within individual cards. Static cards must not look clickable.

**Publication gate:** before implementation, each item must be checked against
the production-bound application version. Remove any item that is unavailable,
disabled, or not approved for the target release.

### 5.6 Security, Integrity & Trust

**Purpose:** explain the concrete controls behind trust without making
unsupported security claims.

**Target audience:** principals, administrators, treasurers, and technically
informed evaluators.

**Key message:** Amanah Cash protects clarity and accountability through
controlled access, consistent financial writes, traceability, and recovery
controls.

**Final heading**

`Kepercayaan dibangun dari kontrol yang dapat dijelaskan`

**Final lead**

`Amanah Cash menggunakan batas akses dan pencatatan yang jelas agar aktivitas
penting dapat diperiksa dan data operasional dapat dipulihkan dengan terkendali.`

**Recommended content**

| Trust area | Final description | Required limitation |
|---|---|---|
| `Jejak audit` | `Tindakan penting menyimpan konteks perubahan dan pelaku untuk mendukung pemeriksaan.` | Do not claim that every read or browser event is audited. |
| `Integritas data keuangan` | `Transaksi dan perubahan saldo disimpan dalam satu batas konsistensi, menggunakan jumlah Rupiah utuh, dan dapat direkonsiliasi.` | Do not claim that software eliminates every input mistake. |
| `Akses berbasis peran` | `Kewenangan Admin dan Operator diperiksa di server, bukan hanya disembunyikan dari tampilan.` | Do not imply that roles can be freely customized. |
| `Backup dan restore` | `Backup mencakup keadaan operasional yang disetujui; restore memerlukan validasi, konfirmasi, dan proses pemeliharaan terkendali.` | Do not imply automatic cloud backup, guaranteed zero data loss, or cross-version compatibility without validation. |
| `Privasi data` | `Tampilan dan hasil ekspor mengikuti kewenangan pengguna dan tidak menggunakan data nyata pada materi pemasaran.` | Do not claim certification or legal compliance that has not been verified. |

**CTA:** optional text action `Baca tanya jawab` → `#tanya-jawab`. Omit it if
the section already flows naturally into FAQ.

**Forbidden claims**

- `100% aman`, `tidak dapat diretas`, or equivalent;
- end-to-end encryption unless a verified architecture supports that exact
  claim;
- automatic cloud synchronization or backup;
- regulatory, ISO, SOC, PCI, banking, or government certification;
- guaranteed uptime, data retention, or zero data loss;
- “prevents fraud” or “eliminates human error.”

### 5.7 Frequently Asked Questions

**Purpose:** answer practical adoption questions and clarify limitations before
the visitor acts.

**Target audience:** operators and decision-makers conducting a final fit check.

**Key message:** Amanah Cash is understandable about its scope, roles, operating
requirements, and recovery boundaries.

**Final heading**

`Pertanyaan yang sering diajukan`

**Final lead**

`Jawaban singkat tentang penggunaan, akses, pencatatan, laporan, dan
pemulihan data.`

#### 1. Apa itu Amanah Cash?

`Amanah Cash adalah aplikasi pengelolaan keuangan siswa untuk membantu sekolah,
pesantren, yayasan, panti asuhan, dan lembaga sejenis mencatat transaksi,
memantau saldo, meninjau laporan, dan menelusuri riwayat secara lebih jelas.`

#### 2. Siapa yang dapat menggunakan Amanah Cash?

`Amanah Cash digunakan oleh pengguna yang telah disediakan oleh pengelola
sistem. Admin mengelola cakupan administratif dan pemulihan data, sedangkan
Operator menjalankan pekerjaan harian sesuai siswa dan kewenangan yang
diberikan.`

#### 3. Transaksi apa yang dapat dicatat?

`Pengguna yang berwenang dapat mencatat setoran dan penarikan pada saldo siswa.
Jumlah menggunakan Rupiah utuh dan hasil yang tersimpan dapat ditinjau pada
saldo serta riwayat transaksi.`

#### 4. Bagaimana saldo siswa dihitung?

`Saldo berubah melalui transaksi yang berhasil disimpan. Amanah Cash
mempertahankan saldo tersimpan dan riwayat transaksi dalam batas konsistensi
yang dapat direkonsiliasi; saldo tidak diedit sebagai angka bebas.`

#### 5. Apakah tersedia laporan?

`Ya. Pengguna dapat meninjau laporan yang tersedia sesuai perannya dan
menghasilkan format ekspor yang didukung untuk kebutuhan operasional. Isi dan
cakupan tetap mengikuti kewenangan akses.`

#### 6. Apakah setiap pengguna memiliki akses yang sama?

`Tidak. Admin dan Operator memiliki kewenangan yang berbeda. Pemeriksaan akses
dilakukan di server, sehingga menyembunyikan menu bukan satu-satunya batas
keamanan.`

#### 7. Apakah perubahan transaksi dapat ditelusuri?

`Tindakan penting pada transaksi dan data operasional menyimpan jejak audit yang
mendukung pemeriksaan perubahan, waktu, dan pelaku sesuai cakupan yang
diterapkan.`

#### 8. Bagaimana backup dan restore bekerja?

`Admin dapat mengunduh backup yang mencakup keadaan operasional yang disetujui.
Restore hanya menerima backup yang kompatibel dan tervalidasi, memerlukan
konfirmasi, dan berjalan dalam mode pemeliharaan agar tidak bercampur dengan
aktivitas lain. Backup aplikasi tetap perlu dilengkapi prosedur penyimpanan dan
pemulihan institusi.`

#### 9. Apakah Amanah Cash dapat digunakan di ponsel?

`Ya. Antarmuka responsif dapat digunakan melalui browser di ponsel maupun
komputer. Koneksi tetap diperlukan untuk memuat data dan menyimpan perubahan
keuangan; jangan menjanjikan transaksi offline.`

#### 10. Apakah Amanah Cash otomatis terhubung ke bank atau sistem pembayaran?

`Tidak ada integrasi bank atau pemrosesan pembayaran yang ditawarkan dalam MVP.
Amanah Cash mencatat dan membantu meninjau aktivitas keuangan siswa; aplikasi
tidak memindahkan atau menyimpan dana sebagai layanan keuangan.`

**Interaction contract**

- use a real button for each question and a controlled answer region;
- allow multiple answers to remain open;
- expose expanded/collapsed state programmatically;
- preserve keyboard operation and visible focus;
- animate only height/opacity with no content delay;
- with reduced motion, change state immediately;
- all questions and answers remain present in server-rendered content.

### 5.8 Final CTA

**Purpose:** provide one calm action after the product has earned trust.

**Target audience:** visitors who understand the product and are ready to enter
it.

**Key message:** begin with the implemented product; no sales pressure is
required.

**Final heading**

`Kelola transaksi siswa dengan alur yang lebih jelas`

**Final supporting copy**

`Gunakan Amanah Cash untuk mencatat aktivitas keuangan, meninjau saldo dan
laporan, serta menjaga riwayat yang dapat ditelusuri.`

**Primary CTA:** `Mulai menggunakan` → `/login`.

**Secondary CTA:** `Kembali ke cara kerja` → `#cara-kerja`.

Do not add pricing, trial length, account-creation promises, contact forms, or
urgency.

### 5.9 Footer

**Purpose:** close the page with identity, orientation, and only verified
destinations.

**Recommended content:**

- `Amanah Cash`;
- short descriptor: `Pengelolaan transaksi keuangan siswa yang jelas dan
  dapat ditelusuri.`;
- anchors: `Cara kerja`, `Fitur`, `Keamanan`, `Tanya jawab`;
- copyright using the current year at render time.

Documentation, privacy, legal, support, social, company, and contact links remain
absent until a real destination and final label are approved.

## 6. Visual Design Direction

### 6.1 Art Direction

Use the approved Calm Financial design language as the foundation and raise the
Landing Page’s expressive quality through:

- strong typography hierarchy with concise line lengths;
- generous section spacing and a consistent vertical rhythm;
- a cool neutral canvas with restrained blue/ink emphasis;
- clean bordered cards and layered surfaces;
- soft shadows only where they clarify depth;
- high-quality Lucide iconography used consistently;
- authentic product screenshots as the main visual evidence;
- refined radii, control proportions, alignment, and whitespace.

Avoid:

- heavy or multicolor gradients;
- neon, loud, or speculative fintech color treatments;
- excessive shadows, glass effects, and floating cards;
- generic admin-template grids;
- ornamental currency imagery;
- decorative elements without informational or compositional purpose.

All values must resolve through `docs/18-design-tokens.md`. Missing values require
the documented token-governance process; implementation must not introduce local
visual constants.

### 6.2 Section Surface Rhythm

| Area | Direction |
|---|---|
| Header and Hero | Calm primary canvas with strongest typographic hierarchy |
| Problems | Subtle contrasting surface for recognition |
| Solution | Primary canvas with paired problem-to-workflow composition |
| Workflow | Layered surface emphasizing sequence |
| Features | Primary canvas with restrained feature grid |
| Security & Trust | Subtle contrasting surface and denser evidence treatment |
| FAQ | Primary canvas optimized for reading |
| Final CTA | Quiet elevated or contrasting surface, not a loud banner |
| Footer | Primary canvas with restrained top border |

### 6.3 Responsive Composition

**Mobile**

- one semantic column;
- content order matches source order;
- full-width primary CTAs where useful;
- vertical workflow;
- no horizontal page scrolling;
- hide decorative layers before reducing product evidence;
- minimum 44 × 44 CSS-pixel interactive targets.

**Tablet**

- preserve the single narrative column for Hero and Workflow;
- use two-column card grids where reading order remains obvious;
- let an unmatched final card span the row when composition benefits.

**Desktop**

- balanced Hero copy/evidence split;
- two-column Problem/Solution comparisons where helpful;
- three-column or carefully balanced feature composition;
- constrain paragraph width even within a wide layout;
- use wide viewports for breathing room, not more content.

Support 320px CSS width, 200% zoom, content reflow, browser text resizing, and
both portrait and landscape orientations without clipped content or hidden
actions.

## 7. Motion and Interaction Specification

Motion communicates hierarchy and state. It must never delay access to content,
animate financial truth, or compete with reading.

| Element | Recommended motion | Constraint |
|---|---|---|
| Page entrance | Header and Hero settle with short fade/translate | Content is visible without JavaScript; no splash screen |
| Section reveal | Once-only subtle fade/translate as section enters viewport | Small travel distance; no replay while scrolling |
| Cards | Stagger within a short shared window | Preserve reading order; no large cascade |
| Buttons | Color/border/elevation response on hover; slight press response | No layout shift; navigation remains immediate |
| FAQ | Smooth disclosure height/opacity | State and focus update immediately |
| Workflow connectors | Optional progressive reveal | Must not be required to understand sequence |
| Decorative layers | Very gentle float or pointer-independent parallax | Disable on small screens when distracting or costly |
| Statistics | Not used unless verified statistics are approved | Never count up financial or product values |
| Anchor navigation | Native or smooth scroll | Focus and history behavior remain predictable |

Use the approved motion tokens and timing families in
`docs/15-motion-guidelines.md`. Avoid scroll-jacking, autoplay media, looping
attention animation, cursor-following effects, large parallax, springy financial
values, and motion that blocks interaction.

For `prefers-reduced-motion: reduce`:

- render content in its final visible state;
- remove parallax, floating, stagger, and nonessential translation;
- make FAQ state changes immediate or near-immediate;
- preserve hover, focus, expanded, selected, loading, success, and error meaning
  without relying on animation.

## 8. Accessibility and Content Quality

The Landing Page must:

- use one `h1` and a logical heading hierarchy;
- preserve landmarks: skip link, header, navigation, main, and footer;
- use semantic ordered/unordered lists for workflows and collections;
- give links destinations and buttons actions;
- provide visible keyboard focus on every interactive element;
- meet approved text, control, icon, and focus contrast requirements;
- provide meaningful alternatives for informative product screenshots;
- hide decorative icons, connectors, and surfaces from accessibility APIs;
- avoid color-only financial or state meaning;
- keep all core copy available without motion or client-side fetching;
- use plain Bahasa Indonesia and explain unavoidable technical terms;
- avoid paragraphs that repeat card titles without adding information.

## 9. Performance and Asset Requirements

- Server-render critical Header, Hero, CTA, and primary copy.
- Reserve image dimensions to prevent layout shift.
- Use optimized responsive image delivery with explicit `sizes`.
- Prioritize only the actual first-view primary image.
- Prefer CSS/tokenized structural decoration over large raster backgrounds.
- Do not autoplay video.
- Keep Client Component boundaries limited to interactions that require browser
  state, such as FAQ disclosure and optional reveal enhancement.
- The complete page remains readable if optional motion enhancement fails.

Screenshot assets must:

- come from the real, release-matched application UI;
- use a reviewed synthetic dataset;
- contain no real student, institution, identity, or financial information;
- record product version, viewport, state, and capture date;
- show no unsupported control or feature;
- remain legible at the implemented display size;
- receive Product Owner approval before publication.

## 10. Content and Claim Governance

Before implementation and again before publication:

1. verify every feature against the target release;
2. verify CTA routes and access behavior;
3. verify role descriptions against server-enforced authorization;
4. verify reports and export formats actually exposed to each role;
5. verify backup/restore wording against the implemented compatibility,
   validation, confirmation, maintenance, and failure behavior;
6. verify screenshots against the release-matched UI;
7. remove any claim that depends on a future sprint or deployment decision;
8. review copy for unsupported security, availability, compliance, or
   performance implications.

When evidence is uncertain, omit the claim. Do not weaken an unsupported claim
with words such as “generally” or “designed to” and publish it anyway.

## 11. Metadata Proposal

**Page title**

`Amanah Cash — Pengelolaan Keuangan Siswa yang Lebih Jelas`

**Meta description**

`Amanah Cash membantu sekolah, pesantren, yayasan, dan lembaga sejenis mencatat
transaksi, memantau saldo, meninjau laporan, dan menelusuri aktivitas keuangan
siswa.`

**Open Graph title**

`Amanah Cash — Kelola Keuangan Siswa dengan Lebih Jelas`

**Open Graph description**

`Satu aplikasi untuk mencatat setoran dan penarikan, memantau saldo, meninjau
laporan, dan menjaga riwayat keuangan siswa tetap dapat ditelusuri.`

Canonical origin, Open Graph image, organization structured data, and public
indexing policy remain separate approval decisions. Do not invent them.

## 12. Acceptance Criteria

The specification is ready for Product Owner approval when:

- product definition clearly names supported institution types without implying
  unsupported multitenancy or commercial availability;
- every section records purpose, target audience, key message, recommended
  content, and CTA where appropriate;
- Hero copy explains what the product is, who it serves, and its practical value
  in the first screen;
- Problems use realistic operational language without blame or exaggerated
  consequences;
- Solution and Workflow describe real application behavior;
- Features contain only implemented capabilities verified against the target
  release;
- Security & Trust uses concrete controls and explicit limitations;
- FAQ answers practical adoption, access, reporting, device, backup, and
  integration questions;
- visual direction is premium, calm, accessible, and token-governed;
- motion supports hierarchy and state, with a complete reduced-motion behavior;
- responsive requirements cover mobile, tablet, desktop, zoom, and reflow;
- screenshot, privacy, performance, and claim-governance gates are explicit;
- there are no pricing, testimonial, certification, unsupported integration,
  or future-feature claims;
- no application code or roadmap completion status changes are included in this
  documentation batch.

## 13. Product Owner Approval Record

The Product Owner approved this specification on 2026-07-30 with the following
binding implementation directions:

- the Hero must communicate professional product quality within five seconds;
- Landing Page visual quality must be noticeably higher than the internal
  application through whitespace, typography, layered surfaces, refined
  borders, soft shadows, iconography, and high-quality illustration;
- motion communicates craftsmanship through restrained entrances, reveals,
  hover/press states, FAQ expansion, transitions, and optional subtle floating
  details;
- sections form one coherent guided story;
- trust is demonstrated through audit history, reports, backup and restore,
  role permissions, and financial transparency;
- mobile receives the same design attention as desktop;
- keyboard access, contrast, visible focus, and reduced motion remain
  first-class requirements;
- rendering, animation, and illustration remain lightweight with minimal
  JavaScript; and
- design references provide qualitative inspiration only and must not be
  reproduced.

The approval covers:

1. this document’s broader institutional positioning;
2. the final section order and whether a separate Application Preview section
   remains;
3. the Hero headline, description, and product-entry CTA;
4. the ten-item implemented feature inventory;
5. the six-step workflow, especially the placement of reports, audit, and
   backup;
6. all Security & Trust language;
7. the ten FAQ answers;
8. final metadata;
9. brand mark and wordmark treatment;
10. screenshot dataset, capture states, crops, alternatives, and publication;
11. canonical origin, Open Graph image, and indexing policy;
12. implementation authorization.

Implementation is complete within the implemented MVP scope. Publication remains
subject to the asset and claim-governance gates in this document.
