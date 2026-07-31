# Amanah Cash — Students Management Specification

**Version:** 1.0

**Status:** Draft

**Owner:** Project Owner

**Last Updated:** 2026-07-31

---

## 1. Purpose

This document defines the complete Students Management experience for Amanah Cash. It covers the Student List, Student Detail, Create Student, and Edit Student flows for both Platform Admin and Operator roles.

This is a product specification. It defines what the interface contains, why each element exists, how users interact with it, and what business questions each surface answers. It is not a design system (see `docs/51-design-system-foundation-v2.md`) and not an implementation guide.

### 1.1 Business Context

Students are the central entity in Amanah Cash. Every financial operation — deposit, withdrawal, correction, audit, report — is anchored to a Student record. The Students Management pages are where operators spend most of their time. They must be fast, scannable, and trustworthy.

### 1.2 Roles and Scope

| Role | Access | Financial Data | Create | Edit | Transfer Ownership |
|------|--------|---------------|--------|------|-------------------|
| **Platform Admin** | All students across all operators | No | Yes (full form) | Yes (name, operator, status, notes) | Yes (with audit) |
| **Operator** | Only students assigned to them | Yes (balance, transactions) | Yes (self-provision) | No | No |

---

## 2. Student List

### 2.1 Business Questions Answered

| # | Question | Source |
|---|----------|--------|
| 1 | How many students are currently registered? | Total count in pagination |
| 2 | Who are my students and what are their balances? | List rows (operator view) |
| 3 | Which students are active, inactive, or archived? | Status badges |
| 4 | Which operator manages a specific student? | Operator column (admin view) |
| 5 | Can I quickly find a specific student? | Search |

### 2.2 Page Structure

```
┌─────────────────────────────────────────────────────┐
│ Page Header                                         │
│ Title: "Siswa" / "Siswa Saya"                      │
│ Description                                         │
│ Action: "Tambah Siswa" button                       │
├─────────────────────────────────────────────────────┤
│ Toolbar                                             │
│ [Search Input ..............] [Status ▾] [Terapkan] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Student Table (desktop) / Student Cards (mobile)   │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Pagination                                          │
│ "Menampilkan 1–20 dari 45 siswa"  [< Sebelumnya]   │
│                                    [Selanjutnya >]  │
└─────────────────────────────────────────────────────┘
```

### 2.3 Page Header

| Property | Admin | Operator |
|----------|-------|----------|
| Title | "Siswa" | "Siswa Saya" |
| Description | "Kelola identitas, status, dan penugasan Operator Siswa." | "Hanya Siswa yang ditugaskan kepada Anda yang ditampilkan." |
| Primary action | "Tambah Siswa" → navigates to `/admin/students/new` | "Tambah Siswa" → opens `CreateStudentModal` dialog |
| Success notice | Supports `?notice=` query param for success messages | Same |

### 2.4 Toolbar

#### Search Input

| Property | Value |
|----------|-------|
| Placeholder (admin) | "Cari nama Siswa atau Operator..." |
| Placeholder (operator) | "Cari nama Siswa..." |
| Max length | 100 characters |
| Debounce | 350ms |
| Behavior | Updates URL params without full page navigation |
| Clear | Visible clear button when input has value |

#### Status Filter

| Option | Value | Label |
|--------|-------|-------|
| All | `""` | "Semua" |
| Active | `ACTIVE` | "Aktif" |
| Inactive | `INACTIVE` | "Tidak aktif" |
| Archived | `ARCHIVED` | "Diarsipkan" |

| Property | Value |
|----------|-------|
| Default | "Semua" (all) |
| Apply | "Terapkan" button triggers filter |
| Behavior | Composable with search (AND logic) |

### 2.5 Student Table (Desktop)

#### Admin Columns

| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| Nama Siswa | Auto | Left | Student name, linked to detail page |
| Operator | Auto | Left | Operator name |
| Status | 120px | Center | Status badge (Aktif / Tidak aktif / Diarsipkan) |
| Dibuat | 140px | Right | Creation date (Indonesian format) |

#### Operator Columns

| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| Nama Siswa | Auto | Left | Student name, linked to detail page |
| Operator | Auto | Left | Operator name |
| Status | 120px | Center | Status badge |
| Saldo saat ini | 180px | Right | Balance (Rupiah) + transaction count |
| Dibuat | 140px | Right | Creation date |

#### Row Specification

| Property | Value |
|----------|-------|
| Row height | 52px |
| Row hover | `surface.subtle` background, no shadow |
| Row click | Entire row is clickable → navigates to detail |
| Name font | `type.body-strong` (16px, semibold) |
| Secondary text | `type.body-small` (14px), `text.secondary` |
| Status badge | Per `docs/51` Badge component specification |

#### Balance Column (Operator Only)

| Property | Value |
|----------|-------|
| Format | `Rp [amount]` using `rupiah()` formatter |
| Font | `type.balance-row` (16px, semibold, tabular-nums) |
| Color | `financial.balance` |
| Sub-text | "[count] transaksi tercatat" or "Belum ada transaksi" |
| Sub-text font | `type.caption` (12px), `text.muted` |

### 2.6 Student Cards (Mobile)

On viewports below 768px, the table converts to a card layout:

```
┌─────────────────────────────────────┐
│ Ahmad Fauzi                    [Aktif]│
│ Operator: Ahmad Santoso               │
│ Rp 2.500.000                          │
│ 15 transaksi tercatat                  │
│ Dibuat: 15 Jan 2026                    │
└─────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Card padding | `space.4` (16px) |
| Card radius | `radius.lg` (12px) |
| Card border | `1px solid border.default` |
| Card gap | `space.3` (12px) between cards |
| Name | `type.body-strong` (16px, semibold) |
| Status badge | Top-right corner |
| Balance | `type.balance-row`, `financial.balance` |
| Metadata | `type.caption`, `text.muted` |

### 2.7 Sorting

| Property | Value |
|----------|-------|
| Primary sort | `createdAt` descending (newest first) |
| Secondary sort | `id` descending (stable ordering) |

**Note:** The screen specification (`docs/19`) describes alphabetical sorting. The current implementation uses newest-first. This specification aligns with the current implementation as it better serves the operational workflow where operators typically work with recently added students. Alphabetical sorting is a future enhancement.

### 2.8 Pagination

| Property | Value |
|----------|-------|
| Type | Server-side offset pagination |
| Default page size | 20 (from user settings) |
| Page size options | 10, 20, 50 |
| Display | "Menampilkan X–Y dari Z siswa" |
| Navigation | Previous / Next buttons with URL-based page params |
| Invalid page | Falls back to page 1 |

### 2.9 Empty States

| Context | Icon | Title | Description | Action |
|---------|------|-------|-------------|--------|
| No students at all (admin) | `Users` | "Belum ada Siswa terdaftar" | "Tambah Siswa pertama untuk mulai mengelola dana titipan." | "Tambah Siswa" |
| No students at all (operator) | `Users` | "Belum ada Siswa yang ditugaskan" | "Siswa yang Anda tambahkan akan muncul di sini." | "Tambah Siswa" |
| No search results | `Search` | "Siswa tidak ditemukan" | "Coba kata kunci lain atau hapus filter." | "Hapus pencarian" |
| No status filter results | `Filter` | "Tidak ada hasil yang cocok" | "Tidak ada Siswa dengan status yang dipilih." | "Reset filter" |

### 2.10 Error State

| Property | Value |
|----------|-------|
| Icon | `AlertTriangle`, 40px, `feedback.danger` |
| Title | "Daftar Siswa tidak dapat dimuat" |
| Description | "Terjadi kesalahan saat memuat data. Coba lagi." |
| Action | "Coba lagi" button (reloads the page) |

### 2.11 Loading State

| Property | Value |
|----------|-------|
| Type | Table skeleton |
| Rows | 7 skeleton rows matching final table geometry |
| Duration | Until data arrives, then crossfades |

---

## 3. Student Detail

### 3.1 Business Questions Answered

| # | Question | Source |
|---|----------|--------|
| 1 | Who is this student? | Identity section |
| 2 | Who manages this student? | Operator info |
| 3 | What is their current financial position? | Balance panel (operator only) |
| 4 | What transactions have occurred? | Transaction history (operator only) |
| 5 | What is the student's status? | Status badge |
| 6 | When was the student created/updated? | Timestamps |

### 3.2 Admin Student Detail

#### Page Structure

```
┌─────────────────────────────────────────────────────┐
│ ← Kembali                    Page Title: Student Name│
├─────────────────────────────────────────────────────┤
│                                                     │
│  Student Information Panel (read-only)              │
│  ┌─────────────────────────────────────────────┐    │
│  │ Nama        : Ahmad Fauzi                   │    │
│  │ Operator    : Ahmad Santoso                  │    │
│  │               ahmad.santoso@pesantren.id     │    │
│  │ Status      : [Aktif]                        │    │
│  │ Dibuat      : 15 Jan 2026, 08:30            │    │
│  │ Diperbarui  : 20 Jul 2026, 14:15            │    │
│  │ Catatan     : Kelas 3A - Pindahan dari ...  │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Edit Student Form                                  │
│  ┌─────────────────────────────────────────────┐    │
│  │ Nama Siswa          [....................]  │    │
│  │ Operator            [Ahmad Santoso      ▾]  │    │
│  │ Alasan perpindahan  [....................]  │    │
│  │   (wajib jika Operator berubah)             │    │
│  │ Status              [Aktif              ▾]  │    │
│  │ Catatan             [....................]  │    │
│  │                                             │    │
│  │                    [Batal]  [Simpan]         │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Information Panel

| Field | Content | Format |
|-------|---------|--------|
| Nama | Student name | `type.body` |
| Operator | Operator name + email | Name: `type.body`, email: `type.caption`, `text.muted` |
| Status | Status badge | Badge component (green/yellow/neutral) |
| Dibuat | Creation timestamp | Indonesian date + 24-hour time |
| Diperbarui | Last update timestamp | Indonesian date + 24-hour time |
| Catatan | Notes or "Tidak ada catatan" | `type.body` or `text.muted` for empty |

#### Edit Form

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Nama Siswa | Text input | Yes | Max 100 chars, normalized, unique (case-insensitive) |
| Operator | Select dropdown | Yes | Must be an active, non-deleted operator |
| Alasan perpindahan | Textarea | Conditional | Required only when Operator changes. Max 500 chars. |
| Status | Select dropdown | Yes | ACTIVE / INACTIVE / ARCHIVED |
| Catatan | Textarea | No | Max 500 chars |

#### Ownership Transfer

When the Operator field changes:

1. The "Alasan perpindahan" textarea becomes required.
2. A hint explains: "Wajib diisi jika Operator berubah."
3. On submit, the system atomically:
   - Updates the `operatorId`
   - Creates a `FinancialAuditEvent` of type `OWNERSHIP_TRANSFER` with old/new operator IDs, actor, reason, and payload hash
4. Transaction history and balance are **not** affected.
5. Success message: "Perubahan dan kepemilikan Siswa disimpan."

#### Validation Recovery

| Behavior | Specification |
|----------|--------------|
| Server-side validation error | Form preserves all entered values |
| Inline field errors | Displayed adjacent to the invalid field |
| Focus management | Focus moves to the first invalid field |
| Error summary | Optional alert at top listing all errors |

### 3.3 Operator Student Detail

#### Page Structure

```
┌─────────────────────────────────────────────────────┐
│ ← Kembali                    Page Title: Student Name│
├─────────────────────────────────────────────────────┤
│                                                     │
│  Student Information Panel (read-only)              │
│  (Same as admin but without edit form)              │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Balance Panel                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │         Saldo                               │    │
│  │         Rp 2.500.000                        │    │
│  │         15 transaksi tercatat               │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [Setor]              [Tarik]                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Transaction History                                │
│  ┌─────────────────────────────────────────────┐    │
│  │ 31 Jul 2026, 10:30                          │    │
│  │ [↓] Setoran                     Rp 100.000  │    │
│  │                                             │    │
│  │ 30 Jul 2026, 14:15                          │    │
│  │ [↑] Penarikan                   Rp  25.000  │    │
│  │                                             │    │
│  │ [Muat transaksi lama]                       │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Balance Panel

| Property | Value |
|----------|-------|
| Label | "Saldo" |
| Value font | `type.balance-display` (40px, bold, tabular-nums) |
| Value color | `financial.balance` |
| Surface | `surface.subtle` with `border.default` border |
| Radius | `radius.lg` (12px) |
| Padding | `space.6` (24px) |
| Transaction count | "[count] transaksi tercatat" in `type.caption`, `text.muted` |
| Shadow | `shadow.none` — financial surfaces are flat |

**Critical rule:** The balance value is the authoritative persisted balance. It appears immediately after data loads. It never animates, counts, interpolates, or transitions between values.

#### Action Buttons

| Action | Label | Icon | Variant | Destination |
|--------|-------|------|---------|-------------|
| Deposit | "Setor" | `ArrowDownLeft` | Deposit variant | Deposit flow |
| Withdrawal | "Tarik" | `ArrowUpRight` | Withdrawal variant | Withdrawal flow |

| Property | Value |
|----------|-------|
| Layout | Side by side, equal width |
| Height | `control.height.prominent` (48px) |
| Width | 50% each with `space.3` gap |
| Mobile | Full width, stacked vertically |

#### Transaction History

| Property | Value |
|----------|-------|
| Title | "Riwayat transaksi" |
| Ordering | Newest first |
| Pagination | "Muat transaksi lama" button (progressive loading) |
| Empty state | "Belum ada transaksi" with `ReceiptText` icon + "Setor" CTA |

Each transaction item:

| Element | Content |
|---------|---------|
| Timestamp | Date + time in Indonesian format, 24-hour |
| Direction icon | `ArrowDownLeft` (deposit), `ArrowUpRight` (withdrawal), `Pencil` (correction) |
| Direction color | `financial.income` / `financial.expense` / `financial.correction` |
| Type label | "Setoran" / "Penarikan" / "Koreksi" |
| Amount | `type.balance-row`, tabular-nums, semantic financial color |
| Clickable | Opens context detail drawer |

### 3.4 Error States

| Context | Title | Description | Action |
|---------|-------|-------------|--------|
| Student not found | 404 page | "Siswa tidak ditemukan" | "Kembali ke daftar" |
| Detail load error | "Detail Siswa tidak dapat dimuat" | "Terjadi kesalahan. Coba lagi." | "Coba lagi" |
| Ownership error (operator) | 404 page | Student not found or not owned | "Kembali ke daftar" |

---

## 4. Create Student

### 4.1 Admin Create

#### Page Structure

```
┌─────────────────────────────────────────────────────┐
│ ← Kembali                    Page Title: Tambah Siswa│
├─────────────────────────────────────────────────────┤
│                                                     │
│  Description: "Setiap Siswa wajib ditugaskan        │
│  kepada satu Operator aktif."                       │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Nama Siswa          [....................]  │    │
│  │ Operator            [Pilih Operator     ▾]  │    │
│  │ Status              [Aktif              ▾]  │    │
│  │ Catatan             [....................]  │    │
│  │                                             │    │
│  │                    [Batal]  [Tambah Siswa]  │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| Nama Siswa | Text input | Yes | — | Max 100 chars, normalized, unique |
| Operator | Select dropdown | Yes | "Pilih Operator" | Must be active, non-deleted |
| Status | Select dropdown | Yes | "Aktif" | ACTIVE / INACTIVE / ARCHIVED |
| Catatan | Textarea | No | empty | Max 500 chars |

**Validation:**
- If no active operators exist: "Aktifkan setidaknya satu Operator sebelum membuat Siswa."
- Duplicate name: "Nama Siswa sudah digunakan."
- Name empty: "Nama Siswa wajib diisi."
- Name too long: "Nama Siswa maksimal 100 karakter."

**Success:** Redirects to `/admin/students/[id]?notice=Siswa berhasil dibuat.`

**Cancel:** Returns to `/admin/students`.

### 4.2 Operator Create (Modal)

#### Modal Specification

| Property | Value |
|----------|-------|
| Trigger | "+ Tambah Siswa" button in page header |
| Presentation | Centered dialog (desktop), bottom sheet (mobile) |
| Title | "Tambah Siswa Baru" |
| Max width | 480px |
| Initial focus | Name input |

#### Fields

| Field | Type | Required | Max Length | Notes |
|-------|------|----------|------------|-------|
| Nama lengkap | Text input | Yes | 100 | Normalized, unique |
| Kelas | Text input | No | 100 | Prepended to notes as "kelas - notes" |
| Catatan | Textarea | No | 500 | Optional operational notes |

#### Behavior

1. Posts to `POST /api/operator/students` via client-side fetch.
2. `operatorId` is derived from the server session — never from the client payload.
3. Status is automatically set to `ACTIVE`.
4. On success: modal closes, page refreshes, navigates to new student's detail page with success notice.
5. On error: inline error display within modal. Values are preserved.

#### Error Handling

| Error | Display |
|-------|---------|
| Duplicate name | "Nama Siswa sudah digunakan." below the name field |
| Validation error | Inline error below each invalid field |
| Network error | "Terjadi kesalahan. Periksa koneksi Anda." at the bottom of the modal |
| No active operator | "Anda tidak memiliki akun Operator aktif." — disables the form |

---

## 5. Student Photo Integration

### 5.1 Avatar in Student List

| Property | Value |
|----------|-------|
| Size | 32px |
| Shape | Circle (`radius.full`) |
| Position | Leading the student name column |
| Fallback | Initials on deterministic colored background |
| Photo | Lazy-loaded, WebP with JPEG fallback |

### 5.2 Avatar in Student Detail

| Property | Value |
|----------|-------|
| Size | 48px |
| Shape | Circle |
| Position | Left of student name in the header area |
| Fallback | Initials |

### 5.3 Avatar in Transaction History

| Property | Value |
|----------|-------|
| Size | 24px |
| Shape | Circle |
| Position | Leading each transaction item (optional — may be omitted for density) |

### 5.4 Fallback Behavior

When no photo is available:

1. Generate initials from the student name (first letter of first and last word).
2. Background color: deterministic hash of the student name, mapped to muted teal/emerald/blue tones.
3. Text: white, `type.caption` (12px), `font-weight.semibold`.
4. The same student always gets the same color — consistent across all views.

### 5.5 Performance

| Technique | Application |
|-----------|-------------|
| Lazy loading | `loading="lazy"` for all avatars below the fold |
| Resolution | Serve at 2× for retina (32px avatar → 64px image) |
| Format | WebP with JPEG fallback |
| Placeholder | Initials circle shown immediately; photo fades in on load |

---

## 6. Search Deep Dive

### 6.1 Search Scope

| Scope | Fields Searched |
|-------|----------------|
| Admin | `name`, `notes`, `operator.name` |
| Operator | `name`, `notes` (within owned students only) |

### 6.2 Search Behavior

| Property | Value |
|----------|-------|
| Trigger | Debounced at 350ms after last keystroke |
| URL sync | Updates `?search=` param via `router.replace` (no full navigation) |
| Max length | 100 characters (truncated) |
| Empty | Clears the search filter |
| Case sensitivity | Case-insensitive (SQLite LIKE with normalization) |

### 6.3 Search Interaction

1. User types in the search input.
2. After 350ms of inactivity, the URL updates with the search param.
3. Server fetches filtered results.
4. List updates with crossfade animation.
5. Pagination resets to page 1 on new search.
6. Status filter is preserved across searches.

### 6.4 Search Feedback

| State | Feedback |
|-------|----------|
| Typing | No visual change (debounce period) |
| Searching | Skeleton loading on the list |
| Results found | List updates, count shown in pagination |
| No results | Empty state: "Siswa tidak ditemukan" |
| Error | Error state with retry |

---

## 7. Mobile Behavior

### 7.1 Breakpoint Behavior

| Breakpoint | List Layout | Detail Layout | Create |
|-----------|-------------|---------------|--------|
| >= 768px | Table | Side-by-side info + form | Full page (admin) / Dialog (operator) |
| < 768px | Card stack | Stacked sections | Full page (admin) / Bottom sheet (operator) |

### 7.2 Mobile-Specific Adaptations

| Element | Mobile Behavior |
|---------|----------------|
| Toolbar | Search and filter stack vertically |
| Table → Cards | Each row becomes a card with labeled fields |
| Balance panel | Full width, larger touch target for actions |
| Action buttons | Full width, stacked vertically |
| Transaction items | Larger touch targets (44px minimum) |
| Pagination | Simplified: "Halaman X dari Y" with prev/next |
| Back navigation | Sticky back button at top |

### 7.3 Touch Targets

| Element | Minimum Size |
|---------|-------------|
| Student row/card | Full width × 52px height |
| Action buttons | Full width × 48px |
| Search input | Full width × 44px |
| Status filter | Full width × 40px |
| Transaction item | Full width × 56px |
| Pagination buttons | 44px × 44px |

---

## 8. Accessibility

### 8.1 Keyboard Navigation

| Action | Key |
|--------|-----|
| Navigate student rows | `Tab` |
| Open student | `Enter` on focused row |
| Navigate search, filter, apply | `Tab` |
| Submit search | `Enter` in search input |
| Navigate form fields | `Tab` |
| Submit form | `Enter` on submit button |
| Cancel/close modal | `Escape` |

### 8.2 Screen Reader Labels

| Element | Label |
|---------|-------|
| Student row | "Ahmad Fauzi, Operator: Ahmad Santoso, Status: Aktif, Saldo: Rp 2.500.000" |
| Status badge | Text is readable; no additional `aria-label` needed |
| Balance | "Saldo: Rp 2.500.000" |
| Search input | `aria-label="Cari Siswa"` |
| Empty state | Announced via `aria-live="polite"` |
| Error state | Announced via `role="alert"` |
| Loading state | `aria-busy="true"` on the list container |

### 8.3 Focus Management

| Context | Focus Behavior |
|---------|---------------|
| Page load | Focus on the page heading |
| Search | Focus remains on input after results load |
| Create modal open | Focus on first field (Name) |
| Create modal close | Focus returns to trigger button |
| Form error | Focus moves to first invalid field |
| Navigation to detail | Focus on the page heading |
| Back to list | Focus on the previously clicked row (if identifiable) |

### 8.4 Contrast

All text and interactive elements meet WCAG 2.2 AA contrast requirements as defined in the Design System Foundation. Financial values use `financial.balance` which maintains 4.5:1 ratio on both light and dark surfaces.

---

## 9. Performance

### 9.1 Loading Strategy

| Phase | Content | Strategy |
|-------|---------|----------|
| 1 | Page shell + sidebar + navbar | Immediate render |
| 2 | Page header + toolbar | Immediate render (no data dependency) |
| 3 | Student list | Server-rendered, streamed with Suspense |
| 4 | Financial summaries (operator) | Parallel fetch with student list |
| 5 | Pagination | Server-rendered with list |

### 9.2 Caching

| Data | Cache Duration | Strategy |
|------|---------------|----------|
| Student list | `Cache-Control: no-store` | Always fresh (financial data) |
| Student detail | `Cache-Control: no-store` | Always fresh |
| Financial summaries | `Cache-Control: no-store` | Always fresh |
| Active operators list | 5 minutes | Cached for operator dropdown |

### 9.3 Performance Targets

| Metric | Target |
|--------|--------|
| Student list render (20 items) | < 500ms |
| Student list render (50 items) | < 800ms |
| Student detail render | < 300ms |
| Search results update | < 500ms (after debounce) |
| Create student (modal) | < 1s (including API call) |
| Create student (page) | < 500ms (page load) + form submit time |

### 9.4 Scaling

| Student Count | Behavior |
|--------------|----------|
| 0–100 | All data loads instantly |
| 100–1,000 | Pagination handles efficiently |
| 1,000–10,000 | Index on `operatorId` + `createdAt` ensures fast queries |
| 10,000+ | Consider cursor-based pagination for list; current offset pagination remains functional |

---

## 10. Business Rules Reference

| Rule | ID | Summary |
|------|----|---------|
| Name required | BR-STU-001 | Non-empty name, max 100 chars after normalization |
| Name normalization | BR-STU-002 | Trim whitespace, collapse consecutive internal spaces |
| Name uniqueness | BR-STU-003 | Case-insensitive unique normalized name |
| No deletion | BR-STU-004 | Student records are never deleted |
| Explicit lifecycle | BR-STU-005 | Status is ACTIVE, INACTIVE, or ARCHIVED |
| Notes bounded | BR-STU-006 | Optional, trimmed, max 500 chars |
| Admin + Operator creation | BR-STU-007 | Admin creates with full control; Operator self-provisions |
| Operator required | — | Every student must have exactly one active, non-deleted Operator |
| Ownership transfer | — | Changing operator requires reason; creates immutable audit event |
| Balance invariant | BR-BAL-001 | Balance is non-negative, whole-IDR, persisted, reconcilable |

---

## Appendix A: API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/admin/students` | GET | Admin | List all students |
| `/api/admin/students` | POST | Admin | Create student |
| `/api/admin/students/[id]` | GET | Admin | Get student detail |
| `/api/admin/students/[id]` | PATCH | Admin | Edit student |
| `/api/operator/students` | GET | Operator | List own students |
| `/api/operator/students` | POST | Operator | Self-provision student |
| `/api/operator/students/[id]` | GET | Owner | Get owned student detail |

---

## Appendix B: Error Codes

| Code | HTTP Status | Meaning |
|------|------------|---------|
| `VALIDATION` | 400 | Input validation failure |
| `DUPLICATE_NAME` | 409 | Student name already exists |
| `NOT_FOUND` | 404 | Student does not exist |
| `INVALID_OPERATOR` | 404 | Operator does not exist or is inactive |
| `CONFLICT` | 409 | Concurrent ownership change detected |

---

## Appendix C: Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-31 | Initial students management specification |

---

## Document Cross-References

| Document | Relationship |
|----------|-------------|
| `docs/51-design-system-foundation-v2.md` | Visual foundation: tokens, components, layout |
| `docs/52-dashboard-analytics-specification.md` | Dashboard context (how students appear in KPIs) |
| `docs/04-domain-model.md` | Domain vocabulary: Student, Operator, Transaction |
| `docs/03-business-rules.md` | Business rules: BR-STU-001 through BR-STU-007 |
| `docs/19-screen-specifications.md` | Original screen specs (superseded for detail, retained for reference) |
| `docs/18-design-tokens.md` | Token architecture and governance |
| `docs/14-component-guidelines.md` | Component contracts |
