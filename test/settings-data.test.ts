import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import Database from "better-sqlite3";
import { openDatabase } from "../src/persistence/database.js";
import {
  createBackupArtifact,
  inspectBackupArtifact,
  restoreBackupArtifact
} from "../src/settings/backup.js";

test("Settings renders role-correct Data, Security, and About groups", async () => {
  const [admin, operator, data, securityAbout, changelog] = await Promise.all([
    readFile("src/app/(app)/(admin)/admin/settings/page.tsx", "utf8"),
    readFile("src/app/(app)/(operator)/operator/settings/page.tsx", "utf8"),
    readFile("src/components/settings/data-settings.tsx", "utf8"),
    readFile("src/components/settings/security-about-settings.tsx", "utf8"),
    readFile("src/app/(app)/changelog/page.tsx", "utf8")
  ]);

  assert.match(admin, /<DataSettings/);
  assert.doesNotMatch(operator, /DataSettings/);
  for (const page of [admin, operator]) {
    assert.match(page, /<SecuritySettings/);
    assert.match(page, /<AboutSettings/);
  }
  assert.match(data, /api\/admin\/settings\/backup/);
  assert.match(data, /api\/admin\/settings\/restore/);
  assert.match(data, /window\.confirm/);
  assert.match(securityAbout, /myaccount\.google\.com\/security/);
  assert.match(securityAbout, /href="\/changelog"/);
  assert.match(changelog, /releasedChangelog/);
});

test("backup round-trip validates, removes reusable sessions, and restores atomically", async () => {
  const directory = await mkdtemp(resolve(tmpdir(), "amanah-settings-backup-"));
  const databasePath = resolve(directory, "amanah.sqlite");
  const databaseUrl = `file:${databasePath}`;
  try {
    const migrated = openDatabase({
      databasePath,
      migrationsPath: resolve(process.cwd(), "migrations")
    });
    migrated.connection.exec(`
      INSERT INTO users (id, name, email, role, is_active)
      VALUES ('admin-1', 'Admin', 'admin@example.com', 'PLATFORM_ADMIN', 1);
      INSERT INTO accounts (user_id, type, provider, provider_account_id, access_token)
      VALUES ('admin-1', 'oauth', 'google', 'google-1', 'secret-token');
      INSERT INTO sessions (session_token, user_id, expires)
      VALUES ('session-1', 'admin-1', '2030-01-01T00:00:00.000Z');
      INSERT INTO settings_preferences (user_id, theme, default_page_size, updated_at)
      VALUES ('admin-1', 'LIGHT', 50, CURRENT_TIMESTAMP);
    `);
    migrated.close();

    const artifact = await createBackupArtifact(databaseUrl, "0.1.0");
    const inspected = await inspectBackupArtifact(artifact.bytes);
    assert.equal(inspected.format, "amanah-cash-backup");
    assert.equal(inspected.applicationVersion, "0.1.0");
    assert.equal(inspected.schemaVersion, "013_student_profile_photo_foundation.sql");

    const changed = new Database(databasePath);
    changed.prepare("UPDATE settings_preferences SET default_page_size = 10").run();
    changed.close();

    await restoreBackupArtifact(databaseUrl, artifact.bytes);

    const restored = new Database(databasePath, { readonly: true });
    assert.equal(
      (restored.prepare("SELECT default_page_size FROM settings_preferences").get() as { default_page_size: number }).default_page_size,
      50
    );
    assert.equal(
      (restored.prepare("SELECT COUNT(*) AS count FROM sessions").get() as { count: number }).count,
      0
    );
    assert.equal(
      (restored.prepare("SELECT access_token FROM accounts").get() as { access_token: string | null }).access_token,
      null
    );
    assert.equal(
      (restored.prepare("SELECT operation FROM maintenance_audit_events").get() as { operation: string }).operation,
      "RESTORE"
    );
    restored.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
