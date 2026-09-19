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

test("authenticated pages translate expected authorization failures through route-safe guards", () => {
  const roleProtectedPages = [
    "src/app/(app)/(operator)/operator/page.tsx",
    "src/app/(app)/(operator)/operator/students/page.tsx",
    "src/app/(app)/(operator)/operator/reports/page.tsx",
    "src/app/(app)/(operator)/operator/reconciliation/page.tsx",
    "src/app/(app)/(admin)/admin/reports/page.tsx"
  ].map(readSource).join("\n");
  const ownershipProtectedPages = [
    "src/app/(app)/(operator)/operator/students/[id]/page.tsx",
    "src/app/(app)/(operator)/operator/reports/students/[id]/page.tsx"
  ].map(readSource).join("\n");
  const routeGuards = readSource("src/authorization/routes.ts");

  assert.doesNotMatch(roleProtectedPages, /currentOperator\(|requirePlatformAdmin\(/);
  assert.match(roleProtectedPages, /protectRoute\("operator"\)/);
  assert.match(roleProtectedPages, /protectRoute\("admin"\)/);
  assert.doesNotMatch(ownershipProtectedPages, /requireOwnership\(/);
  assert.match(ownershipProtectedPages, /protectOwnership\(/);
  assert.match(routeGuards, /UnauthenticatedError\) redirect\("\/login"\)/);
  assert.match(routeGuards, /OwnershipNotFoundError\) notFound\(\)/);
});

test("navigation exposes only the modules designated for each role", () => {
  const admin = navigationForRole("PLATFORM_ADMIN");
  const operator = navigationForRole("OPERATOR");

  assert.deepEqual(admin.map(({ label }) => label), ["Dashboard", "Operator", "Penugasan Siswa", "Laporan", "Pengaturan"]);
  assert.deepEqual(operator.map(({ label }) => label), ["Dashboard", "Siswa", "Transaksi", "Laporan", "Pemeriksaan", "Pengaturan"]);
  assert.equal(admin.some(({ label }) => label === "Transaksi"), false);
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
  assert.doesNotMatch(shell, /Bell|Notifikasi|notification/i);
  assert.doesNotMatch(styles, /iconButton/);
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

test("navigation links do not opt into the five-minute client cache", () => {
  const shell = readSource("src/components/app-shell/app-shell.tsx");

  // Every destination in this nav is force-dynamic and renders money. Setting
  // prefetch={true} on a Link moves it into Next's "static" client-cache tier,
  // whose staleTimes default is five minutes — so a figure recorded moments ago
  // would still read its pre-transaction value until a manual reload.
  //
  // Left at the default, the shell and loading boundary are still prefetched
  // while the page segment falls under staleTimes.dynamic (default 0, never
  // reused), so figures are read fresh on arrival.
  //
  // Comments are stripped first: the source carries a note explaining this
  // decision, and matching prose would make the guard pass or fail on wording.
  const code = shell
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");

  assert.match(code, /href=\{item\.href\}/, "expected the navigation Link");
  assert.doesNotMatch(
    code,
    /prefetch=\{true\}/,
    "navigation Links must not set prefetch={true}: it caches money pages for five minutes"
  );
});

test("back and forward navigation refetches instead of serving Next's own cache", () => {
  const refresher = readSource("src/components/app-shell/history-navigation-refresh.tsx");
  const layout = readSource("src/app/(app)/layout.tsx");

  // Next serves back/forward from its own cache by design — staleTimes
  // explicitly "doesn't change back/forward caching behavior" — which on a page
  // showing a current figure means stepping back redisplays a pre-transaction
  // total. Removing prefetch={true} covers forward navigation only.
  assert.match(refresher, /addEventListener\("popstate"/);
  assert.match(refresher, /router\.refresh\(\)/);
  assert.match(refresher, /removeEventListener\("popstate"/);

  // Useless unless mounted for the authenticated surfaces.
  assert.match(layout, /<HistoryNavigationRefresh \/>/);
});
