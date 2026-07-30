import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  DEFAULT_PAGE_SIZE,
  isPageSizePreference,
  PAGE_SIZE_OPTIONS,
  resolvePageSize
} from "../src/settings/preferences.js";

test("daily preference contract accepts only the approved page sizes", () => {
  assert.deepEqual(PAGE_SIZE_OPTIONS, [10, 20, 50]);
  assert.equal(DEFAULT_PAGE_SIZE, 20);
  for (const value of PAGE_SIZE_OPTIONS) assert.equal(isPageSizePreference(value), true);
  assert.equal(isPageSizePreference(25), false);
  assert.equal(resolvePageSize("50"), 50);
  assert.equal(resolvePageSize("invalid"), 20);
});

test("Preferences UI is local-first and deletion safety is not configurable", async () => {
  const [component, action, schema, migration, deleteForm, transactionDialog] = await Promise.all([
    readFile("src/components/settings/preferences-settings.tsx", "utf8"),
    readFile("src/settings/actions.ts", "utf8"),
    readFile("prisma/schema.prisma", "utf8"),
    readFile("migrations/011_settings_final_contract.sql", "utf8"),
    readFile("src/components/admin-forms/delete-operator-form.tsx", "utf8"),
    readFile("src/components/transactions/transaction-dialog.tsx", "utf8")
  ]);

  assert.match(component, /<select/);
  assert.match(component, /setPageSize\(value\)[\s\S]*updateDefaultPageSize/);
  assert.doesNotMatch(component, /disabled=/);
  assert.match(action, /authorizeServerAction\(\{ role: "authenticated" \}\)/);
  assert.match(schema, /defaultPageSize\s+Int\s+@default\(20\)/);
  assert.doesNotMatch(schema, /deleteConfirmation/);
  assert.match(migration, /default_page_size[\s\S]*IN \(10, 20, 50\)/);
  assert.doesNotMatch(migration, /delete_confirmation/);
  assert.match(deleteForm, /window\.confirm/);
  assert.doesNotMatch(deleteForm, /requireConfirmation/);
  assert.doesNotMatch(transactionDialog, /deleteConfirmation|requireConfirmation/);
});
