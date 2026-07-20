import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { navigationForRole } from "../src/components/app-shell/navigation";

const root = resolve(import.meta.dirname, "..");
const readSource = (path: string) => readFileSync(resolve(root, path), "utf8");

test("route groups separate public, auth, authenticated, admin, and Operator layouts", () => {
  const authenticated = readSource("src/app/(app)/layout.tsx");
  const admin = readSource("src/app/(app)/(admin)/admin/layout.tsx");
  const operator = readSource("src/app/(app)/(operator)/operator/layout.tsx");

  assert.match(authenticated, /<SessionProvider session=\{session\}>/);
  assert.match(authenticated, /<AppShell role=\{authorizationContext\.role\}/);
  assert.match(authenticated, /<Suspense fallback=\{<AppLoading \/>\}>/);
  assert.match(admin, /protectRoute\("admin"\)/);
  assert.match(operator, /protectRoute\("operator"\)/);
});

test("navigation exposes only the modules designated for each role", () => {
  const admin = navigationForRole("PLATFORM_ADMIN");
  const operator = navigationForRole("OPERATOR");

  assert.deepEqual(admin.map(({ label }) => label), ["Dashboard", "Operator", "Penugasan Siswa", "Pengaturan"]);
  assert.deepEqual(operator.map(({ label }) => label), ["Dashboard", "Siswa", "Transaksi", "Laporan", "Pengaturan"]);
  assert.equal(admin.some(({ label }) => label === "Transaksi" || label === "Laporan"), false);
  assert.equal(operator.some(({ label }) => label === "Operator"), false);
});

test("the shell provides accessible responsive landmarks without business content", () => {
  const shell = readSource("src/components/app-shell/app-shell.tsx");
  const styles = readSource("src/components/app-shell/app-shell.module.css");

  assert.match(shell, /<header/);
  assert.match(shell, /<aside id="app-navigation"/);
  assert.match(shell, /<main id="app-content"/);
  assert.match(shell, /<footer/);
  assert.match(shell, /aria-expanded=\{navigationOpen\}/);
  assert.match(styles, /@media \(min-width: 48rem\)/);
  assert.doesNotMatch(shell, /balance|amount|chart|statistic/i);
});

test("shared loading, empty, not-found, forbidden, and unexpected-error states exist", () => {
  for (const path of [
    "src/app/loading.tsx",
    "src/app/(app)/loading.tsx",
    "src/app/(app)/error.tsx",
    "src/app/error.tsx",
    "src/app/global-error.tsx",
    "src/app/not-found.tsx",
    "src/app/forbidden.tsx",
    "src/app/unauthorized.tsx",
    "src/components/ui/empty-state.tsx",
    "src/components/ui/loading-skeleton.tsx"
  ]) {
    assert.ok(readSource(path).length > 0, `${path} must not be empty`);
  }
});
