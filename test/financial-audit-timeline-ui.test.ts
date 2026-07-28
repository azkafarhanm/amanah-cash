import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

test("Financial Audit Timeline uses only the Batch 3B API and preserves opaque cursor pagination", () => {
  const component = source("src/components/financial-assurance/financial-audit-timeline.tsx");

  assert.match(component, /\/api\/operator\/reconciliation\/students\/\$\{encodeURIComponent\(studentId\)\}\/audit/);
  assert.match(component, /parameters\.set\("cursor", cursor\)/);
  assert.match(component, /cache: "no-store"/);
  assert.match(component, /loadMoreInFlight\.current/);
  assert.match(component, /function uniqueAuditItems/);
  assert.match(component, /setItems\(uniqueAuditItems\(data\.items\)\)/);
  assert.match(component, /setItems\(\(previous\) => uniqueAuditItems\(\[\.\.\.previous, \.\.\.data\.items\]\)\)/);
  assert.match(component, /const visibleItems = uniqueAuditItems\(items\)/);
  assert.match(component, /setNextCursor\(data\.nextCursor\)/);
  assert.doesNotMatch(component, /JSON\.parse\(.*cursor|base64|decode|Prisma|financialAuditReadService|BigInt|effect\(/);
});

test("Financial Audit Timeline renders every approved event badge and timeline evidence", () => {
  const component = source("src/components/financial-assurance/financial-audit-timeline.tsx");

  for (const eventType of ["CREATE", "EDIT", "DELETE", "RESTORE", "OWNERSHIP_TRANSFER"]) {
    assert.match(component, new RegExp(`${eventType}:`));
  }
  assert.match(component, /<ol className=\{styles\.auditTimelineList\}/);
  assert.match(component, /<li/);
  assert.match(component, /<StatusBadge tone=\{presentation\.tone\}>/);
  assert.match(component, /<time dateTime=\{item\.committedAt\}>/);
  assert.match(component, /reportDate\(item\.committedAt\)/);
  assert.match(component, /item\.transactionRevision !== null/);
  assert.match(component, /Revisi \{item\.transactionRevision\}/);
});

test("Financial Audit Timeline provides loading, empty, error, retry, pagination, and keyboard states", () => {
  const component = source("src/components/financial-assurance/financial-audit-timeline.tsx");
  const styles = source("src/components/financial-assurance/financial-assurance.module.css");

  assert.match(component, /aria-busy="true"/);
  assert.match(component, /<LoadingSkeleton variant="cards" lines=\{4\}/);
  assert.match(component, /<EmptyState/);
  assert.match(component, /Belum ada riwayat audit keuangan/);
  assert.match(component, /role="alert"/);
  assert.match(component, /Coba lagi memuat riwayat audit/);
  assert.match(component, /Muat lebih banyak/);
  assert.match(component, /role="status" aria-live="polite"/);
  assert.match(component, /document\.getElementById\(`financial-audit-event-\$\{focusAfterLoadMore\.current\}`\)\?\.focus\(\)/);
  assert.match(component, /tabIndex=\{-1\}/);
  assert.match(styles, /\.auditTimelineItem:focus-visible/);
  assert.match(styles, /@media \(max-width: 48rem\)/);
  assert.doesNotMatch(styles, /animation|transition/);
});
