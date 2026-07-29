import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  isThemePreference,
  millisecondsUntilNextTimeBoundary,
  resolveTheme,
  resolveTimeTheme,
  THEME_PREFERENCES
} from "../src/settings/theme.js";

test("theme contract exposes exactly the four approved options", () => {
  assert.deepEqual(THEME_PREFERENCES, ["LIGHT", "DARK", "SYSTEM", "TIME"]);
  for (const value of THEME_PREFERENCES) assert.equal(isThemePreference(value), true);
  assert.equal(isThemePreference("CUSTOM"), false);
});

test("time theme uses the approved local-hour boundaries", () => {
  assert.equal(resolveTimeTheme(5), "dark");
  assert.equal(resolveTimeTheme(6), "light");
  assert.equal(resolveTimeTheme(17), "light");
  assert.equal(resolveTimeTheme(18), "dark");
});

test("explicit, system, and time preferences resolve predictably", () => {
  assert.equal(resolveTheme("LIGHT", true), "light");
  assert.equal(resolveTheme("DARK", false), "dark");
  assert.equal(resolveTheme("SYSTEM", true), "dark");
  assert.equal(resolveTheme("SYSTEM", false), "light");
  assert.equal(resolveTheme("TIME", false, new Date(2026, 6, 29, 6)), "light");
  assert.equal(resolveTheme("TIME", true, new Date(2026, 6, 29, 18)), "dark");
});

test("time preference schedules the next exact local boundary", () => {
  assert.equal(
    millisecondsUntilNextTimeBoundary(new Date(2026, 6, 29, 5, 30)),
    30 * 60 * 1000
  );
  assert.equal(
    millisecondsUntilNextTimeBoundary(new Date(2026, 6, 29, 17, 59, 59)),
    1000
  );
  assert.equal(
    millisecondsUntilNextTimeBoundary(new Date(2026, 6, 29, 18)),
    12 * 60 * 60 * 1000
  );
});

test("appearance UI remains theme-only and uses semantic tokens", async () => {
  const [component, styles, adminPage, operatorPage, schema, migration, action, service] = await Promise.all([
    readFile("src/components/settings/theme-settings.tsx", "utf8"),
    readFile("src/components/settings/theme-settings.module.css", "utf8"),
    readFile("src/app/(app)/(admin)/admin/settings/page.tsx", "utf8"),
    readFile("src/app/(app)/(operator)/operator/settings/page.tsx", "utf8"),
    readFile("prisma/schema.prisma", "utf8"),
    readFile("prisma/migrations/20260729000000_theme_preference/migration.sql", "utf8"),
    readFile("src/settings/actions.ts", "utf8"),
    readFile("src/settings/service.ts", "utf8")
  ]);

  for (const label of ["Light", "Dark", "System", "Time"]) {
    assert.match(component, new RegExp(`label: "${label}"`));
  }
  assert.doesNotMatch(component, /accent color|font size|compact mode/i);
  assert.doesNotMatch(styles, /#[0-9a-f]{3,8}|rgb\(|hsl\(/i);
  assert.match(adminPage, /ThemeSettings/);
  assert.match(operatorPage, /ThemeSettings/);
  assert.match(schema, /model SettingsPreference[\s\S]*theme\s+ThemePreference/);
  assert.match(schema, /TIME/);
  assert.match(migration, /CHECK \("theme" IN \('LIGHT', 'DARK', 'SYSTEM', 'TIME'\)\)/);
  assert.match(action, /authorizeServerAction\(\{ role: "authenticated" \}\)/);
  assert.match(action, /saveThemePreference/);
  assert.match(service, /isThemePreference\(preference\?\.theme\)/);
});
