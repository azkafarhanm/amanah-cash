import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  assert.deepEqual(appliedMigrations(first.connection), [
    { version: "001_initial_schema.sql" },
    { version: "002_auth_identity_and_ownership.sql" },
    { version: "003_operator_management.sql" },
    { version: "004_student_management.sql" },
    { version: "005_transaction_engine.sql" },
    { version: "006_transaction_ui_notes.sql" }
  ]);
  first.close();

  const second = openDatabase({ databasePath, migrationsPath });
  assert.deepEqual(schemaSnapshot(second.connection), firstSnapshot);
  assert.deepEqual(appliedMigrations(second.connection), [
    { version: "001_initial_schema.sql" },
    { version: "002_auth_identity_and_ownership.sql" },
    { version: "003_operator_management.sql" },
    { version: "004_student_management.sql" },
    { version: "005_transaction_engine.sql" },
    { version: "006_transaction_ui_notes.sql" }
  ]);
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

test("identity migration refuses to invent ownership for existing Students", () => {
  const directory = makeTemporaryDirectory("ownership-precondition");
  const databasePath = join(directory, "amanah-cash.sqlite");
  const initialMigrationsPath = join(directory, "initial-migrations");
  mkdirSync(initialMigrationsPath);
  writeFileSync(
    join(initialMigrationsPath, "001_initial_schema.sql"),
    readFileSync(resolve(root, "migrations/001_initial_schema.sql"), "utf8")
  );

  const initial = openDatabase({ databasePath, migrationsPath: initialMigrationsPath });
  initial.connection.prepare("INSERT INTO students (id, name) VALUES ('student-1', 'Alya')").run();
  initial.close();

  assert.throws(
    () => openDatabase({ databasePath, migrationsPath: resolve(root, "migrations") }),
    /NOT NULL constraint failed: new_students\.operator_id/
  );

  const connection = new DatabaseSync(databasePath);
  try {
    assert.deepEqual(appliedMigrations(connection), [{ version: "001_initial_schema.sql" }]);
    assert.deepEqual(
      connection.prepare("SELECT id, name FROM students").all().map((row) => ({ ...row })),
      [{ id: "student-1", name: "Alya" }]
    );
    assert.equal(
      connection.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name = 'users'").get()
        .count,
      0
    );
  } finally {
    connection.close();
  }
});

test("Prisma migration mirror matches the executable migration", () => {
  assert.equal(
    readFileSync(resolve(root, "prisma/migrations/20260720000000_auth_identity_and_ownership/migration.sql"), "utf8"),
    readFileSync(resolve(root, "migrations/002_auth_identity_and_ownership.sql"), "utf8")
  );
});

test("Operator Management migration mirror matches the executable migration", () => {
  assert.equal(
    readFileSync(resolve(root, "prisma/migrations/20260720010000_operator_management/migration.sql"), "utf8"),
    readFileSync(resolve(root, "migrations/003_operator_management.sql"), "utf8")
  );
});

test("Student Management migration mirror matches the executable migration", () => {
  assert.equal(
    readFileSync(resolve(root, "prisma/migrations/20260720020000_student_management/migration.sql"), "utf8"),
    readFileSync(resolve(root, "migrations/004_student_management.sql"), "utf8")
  );
});

test("Transaction Engine migration mirror matches the executable migration", () => {
  assert.equal(
    readFileSync(resolve(root, "prisma/migrations/20260720030000_transaction_engine/migration.sql"), "utf8"),
    readFileSync(resolve(root, "migrations/005_transaction_engine.sql"), "utf8")
  );
});

test("Transaction UI notes migration mirror matches the executable migration", () => {
  assert.equal(
    readFileSync(resolve(root, "prisma/migrations/20260721000000_transaction_ui_notes/migration.sql"), "utf8"),
    readFileSync(resolve(root, "migrations/006_transaction_ui_notes.sql"), "utf8")
  );
});

test("Transaction Engine migration refuses to invent provenance for legacy financial rows", () => {
  const directory = makeTemporaryDirectory("transaction-provenance");
  const databasePath = join(directory, "amanah-cash.sqlite");
  const stagedMigrations = join(directory, "staged-migrations");
  mkdirSync(stagedMigrations);
  for (const filename of ["001_initial_schema.sql", "002_auth_identity_and_ownership.sql", "003_operator_management.sql", "004_student_management.sql"]) {
    writeFileSync(join(stagedMigrations, filename), readFileSync(resolve(root, "migrations", filename), "utf8"));
  }
  const staged = openDatabase({ databasePath, migrationsPath: stagedMigrations });
  staged.connection.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator', 'Operator', 'operator@example.com', 'OPERATOR', 1)").run();
  staged.connection.prepare("INSERT INTO students (id, name, operator_id) VALUES ('student-1', 'Alya', 'operator')").run();
  staged.connection.prepare("INSERT INTO transactions (id, student_id, type, amount) VALUES ('legacy', 'student-1', 'deposit', 1000)").run();
  staged.close();

  assert.throws(() => openDatabase({ databasePath, migrationsPath: resolve(root, "migrations") }), /CHECK constraint failed/);
  const connection = new DatabaseSync(databasePath);
  try {
    assert.deepEqual(appliedMigrations(connection).at(-1), { version: "004_student_management.sql" });
    assert.deepEqual(connection.prepare("SELECT id, type, amount FROM transactions").all().map((row) => ({ ...row })), [{ id: "legacy", type: "deposit", amount: 1000 }]);
  } finally {
    connection.close();
  }
});

test("identity migration rollback preserves financial rows", () => {
  const directory = makeTemporaryDirectory("identity-rollback");
  const databasePath = join(directory, "amanah-cash.sqlite");
  const identityMigrations = join(directory, "identity-migrations");
  mkdirSync(identityMigrations);
  writeFileSync(join(identityMigrations, "001_initial_schema.sql"), readFileSync(resolve(root, "migrations/001_initial_schema.sql"), "utf8"));
  writeFileSync(join(identityMigrations, "002_auth_identity_and_ownership.sql"), readFileSync(resolve(root, "migrations/002_auth_identity_and_ownership.sql"), "utf8"));
  const migrated = openDatabase({ databasePath, migrationsPath: identityMigrations });
  migrated.connection
    .prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator', 'Operator', 'operator@example.com', 'OPERATOR', 1)")
    .run();
  migrated.connection
    .prepare("INSERT INTO students (id, name, operator_id) VALUES ('student-1', 'Alya', 'operator')")
    .run();
  migrated.connection
    .prepare("INSERT INTO transactions (id, student_id, type, amount) VALUES ('transaction-1', 'student-1', 'deposit', 1000)")
    .run();

  migrated.connection.exec(
    readFileSync(resolve(root, "prisma/migrations/20260720000000_auth_identity_and_ownership/rollback.sql"), "utf8")
  );

  assert.deepEqual(appliedMigrations(migrated.connection), [{ version: "001_initial_schema.sql" }]);
  assert.deepEqual(
    migrated.connection.prepare("SELECT id, name FROM students").all().map((row) => ({ ...row })),
    [{ id: "student-1", name: "Alya" }]
  );
  assert.deepEqual(
    migrated.connection.prepare("SELECT id, student_id, type, amount FROM transactions").all().map((row) => ({ ...row })),
    [{ id: "transaction-1", student_id: "student-1", type: "deposit", amount: 1000 }]
  );
  assert.equal(
    migrated.connection.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name = 'users'").get()
      .count,
    0
  );
  migrated.close();
});
