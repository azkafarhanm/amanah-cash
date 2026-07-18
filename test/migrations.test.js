import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { openDatabase } from "../src/persistence/database.js";

const root = resolve(import.meta.dirname, "..");
const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function makeTemporaryDirectory(name) {
  const directory = join(tmpdir(), `amanah-cash-${name}-${crypto.randomUUID()}`);
  mkdirSync(directory, { recursive: true });
  temporaryDirectories.push(directory);
  return directory;
}

function schemaSnapshot(connection) {
  return connection
    .prepare(
      "SELECT type, name, tbl_name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name"
    )
    .all()
    .map((row) => ({ ...row }));
}

function appliedMigrations(connection) {
  return connection
    .prepare("SELECT version FROM schema_migrations ORDER BY version")
    .all()
    .map((row) => ({ ...row }));
}

test("reopening a file-backed database does not reapply an applied migration", () => {
  const directory = makeTemporaryDirectory("repeatability");
  const databasePath = join(directory, "amanah-cash.sqlite");
  const migrationsPath = resolve(root, "migrations");

  const first = openDatabase({ databasePath, migrationsPath });
  const firstSnapshot = schemaSnapshot(first.connection);
  assert.deepEqual(appliedMigrations(first.connection), [{ version: "001_initial_schema.sql" }]);
  first.close();

  const second = openDatabase({ databasePath, migrationsPath });
  assert.deepEqual(schemaSnapshot(second.connection), firstSnapshot);
  assert.deepEqual(appliedMigrations(second.connection), [{ version: "001_initial_schema.sql" }]);
  second.close();
});

test("a failing migration rolls back its changes and is not recorded", () => {
  const directory = makeTemporaryDirectory("rollback");
  const databasePath = join(directory, "amanah-cash.sqlite");
  const migrationsPath = join(directory, "migrations");
  mkdirSync(migrationsPath);

  writeFileSync(join(migrationsPath, "001_valid.sql"), "CREATE TABLE retained (id TEXT PRIMARY KEY) STRICT;\n");
  writeFileSync(
    join(migrationsPath, "002_failing.sql"),
    "CREATE TABLE rolled_back (id TEXT PRIMARY KEY) STRICT;\nINSERT INTO missing_table (id) VALUES ('failure');\n"
  );

  assert.throws(() => openDatabase({ databasePath, migrationsPath }), /no such table: missing_table/);

  const connection = new DatabaseSync(databasePath);
  try {
    assert.deepEqual(
      connection
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
        .all()
        .map(({ name }) => name),
      ["retained", "schema_migrations"]
    );
    assert.deepEqual(appliedMigrations(connection), [{ version: "001_valid.sql" }]);
  } finally {
    connection.close();
  }
});
