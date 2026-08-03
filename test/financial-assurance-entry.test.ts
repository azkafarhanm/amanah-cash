import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { navigationForRole } from "../src/components/app-shell/navigation";

const root = resolve(import.meta.dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

test("Financial Assurance entry reuses protected Operator data and shared page primitives", () => {
  const page = source("src/app/(app)/(operator)/operator/reconciliation/page.tsx");
  const operatorLayout = source("src/app/(app)/(operator)/operator/layout.tsx");

  assert.match(operatorLayout, /protectRoute\("operator"\)/);
  assert.match(page, /protectRoute\("operator"\)/);
  assert.match(page, /studentManagement\(\)\.list/);
  assert.match(page, /<ContentWrapper>/);
  assert.match(page, /<SectionHeader/);
  assert.match(page, /<StudentList/);
  assert.ok(page.includes('basePath="/operator/reconciliation/students"'));
  assert.match(page, /showFinancialSummary=\{false\}/);
  assert.match(page, /showStatusFilter=\{false\}/);
  assert.doesNotMatch(page, /Prisma|reconcile|integrityStatus|MATCHED|MISMATCHED|financialAudit/i);
});

test("Financial Assurance entry reuses searchable, paginated, responsive Student selection", () => {
  const list = source("src/components/students/student-list.tsx");
  const styles = source("src/components/students/students.module.css");

  assert.ok(list.includes("setTimeout(() =>"));
  assert.match(list, /}, 350\)/);
  assert.ok(list.includes("router.replace(target, { scroll: false })"));
  assert.ok(list.includes("href={`${basePath}/${student.id}`}"));
  assert.match(list, /<EmptyState kind="students"/);
  assert.match(list, /Belum ada Siswa yang ditugaskan/);
  assert.match(list, /Tidak ada hasil yang cocok/);
  assert.match(list, /ariaLabel="Paginasi Siswa"/);
  assert.ok(styles.includes("min-height: var(--control-height-minimum)"));
  assert.match(styles, /:focus-visible/);
  assert.ok(styles.includes("@media (max-width: 48rem)"));
  assert.doesNotMatch(styles, /transition|animation/);
});

test("Financial Assurance entry exposes localized loading, retry, and navigation states", () => {
  const loading = source("src/app/(app)/(operator)/operator/reconciliation/loading.tsx");
  const error = source("src/app/(app)/(operator)/operator/reconciliation/error.tsx");
  const navigation = navigationForRole("OPERATOR");

  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /LoadingSkeleton/);
  assert.match(error, /<ErrorState/);
  assert.ok(error.includes("<Button onClick={reset}>Coba lagi memuat daftar Siswa</Button>"));
  assert.equal(
    navigation.some(
      (item) =>
        item.label === "Pemeriksaan" &&
        item.href === "/operator/reconciliation"
    ),
    true
  );
});
