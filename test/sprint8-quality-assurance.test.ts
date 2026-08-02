import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Epic 8.1 Accessibility: focus rings, screen reader landmarks, and touch targets are present", async () => {
  const [appShell, uiStyles, pagination, drawer] = await Promise.all([
    readFile("src/components/app-shell/app-shell.module.css", "utf8"),
    readFile("src/components/ui/ui.module.css", "utf8"),
    readFile("src/components/ui/pagination.tsx", "utf8"),
    readFile("src/components/ui/context-detail-drawer.tsx", "utf8")
  ]);

  // Focus visible styling
  assert.match(appShell, /:focus-visible/);
  assert.match(uiStyles, /:focus-visible/);

  // ARIA screen reader attributes and landmarks
  assert.match(pagination, /aria-current="page"/);
  assert.match(pagination, /aria-disabled="true"/);
  assert.match(drawer, /<dialog/);
  assert.match(drawer, /aria-labelledby/);

  // Touch targets minimum size
  assert.match(uiStyles, /min-height:\s*(var\(--control-height-minimum\)|var\(--button-height-default\))/);
});

test("Epic 8.2 Performance: animations use opacity/transform and skeleton geometries match layout", async () => {
  const [uiStyles, dashboardCss, skeleton] = await Promise.all([
    readFile("src/components/ui/ui.module.css", "utf8"),
    readFile("src/components/dashboard/dashboard-v2.module.css", "utf8"),
    readFile("src/components/ui/loading-skeleton.tsx", "utf8")
  ]);

  // Keyframes and performance-friendly animation properties
  assert.match(uiStyles, /@keyframes/);
  assert.match(dashboardCss, /animation:\s*skeleton-pulse/);
  assert.match(dashboardCss, /opacity:/);

  // Skeleton component structure
  assert.match(skeleton, /styles\.loadingSkeleton/);
});

test("Epic 8.3 Cross-Device & Theme: layout metadata, flash-free theme bootstrap, and dual theme tokens are complete", async () => {
  const [layout, globals] = await Promise.all([
    readFile("src/app/layout.tsx", "utf8"),
    readFile("src/app/globals.css", "utf8")
  ]);

  // Flash-free theme bootstrap script in layout.tsx
  assert.match(layout, /themeBootstrap/);
  assert.match(layout, /dataset\.theme/);

  // Dual Theme token support in globals.css
  assert.match(globals, /--color-background-canvas:/);
  assert.match(globals, /\[data-theme="dark"\]/);
});

test("Epic 8.4 Visual Review: operational CSS contains tokenized properties and centralized formatters", async () => {
  const [formatting, uiStyles, workspaceStyles] = await Promise.all([
    readFile("src/presentation/formatting.ts", "utf8"),
    readFile("src/components/ui/ui.module.css", "utf8"),
    readFile("src/components/transactions/workspace/workspace.module.css", "utf8")
  ]);

  // Centralized Rupiah formatting
  assert.match(formatting, /export function rupiah/);
  assert.match(formatting, /export function formatTimelineGroup/);

  // No legacy or raw literal colors in operational CSS
  assert.doesNotMatch(uiStyles, /#[0-9a-f]{3,8}|rgba?\(|hsla?\(/i);
  assert.doesNotMatch(workspaceStyles, /#[0-9a-f]{3,8}|rgba?\(|hsla?\(/i);
});

test("Epic 8.5 Final MVP Alignment: business rules, authorization, and financial invariants intact", async () => {
  const [authorization, domain, readService] = await Promise.all([
    readFile("src/authorization/index.ts", "utf8"),
    readFile("src/transactions/domain.ts", "utf8"),
    readFile("src/transactions/read-service.ts", "utf8")
  ]);

  // Authorization boundaries
  assert.match(authorization, /authorization\(\)/);
  assert.match(authorization, /requirePlatformAdmin/);
  assert.match(authorization, /requireOperator/);

  // Financial invariants
  assert.match(domain, /export function effect/);
  assert.match(domain, /export function checkedBalance/);
  assert.match(readService, /workspaceHistory/);
});
