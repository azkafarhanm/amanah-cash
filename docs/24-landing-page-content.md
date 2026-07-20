# Amanah Cash — Landing Page Content Specification

**Version:** 1.0

**Status:** Content Specification

**Owner:** Project Owner
**Last Updated:** 2026-07-18

---

## 1. Purpose and Authority

This document is the single source of truth for visible Landing Page content. It supplies final production wording, labels, content order, icon intent, screenshot requirements, accessible alternatives, and implementation constraints for the approved structure in `docs/23-landing-page-blueprint.md`.

Content authority order:

1. approved Product Principles, Functional Requirements, Business Rules, User Flows, and Wireframes;
2. `docs/22-landing-page-strategy.md` for positioning, audience, narrative, and claim boundaries;
3. `docs/23-landing-page-blueprint.md` for section structure and presentation;
4. this document for final visible Landing Page content.

If implementation or product behavior changes, affected content must be reviewed against the higher authorities before publication. Developers must not improvise replacement copy.

## 2. Global Content Rules

- All visible copy uses Bahasa Indonesia and natural sentence case.
- The document language is `id-ID`.
- Use `Amanah Cash`, `transaksi keuangan siswa`, `pemasukan`, `pengeluaran`, `saldo`, and `riwayat transaksi` consistently.
- Apply `docs/04-domain-model.md` Section 4.6: public `pemasukan` means Deposit/Setoran into the tracked Student Balance, and public `pengeluaran` means Withdrawal/Penarikan from that Balance. These terms do not describe the operator's accounting revenue, expense, or cash position.
- Application screenshots retain the approved in-product labels `Setor` and `Tarik` where those labels appear in the real interface.
- Use `Rupiah` in explanatory prose and `Rp` in formatted example values.
- Dates use Indonesian formatting and time uses the 24-hour system.
- Describe implemented behavior directly. Approved authentication, role, and privacy claims must follow ADR-001 through ADR-003 and must not imply that deferred UI or reports already exist.
- Never add statistics, testimonials, customer names, certifications, urgency, or unsupported security claims.
- Never replace authentic product evidence with fabricated dashboards or notifications.
- Text in this document is final unless explicitly marked `Pending Product Decision` or as an implementation placeholder.

## 3. CTA and Destination Registry

| CTA key | Final visible label | Destination | Use |
|---------|---------------------|-------------|-----|
| `cta.primary.product-entry` | `Mulai menggunakan` | `/login` | Header, Hero, Final CTA |
| `cta.workflow` | `Lihat cara kerja` | `#cara-kerja` | Hero secondary action |
| `cta.preview` | `Lihat tampilan aplikasi` | `#pratinjau-aplikasi` | Workflow |
| `cta.features` | `Jelajahi fitur` | `#fitur` | Solution |
| `cta.documentation` | `Dokumentasi` | `Pending Product Decision` | Footer; do not render until destination is approved |

Implementation rules:

- Do not guess a URL for a pending destination.
- Do not render `cta.documentation` until its destination exists.
- All in-page destinations use the exact section IDs in this registry.
- `Mulai menggunakan` must use one consistent destination in Header, Hero, and Final CTA.
- Do not replace these labels with purchase-oriented or account-creation wording.

## 4. Section Content Specifications

### 4.1 Header

**Purpose:** Provide product identity, concise orientation, and the primary product-entry action.

**Content Goal:** Help visitors recognize the product and reach Workflow, Features, FAQ, or the approved product entry without adding a separate marketing message.

**Final Heading:** Omitted.

**Final Subheading:** Omitted.

**Supporting Copy:** Product identity text: `Amanah Cash`.

**CTA Labels:**

- Desktop navigation: `Cara kerja`, `Fitur`, `Tanya jawab`.
- Primary CTA: `Mulai menggunakan`.
- Tablet and mobile: product identity and `Mulai menggunakan` only.

**CTA Destination:**

- Product identity `Amanah Cash` → `/`.
- `Cara kerja` → `#cara-kerja`.
- `Fitur` → `#fitur`.
- `Tanya jawab` → `#tanya-jawab`.
- `Mulai menggunakan` → `/login`.

**Icons:** Brand mark → `Pending Product Decision`. The visible product name `Amanah Cash` is required. Do not substitute a Lucide icon for the brand.

**Screenshot Requirement:** Omitted.

**Accessibility Notes:** The product identity link accessible name is `Amanah Cash — Beranda`. If the approved brand mark is displayed beside the visible product name, treat the mark as decorative. The primary navigation has the accessible label `Navigasi utama`. Current-page indication is unnecessary for same-page anchors. The primary CTA name remains identical at every occurrence.

**Implementation Notes:** Use the exact navigation composition defined by the Blueprint. `/login` is reached only through the approved primary CTA; do not add a separate Login, pricing, company, blog, social, or unapproved destination link.

### 4.2 Hero

**Purpose:** Establish product relevance, primary benefit, and the next safe action.

**Content Goal:** Make visitors understand that Amanah Cash helps teachers and school operators manage Student financial transactions through clear recording, Balance, and history.

**Final Heading:** `Transaksi keuangan siswa, tercatat lebih jelas`

**Final Subheading:** `Amanah Cash membantu guru mencatat pemasukan dan pengeluaran, melihat saldo, dan menelusuri riwayat transaksi dalam satu alur yang sederhana.`

**Supporting Copy:** `Dirancang untuk penggunaan sehari-hari melalui browser di ponsel maupun komputer.`

**CTA Labels:**

- Primary: `Mulai menggunakan`.
- Secondary: `Lihat cara kerja`.

**CTA Destination:**

- `Mulai menggunakan` → `/login`.
- `Lihat cara kerja` → `#cara-kerja`.

**Icons:** Omitted.

**Screenshot Requirement:**

- Required screen: reuse Screenshot B — Student Detail from Application Preview with a Hero crop that retains the content specified below.
- Required data: one approved synthetic Student, authoritative whole-Rupiah Balance, and at least two Transactions with different types.
- Required state: populated state with Balance, `Setor`, `Tarik`, and newest-first history visible.
- Sensitive information: no real Student name, school name, personal identifier, account data, or real financial record.
- Accessibility: use the alternative text `Tampilan detail siswa dengan saldo, tombol Setor dan Tarik, serta riwayat transaksi.` Do not duplicate the screenshot text in a nearby caption.

**Accessibility Notes:** The heading is the page's only `h1`. The supporting copy follows the subheading in reading order. The screenshot alternative describes purpose rather than transcribing every value.

**Implementation Notes:** Do not add badges, statistics, customer logos, or installation claims beyond the approved browser and PWA behavior. The screenshot asset and synthetic dataset require Project Owner approval before publication.

### 4.3 Problems

**Purpose:** Create recognition through credible operational difficulties without blaming users.

**Content Goal:** Show that Amanah Cash understands why manual Student transaction records can become difficult to review and explain.

**Final Heading:** `Pencatatan keuangan siswa seharusnya tidak merepotkan`

**Final Subheading:** `Ketika catatan tersebar dan saldo harus dihitung ulang, aktivitas sederhana dapat menyita waktu lebih banyak dari yang seharusnya.`

**Supporting Copy:**

| Item | Final title | Final description |
|------|-------------|-------------------|
| 1 | `Catatan tersebar` | `Transaksi dapat tersimpan di buku, pesan, lembar kerja, atau ingatan orang yang mencatatnya.` |
| 2 | `Saldo perlu dihitung ulang` | `Perhitungan manual harus diulang ketika ada transaksi baru atau catatan perlu diperiksa.` |
| 3 | `Riwayat sulit ditemukan` | `Mencari transaksi tertentu membutuhkan waktu ketika urutan dan tempat pencatatannya tidak konsisten.` |
| 4 | `Arah transaksi kurang jelas` | `Pemasukan dan pengeluaran dapat tertukar ketika istilah dan keterangannya tidak seragam.` |
| 5 | `Penjelasan membutuhkan waktu` | `Pertanyaan tentang saldo sulit dijawab dengan cepat ketika bukti transaksi tidak berada dalam satu riwayat.` |

**CTA Labels:** Omitted.

**CTA Destination:** Omitted.

**Icons:**

- `Files` — Catatan tersebar.
- `Calculator` — Saldo perlu dihitung ulang.
- `Search` — Riwayat sulit ditemukan.
- `ArrowLeftRight` — Arah transaksi kurang jelas.
- `MessageCircleQuestion` — Penjelasan membutuhkan waktu.

Icons are decorative because each item has a visible title.

**Screenshot Requirement:** Omitted.

**Accessibility Notes:** Render the five items as one semantic list. Do not announce icon names. Preserve the title-description association for every item.

**Implementation Notes:** Do not add claims about lost money, fraud, user negligence, institutional failure, or quantified time savings.

### 4.4 Solution

**Purpose:** Connect the recognized problems to approved product behavior.

**Content Goal:** Explain how consistent Student-centered records, complete-history Balance, explicit transaction direction, and ordered history improve clarity.

**Final Heading:** `Satu alur yang lebih mudah dipahami`

**Final Subheading:** `Amanah Cash menyatukan pencatatan, saldo, dan riwayat transaksi agar aktivitas keuangan setiap siswa lebih mudah ditinjau.`

**Supporting Copy:**

| Item | Final title | Final description |
|------|-------------|-------------------|
| 1 | `Catatan terpusat per siswa` | `Pencatatan dan riwayat transaksi tersedia dalam konteks siswa yang sama.` |
| 2 | `Saldo dari riwayat lengkap` | `Saldo dihitung dari seluruh transaksi yang tersimpan, bukan diubah secara manual.` |
| 3 | `Arah transaksi yang jelas` | `Setiap transaksi menunjukkan apakah dana dititipkan kepada siswa atau dikembalikan oleh siswa.` |
| 4 | `Riwayat yang mudah ditelusuri` | `Transaksi ditampilkan dari yang terbaru dengan jenis, jumlah, dan waktu yang jelas.` |

**CTA Labels:** `Jelajahi fitur`.

**CTA Destination:** `#fitur`.

**Icons:**

- `UserRoundCheck` — Catatan terpusat per siswa.
- `History` — Saldo dari riwayat lengkap.
- `ArrowLeftRight` — Arah transaksi yang jelas.
- `ListOrdered` — Riwayat yang mudah ditelusuri.

Icons are decorative.

**Screenshot Requirement:** Omitted. Product evidence appears in Hero and Application Preview.

**Accessibility Notes:** Each problem response is a titled content group. The CTA accessible name is `Jelajahi fitur Amanah Cash`.

**Implementation Notes:** `Catatan terpusat` refers to one consistent application record; it does not claim integration with external records or systems.

### 4.5 Workflow

**Purpose:** Show the approved three-step workflow and reduce perceived learning effort.

**Content Goal:** Demonstrate that the primary transaction journey is direct and understandable.

**Final Heading:** `Cara kerja Amanah Cash`

**Final Subheading:** `Tiga langkah membantu operator menemukan siswa, mencatat transaksi, lalu memeriksa hasilnya.`

**Supporting Copy:**

| Step | Final title | Final description |
|------|-------------|-------------------|
| 1 | `Cari siswa` | `Gunakan pencarian nama untuk membuka detail siswa yang tepat.` |
| 2 | `Catat transaksi` | `Pilih Setor atau Tarik, lalu masukkan jumlah Rupiah utuh.` |
| 3 | `Periksa saldo dan riwayat` | `Setelah transaksi berhasil tersimpan, saldo terbaru dan transaksi baru langsung terlihat.` |

**CTA Labels:** `Lihat tampilan aplikasi`.

**CTA Destination:** `#pratinjau-aplikasi`.

**Icons:** Use visible numbered markers `1`, `2`, and `3`. No additional icon is required.

**Screenshot Requirement:** Omitted. Workflow uses numbered text steps without screenshot crops.

**Accessibility Notes:** Render the steps as an ordered list. Do not add redundant accessible text such as `Langkah satu` when the ordered-list semantics and visible number already communicate sequence.

**Implementation Notes:** Do not add account creation, approval, synchronization, or configuration steps. `Langsung terlihat` applies only after persistence is confirmed and must not imply optimistic financial updates.

### 4.6 Application Preview

**Purpose:** Provide authentic product evidence for the approved core workflow.

**Content Goal:** Let visitors inspect the real Student search, Balance/history, and Transaction Entry experiences.

**Final Heading:** `Lihat alur nyata di dalam aplikasi`

**Final Subheading:** `Mulai dari mencari siswa hingga memeriksa saldo dan riwayat, setiap langkah dirancang agar tetap fokus pada informasi yang dibutuhkan.`

**Supporting Copy:**

| Preview | Final caption | Final annotation |
|---------|---------------|------------------|
| Student List | `Temukan siswa dengan cepat` | `Pencarian langsung membantu operator membuka catatan siswa tanpa menelusuri daftar secara manual.` |
| Student Detail | `Pahami saldo dan riwayatnya` | `Saldo ditampilkan bersama transaksi terbaru agar aktivitas keuangan lebih mudah ditelusuri.` |
| Transaction Entry | `Catat satu transaksi dengan fokus` | `Satu kolom jumlah dan arah transaksi yang jelas membantu menjaga proses tetap sederhana.` |

**CTA Labels:** Omitted.

**CTA Destination:** Omitted.

**Icons:** Omitted. The product is the evidence.

**Screenshot Requirement:**

#### Screenshot A — Student List

- Required screen: Student List.
- Required data: at least three approved synthetic Student records, alphabetically ordered, with whole-Rupiah Balances.
- Required state: populated and usable with an empty search query; search input, all approved Student names, and Balances visible.
- Sensitive information: hide or replace all real Student names, school identity, identifiers, and real financial values.
- Accessibility: alternative text `Daftar siswa dengan pencarian nama dan saldo setiap siswa.` The visible caption supplies the benefit; do not repeat it in `alt`.

#### Screenshot B — Student Detail

- Required screen: Student Detail.
- Required data: one approved synthetic Student, authoritative Balance, at least one Setoran and one Penarikan, whole-Rupiah amounts, Indonesian dates, and 24-hour times.
- Required state: populated history; `Saldo`, `Setor`, `Tarik`, `Riwayat transaksi`, and newest-first entries visible.
- Sensitive information: hide or replace all real Student names, timestamps tied to real activity, school identity, identifiers, and real financial values.
- Accessibility: alternative text `Detail siswa dengan saldo, tindakan Setor dan Tarik, serta riwayat transaksi terbaru.` A nearby text summary must explain that Balance uses the complete Transaction history.

#### Screenshot C — Transaction Entry

- Required screen: Transaction Entry in `Setor dana` mode.
- Required data: approved synthetic Student context and one valid whole-Rupiah Amount.
- Required state: initial populated form before submission; direction explanation, Amount field, Confirm, and Cancel visible. Do not show success, loading, error, or unknown outcome.
- Sensitive information: hide or replace every real Student name and financial value.
- Accessibility: alternative text `Form Setor dana dengan penjelasan arah transaksi, kolom jumlah, serta tombol konfirmasi dan batal.`

#### Shared Screenshot Data Decision

- Exact synthetic names, amounts, dates, and times: `Pending Product Decision`.
- Screenshot capture viewport: `Pending Product Decision`.
- Use one internally consistent synthetic dataset across all screenshots.
- Do not use real production data, blurred-but-identifiable personal data, generic dashboard templates, fabricated analytics, or speculative UI.

**Accessibility Notes:** Each screenshot and caption uses a semantic `figure` and `figcaption`. Do not expose decorative device chrome as meaningful content. The page remains understandable if screenshots fail to load because the captions and annotations remain visible.

**Implementation Notes:** Record asset source screen, product version, viewport, state, approval date, and redaction confirmation. Preserve image dimensions and aspect ratio. Do not alter visible UI labels in image editing.

### 4.7 Features

**Purpose:** Summarize the approved current capabilities by user outcome.

**Content Goal:** Help visitors confirm that Amanah Cash supports the daily tasks required to find Students, record Transactions, and understand financial activity.

**Final Heading:** `Fitur inti untuk pencatatan sehari-hari`

**Final Subheading:** `Setiap fitur mendukung alur kerja yang singkat, jelas, dan mudah digunakan melalui ponsel.`

**Supporting Copy:**

| Feature | Final title | Final description | Icon |
|---------|-------------|-------------------|------|
| 1 | `Pencarian siswa` | `Cari nama secara langsung dan buka catatan siswa yang dibutuhkan.` | `Search` |
| 2 | `Pencatatan transaksi` | `Catat Setoran atau Penarikan dalam Rupiah utuh melalui alur yang terfokus.` | `ArrowLeftRight` |
| 3 | `Saldo yang dapat dijelaskan` | `Lihat saldo yang dihitung dari seluruh riwayat transaksi siswa.` | `Scale` |
| 4 | `Riwayat transaksi` | `Tinjau jenis, jumlah, dan waktu transaksi dari yang terbaru.` | `ListOrdered` |
| 5 | `Akses melalui ponsel` | `Gunakan melalui browser di ponsel atau komputer, lalu pasang pada perangkat yang mendukung untuk akses seperti aplikasi.` | `Smartphone` |
| 6 | `Hasil operasi yang jelas` | `Keberhasilan, kegagalan, dan kondisi koneksi ditampilkan tanpa menyamarkan hasil transaksi.` | `CircleCheckBig` |

**CTA Labels:** Omitted.

**CTA Destination:** Omitted.

**Icons:** Use the Lucide icons specified in the feature table. Icons are decorative because visible titles carry the meaning.

**Screenshot Requirement:** Omitted.

**Accessibility Notes:** Render features as a semantic list. Do not include icon names in accessible labels. `CircleCheckBig` must not imply that every operation succeeds.

**Implementation Notes:** The installable access described above refers to the approved PWA capability. Do not add Dashboard, Reports, Settings, authentication, roles, export, integrations, notifications, or offline transaction recording.

### 4.8 Security & Trust

**Purpose:** Build confidence through verified financial-integrity behavior rather than unsupported security language.

**Content Goal:** Explain how Balance, Transaction history, direction, persistence, and failure behavior make financial activity understandable.

**Final Heading:** `Kepercayaan dibangun dari catatan yang jelas`

**Final Subheading:** `Setiap saldo dapat dijelaskan melalui riwayat transaksi yang mendasarinya.`

**Supporting Copy:**

| Principle | Final title | Final description |
|-----------|-------------|-------------------|
| 1 | `Saldo berasal dari riwayat lengkap` | `Perhitungan menggunakan seluruh transaksi yang tersimpan, bukan hanya transaksi yang sedang terlihat.` |
| 2 | `Transaksi membentuk catatan berurutan` | `Setoran dan Penarikan tersimpan sebagai riwayat yang tidak dapat diedit atau dihapus melalui aplikasi.` |
| 3 | `Arah transaksi dinyatakan dengan jelas` | `Aplikasi menjelaskan apakah dana dititipkan kepada siswa atau dikembalikan oleh siswa.` |
| 4 | `Keberhasilan menunggu penyimpanan` | `Transaksi hanya dinyatakan berhasil setelah penyimpanan dikonfirmasi.` |
| 5 | `Kegagalan tidak disamarkan` | `Kesalahan dan hasil yang belum pasti ditampilkan secara eksplisit agar tindakan tidak diulang sebelum hasilnya diketahui.` |

**CTA Labels:** Omitted.

**CTA Destination:** Omitted.

**Icons:**

- `History` — Saldo berasal dari riwayat lengkap.
- `ListChecks` — Transaksi membentuk catatan berurutan.
- `ArrowLeftRight` — Arah transaksi dinyatakan dengan jelas.
- `DatabaseZap` — Keberhasilan menunggu penyimpanan.
- `CircleAlert` — Kegagalan tidak disamarkan.

Icons reinforce visible text and do not function as security badges.

**Screenshot Requirement:** Omitted.

**Accessibility Notes:** Render the principles as a semantic list. Do not announce icon names. Avoid shield or lock alternatives that could imply unverified security controls.

**Implementation Notes:** Do not add claims about encryption, authentication, access control, backup, certification, compliance, fraud prevention, or guaranteed institutional security.

### 4.9 FAQ

**Purpose:** Answer current-scope questions that are already supported by approved documentation.

**Content Goal:** Resolve uncertainty about audience, Transactions, Balance, mobile access, connectivity, and Transaction history without speculating.

**Final Heading:** `Pertanyaan yang sering diajukan`

**Final Subheading:** `Jawaban singkat tentang cara kerja dan cakupan Amanah Cash saat ini.`

**Supporting Copy:**

#### 1. Apa itu Amanah Cash?

`Amanah Cash adalah aplikasi pencatatan transaksi keuangan siswa. Aplikasi ini membantu operator sekolah mencatat Setoran dan Penarikan, melihat saldo, serta menelusuri riwayat transaksi setiap siswa.`

#### 2. Siapa yang dapat menggunakan Amanah Cash?

`Amanah Cash dirancang untuk orang yang menangani pencatatan transaksi keuangan siswa, termasuk guru, wali kelas, bendahara sekolah, dan pengelola asrama.`

#### 3. Transaksi apa yang dapat dicatat?

`Amanah Cash mencatat Setoran, yaitu dana yang dititipkan kepada siswa, dan Penarikan, yaitu dana yang dikembalikan oleh siswa. Setiap jumlah menggunakan Rupiah utuh.`

#### 4. Bagaimana saldo siswa dihitung?

`Saldo dihitung dari seluruh Setoran dikurangi seluruh Penarikan yang tersimpan untuk siswa tersebut. Saldo tidak disimpan atau diubah secara manual.`

#### 5. Apakah Amanah Cash dapat digunakan melalui ponsel?

`Ya. Amanah Cash dirancang untuk digunakan melalui browser di ponsel maupun komputer. Pada perangkat dan browser yang mendukung, Amanah Cash juga dapat dipasang untuk akses seperti aplikasi.`

#### 6. Apakah transaksi dapat dicatat saat offline?

`Belum. Koneksi ke layanan aplikasi diperlukan untuk memuat data dan menyimpan transaksi. Amanah Cash tidak mengantrekan transaksi untuk dikirim otomatis ketika koneksi kembali.`

#### 7. Apakah transaksi dapat diedit atau dihapus?

`Tidak melalui aplikasi. Riwayat hanya bertambah melalui transaksi baru agar saldo tetap dapat ditelusuri dari catatan transaksi yang tersimpan.`

**CTA Labels:** Omitted.

**CTA Destination:** Omitted.

**Icons:** Accordion disclosure indicator only. It is decorative; expanded state is communicated programmatically.

**Screenshot Requirement:** Omitted.

**Accessibility Notes:** Each question is the visible label of its disclosure button. Answers remain associated with their questions. Do not place headings, links, or lists inside an answer unless the final content later requires them.

**Implementation Notes:** Preserve wording exactly. Do not add questions about pricing, accounts, integrations, reporting, security certifications, or future modules without approved answers.

### 4.10 Final CTA

**Purpose:** Turn accumulated understanding and trust into the approved next action.

**Content Goal:** Encourage visitors to begin using or exploring the product without introducing a new promise.

**Final Heading:** `Kelola transaksi siswa dengan lebih jelas`

**Final Subheading:** `Mulai dengan alur sederhana untuk mencatat transaksi, memahami saldo, dan menelusuri riwayat setiap siswa.`

**Supporting Copy:** Omitted.

**CTA Labels:**

- Primary: `Mulai menggunakan`.
- Secondary: `Lihat cara kerja`.

**CTA Destination:**

- `Mulai menggunakan` → `/login`.
- `Lihat cara kerja` → `#cara-kerja`.

**Icons:** Omitted.

**Screenshot Requirement:** Omitted.

**Accessibility Notes:** Primary CTA accessible name remains `Mulai menggunakan`. Secondary CTA accessible name is `Kembali ke cara kerja Amanah Cash` because it moves to an earlier page section.

**Implementation Notes:** Do not add urgency, availability limits, account claims, or a second conversion goal.

### 4.11 Footer

**Purpose:** Close the page with product identity and verified destinations.

**Content Goal:** Help visitors reorient and reach key Landing Page sections or approved documentation.

**Final Heading:** Omitted.

**Final Subheading:** Omitted.

**Supporting Copy:**

- Product identity: `Amanah Cash`.
- Product descriptor: `Pencatatan transaksi keuangan siswa yang sederhana, jelas, dan mudah ditelusuri.`
- Copyright: `© [TAHUN BERJALAN] Amanah Cash.`

**CTA Labels:**

- Navigation group heading: `Produk`.
- Links: `Cara kerja`, `Fitur`, `Tanya jawab`.
- Resource group heading: `Sumber daya`.
- Conditional link: `Dokumentasi`.

**CTA Destination:**

- `Cara kerja` → `#cara-kerja`.
- `Fitur` → `#fitur`.
- `Tanya jawab` → `#tanya-jawab`.
- `Dokumentasi` → `Pending Product Decision`; do not render the Resource group until at least one verified resource destination exists.

**Icons:** Omitted.

**Screenshot Requirement:** Omitted.

**Accessibility Notes:** Each link group uses a visible group heading and a labeled navigation landmark. `[TAHUN BERJALAN]` is rendered as a four-digit year without an extra announcement.

**Implementation Notes:** Do not add empty support, contact, privacy, legal, company, social, or product-category links. Add them only after both final labels and verified destinations are approved.

## 5. Screenshot Asset Checklist

### 5.1 Required Assets

- [ ] Hero crop reuses the approved Application Preview Student Detail asset and retains the required Balance, actions, and history content.
- [ ] Application Preview Student List screenshot.
- [ ] Application Preview Student Detail screenshot.
- [ ] Application Preview Transaction Entry screenshot.

### 5.2 Shared Dataset Requirements

- [ ] Exact synthetic Student names approved.
- [ ] Exact whole-Rupiah amounts approved.
- [ ] Indonesian dates and 24-hour times approved.
- [ ] Screenshot capture viewport approved.
- [ ] Student List and Student Detail data are internally consistent.
- [ ] Student Detail Balance equals total Setoran minus total Penarikan in the complete synthetic history.
- [ ] Newest-first ordering is correct.
- [ ] No real Student, school, identifier, or financial data is present.
- [ ] No unsupported screen, control, notification, statistic, or feature is visible.

### 5.3 Asset Quality and Accessibility

- [ ] Screenshots come from the approved implemented UI, not recreated marketing artwork.
- [ ] Source product version, viewport, state, and capture date are recorded.
- [ ] Required content remains legible at its implemented display size.
- [ ] Asset dimensions are reserved to prevent layout shift.
- [ ] Alternative text matches Section 4 and is not duplicated by captions.
- [ ] Decorative device chrome is excluded from the accessible description.
- [ ] Redaction and synthetic-data approval are recorded.

## 6. Metadata Specification

### 6.1 Page Title

`Amanah Cash — Pencatatan Transaksi Keuangan Siswa`

### 6.2 Meta Description

`Amanah Cash membantu guru dan pengelola sekolah mencatat transaksi keuangan siswa, memahami saldo, dan menelusuri riwayat transaksi dengan lebih jelas.`

### 6.3 Open Graph Title

`Amanah Cash — Transaksi Keuangan Siswa Lebih Jelas`

### 6.4 Open Graph Description

`Catat pemasukan dan pengeluaran, lihat saldo, dan telusuri riwayat transaksi siswa melalui alur sederhana yang mudah digunakan lewat ponsel.`

### 6.5 Metadata Implementation Notes

- Set the HTML document language to `id-ID`.
- Use the Page Title for the document title; do not append unapproved slogans.
- Use the same Meta Description for general description metadata unless a platform requires a shorter verified variant.
- Open Graph image: `Pending Product Decision`. Do not generate or substitute a generic marketing image.
- Canonical URL: `Pending Product Decision`.
- Do not add keyword stuffing, fabricated locality, review ratings, organization claims, or structured data unsupported by the published page.

## 7. Content Traceability Matrix

| Content area | Governing approved source |
|--------------|---------------------------|
| Product positioning and audiences | `docs/22-landing-page-strategy.md` Sections 2–5 |
| Narrative and section purpose | `docs/22-landing-page-strategy.md` Sections 6–8; `docs/23-landing-page-blueprint.md` Section 6 |
| Student search and list | FR-3.1.2–3.1.3; `docs/19-screen-specifications.md` Section 3 |
| Student Detail, Balance, and history | FR-3.1.4, FR-3.2.3, FR-3.3.1; `docs/19-screen-specifications.md` Section 4 |
| Setoran and Penarikan | FR-3.2.1–3.2.2; `docs/19-screen-specifications.md` Section 5 |
| Complete-history Balance | Product Principle 5; FR-3.3.1; BR-BAL-001–005 |
| Append-only Transactions | FR-3.2.3; BR-TXN-003 |
| PWA and mobile behavior | Product Principles 1–2; FR-3.4.1–3.4.3 |
| Offline limitation | Product Principle 2; `docs/19-screen-specifications.md`; `docs/20-interaction-states.md` Section 9 |
| Persistence and explicit outcomes | BR-TXN-001–005; `docs/20-interaction-states.md` Sections 7, 11–12 |
| Accessibility and media alternatives | `docs/16-accessibility-guidelines.md`; `docs/23-landing-page-blueprint.md` Section 8 |

## 8. Remaining Content Decisions

The following items must be approved before publication:

1. Header product identity link destination.
2. Primary `Mulai menggunakan` destination and behavior.
3. Documentation destination and whether the Footer Resource group should render.
4. Exact synthetic screenshot dataset: Student names, Amounts, dates, and times.
5. Screenshot capture viewport.
6. Final approved screenshot assets and redaction record.
7. Approved brand mark and wordmark treatment in Header and Footer.
8. Open Graph image.
9. Canonical production URL.
10. Any verified support, contact, privacy, or legal labels and destinations that should be added later.

Until approved, pending content must remain absent or use the explicit implementation placeholders defined in this document. Developers must not fill these decisions independently.
