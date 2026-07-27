import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

test("Student reconciliation page reuses the protected layout and Batch 1C endpoint renderer", () => {
  const page = source("src/app/(app)/(operator)/operator/reconciliation/students/[studentId]/page.tsx");
  const component = source("src/components/financial-assurance/reconciliation-result.tsx");

  assert.match(page, /<ContentWrapper>/);
  assert.match(page, /<SectionHeader/);
  assert.match(page, /<ReconciliationResultCard key=\{studentId\} studentId=\{studentId\}/);
  assert.ok(page.includes('href="/operator/reconciliation"'));
  assert.ok(component.includes("/api/operator/students/${encodeURIComponent(studentId)}/reconciliation"));
  assert.match(component, /cache: "no-store"/);
  assert.doesNotMatch(page + component, /Prisma|studentManagement|transactionReadService|financialAudit|Audit Timeline/i);
});

test("Result Card renders only approved DTO evidence with shared presentation formatters", () => {
  const component = source("src/components/financial-assurance/reconciliation-result.tsx");

  for (const field of [
    "checkedAt",
    "persistedBalance",
    "calculatedBalance",
    "difference",
    "activeTransactionCount",
    "integrityStatus"
  ]) {
    assert.match(component, new RegExp(`result\\.${field}`));
  }
  assert.ok(component.includes("reportDate(result.checkedAt)"));
  assert.ok(component.includes("rupiah(result.persistedBalance)"));
  assert.ok(component.includes("rupiah(result.calculatedBalance)"));
  assert.ok(component.includes("rupiah(result.difference)"));
  assert.doesNotMatch(component, /BigInt|effect\(|calculatedBalance\s*[-+*/]|persistedBalance\s*[-+*/]/);
});

test("Result Card supports all integrity, loading, error, retry, and accessibility states", () => {
  const component = source("src/components/financial-assurance/reconciliation-result.tsx");
  const styles = source("src/components/financial-assurance/financial-assurance.module.css");
  const loading = source("src/app/(app)/(operator)/operator/reconciliation/students/[studentId]/loading.tsx");
  const error = source("src/app/(app)/(operator)/operator/reconciliation/students/[studentId]/error.tsx");

  assert.match(component, /MATCHED:/);
  assert.match(component, /MISMATCHED:/);
  assert.match(component, /UNAVAILABLE:/);
  assert.match(component, /badgeLabel: "Sesuai"/);
  assert.match(component, /aria-hidden="true"/);
  assert.ok(component.includes('role={urgent ? "alert" : "status"}'));
  assert.match(component, /aria-labelledby="reconciliation-result-title"/);
  assert.ok(component.includes("<dl className={styles.resultValues}>"));
  assert.ok(component.includes("<time dateTime={result.checkedAt}>"));
  assert.match(component, /<LoadingSkeleton/);
  assert.match(component, /Coba lagi memuat hasil pemeriksaan/);
  assert.match(component, /Periksa lagi/);
  assert.match(component, /Hasil pemeriksaan sebelumnya tetap ditampilkan/);
  assert.match(loading, /aria-busy="true"/);
  assert.match(error, /<ErrorState/);
  assert.ok(styles.includes("@media (max-width: 48rem)"));
  assert.match(styles, /font-variant-numeric: tabular-nums/);
  assert.doesNotMatch(styles, /animation|transition/);
});
