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

function insertStudent(id, name) {
  return database.connection.prepare("INSERT INTO students (id, name) VALUES (?, ?)").run(id, name);
}

function insertTransaction(id, studentId, type, amount) {
  return database.connection
    .prepare("INSERT INTO transactions (id, student_id, type, amount) VALUES (?, ?, ?, ?)")
    .run(id, studentId, type, amount);
}

test("schema contains only the approved strict tables and exact columns", () => {
  const tables = database.connection
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map(({ name }) => name);

  assert.deepEqual(tables, ["schema_migrations", "students", "transactions"]);

  assert.deepEqual(tableInfo("schema_migrations"), [
    { cid: 0, name: "version", type: "TEXT", notnull: 1, dflt_value: null, pk: 1 },
    {
      cid: 1,
      name: "applied_at",
      type: "TEXT",
      notnull: 1,
      dflt_value: "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')",
      pk: 0
    }
  ]);
  assert.deepEqual(tableInfo("students"), [
    { cid: 0, name: "id", type: "TEXT", notnull: 1, dflt_value: null, pk: 1 },
    { cid: 1, name: "name", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
    {
      cid: 2,
      name: "created_at",
      type: "TEXT",
      notnull: 1,
      dflt_value: "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')",
      pk: 0
    }
  ]);
  assert.deepEqual(tableInfo("transactions"), [
    { cid: 0, name: "id", type: "TEXT", notnull: 1, dflt_value: null, pk: 1 },
    { cid: 1, name: "student_id", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
    { cid: 2, name: "type", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
    { cid: 3, name: "amount", type: "INTEGER", notnull: 1, dflt_value: null, pk: 0 },
    {
      cid: 4,
      name: "created_at",
      type: "TEXT",
      notnull: 1,
      dflt_value: "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')",
      pk: 0
    }
  ]);

  const strictness = database.connection
    .prepare("PRAGMA table_list")
    .all()
    .filter(({ name }) => tables.includes(name))
    .map(({ name, strict }) => [name, strict])
    .sort(([left], [right]) => left.localeCompare(right));
  assert.deepEqual(strictness, [
    ["schema_migrations", 1],
    ["students", 1],
    ["transactions", 1]
  ]);
});

test("primary keys are required and reject duplicate identities", () => {
  insertStudent("student-1", "Alya");
  assert.throws(() => insertStudent("student-1", "Bima"), /UNIQUE constraint failed: students\.id/);
  assert.throws(() => insertStudent(null, "Citra"), /NOT NULL constraint failed: students\.id/);

  insertTransaction("transaction-1", "student-1", "deposit", 1000);
  assert.throws(
    () => insertTransaction("transaction-1", "student-1", "withdrawal", 500),
    /UNIQUE constraint failed: transactions\.id/
  );
  assert.throws(
    () => insertTransaction(null, "student-1", "deposit", 1000),
    /NOT NULL constraint failed: transactions\.id/
  );
});

test("foreign key requires an existing student and restricts referenced deletion", () => {
  assert.equal(database.connection.prepare("PRAGMA foreign_keys").get().foreign_keys, 1);
  assert.deepEqual(plainRows(database.connection.prepare("PRAGMA foreign_key_list(transactions)").all()), [
    {
      id: 0,
      seq: 0,
      table: "students",
      from: "student_id",
      to: "id",
      on_update: "NO ACTION",
      on_delete: "RESTRICT",
      match: "NONE"
    }
  ]);

  assert.throws(
    () => insertTransaction("orphan", "missing-student", "deposit", 1000),
    /FOREIGN KEY constraint failed/
  );

  insertStudent("student-1", "Alya");
  insertTransaction("transaction-1", "student-1", "deposit", 1000);
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
  insertTransaction("deposit", "student-1", "deposit", 1000);
  insertTransaction("withdrawal", "student-1", "withdrawal", 500);

  for (const [index, type] of ["Deposit", "transfer", "", null].entries()) {
    assert.throws(() => insertTransaction(`invalid-type-${index}`, "student-1", type, 1000));
  }

  assert.deepEqual(
    plainRows(database.connection.prepare("SELECT type FROM transactions ORDER BY id").all()),
    [{ type: "deposit" }, { type: "withdrawal" }]
  );
});

test("transaction amount accepts positive whole Rupiah and rejects invalid storage", () => {
  insertStudent("student-1", "Alya");
  insertTransaction("valid", "student-1", "deposit", 1);

  const invalidAmounts = [0, -1, null, 1.5, "not-a-number", 9223372036854775808n];
  for (const [index, amount] of invalidAmounts.entries()) {
    assert.throws(() => insertTransaction(`invalid-amount-${index}`, "student-1", "deposit", amount));
  }

  assert.deepEqual(plainRows(database.connection.prepare("SELECT id, amount FROM transactions").all()), [
    { id: "valid", amount: 1 }
  ]);
});

test("approved indexes have the required uniqueness, collation, columns, and direction", () => {
  const namedIndexes = database.connection
    .prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL ORDER BY name")
    .all()
    .map(({ name }) => name);
  assert.deepEqual(namedIndexes, ["ix_transactions_student_history", "uq_students_name_ci"]);

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
      { name: "created_at", desc: 1 },
      { name: "id", desc: 1 }
    ]
  );
});
