import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("settings About and changelog content stay inside narrow PWA viewports", async () => {
  const [changelog, settings] = await Promise.all([
    readFile("src/app/(app)/changelog/changelog.module.css", "utf8"),
    readFile("src/components/settings/settings-sections.module.css", "utf8")
  ]);

  assert.match(changelog, /\.release\s*\{[^}]*min-width:\s*0/);
  assert.match(changelog, /\.release\s*\{[^}]*overflow-wrap:\s*anywhere/);
  assert.match(changelog, /\.release section\s*\{[^}]*min-width:\s*0/);
  assert.match(changelog, /\.release li\s*\{[^}]*overflow-wrap:\s*anywhere/);

  assert.match(settings, /\.headerTitleRow\s*\{[^}]*min-width:\s*0/);
  assert.match(settings, /\.headerTitleRow > div\s*\{[^}]*min-width:\s*0/);
  assert.match(settings, /\.header,[\s\S]*\.row > div,[\s\S]*min-width:\s*0/);
  assert.match(settings, /@media \(max-width: 40rem\)[\s\S]*\.secondaryButton[^}]*width:\s*100%/);
});
