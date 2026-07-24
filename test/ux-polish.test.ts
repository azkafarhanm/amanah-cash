import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { navigationForRole } from "../src/components/app-shell/navigation";

const root = resolve(import.meta.dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

const routeFile = (href: string) => {
  const [role, ...segments] = href.split("/").filter(Boolean);
  return resolve(root, "src/app/(app)", role === "admin" ? "(admin)" : "(operator)", role, ...segments, "page.tsx");
};

test("every sidebar destination resolves to an implemented page or FeaturePlaceholder", () => {
  for (const role of ["PLATFORM_ADMIN", "OPERATOR"] as const) {
    for (const item of navigationForRole(role)) {
      const path = routeFile(item.href);
      assert.equal(existsSync(path), true, `${item.href} must resolve to a page`);
    }
  }

  for (const path of [
    "src/app/(app)/(admin)/admin/settings/page.tsx",
    "src/app/(app)/(operator)/operator/settings/page.tsx"
  ]) {
    assert.match(source(path), /<FeaturePlaceholder/);
  }
  assert.match(source("src/app/(app)/(operator)/operator/transactions/page.tsx"), /<TransactionWorkspaceView/);
});


test("the reusable placeholder communicates status, availability, actions, and future capabilities accessibly", () => {
  const placeholder = source("src/components/ui/feature-placeholder.tsx");
  assert.match(placeholder, /FeatureDevelopmentStatus/);
  assert.match(placeholder, /estimatedAvailability/);
  assert.match(placeholder, /capabilities/);
  assert.match(placeholder, /aria-labelledby/);
  assert.match(placeholder, /role="status"/);
  assert.doesNotMatch(source("src/app/(app)/(operator)/operator/page.tsx"), /FeaturePlaceholder/);
  assert.doesNotMatch(source("src/app/(app)/(admin)/admin/page.tsx"), /FeaturePlaceholder/);
});

test("empty, balance, loading, error, and mobile table states remain distinct", () => {
  const students = source("src/components/students/student-list.tsx");
  const studentStyles = source("src/components/students/students.module.css");
  const operatorStyles = source("src/app/(app)/(admin)/admin/operators/operators.module.css");
  const transactions = source("src/components/transactions/transaction-experience.tsx");

  assert.doesNotMatch(students, /Belum tersedia/);
  assert.match(students, /Belum ada transaksi tercatat/);
  assert.match(students, /Tidak ada hasil yang cocok/);
  assert.match(students, /rupiah\(financial\?\.balance \?\? "0"\)/);
  assert.match(transactions, /Belum ada transaksi keuangan/);
  assert.match(studentStyles, /content: attr\(data-label\)/);
  assert.match(operatorStyles, /content: attr\(data-label\)/);
  assert.match(source("src/components/ui/loading-skeleton.tsx"), /"table" \| "cards"/);
  assert.match(source("src/app/not-found.tsx"), /kind="notFound"/);
  assert.match(source("src/app/forbidden.tsx"), /kind="forbidden"/);
  assert.match(source("src/app/unauthorized.tsx"), /kind="unauthorized"/);
});
