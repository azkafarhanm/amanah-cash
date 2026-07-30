import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  isThemePreference,
  resolveTheme,
  THEME_PREFERENCES
} from "../src/settings/theme.js";

test("theme contract exposes exactly the three approved options", () => {
  assert.deepEqual(THEME_PREFERENCES, ["LIGHT", "DARK", "SYSTEM"]);
  for (const value of THEME_PREFERENCES) assert.equal(isThemePreference(value), true);
  assert.equal(isThemePreference("TIME"), false);
  assert.equal(isThemePreference("CUSTOM"), false);
});

test("explicit and system preferences resolve predictably", () => {
  assert.equal(resolveTheme("LIGHT", true), "light");
  assert.equal(resolveTheme("DARK", false), "dark");
  assert.equal(resolveTheme("SYSTEM", true), "dark");
  assert.equal(resolveTheme("SYSTEM", false), "light");
});

test("appearance UI uses three semantic, local-first choices", async () => {
  const [component, styles, adminPage, operatorPage, schema, migration, action, service] = await Promise.all([
    readFile("src/components/settings/theme-settings.tsx", "utf8"),
    readFile("src/components/settings/theme-settings.module.css", "utf8"),
    readFile("src/app/(app)/(admin)/admin/settings/page.tsx", "utf8"),
    readFile("src/app/(app)/(operator)/operator/settings/page.tsx", "utf8"),
    readFile("prisma/schema.prisma", "utf8"),
    readFile("migrations/011_settings_final_contract.sql", "utf8"),
    readFile("src/settings/actions.ts", "utf8"),
    readFile("src/settings/service.ts", "utf8")
  ]);

  for (const label of ["Light", "Dark", "System"]) {
    assert.match(component, new RegExp(`label: "${label}"`));
  }
  assert.doesNotMatch(component, /label: "Time"|disabled=\{saving/);
  assert.doesNotMatch(styles, /#[0-9a-f]{3,8}|rgb\(|hsl\(/i);
  assert.match(adminPage, /ThemeSettings/);
  assert.match(operatorPage, /ThemeSettings/);
  assert.match(schema, /model SettingsPreference[\s\S]*theme\s+ThemePreference/);
  assert.doesNotMatch(schema, /\bTIME\b/);
  assert.match(migration, /theme IN \('LIGHT', 'DARK', 'SYSTEM'\)/);
  assert.match(action, /authorizeServerAction\(\{ role: "authenticated" \}\)/);
  assert.match(action, /saveThemePreference/);
  assert.match(service, /isThemePreference\(preference\?\.theme\)/);
});
