# Amanah Cash — Dashboard Analytics Specification

**Version:** 1.0

**Status:** Draft

**Owner:** Project Owner

**Last Updated:** 2026-07-31

---

## 1. Product Philosophy

The Dashboard is the first screen an administrator sees after login. It is a financial health overview — not a data warehouse, not a trading terminal, not a widget playground.

### 1.1 Emotional Target

The dashboard should feel like opening a well-organized desk in the morning. The most important numbers are immediately visible. There is no noise. There is no urgency that does not exist. The administrator should feel informed, calm, and ready to act within 10 seconds.

### 1.2 Reference Direction

| Reference | What to take | What to leave |
|-----------|-------------|---------------|
| **Stripe Dashboard** | Financial clarity, restrained charts, clear KPI hierarchy, professional spacing | Payment-processing context, developer-first density |
| **Linear** | Clean hierarchy, sidebar discipline, calm surfaces, focused content | Ticket-centric workflow, keyboard-heavy paradigm |
| **Apple Health** | Card-based KPIs, trend visualization, human-readable insights, generous whitespace | Health/fitness context, iOS-specific patterns |

### 1.3 Anti-References

| Reference | Why it is rejected |
|-----------|-------------------|
| Crypto exchange | Neon colors, ticker anxiety, gamified numbers, constant motion |
| Stock trading platform | Red/green panic, dense candlestick charts, real-time pressure |
| Bootstrap admin template | Generic widget grid, no hierarchy, template-driven clutter |
| ERP dashboard | Dense tables, jargon, enterprise complexity, no breathing room |

### 1.4 Core Rules

1. **Every chart answers a business question.** If a visualization does not answer a clear question, remove it.
2. **Financial values are facts, not animations.** Numbers appear instantly after confirmation. They never count, interpolate, or transition.
3. **Charts are tools, not decoration.** A chart that does not inform is visual noise.
4. **The dashboard is scannable.** The most important information requires no scrolling on desktop.
5. **Quiet confidence.** The interface earns trust through precision and restraint, not through visual spectacle.

---

## 2. Dashboard Goals

Within 10 seconds of opening the dashboard, an administrator must understand:

| # | Understanding | Source |
|---|--------------|--------|
| 1 | How much money is currently entrusted | Hero KPI: Total Entrusted Money |
| 2 | What happened today | Hero KPI: Today's Deposits + Withdrawals |
| 3 | Whether the financial position is improving | Cash Flow Trend chart |
| 4 | Where money is being spent | Top Expense Categories |
| 5 | Which students need attention | Smart Insights |
| 6 | What just happened | Recent Activity Timeline |

If any of these six understandings requires more than 10 seconds of scanning, the dashboard has failed its purpose.

---

## 3. Dashboard Layout

### 3.1 Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Page Header                                                 │
│ Title: "Dashboard" · Date range selector · Export button    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Hero KPI Cards (4 cards, horizontal row)                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Primary Analytics (2 columns)                              │
│  ┌─────────────────────────┬───────────────────────────┐    │
│  │ Cash Flow Trend         │ Deposit vs Withdrawal     │    │
│  │ (hero chart)            │ (comparison chart)        │    │
│  └─────────────────────────┴───────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Secondary Analytics (3 columns)                            │
│  ┌─────────────┬─────────────┬─────────────────────────┐    │
│  │ Top Expense │ Balance     │ Daily Activity           │    │
│  │ Categories  │ Distribution│ Trend                    │    │
│  └─────────────┴─────────────┴─────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Smart Insights (horizontal card strip)                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Recent Activity + Quick Actions (2 columns)                │
│  ┌─────────────────────────┬───────────────────────────┐    │
│  │ Recent Activity         │ Quick Actions             │    │
│  │ Timeline                │                           │    │
│  └─────────────────────────┴───────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Section Rationale

| Section | Why it exists |
|---------|--------------|
| **Page Header** | Identifies the screen, provides date range context, offers export |
| **Hero KPI Cards** | Instant financial snapshot — the first thing the eye lands on |
| **Primary Analytics** | Answers the two most important trend questions: health and balance |
| **Secondary Analytics** | Provides depth: where money goes, who holds it, when activity peaks |
| **Smart Insights** | Surfaces anomalies and patterns without requiring manual analysis |
| **Recent Activity** | Shows what just happened — immediate operational awareness |
| **Quick Actions** | Reduces friction for the most common next steps |

### 3.3 Responsive Behavior

| Breakpoint | Layout |
|-----------|--------|
| Desktop (>= 1024px) | Full layout as specified above |
| Tablet (768px–1023px) | KPI cards 2×2, Primary charts stacked, Secondary charts 2+1, Recent Activity full width |
| Mobile (< 768px) | Single column: KPI cards stacked, charts stacked, Recent Activity full width, Quick Actions as bottom sheet |

---

## 4. Hero KPI Cards

### 4.1 Overview

Four cards in a horizontal row. The first card (Total Entrusted Money) is visually dominant — larger, with glass treatment. The other three are equal in size with solid surfaces and subtle semantic tinting.

### 4.2 Card 1: Total Entrusted Money

**Business question:** "How much money are we currently holding in trust?"

| Property | Value |
|----------|-------|
| Visual treatment | Glass surface (approved accent usage) |
| Size | 1.5× width of other cards |
| Primary value | `type.balance-display` (40px, bold, tabular-nums) |
| Label | "Total Dana Dititipkan" |
| Sub-label | "Saldo keseluruhan siswa" |
| Mini sparkline | Last 30 days balance trend, 60px wide, no axis |
| Comparison | "vs bulan lalu" with percentage delta |
| Delta color | Positive: `financial.income`, Negative: `financial.expense` |
| Icon | `Wallet` (Lucide), 40px, `text.muted` |

**Information hierarchy:**

```
[Icon]     Total Dana Dititipkan
           Saldo keseluruhan siswa

[Amount]   Rp 125.450.000

[Sparkline ─────────────]
           +12,5% vs bulan lalu
```

**Interaction:**
- Hover: subtle elevation lift
- Click: navigates to full Reports page (future)
- Sparkline hover: shows date and value tooltip

**Loading state:** Skeleton matching the card geometry. No shimmer on the amount area to avoid implying a financial value.

**Empty state:** "Rp 0" with caption "Belum ada data siswa"

### 4.3 Card 2: Today's Deposits

**Business question:** "How much money came in today?"

| Property | Value |
|----------|-------|
| Visual treatment | Solid surface with `financial.income.surface` tint |
| Primary value | `type.balance-card` (28px, semibold, tabular-nums) |
| Label | "Setoran Hari Ini" |
| Count | "5 transaksi" (transaction count) |
| Mini sparkline | Last 7 days daily deposit totals |
| Icon | `ArrowDownLeft` (Lucide), 32px, `financial.income.icon` |

**Information hierarchy:**

```
[↓ Icon]   Setoran Hari Ini

[Amount]   Rp 2.500.000
           5 transaksi

[Sparkline ─────────────]
```

### 4.4 Card 3: Today's Withdrawals

**Business question:** "How much money went out today?"

| Property | Value |
|----------|-------|
| Visual treatment | Solid surface with `financial.expense.surface` tint |
| Primary value | `type.balance-card` (28px, semibold, tabular-nums) |
| Label | "Penarikan Hari Ini" |
| Count | "3 transaksi" |
| Mini sparkline | Last 7 days daily withdrawal totals |
| Icon | `ArrowUpRight` (Lucide), 32px, `financial.expense.icon` |

**Information hierarchy:**

```
[↑ Icon]   Penarikan Hari Ini

[Amount]   Rp 750.000
           3 transaksi

[Sparkline ─────────────]
```

### 4.5 Card 4: Student Count

**Business question:** "How many students are we managing?"

| Property | Value |
|----------|-------|
| Visual treatment | Solid surface, neutral |
| Primary value | `type.balance-card` (28px, semibold) |
| Label | "Siswa Aktif" |
| Sub-stat | "150 dari 155 total" (active vs total) |
| Optional trend | Small delta vs last month |
| Icon | `Users` (Lucide), 32px, `text.muted` |

**Information hierarchy:**

```
[Users]    Siswa Aktif

[Count]    150
           dari 155 total
```

### 4.6 KPI Card Rules

1. **Financial values never animate.** The number appears instantly when data loads.
2. **Sparklines are informational only.** They have no axis labels, no tooltips on mobile, no interactive data points.
3. **Loading state:** Skeleton geometry matches final layout. The amount area uses a solid muted block, not a shimmer that could imply a number.
4. **Empty state:** Shows "Rp 0" or "0" with a contextual caption. Never shows "—" on KPI cards (reserve em-dash for error states).
5. **Comparison deltas** only appear when previous-period data exists. If this is the first month, the delta is hidden.
6. **Cards are not interactive containers.** The entire card may be clickable to navigate to a detail page, but no card contains internal interactive elements (buttons, dropdowns).

---

## 5. Primary Analytics

### 5.1 Cash Flow Trend

**Business question:** "Is our financial position improving over time?"

This is the hero visualization. It occupies the left column of the Primary Analytics section.

#### Chart Specification

| Property | Value |
|----------|-------|
| Chart type | Smooth line chart with gradient area fill |
| X-axis | Time (months or days, depending on filter) |
| Y-axis | Total balance at each point |
| Line color | `financial.balance` |
| Area fill | `financial.balance` at 10% opacity, gradient to 0% |
| Line style | Smooth (cubic bezier interpolation), 2px stroke |
| Data points | None visible by default; appear on hover |
| Gridlines | None |
| Axis labels | `type.caption`, `text.muted` |
| Tooltip | Rounded, `surface.elevated`, shows date + exact value |

#### Time Filters

| Filter | Label | X-axis granularity |
|--------|-------|-------------------|
| 7 Days | "7 Hari" | Daily |
| 30 Days | "30 Hari" | Daily |
| 3 Months | "3 Bulan" | Weekly |
| 6 Months | "6 Bulan" | Monthly |
| 1 Year | "1 Tahun" | Monthly |

Default selection: **30 Days**

#### Interaction

- **Hover:** Vertical indicator line appears at the nearest data point. Tooltip shows date and balance value.
- **Filter change:** Chart transitions smoothly to new data range (200ms).
- **Click on data point:** No action (informational only).

#### States

| State | Behavior |
|-------|----------|
| Loading | Skeleton: muted area matching chart geometry |
| Empty | "Belum ada data transaksi" with icon `BarChart3` |
| No data for range | "Tidak ada data untuk periode ini" |
| Error | Error state with "Coba lagi" action |
| Single data point | Show the point with "Data terbatas" caption |

#### Design Rules

1. **Smooth curves.** No jagged lines. Use cubic bezier interpolation.
2. **Gradient area fill** fades to transparent at the bottom. No hard edges.
3. **No chart border.** The chart area is defined by its container card.
4. **Whitespace dominates.** Padding around the chart is generous (`space.5` minimum).
5. **Y-axis uses Rupiah formatting** with Indonesian grouping (e.g., `Rp 50 jt` for compact, `Rp 50.000.000` for tooltip).

### 5.2 Deposit vs Withdrawal Comparison

**Business question:** "Are we spending more than we receive?"

This chart occupies the right column of the Primary Analytics section.

#### Chart Specification

| Property | Value |
|----------|-------|
| Chart type | Dual smooth line chart |
| Line 1 | Deposits — `financial.income` color |
| Line 2 | Withdrawals — `financial.expense` color |
| X-axis | Time (matches Cash Flow Trend filter) |
| Y-axis | Transaction totals per period |
| Line style | Smooth, 2px stroke |
| Area fill | None (dual lines only, for clarity) |
| Legend | Below chart, horizontal: "Setoran" (emerald dot) · "Penarikan" (blue dot) |

#### Interaction

- **Hover:** Both lines show values at the hovered x-position. Tooltip displays both amounts.
- **Filter change:** Synced with Cash Flow Trend filter (single date range control).

#### Insight

When deposit line is consistently above withdrawal line, the institution's entrusted money is growing. When withdrawal exceeds deposit, it signals potential concern. The Smart Insights section (below) will call this out explicitly.

#### States

Same as Cash Flow Trend.

---

## 6. Secondary Analytics

### 6.1 Top Expense Categories

**Business question:** "Where is most money being spent?"

This chart occupies the left column of the Secondary Analytics section.

#### Chart Specification

| Property | Value |
|----------|-------|
| Chart type | Horizontal bar chart |
| Maximum bars | 5 |
| Bar color | `financial.expense` with decreasing opacity (100%, 80%, 60%, 40%, 20%) |
| Bar height | 28px |
| Bar radius | `radius.sm` (4px) |
| Label | Category name (left of bar) |
| Value | Rupiah amount (right of bar) |
| Sort | Descending by amount |

#### Categories

Categories are derived from transaction notes or a future category field. Default categories when no categorization exists:

| Category | Icon | Notes |
|----------|------|-------|
| Makanan | `Utensils` | Food and daily needs |
| Pendidikan | `BookOpen` | School supplies, tuition |
| Kesehatan | `Heart` | Medical, health |
| Transportasi | `Bus` | Travel, transport |
| Lainnya | `MoreHorizontal` | Uncategorized or other |

**Note:** Categories are not yet implemented in the domain model. This chart is a future feature that activates when categorization is added to transactions. Until then, the chart shows "Top 5 Withdrawals by Amount" as a fallback.

#### States

| State | Behavior |
|-------|----------|
| Loading | 5 skeleton bars |
| Empty | "Belum ada data pengeluaran" |
| No categories | Show top 5 withdrawals by amount with "Belum dikategorikan" label |

### 6.2 Balance Distribution

**Business question:** "Which students currently hold the largest entrusted balances?"

This chart occupies the center column of the Secondary Analytics section.

#### Specification

| Property | Value |
|----------|-------|
| Format | Ranked list (not a chart) |
| Items shown | 5 (default), expandable to 10 |
| Row content | Rank number, student name, balance amount |
| Sort | Descending by balance |
| Row height | 44px |
| Avatar | 32px circle with initials (see Appendix D of Design System Foundation) |

#### Row Structure

```
1  [Avatar]  Ahmad Fauzi          Rp 2.500.000
2  [Avatar]  Siti Nurhaliza       Rp 1.850.000
3  [Avatar]  Muhammad Rizki       Rp 1.200.000
4  [Avatar]  Aisyah Putri         Rp   950.000
5  [Avatar]  Abdullah Rahman      Rp   750.000
```

#### Interaction

- **Click on row:** Navigates to that student's detail page
- **"Lihat semua" link:** Navigates to full student list sorted by balance

#### States

| State | Behavior |
|-------|----------|
| Loading | 5 skeleton rows |
| Empty | "Belum ada siswa" with "Tambah siswa" action |
| Fewer than 5 | Show available students, no padding with empty rows |

### 6.3 Daily Activity Trend

**Business question:** "When are the busiest transaction days?"

This chart occupies the right column of the Secondary Analytics section.

#### Chart Specification

| Property | Value |
|----------|-------|
| Chart type | Vertical bar chart (7 bars, one per day of week) |
| Bar color | `color.brand` at 60% opacity; busiest day at 100% |
| Bar width | Flexible, max 40px |
| Bar radius | `radius.sm` (4px) top corners only |
| X-axis | Day names (Sen, Sel, Rab, Kam, Jum, Sab, Min) |
| Y-axis | Transaction count |
| Highlight | Busiest day has full-opacity bar and subtle label above |

#### Insight

Identifies operational patterns. If Friday consistently peaks, the institution can prepare accordingly.

#### States

| State | Behavior |
|-------|----------|
| Loading | 7 skeleton bars |
| Empty | "Belum ada data transaksi" |
| No activity on a day | Bar height is 0 (no placeholder bar) |

---

## 7. Smart Insights

### 7.1 Purpose

Smart Insights surface patterns and anomalies that an administrator might miss by scanning charts manually. They are concise, human-readable, and actionable.

### 7.2 Specification

| Property | Value |
|----------|-------|
| Layout | Horizontal card strip (scrollable on mobile) |
| Card count | 3–5 insights (dynamic based on data) |
| Card width | Auto-fit, min 240px |
| Card height | 80px |
| Card surface | `surface.default` with left color accent bar (4px) |
| Icon | Contextual Lucide icon, 20px |
| Text | `type.body-small` (14px), two lines maximum |
| Accent bar color | Semantic: `feedback.warning`, `financial.income`, `financial.expense`, `feedback.info` |

### 7.3 Insight Types

| Type | Example | Accent | Icon |
|------|---------|--------|------|
| **Anomaly** | "Pengeluaran naik 18% dibanding bulan lalu" | `feedback.warning` | `TrendingUp` |
| **Category leader** | "Makanan adalah kategori pengeluaran terbesar" | `feedback.info` | `Utensils` |
| **Low balance alert** | "3 siswa memiliki saldo di bawah Rp 20.000" | `feedback.warning` | `AlertTriangle` |
| **Positive trend** | "Setoran melebihi penarikan minggu ini" | `financial.income` | `TrendingUp` |
| **Activity peak** | "Aktivitas transaksi paling tinggi pada hari Jumat" | `feedback.info` | `Calendar` |
| **Growth** | "15 siswa baru ditambahkan bulan ini" | `financial.income` | `UserPlus` |
| **Correction notice** | "2 koreksi dilakukan minggu ini" | `feedback.warning` | `Pencil` |

### 7.4 Insight Generation Rules

1. **Insights are generated from data, not hardcoded.** Each insight type has a threshold or pattern that triggers it.
2. **Maximum 5 insights.** Prioritize by relevance: anomalies > alerts > trends > patterns.
3. **Insights refresh on page load.** They do not update in real-time.
4. **No insight is better than a misleading insight.** If data is insufficient, show fewer insights rather than speculative ones.
5. **Insights are dismissible.** A close button removes the card for the current session.

### 7.5 Insight Priority

| Priority | Type | Threshold |
|----------|------|-----------|
| 1 | Low balance alert | Any student balance < Rp 20.000 |
| 2 | Anomaly | Expense change > 15% vs previous period |
| 3 | Positive trend | Deposits > Withdrawals for current week |
| 4 | Category leader | Top category > 40% of total expenses |
| 5 | Activity peak | Busiest day has 2× average daily volume |
| 6 | Growth | New students > 10% of total in current month |
| 7 | Correction notice | Any correction in last 7 days |

### 7.6 States

| State | Behavior |
|-------|----------|
| Loading | 3 skeleton insight cards |
| No insights | Section hidden entirely (do not show "Tidak ada insight") |
| Fewer than 3 | Show available insights, no empty card slots |

---

## 8. Recent Activity Timeline

### 8.1 Purpose

Shows the latest financial events in reverse chronological order. Provides immediate operational awareness: "What just happened?"

### 8.2 Specification

| Property | Value |
|----------|-------|
| Layout | Vertical timeline list |
| Items shown | 10 (default) |
| Row height | 56px |
| Time format | 24-hour (e.g., "09:10") |
| Date | Shown only if not today; format: "31 Jul" |
| Direction icon | `ArrowDownLeft` (deposit), `ArrowUpRight` (withdrawal), `Pencil` (correction) |
| Direction color | `financial.income` (deposit), `financial.expense` (withdrawal), `financial.correction` (correction) |

### 8.3 Row Structure

```
09:10  [↓]  Setoran      Ahmad Fauzi        Rp 100.000
09:25  [↑]  Penarikan    Zaid Abdullah      Rp  25.000
09:40  [✎]  Koreksi      Admin              Rp   5.000
10:15  [↓]  Setoran      Siti Nurhaliza     Rp 200.000
```

### 8.4 Interaction

- **Click on row:** Opens context detail drawer with full transaction detail
- **"Lihat semua" link:** Navigates to full Transactions page

### 8.5 States

| State | Behavior |
|-------|----------|
| Loading | 5 skeleton rows |
| Empty | "Belum ada aktivitas hari ini" with `ArrowRightLeft` icon |
| Today empty, yesterday has data | Show yesterday's data with "Kemarin" header |

---

## 9. Quick Actions

### 9.1 Purpose

Reduces friction for the most common next steps after viewing the dashboard.

### 9.2 Specification

| Property | Value |
|----------|-------|
| Layout | Vertical button stack |
| Button style | Secondary variant, full width |
| Button height | 44px |
| Icon | Leading icon, 20px |
| Label | Action verb in Bahasa Indonesia |

### 9.3 Actions

| Action | Icon | Label | Destination |
|--------|------|-------|-------------|
| Deposit | `ArrowDownLeft` | "Setoran Baru" | Student selection → Deposit form |
| Withdrawal | `ArrowUpRight` | "Penarikan Baru" | Student selection → Withdrawal form |
| Correction | `Pencil` | "Koreksi Transaksi" | Student selection → Correction form |
| Export Report | `Download` | "Ekspor Laporan" | Export dialog |
| Student Management | `Users` | "Kelola Siswa" | Student List page |

### 9.4 Rules

1. **Quick Actions are shortcuts, not the only way.** Every action is also available through the sidebar navigation.
2. **Actions respect permissions.** If the user's role does not permit an action, it is hidden, not disabled.
3. **No confirmation on navigation.** Clicking an action navigates directly; no "Are you sure?" for navigation.

---

## 10. Chart Design Rules

These rules extend the Design System Foundation (Enhancement 7: Data Visualization Guidelines).

### 10.1 Curve Style

- All line charts use **smooth cubic bezier interpolation**. No jagged polylines.
- Tension parameter: 0.3 (gentle curves, not exaggerated).
- Data points are not visible by default. They appear as 6px circles on hover.

### 10.2 Gradient Area

- Area fills use a **vertical linear gradient** from the line color at 10% opacity (top) to 0% opacity (bottom).
- No horizontal gradients, no multi-color gradients, no radial gradients.
- Gradient is clipped to the chart area.

### 10.3 Tooltip Design

| Property | Value |
|----------|-------|
| Background | `surface.elevated` |
| Border | `1px solid border.default` |
| Radius | `radius.md` (8px) |
| Padding | `space.3` (12px) |
| Shadow | `shadow.sm` |
| Font | `type.body-small` (14px) for labels, `type.balance-inline` (14px) for values |
| Max width | 200px |

### 10.4 Grid and Axes

- **No vertical gridlines.** They add noise without aiding comprehension.
- **Horizontal gridlines:** Optional, only when the Y-axis range is large. Use `border.muted`, 1px dashed.
- **Axis labels:** `type.caption` (12px), `text.muted`. X-axis labels use Indonesian day/month names.
- **No axis lines.** The axis is implied by the label position.
- **Y-axis compact format:** `Rp 50 jt`, `Rp 500 rb` for large numbers. Full format in tooltips.

### 10.5 Color Rules

- **Maximum 5–6 colors per chart.** Use the semantic financial palette.
- **No neon, no saturated fills for large areas.** Muted tones only.
- **No decorative gradients inside chart areas.** Gradient area fill is the only exception, and it must be subtle (10% opacity max).
- **Color-independent meaning.** Use line style (solid vs dashed), labels, or icons to differentiate series in addition to color.

### 10.6 Chart Container

| Property | Value |
|----------|-------|
| Background | `surface.default` |
| Border | `1px solid border.default` |
| Radius | `radius.lg` (12px) |
| Padding | `space.5` (20px) |
| Header | Chart title (`type.h4`) + optional filter controls |
| Footer | Optional legend, "Lihat semua" link |

### 10.7 What Charts Must NOT Have

| Element | Why |
|---------|-----|
| Chart border (inner) | The container card provides structure |
| 3D effects | Distracting, reduces readability |
| Decorative gridlines | Noise without information |
| Legends when only one series | Unnecessary; label directly |
| Animated data transitions | Financial values are facts, not animations |
| Continuous animation | No pulsing, breathing, or looping |
| Neon or saturated fills | Signals gaming/crypto, not financial trust |

---

## 11. Animation

### 11.1 Allowed Animation

| Trigger | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Initial load | Area fill fades in from 0% opacity | 200ms | `motion.ease.standard` |
| Initial load | Line draws from left to right | 250ms | `motion.ease.standard` |
| Filter change | Data crossfades | 200ms | `motion.ease.standard` |
| Hover | Data point appears, tooltip fades in | 120ms | `motion.ease.standard` |
| Hover | Vertical indicator line appears | 120ms | `motion.ease.standard` |

### 11.2 Prohibited Animation

| Animation | Why |
|-----------|-----|
| Counting numbers from 0 to value | Financial values are facts, not transitions |
| Continuous line drawing | Distracting, implies live data |
| Pulsing data points | Unnecessary attention |
| Bounce or elastic easing | Playful, not professional |
| Parallax on charts | Disorienting |
| Staggered bar animation (repeated) | Acceptable on first load only; never on filter change |

### 11.3 Reduced Motion

When `prefers-reduced-motion: reduce`:
- All chart animation is disabled
- Data appears immediately
- Tooltips appear instantly on hover
- Skeletons are static (no shimmer)

---

## 12. Mobile Behavior

### 12.1 Layout Stacking

| Section | Mobile Behavior |
|---------|----------------|
| KPI Cards | Stack vertically, 1 per row |
| Cash Flow Trend | Full width, below KPI cards |
| Deposit vs Withdrawal | Full width, below Cash Flow |
| Top Expense Categories | Full width |
| Balance Distribution | Full width, show top 3 only |
| Daily Activity | Full width |
| Smart Insights | Horizontal scroll, 1 card visible at a time |
| Recent Activity | Full width |
| Quick Actions | Full width, or bottom sheet |

### 12.2 Chart Adaptations

| Chart | Mobile Adaptation |
|-------|------------------|
| Line charts | Reduced data labels, larger touch targets for hover |
| Bar charts | Fewer bars visible (scroll if needed), wider bars |
| Horizontal bar | Labels truncate with ellipsis, full label on tap |

### 12.3 Touch Interactions

| Interaction | Behavior |
|------------|----------|
| Tap on chart data point | Shows tooltip for that point |
| Tap elsewhere | Dismisses tooltip |
| Horizontal swipe on Smart Insights | Scrolls insight cards |
| Long press | No special behavior (avoids accidental activation) |

### 12.4 Mobile Rules

1. **No horizontal scrolling** for primary content. Charts reflow to single column.
2. **Touch targets are 44px minimum.** Chart data points have 44px hit areas even if the visual point is smaller.
3. **Tooltips appear above the data point** to avoid being obscured by the finger.
4. **KPI cards are scannable without scrolling.** On a 390px viewport, at least 2 KPI cards should be visible without scrolling.

---

## 13. Loading Experience

### 13.1 Per-Section Loading

Each section loads independently. A slow chart does not block the entire dashboard.

| Section | Loading Behavior |
|---------|-----------------|
| KPI Cards | Skeleton geometry matching final layout |
| Charts | Skeleton: muted area matching chart shape |
| Smart Insights | 3 skeleton cards |
| Recent Activity | 5 skeleton rows |
| Quick Actions | Always visible immediately (no data dependency) |

### 13.2 Loading Sequence

```
1. Page shell + Sidebar + Navbar (immediate)
2. Quick Actions (immediate, no data)
3. KPI Cards (priority: load first)
4. Cash Flow Trend (priority: load second)
5. Deposit vs Withdrawal (parallel with #4)
6. Secondary Analytics (parallel, lower priority)
7. Smart Insights (after KPI data arrives)
8. Recent Activity (parallel with #6)
```

### 13.3 Progressive Rendering

- KPI cards appear as soon as their data is ready, even if charts are still loading.
- Charts render in their container immediately (skeleton), then swap to data when ready.
- No global loading spinner. The dashboard is always structurally visible.

### 13.4 Error Recovery

| Error Scope | Behavior |
|------------|----------|
| Single chart fails | That chart shows error state; others remain |
| All charts fail | Dashboard shows error state with "Coba lagi" action |
| Network offline | Offline banner at top; stale data shown with "Data mungkin tidak terbaru" |
| Partial data | Show available data; missing sections show "Data tidak tersedia" |

---

## 14. Accessibility

### 14.1 Chart Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Screen readers | Each chart has `aria-label` describing its purpose and linked data table |
| Keyboard navigation | Data points are focusable; arrow keys move between points |
| Tooltips on focus | Same tooltip appears on keyboard focus as on hover |
| High contrast | Charts remain readable in Windows High Contrast Mode |
| Color independence | Line style, labels, or shapes supplement color coding |
| Data table | Visually hidden `<table>` with the same data as the chart |

### 14.2 KPI Card Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Screen readers | "Total dana dititipkan: Rp 125.450.000, naik 12,5% dari bulan lalu" |
| Value announcement | `aria-live="polite"` on KPI values so screen readers announce updates |
| Delta meaning | Percentage change includes direction in text, not just color |

### 14.3 Smart Insights Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Screen readers | Each insight is a list item with full text |
| Dismiss | Close button has `aria-label="Tutup insight"` |
| Live region | `aria-live="polite"` so new insights are announced |

### 14.4 General Dashboard Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Page title | `<title>` updates to "Dashboard — Amanah Cash" |
| Heading hierarchy | `h1` for page title, `h2` for section titles, `h3` for card titles |
| Landmark regions | `main`, `nav`, `banner` used correctly |
| Skip link | "Langsung ke konten" available for keyboard users |
| Focus order | Logical: header → KPIs → primary charts → secondary → insights → activity → actions |

---

## 15. Performance

### 15.1 Perceived Speed

| Technique | Application |
|-----------|-------------|
| Skeleton loading | Every data-dependent section shows skeleton immediately |
| Progressive rendering | Sections appear as data arrives, not all at once |
| Lazy loading | Secondary analytics load after primary analytics render |
| Memoization | Chart calculations are memoized; filter changes do not recompute everything |

### 15.2 Data Loading Strategy

| Data | Strategy |
|------|----------|
| KPI values | Single aggregated API call, cached for 60 seconds |
| Chart data | Separate API call per chart, cached for 5 minutes |
| Smart Insights | Computed server-side from cached KPI data |
| Recent Activity | Real-time fetch, not cached |

### 15.3 Rendering Performance

| Technique | Application |
|-----------|-------------|
| Virtual scrolling | Not needed for dashboard (fixed content) |
| Chart debouncing | Filter changes debounced by 150ms before chart re-render |
| Canvas rendering | Use canvas for charts with >100 data points; SVG for smaller datasets |
| Image optimization | Sparklines rendered as inline SVG, not images |

### 15.4 Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint (KPI cards) | < 2.0s |
| Time to Interactive | < 3.0s |
| Total dashboard data transfer | < 200KB (compressed) |
| Chart render time | < 100ms per chart |

### 15.5 Scaling

| Student Count | Behavior |
|--------------|----------|
| 0–100 | All data loads instantly; no pagination needed |
| 100–1,000 | Chart data aggregated server-side; KPIs pre-computed |
| 1,000–10,000 | Pagination on Recent Activity; charts use aggregated buckets |
| 10,000+ | Dashboard uses pre-computed daily snapshots; real-time only for today's KPIs |

---

## 16. Success Criteria

A successful dashboard implementation must:

| # | Criterion | Measurement |
|---|-----------|-------------|
| 1 | Communicate financial health within 10 seconds | User testing: 8/10 administrators can state total balance and today's activity after 10 seconds |
| 2 | Require minimal cognitive effort | No section requires more than 5 seconds to understand |
| 3 | Feel premium | Visual review against Design System Foundation passes all checks |
| 4 | Remain readable with large datasets | Tested with 5,000+ students and 50,000+ transactions |
| 5 | Scale from 20 students to thousands | Performance targets met at all scales |
| 6 | Support desktop and mobile equally well | All sections functional and readable at 320px–2560px |
| 7 | Pass accessibility audit | WCAG 2.2 AA compliance verified |
| 8 | Handle all error states gracefully | Every section has loading, empty, error, and offline states |
| 9 | Answer all 6 core questions | Each question is answered by a specific, identifiable section |
| 10 | Feel calm, not urgent | No flashing, no countdown timers, no anxiety-inducing patterns |

---

## Appendix A: Data Model Requirements

The Dashboard requires the following data aggregations that may not exist in the current domain model:

| Aggregation | Source | Notes |
|-------------|--------|-------|
| Total balance (all students) | `Student.balance` sum | Pre-computed, cached |
| Today's deposits | `Transaction` where type=DEPOSIT and date=today | Real-time |
| Today's withdrawals | `Transaction` where type=WITHDRAWAL and date=today | Real-time |
| Student count (active) | `Student` where status=ACTIVE | Cached |
| Monthly trend | Daily balance snapshots or transaction aggregation | Requires snapshot table or computed aggregation |
| Deposit vs Withdrawal trend | Transaction aggregation by month | Server-side computation |
| Top expense categories | Transaction notes or future category field | Requires categorization feature |
| Balance distribution | Top N students by balance | Pre-computed, cached |
| Daily activity | Transaction count by day of week | Server-side aggregation |
| Smart insights | Computed from above aggregations | Server-side computation |

**Note:** Some of these aggregations may require new database queries or a read-model optimization layer. This is an implementation concern, not a design concern.

---

## Appendix B: Date Range Filter

### Specification

| Property | Value |
|----------|-------|
| Default range | Last 30 days |
| Position | Page header, right-aligned |
| Presets | 7 Hari, 30 Hari, 3 Bulan, 6 Bulan, 1 Tahun |
| Custom range | Date picker (from/to) |
| Scope | Affects Cash Flow Trend and Deposit vs Withdrawal charts |
| Persistence | Remembers last selection per user |

### Behavior

- Changing the date range updates only the affected charts, not KPI cards or other sections.
- Charts show a brief loading skeleton during data fetch (200ms minimum to prevent flash).
- If the selected range has no data, show "Tidak ada data untuk periode ini" with the chart shape preserved.

---

## Appendix C: Export

### Dashboard Export

The page header includes an export button that generates a PDF or Excel report of the current dashboard state.

| Property | Value |
|----------|-------|
| Format | PDF (default), Excel |
| Content | KPI values, chart data as tables, insight text |
| Date range | Matches current filter selection |
| Filename | `dashboard-amanah-cash-[date].[ext]` |

---

## Appendix D: Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-31 | Initial dashboard analytics specification |

---

## Document Cross-References

| Document | Relationship |
|----------|-------------|
| `docs/51-design-system-foundation-v2.md` | Visual foundation: tokens, typography, spacing, elevation, glass, components |
| `docs/12-ui-design-system.md` | Foundational design philosophy |
| `docs/14-component-guidelines.md` | Component contracts (cards, buttons, tables, dialogs) |
| `docs/18-design-tokens.md` | Token architecture and governance |
| `docs/04-domain-model.md` | Domain vocabulary for UI copy |
