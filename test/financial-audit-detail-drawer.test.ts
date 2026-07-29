import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

test("audit timeline selections open the detail drawer and restore trigger focus", () => {
  const timeline = source("src/components/financial-assurance/financial-audit-timeline.tsx");
  assert.match(timeline, /aria-haspopup="dialog"/);
  assert.match(timeline, /setSelectedAuditEventId\(item\.id\)/);
  assert.match(timeline, /<FinancialAuditDetail/);
  assert.match(timeline, /aria-expanded=\{selectedAuditEventId === item\.id\}/);
  assert.match(timeline, /data-selected=\{selectedAuditEventId === item\.id\}/);
  assert.match(timeline, /selectedTrigger\.current\?\.focus\(\)/);
});

test("detail drawer lazy-loads only the approved endpoint and deduplicates requests", () => {
  const drawer = source("src/components/financial-assurance/financial-audit-detail.tsx");
  assert.match(drawer, /\/api\/operator\/reconciliation\/students\/\$\{encodeURIComponent\(studentId\)\}\/audit\/\$\{encodeURIComponent\(auditEventId\)\}/);
  assert.match(drawer, /if \(!auditEventId\) return/);
  assert.match(drawer, /detailCache = useRef\(new Map/);
  assert.match(drawer, /inFlight = useRef\(new Map/);
  assert.match(drawer, /inFlight\.current\.get\(auditEventId\)/);
  assert.match(drawer, /cache: "no-store"/);
  assert.doesNotMatch(drawer, /Prisma|financialAuditReadService|JSON\.parse|schemaVersion/);
});

test("detail drawer exposes all required states and native modal semantics", () => {
  const drawer = source("src/components/financial-assurance/financial-audit-detail.tsx");
  const platformDrawer = source("src/components/ui/context-detail-drawer.tsx");
  assert.match(drawer, /<ContextDetailDrawer/);
  assert.match(platformDrawer, /<dialog/);
  assert.match(platformDrawer, /\.showModal\(\)/);
  assert.match(platformDrawer, /aria-labelledby=\{titleId\}/);
  assert.match(platformDrawer, /aria-describedby=\{descriptionId\}/);
  assert.match(drawer, /aria-busy="true"/);
  assert.match(drawer, /role="status" aria-live="polite"/);
  assert.match(drawer, /role="alert"/);
  assert.match(drawer, /Coba lagi memuat detail audit/);
  assert.match(drawer, /detailAvailability === "UNSUPPORTED_SCHEMA"/);
  assert.match(drawer, /Detail audit tidak tersedia/);
  assert.match(platformDrawer, /if \(event\.target === dialog\.current\) dialog\.current\?\.close\(\)/);
});

test("platform context detail drawer owns responsive, motion, and focus-visible styling", () => {
  const component = source("src/components/ui/context-detail-drawer.tsx");
  const styles = source("src/components/ui/context-detail-drawer.module.css");
  const globals = source("src/app/globals.css");

  assert.match(component, /export function ContextDetailDrawer/);
  assert.match(component, /aria-label=\{`Tutup \$\{title\.toLocaleLowerCase\("id-ID"\)\}`\}/);
  assert.match(component, /<CloseIcon \/>/);
  assert.match(styles, /var\(--context-detail-drawer-width-desktop\)/);
  assert.match(styles, /var\(--context-detail-drawer-width-tablet\)/);
  assert.match(styles, /var\(--context-detail-drawer-width-mobile\)/);
  assert.match(styles, /scrollbar-gutter: stable/);
  assert.match(styles, /overscroll-behavior: contain/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(styles, /\.close:focus-visible/);
  assert.match(globals, /--context-detail-drawer-motion-enter/);
  assert.match(globals, /--context-detail-drawer-elevation/);
});

test("detail drawer renders the approved audit field labels and optional values safely", () => {
  const drawer = source("src/components/financial-assurance/financial-audit-detail.tsx");
  for (const label of ["Jenis peristiwa", "Revisi", "Jumlah", "Arah koreksi", "Alasan", "Catatan", "Waktu kejadian", "Waktu penghapusan"]) {
    assert.match(drawer, new RegExp(label));
  }
  assert.match(drawer, /Tidak tersedia/);
  assert.doesNotMatch(drawer, /Raw snapshot|Command hash|Correlation ID|Internal ID|ORM model/);
});
