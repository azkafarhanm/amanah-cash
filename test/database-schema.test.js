import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { resolve } from "node:path";
import { openDatabase } from "../src/persistence/database.js";

const root = resolve(import.meta.dirname, "..");
let database;

beforeEach(() => {
  database = openDatabase({ databasePath: ":memory:", migrationsPath: resolve(root, "migrations") });
});

afterEach(() => {
  database.close();
});

function tableInfo(table) {
  return plainRows(database.connection.prepare(`PRAGMA table_info(${table})`).all());
}

function plainRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function insertUser(id, name, email, role, isActive = 1) {
  return database.connection
    .prepare("INSERT INTO users (id, name, email, role, is_active) VALUES (?, ?, ?, ?, ?)")
    .run(id, name, email, role, isActive);
}

function insertStudent(id, name, operatorId = "operator-1") {
  if (operatorId === "operator-1") {
    database.connection
      .prepare(
        "INSERT OR IGNORE INTO users (id, name, email, role, is_active) VALUES (?, ?, ?, 'OPERATOR', 1)"
      )
      .run(operatorId, "Default Operator", `${operatorId}@example.com`);
  }
  return database.connection
    .prepare("INSERT INTO students (id, name, operator_id) VALUES (?, ?, ?)")
    .run(id, name, operatorId);
}

function insertTransaction(id, studentId, type, amount, correctionDirection = null, reason = null) {
  const owner = database.connection.prepare("SELECT operator_id FROM students WHERE id = ?").get(studentId)?.operator_id ?? "operator-1";
  return database.connection
    .prepare(`INSERT INTO transactions
      (id, student_id, type, amount, correction_direction, reason, occurred_at, created_by, updated_at, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, '2026-07-20T08:00:00.000Z', ?, '2026-07-20T08:00:00.000Z', ?)`)
    .run(id, studentId, type, amount, correctionDirection, reason, owner, owner);
}

test("schema contains only the approved strict persistence tables and columns", () => {
  const tables = database.connection
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map(({ name }) => name);

  assert.deepEqual(tables, ["accounts", "financial_audit_events", "operator_audit", "schema_migrations", "sessions", "students", "transactions", "users"]);

  const columns = Object.fromEntries(
    tables.map((table) => [table, tableInfo(table).map(({ name, type, notnull, pk }) => ({ name, type, notnull, pk }))])
  );
  assert.deepEqual(columns.users, [
    { name: "id", type: "TEXT", notnull: 1, pk: 1 },
    { name: "name", type: "TEXT", notnull: 1, pk: 0 },
    { name: "email", type: "TEXT", notnull: 1, pk: 0 },
    { name: "email_verified", type: "TEXT", notnull: 0, pk: 0 },
    { name: "image", type: "TEXT", notnull: 0, pk: 0 },
    { name: "role", type: "TEXT", notnull: 1, pk: 0 },
    { name: "is_active", type: "INTEGER", notnull: 1, pk: 0 },
    { name: "created_at", type: "TEXT", notnull: 1, pk: 0 },
    { name: "last_login_at", type: "TEXT", notnull: 0, pk: 0 },
    { name: "deleted_at", type: "TEXT", notnull: 0, pk: 0 }
  ]);
  assert.deepEqual(columns.accounts.map(({ name }) => name), [
    "user_id", "type", "provider", "provider_account_id", "refresh_token", "access_token",
    "expires_at", "token_type", "scope", "id_token", "session_state"
  ]);
  assert.deepEqual(columns.sessions, [
    { name: "session_token", type: "TEXT", notnull: 1, pk: 1 },
    { name: "user_id", type: "TEXT", notnull: 1, pk: 0 },
    { name: "expires", type: "TEXT", notnull: 1, pk: 0 }
  ]);
  assert.deepEqual(columns.students.map(({ name }) => name), ["id", "name", "created_at", "operator_id", "notes", "status", "updated_at", "balance", "financial_version"]);
  assert.deepEqual(columns.transactions.map(({ name }) => name), ["id", "student_id", "type", "amount", "correction_direction", "reason", "occurred_at", "created_at", "created_by", "updated_at", "updated_by", "revision", "deleted_at", "deleted_by"]);
  assert.deepEqual(columns.financial_audit_events.map(({ name }) => name), ["id", "command_id", "command_payload_hash", "event_type", "actor_id", "actor_role", "student_id", "transaction_id", "transaction_revision", "reason", "before_snapshot", "after_snapshot", "balance_before", "balance_after", "balance_delta", "old_operator_id", "new_operator_id", "occurred_at", "schema_version", "correlation_id"]);
  assert.deepEqual(columns.operator_audit.map(({ name }) => name), ["id", "operator_id", "actor_id", "action", "summary", "created_at"]);

  const strictness = database.connection
    .prepare("PRAGMA table_list")
    .all()
    .filter(({ name }) => tables.includes(name))
    .map(({ name, strict }) => [name, strict])
    .sort(([left], [right]) => left.localeCompare(right));
  assert.deepEqual(strictness, [
    ["accounts", 1],
    ["financial_audit_events", 1],
    ["operator_audit", 1],
    ["schema_migrations", 1],
    ["sessions", 1],
    ["students", 1],
    ["transactions", 1],
    ["users", 1]
  ]);
});

test("users enforce normalized unique email, approved roles, and active status", () => {
  insertUser("admin", "Platform Admin", "admin@example.com", "PLATFORM_ADMIN");
  insertUser("operator", "Operator", "operator@example.com", "OPERATOR");

  assert.throws(
    () => insertUser("duplicate", "Duplicate", "admin@example.com", "OPERATOR"),
    /UNIQUE constraint failed: users\.email/
  );
  for (const [id, email] of [["upper", "UPPER@example.com"], ["space", " space@example.com"]]) {
    assert.throws(() => insertUser(id, "Invalid", email, "OPERATOR"), /CHECK constraint failed/);
  }
  assert.throws(() => insertUser("invalid-role", "Invalid", "invalid@example.com", "ADMIN"), /CHECK constraint failed/);
  assert.throws(() => insertUser("invalid-active", "Invalid", "active@example.com", "OPERATOR", 2), /CHECK constraint failed/);
});

test("accounts and sessions cascade with users and enforce Auth.js identities", () => {
  insertUser("operator", "Operator", "operator@example.com", "OPERATOR");
  database.connection
    .prepare("INSERT INTO accounts (user_id, type, provider, provider_account_id) VALUES (?, 'oidc', 'google', ?)")
    .run("operator", "google-subject");
  database.connection
    .prepare("INSERT INTO sessions (session_token, user_id, expires) VALUES (?, ?, ?)")
    .run("session-token", "operator", "2026-07-20T08:00:00.000Z");

  assert.throws(
    () => database.connection.prepare("INSERT INTO accounts (user_id, type, provider, provider_account_id) VALUES ('missing', 'oidc', 'google', 'missing')").run(),
    /FOREIGN KEY constraint failed/
  );
  database.connection.prepare("DELETE FROM users WHERE id = 'operator'").run();
  assert.equal(database.connection.prepare("SELECT COUNT(*) AS count FROM accounts").get().count, 0);
  assert.equal(database.connection.prepare("SELECT COUNT(*) AS count FROM sessions").get().count, 0);
});

test("every Student owner is exactly one active Operator", () => {
  insertUser("operator", "Operator", "operator@example.com", "OPERATOR");
  insertUser("admin", "Admin", "admin@example.com", "PLATFORM_ADMIN");
  insertUser("inactive", "Inactive", "inactive@example.com", "OPERATOR", 0);

  insertStudent("student-1", "Alya", "operator");
  assert.throws(() => insertStudent("student-2", "Bima", "admin"), /active operator/);
  assert.throws(() => insertStudent("student-3", "Citra", "inactive"), /active operator/);
  assert.throws(() => insertStudent("student-4", "Dina", "missing"), /active operator/);
  assert.throws(
    () => database.connection.prepare("UPDATE users SET is_active = 0 WHERE id = 'operator'").run(),
    /transfer owned students/
  );
  assert.throws(() => database.connection.prepare("DELETE FROM users WHERE id = 'operator'").run(), /FOREIGN KEY/);
});

test("primary keys are required and reject duplicate identities", () => {
  insertStudent("student-1", "Alya");
  assert.throws(() => insertStudent("student-1", "Bima"), /UNIQUE constraint failed: students\.id/);
  assert.throws(() => insertStudent(null, "Citra"), /NOT NULL constraint failed: students\.id/);

  insertTransaction("transaction-1", "student-1", "DEPOSIT", 1000);
  assert.throws(
    () => insertTransaction("transaction-1", "student-1", "WITHDRAWAL", 500),
    /UNIQUE constraint failed: transactions\.id/
  );
  assert.throws(
    () => insertTransaction(null, "student-1", "DEPOSIT", 1000),
    /NOT NULL constraint failed: transactions\.id/
  );
});

test("foreign key requires an existing student and restricts referenced deletion", () => {
  assert.equal(database.connection.prepare("PRAGMA foreign_keys").get().foreign_keys, 1);
  const transactionForeignKeys = plainRows(database.connection.prepare("PRAGMA foreign_key_list(transactions)").all());
  assert.ok(transactionForeignKeys.some(({ table, from, to, on_delete }) => table === "students" && from === "student_id" && to === "id" && on_delete === "RESTRICT"));

  assert.throws(
    () => insertTransaction("orphan", "missing-student", "DEPOSIT", 1000),
    /FOREIGN KEY constraint failed/
  );

  insertStudent("student-1", "Alya");
  insertTransaction("transaction-1", "student-1", "DEPOSIT", 1000);
  assert.throws(
    () => database.connection.prepare("DELETE FROM students WHERE id = ?").run("student-1"),
    /FOREIGN KEY constraint failed/
  );
  assert.equal(database.connection.prepare("SELECT COUNT(*) AS count FROM students").get().count, 1);
});

test("student name checks accept approved boundaries and reject non-normalized values", () => {
  insertStudent("one-character", "A");
  insertStudent("one-hundred-characters", "B".repeat(100));

  const invalidNames = ["", "C".repeat(101), " Leading", "Trailing ", "Tab\tName", "Double  Space"];
  for (const [index, name] of invalidNames.entries()) {
    assert.throws(() => insertStudent(`invalid-${index}`, name), /CHECK constraint failed/);
  }

  assert.equal(database.connection.prepare("SELECT COUNT(*) AS count FROM students").get().count, 2);
});

test("student names are unique case-insensitively", () => {
  insertStudent("student-1", "Alya");
  assert.throws(() => insertStudent("student-2", "ALYA"), /UNIQUE constraint failed: students\.name/);
  assert.equal(database.connection.prepare("SELECT COUNT(*) AS count FROM students").get().count, 1);
});

test("transaction type accepts only approved terminology", () => {
  insertStudent("student-1", "Alya");
  insertTransaction("deposit", "student-1", "DEPOSIT", 1000);
  insertTransaction("withdrawal", "student-1", "WITHDRAWAL", 500);
  insertTransaction("correction", "student-1", "CORRECTION", 25, "INCREASE", "Rekonsiliasi");

  for (const [index, type] of ["deposit", "transfer", "", null].entries()) {
    assert.throws(() => insertTransaction(`invalid-type-${index}`, "student-1", type, 1000));
  }

  assert.deepEqual(
    plainRows(database.connection.prepare("SELECT type FROM transactions ORDER BY id").all()),
    [{ type: "CORRECTION" }, { type: "DEPOSIT" }, { type: "WITHDRAWAL" }]
  );
});

test("transaction amount accepts positive whole Rupiah and rejects invalid storage", () => {
  insertStudent("student-1", "Alya");
  insertTransaction("valid", "student-1", "DEPOSIT", 1);

  const invalidAmounts = [0, -1, null, 1.5, "not-a-number", 9223372036854775808n];
  for (const [index, amount] of invalidAmounts.entries()) {
    assert.throws(() => insertTransaction(`invalid-amount-${index}`, "student-1", "DEPOSIT", amount));
  }

  assert.deepEqual(plainRows(database.connection.prepare("SELECT id, amount FROM transactions").all()), [
    { id: "valid", amount: 1 }
  ]);
});

test("financial constraints enforce Balance, Correction shape, soft deletion, and immutable audit", () => {
  insertStudent("student-1", "Alya");
  assert.throws(() => database.connection.prepare("UPDATE students SET balance = -1 WHERE id = 'student-1'").run(), /CHECK constraint failed/);
  assert.throws(() => insertTransaction("bad-deposit", "student-1", "DEPOSIT", 100, "INCREASE", null), /CHECK constraint failed/);
  assert.throws(() => insertTransaction("bad-correction", "student-1", "CORRECTION", 100, "INCREASE", null), /CHECK constraint failed/);

  insertTransaction("transaction-1", "student-1", "DEPOSIT", 100);
  assert.throws(() => database.connection.prepare("DELETE FROM transactions WHERE id = 'transaction-1'").run(), /cannot be hard deleted/);
  database.connection.prepare(`INSERT INTO financial_audit_events
    (id, command_id, command_payload_hash, event_type, actor_id, actor_role, student_id, transaction_id,
     transaction_revision, after_snapshot, balance_before, balance_after, balance_delta, correlation_id)
    VALUES ('audit-1', 'command-1', ?, 'CREATE', 'operator-1', 'OPERATOR', 'student-1', 'transaction-1',
      1, '{}', 0, 100, 100, 'correlation-1')`).run("a".repeat(64));
  assert.throws(() => database.connection.prepare("UPDATE financial_audit_events SET correlation_id = 'changed' WHERE id = 'audit-1'").run(), /immutable/);
  assert.throws(() => database.connection.prepare("DELETE FROM financial_audit_events WHERE id = 'audit-1'").run(), /cannot be deleted/);
});

test("approved indexes have the required uniqueness, collation, columns, and direction", () => {
  const namedIndexes = database.connection
    .prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL ORDER BY name")
    .all()
    .map(({ name }) => name);
  assert.deepEqual(namedIndexes, [
    "ix_accounts_user",
    "ix_financial_audit_student",
    "ix_financial_audit_transaction_revision",
    "ix_operator_audit_operator",
    "ix_sessions_expires",
    "ix_sessions_user",
    "ix_students_management_list",
    "ix_students_operator",
    "ix_transactions_student_active_history",
    "ix_transactions_student_history",
    "ix_transactions_student_type_date",
    "ix_users_operator_list",
    "uq_financial_audit_command",
    "uq_students_name_ci",
    "uq_users_email"
  ]);

  const studentIndexes = database.connection.prepare("PRAGMA index_list(students)").all();
  assert.equal(studentIndexes.find(({ name }) => name === "uq_students_name_ci")?.unique, 1);
  assert.deepEqual(
    database.connection
      .prepare("PRAGMA index_xinfo(uq_students_name_ci)")
      .all()
      .filter(({ key }) => key)
      .map(({ name, desc, coll }) => ({ name, desc, coll })),
    [{ name: "name", desc: 0, coll: "NOCASE" }]
  );

  const transactionIndexes = database.connection.prepare("PRAGMA index_list(transactions)").all();
  assert.equal(transactionIndexes.find(({ name }) => name === "ix_transactions_student_history")?.unique, 0);
  assert.deepEqual(
    database.connection
      .prepare("PRAGMA index_xinfo(ix_transactions_student_history)")
      .all()
      .filter(({ key }) => key)
      .map(({ name, desc }) => ({ name, desc })),
    [
      { name: "student_id", desc: 0 },
      { name: "occurred_at", desc: 1 },
      { name: "id", desc: 1 }
    ]
  );
});
