import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const source = (path: string) => readFile(path, "utf8");

test("shared Avatar supports approved Phase 1 sizes and preserves initials fallback", async () => {
  const [avatar, styles] = await Promise.all([
    source("src/components/ui/avatar.tsx"),
    source("src/components/ui/avatar.module.css")
  ]);

  assert.match(avatar, /"xs" \| "sm" \| "md" \| "lg"/);
  assert.match(avatar, /slice\(0, 2\)/);
  assert.match(avatar, /\|\| "\?"/);
  assert.match(avatar, /photo.*\? \(/);
  assert.match(avatar, /width=\{pixels\}/);
  assert.match(avatar, /height=\{pixels\}/);
  assert.match(avatar, /onLoad/);
  assert.match(avatar, /loadedPhotosCache\.add\(photo\)/);
  assert.match(avatar, /failedPhotosCache\.add\(photo\)/);
  assert.match(avatar, /event\.currentTarget\.hidden = true/);
  assert.match(styles, /border-radius: var\(--radius-full\)/);
  assert.match(styles, /object-fit: cover/);
});

test("Phase 1 uses existing session images only in approved account surfaces", async () => {
  const [shell, account, adminSettings, operatorSettings] = await Promise.all([
    source("src/components/app-shell/app-shell.tsx"),
    source("src/components/settings/account-settings.tsx"),
    source("src/app/(app)/(admin)/admin/settings/page.tsx"),
    source("src/app/(app)/(operator)/operator/settings/page.tsx")
  ]);

  assert.match(shell, /photo=\{user\.image\}/);
  assert.match(shell, /loading="eager"/);
  assert.match(account, /photo=\{user\.image\}/);
  assert.match(adminSettings, /<AccountSettings user=\{session\?\.user \?\? \{\}\} \/>/);
  assert.match(operatorSettings, /<AccountSettings user=\{session\?\.user \?\? \{\}\} \/>/);
});

test("Phase 1 introduces no Student, upload, media, Blob, backup, or schema integration", async () => {
  const account = await source("src/components/settings/account-settings.tsx");
  assert.doesNotMatch(account, /Student|upload|crop|Blob|backup|photoObjectKey/);
});
