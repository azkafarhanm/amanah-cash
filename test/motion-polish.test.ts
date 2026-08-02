import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("globals.css defines comprehensive reduced motion rules", async () => {
  const globals = await readFile("src/app/globals.css", "utf8");

  assert.match(globals, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(globals, /animation-duration:\s*0\.01ms\s*!important/);
  assert.match(globals, /transition-duration:\s*0\.01ms\s*!important/);
  assert.match(globals, /scroll-behavior:\s*auto\s*!important/);
});

test("operational CSS modules with transitions include explicit prefers-reduced-motion blocks", async () => {
  const files = [
    "src/components/ui/ui.module.css",
    "src/components/ui/context-detail-drawer.module.css",
    "src/components/app-shell/app-shell.module.css",
    "src/components/dashboard/dashboard-v2.module.css",
    "src/components/transactions/transactions.module.css",
    "src/components/transactions/workspace/workspace.module.css",
    "src/app/(app)/(admin)/admin/operators/operators.module.css",
    "src/components/reports/reports.module.css",
    "src/components/settings/settings-sections.module.css",
    "src/app/(auth)/auth.module.css"
  ];

  for (const file of files) {
    const css = await readFile(file, "utf8");
    assert.match(
      css,
      /@media \(prefers-reduced-motion: reduce\)/,
      `File ${file} missing explicit prefers-reduced-motion block`
    );
  }
});

test("financial values never animate, count, interpolate, or transition", async () => {
  const files = [
    "src/components/transactions/transactions.module.css",
    "src/components/transactions/workspace/workspace.module.css",
    "src/components/students/students.module.css",
    "src/components/reports/reports.module.css",
    "src/components/dashboard/dashboard-v2.module.css"
  ];

  for (const file of files) {
    const css = await readFile(file, "utf8");
    assert.doesNotMatch(css, /\.balance\s*\{[^}]*(animation|transition:\s*(color|font-size|number))/);
    assert.doesNotMatch(css, /\.amount\s*\{[^}]*(animation|transition:\s*(color|font-size|number))/);
    assert.doesNotMatch(css, /\.money\s*\{[^}]*(animation|transition:\s*(color|font-size|number))/);
  }
});
