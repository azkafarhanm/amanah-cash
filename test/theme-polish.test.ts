import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("skeletons use independently mapped semantic theme tokens", async () => {
  const [globals, ui] = await Promise.all([
    readFile("src/app/globals.css", "utf8"),
    readFile("src/components/ui/ui.module.css", "utf8")
  ]);

  assert.match(ui, /var\(--color-skeleton-base\)/);
  assert.match(ui, /var\(--color-skeleton-highlight\)/);
  assert.doesNotMatch(
    ui.match(/\.loadingSkeleton span \{[\s\S]*?\n\}/)?.[0] ?? "",
    /var\(--color-neutral-/
  );

  const darkTheme = globals.match(/:root\[data-theme="dark"\] \{[\s\S]*?\n\}/)?.[0] ?? "";
  assert.match(globals, /--color-skeleton-base: var\(--color-neutral-100\)/);
  assert.match(globals, /--color-skeleton-highlight: var\(--color-neutral-200\)/);
  assert.match(darkTheme, /--color-skeleton-base: var\(--color-navy-900\)/);
  assert.match(darkTheme, /--color-skeleton-highlight: var\(--color-navy-800\)/);
});

test("operational component styles contain no raw light surfaces or shadow colors", async () => {
  const files = [
    "src/components/dashboard/dashboard.module.css",
    "src/components/transactions/workspace/workspace.module.css",
    "src/components/settings/theme-settings.module.css",
    "src/components/ui/ui.module.css",
    "src/components/ui/context-detail-drawer.module.css",
    "src/components/reports/reports.module.css",
    "src/components/students/students.module.css",
    "src/components/transactions/transactions.module.css"
  ];
  const styles = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");

  assert.doesNotMatch(styles, /#[0-9a-f]{3,8}|rgba?\(|hsla?\(/i);
  assert.doesNotMatch(styles, /var\([^)]*,\s*(?:#|rgba?\(|white|black)/i);
});

test("shared secondary buttons expose tokenized enabled interaction states", async () => {
  const [globals, ui] = await Promise.all([
    readFile("src/app/globals.css", "utf8"),
    readFile("src/components/ui/ui.module.css", "utf8")
  ]);

  assert.match(globals, /--button-secondary-background-hover: var\(--color-background-subtle\)/);
  assert.match(globals, /--button-secondary-background-active: var\(--color-primary-subtle\)/);
  assert.match(globals, /--button-secondary-border-hover: var\(--color-border-strong\)/);
  assert.match(globals, /--button-secondary-border-active: var\(--color-action-primary\)/);
  assert.match(ui, /\.buttonSecondary:hover:not\(:disabled, \[aria-busy="true"\]\)/);
  assert.match(ui, /\.buttonSecondary:active:not\(:disabled, \[aria-busy="true"\]\)/);
  assert.match(ui, /\.button:disabled,[\s\S]*?var\(--button-disabled-foreground\)/);
  assert.match(ui, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.button,[\s\S]*?transition: none/);
});

test("theme is bootstrapped in the document head and synchronized around the application shell", async () => {
  const [rootLayout, authenticatedLayout, theme, globals] = await Promise.all([
    readFile("src/app/layout.tsx", "utf8"),
    readFile("src/app/(app)/layout.tsx", "utf8"),
    readFile("src/settings/theme.ts", "utf8"),
    readFile("src/app/globals.css", "utf8")
  ]);
  const providerPosition = authenticatedLayout.indexOf("<ThemeProvider");
  const shellPosition = authenticatedLayout.indexOf("<AppShell");

  assert.match(rootLayout, /<head>[\s\S]*?<script dangerouslySetInnerHTML/);
  assert.doesNotMatch(authenticatedLayout, /<script|ThemeBootstrapScript/);
  assert.ok(providerPosition >= 0);
  assert.ok(shellPosition > providerPosition);
  assert.match(theme, /classList\.add\("theme-changing"\)/);
  assert.match(theme, /classList\.remove\("theme-changing"\)/);
  assert.match(globals, /\.theme-changing \*/);
});

test("Light interactions use teal accent with navy dark theme foundation", async () => {
  const globals = await readFile("src/app/globals.css", "utf8");
  const darkTheme = globals.match(/:root\[data-theme="dark"\] \{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(globals, /--color-action-primary: var\(--color-teal-600\)/);
  assert.match(globals, /--color-action-primary-hover: var\(--color-teal-700\)/);
  assert.match(globals, /--color-action-primary-active: var\(--color-teal-800\)/);
  assert.match(globals, /--color-background-subtle: var\(--color-calm-50\)/);
  assert.match(globals, /--color-text-inverse: var\(--color-neutral-0\)/);
  assert.match(globals, /--focus-visible-shadow: var\(--shadow-focus-light\)/);
  assert.match(darkTheme, /--color-action-primary: var\(--color-teal-400\)/);
  assert.match(darkTheme, /--color-background-canvas: var\(--color-navy-950\)/);
});
