import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, test } from "node:test";
import Database from "better-sqlite3";
import { openDatabase } from "../src/persistence/database.js";
import { TransactionEngineError } from "../src/transactions/domain";
import { createTransactionEngine } from "../src/transactions/service";

const root = resolve(import.meta.dirname, "..");
const directories: string[] = [];

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function fixture(studentStatus = "ACTIVE") {
  const directory = join(tmpdir(), `amanah-cash-transactions-${crypto.randomUUID()}`);
  mkdirSync(directory, { recursive: true });
  directories.push(directory);
  const path = join(directory, "database.sqlite");
  openDatabase({ databasePath: path, migrationsPath: resolve(root, "migrations") }).close();
  const database = new Database(path);
  database.pragma("foreign_keys = ON");
  database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-1', 'Operator One', 'one@example.com', 'OPERATOR', 1)").run();
  database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-2', 'Operator Two', 'two@example.com', 'OPERATOR', 1)").run();
  database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('admin-1', 'Admin', 'admin@example.com', 'PLATFORM_ADMIN', 1)").run();
  database.prepare("INSERT INTO students (id, name, operator_id, status) VALUES ('student-1', 'Alya', 'operator-1', ?)").run(studentStatus);
  const engine = createTransactionEngine(database, () => new Date("2026-07-20T12:00:00.000Z"));
  const create = (overrides: Record<string, unknown> = {}) => engine.create({
    actorId: "operator-1", studentId: "student-1", transactionId: crypto.randomUUID(), commandId: crypto.randomUUID(),
    correlationId: crypto.randomUUID(), type: "DEPOSIT", amount: "1000", occurredAt: "2026-07-20T10:00:00.000Z", ...overrides
  });
  return { database, engine, create };
}

function count(database: Database.Database, table: string) {
  return Number((database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number }).count);
}

function studentState(database: Database.Database) {
  const row = database.prepare("SELECT balance, financial_version FROM students WHERE id = 'student-1'").get() as { balance: bigint | number; financial_version: bigint | number };
  return { balance: Number(row.balance), financial_version: Number(row.financial_version) };
}

test("Deposit, Withdrawal, and directional Correction atomically update Balance and audit", () => {
  const { database, create } = fixture();
  const deposit = create({ notes: "Titipan pekan ini" });
  assert.equal(deposit.balance, "1000");
  assert.equal(deposit.transaction.notes, "Titipan pekan ini");
  assert.equal(create({ type: "WITHDRAWAL", amount: "250" }).balance, "750");
  assert.equal(create({ type: "CORRECTION", amount: "40", correctionDirection: "INCREASE", reason: "Selisih kas" }).balance, "790");
  assert.equal(create({ type: "CORRECTION", amount: "10", correctionDirection: "DECREASE", reason: "Koreksi catatan" }).balance, "780");
  assert.deepEqual(studentState(database), { balance: 780, financial_version: 4 });
  assert.equal(count(database, "transactions"), 4);
  assert.equal(count(database, "financial_audit_events"), 4);
  assert.deepEqual(database.prepare("SELECT DISTINCT event_type FROM financial_audit_events").all(), [{ event_type: "CREATE" }]);
  database.close();
});

test("Withdrawal and decreasing Correction prevent negative Balance without writes", () => {
  const { database, create } = fixture();
  for (const values of [
    { type: "WITHDRAWAL", amount: "1" },
    { type: "CORRECTION", amount: "1", correctionDirection: "DECREASE", reason: "Selisih" }
  ]) {
    assert.throws(() => create(values), (error: unknown) => error instanceof TransactionEngineError && error.code === "INSUFFICIENT_BALANCE");
  }
  assert.deepEqual(studentState(database), { balance: 0, financial_version: 0 });
  assert.equal(count(database, "transactions"), 0);
  assert.equal(count(database, "financial_audit_events"), 0);
  database.close();
});

test("Edit applies only the effect difference and records deterministic before/after evidence", () => {
  const { database, engine, create } = fixture();
  const deposit = create();
  const edited = engine.edit({
    actorId: "operator-1", studentId: "student-1", transactionId: deposit.transaction.id,
    commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(), expectedRevision: 1,
    type: "DEPOSIT", amount: "700", occurredAt: "2026-07-20T11:00:00.000Z", editReason: "Jumlah awal salah"
  });
  assert.equal(edited.balanceDelta, "-300");
  assert.equal(edited.balance, "700");
  const audit = database.prepare("SELECT event_type, before_snapshot, after_snapshot FROM financial_audit_events ORDER BY rowid DESC LIMIT 1").get() as { event_type: string; before_snapshot: string; after_snapshot: string };
  assert.equal(audit.event_type, "EDIT");
  assert.equal((JSON.parse(audit.before_snapshot) as { amount: string }).amount, "1000");
  assert.equal((JSON.parse(audit.after_snapshot) as { amount: string }).amount, "700");
  database.close();
});

test("Edit rolls back when its effect would make Balance negative", () => {
  const { database, engine, create } = fixture();
  const deposit = create();
  assert.throws(() => engine.edit({
    actorId: "operator-1", studentId: "student-1", transactionId: deposit.transaction.id,
    commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(), expectedRevision: 1,
    type: "WITHDRAWAL", amount: "200", occurredAt: "2026-07-20T11:00:00.000Z", editReason: "Jenis awal salah"
  }), (error: unknown) => error instanceof TransactionEngineError && error.code === "INSUFFICIENT_BALANCE");
  assert.deepEqual(studentState(database), { balance: 1000, financial_version: 1 });
  assert.equal(Number((database.prepare("SELECT revision FROM transactions WHERE id = ?").get(deposit.transaction.id) as { revision: bigint }).revision), 1);
  assert.equal(count(database, "financial_audit_events"), 1);
  database.close();
});

test("Soft delete removes an effect and restore reapplies it with revision guards", () => {
  const { database, engine, create } = fixture();
  const withdrawalFunding = create({ amount: "2000" });
  const withdrawal = create({ type: "WITHDRAWAL", amount: "500" });
  const deleted = engine.remove({ actorId: "operator-1", studentId: "student-1", transactionId: withdrawal.transaction.id, commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(), expectedRevision: 1, reason: "Duplikat" });
  assert.equal(deleted.balance, "2000");
  assert.ok(deleted.transaction.deletedAt);
  const restored = engine.restore({ actorId: "operator-1", studentId: "student-1", transactionId: withdrawal.transaction.id, commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(), expectedRevision: 2, reason: "Ternyata sah" });
  assert.equal(restored.balance, "1500");
  assert.equal(restored.transaction.deletedAt, null);
  assert.equal(restored.transaction.revision, 3);
  assert.deepEqual(database.prepare("SELECT event_type FROM financial_audit_events ORDER BY rowid").all(), [
    { event_type: "CREATE" }, { event_type: "CREATE" }, { event_type: "DELETE" }, { event_type: "RESTORE" }
  ]);
  assert.equal(withdrawalFunding.balance, "2000");
  database.close();
});

test("long lifecycle chain reconciles Balance, history, audit, and every revision without double counting", () => {
  const { database, engine, create } = fixture();
  const first = create({ amount: "2000" });
  const second = create({ amount: "500" });
  const withdrawal = create({ type: "WITHDRAWAL", amount: "600" });
  const correction = create({ type: "CORRECTION", amount: "100", correctionDirection: "DECREASE", reason: "Selisih kas" });
  assert.equal(correction.balance, "1800");

  const edited = engine.edit({
    actorId: "operator-1", studentId: "student-1", transactionId: second.transaction.id,
    commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(), expectedRevision: 1,
    type: "DEPOSIT", amount: "800", occurredAt: "2026-07-20T11:00:00.000Z", editReason: "Nominal dikonfirmasi"
  });
  assert.equal(edited.balance, "2100");
  assert.equal(edited.transaction.revision, 2);
  const deleted = engine.remove({ actorId: "operator-1", studentId: "student-1", transactionId: withdrawal.transaction.id, commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(), expectedRevision: 1, reason: "Verifikasi sementara" });
  assert.equal(deleted.balance, "2700");
  assert.equal(deleted.transaction.revision, 2);
  const restored = engine.restore({ actorId: "operator-1", studentId: "student-1", transactionId: withdrawal.transaction.id, commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(), expectedRevision: 2, reason: "Bukti transaksi sah" });
  assert.equal(restored.balance, "2100");
  assert.equal(restored.transaction.revision, 3);

  const reconciled = database.prepare(`SELECT COALESCE(SUM(CASE
    WHEN deleted_at IS NOT NULL THEN 0
    WHEN type = 'DEPOSIT' THEN amount
    WHEN type = 'WITHDRAWAL' THEN -amount
    WHEN correction_direction = 'INCREASE' THEN amount
    ELSE -amount END), 0) AS balance FROM transactions WHERE student_id = 'student-1'`).get() as { balance: bigint };
  assert.equal(reconciled.balance, BigInt(2100));
  assert.deepEqual(studentState(database), { balance: 2100, financial_version: 7 });
  assert.equal(count(database, "transactions"), 4);
  assert.equal(count(database, "financial_audit_events"), 7);
  assert.deepEqual(database.prepare("SELECT event_type, transaction_revision FROM financial_audit_events ORDER BY rowid").all(), [
    { event_type: "CREATE", transaction_revision: BigInt(1) },
    { event_type: "CREATE", transaction_revision: BigInt(1) },
    { event_type: "CREATE", transaction_revision: BigInt(1) },
    { event_type: "CREATE", transaction_revision: BigInt(1) },
    { event_type: "EDIT", transaction_revision: BigInt(2) },
    { event_type: "DELETE", transaction_revision: BigInt(2) },
    { event_type: "RESTORE", transaction_revision: BigInt(3) }
  ]);
  assert.equal(first.balance, "2000");
  database.close();
});

test("Deleting a positive effect cannot make Balance negative", () => {
  const { database, engine, create } = fixture();
  const deposit = create({ amount: "1000" });
  create({ type: "WITHDRAWAL", amount: "800" });
  assert.throws(() => engine.remove({ actorId: "operator-1", studentId: "student-1", transactionId: deposit.transaction.id, commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(), expectedRevision: 1, reason: "Salah" }), (error: unknown) => error instanceof TransactionEngineError && error.code === "INSUFFICIENT_BALANCE");
  assert.deepEqual(studentState(database), { balance: 200, financial_version: 2 });
  database.close();
});

test("Audit insertion failure rolls back Transaction, Balance, and version", () => {
  const { database, create } = fixture();
  database.exec("CREATE TRIGGER fail_audit BEFORE INSERT ON financial_audit_events BEGIN SELECT RAISE(ABORT, 'forced audit failure'); END");
  assert.throws(() => create(), /forced audit failure/);
  assert.deepEqual(studentState(database), { balance: 0, financial_version: 0 });
  assert.equal(count(database, "transactions"), 0);
  assert.equal(count(database, "financial_audit_events"), 0);
  database.close();
});

test("same command is idempotent while a different payload is rejected", () => {
  const { database, create } = fixture();
  const transactionId = crypto.randomUUID();
  const commandId = crypto.randomUUID();
  const first = create({ transactionId, commandId });
  const replay = create({ transactionId, commandId });
  assert.equal(first.replayed, false);
  assert.equal(replay.replayed, true);
  assert.equal(replay.balance, "1000");
  assert.throws(() => create({ transactionId, commandId, amount: "2000" }), (error: unknown) => error instanceof TransactionEngineError && error.code === "IDEMPOTENCY_CONFLICT");
  assert.deepEqual(studentState(database), { balance: 1000, financial_version: 1 });
  assert.equal(count(database, "transactions"), 1);
  assert.equal(count(database, "financial_audit_events"), 1);
  database.close();
});

test("authorization is rechecked inside the financial transaction", () => {
  for (const [overrides, code] of [
    [{ actorId: "operator-2" }, "NOT_FOUND"],
    [{ actorId: "admin-1" }, "FORBIDDEN"],
    [{ actorId: "missing" }, "UNAUTHORIZED"]
  ] as const) {
    const { database, create } = fixture();
    assert.throws(() => create(overrides), (error: unknown) => error instanceof TransactionEngineError && error.code === code);
    assert.deepEqual(studentState(database), { balance: 0, financial_version: 0 });
    database.close();
  }
  const inactive = fixture("INACTIVE");
  assert.throws(() => inactive.create(), (error: unknown) => error instanceof TransactionEngineError && error.code === "READ_ONLY_STUDENT");
  inactive.database.close();
  const archived = fixture("ARCHIVED");
  assert.throws(() => archived.create(), (error: unknown) => error instanceof TransactionEngineError && error.code === "READ_ONLY_STUDENT");
  archived.database.close();
});

test("stale lifecycle revision fails without partial writes", () => {
  const { database, engine, create } = fixture();
  const deposit = create();
  assert.throws(() => engine.remove({ actorId: "operator-1", studentId: "student-1", transactionId: deposit.transaction.id, commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(), expectedRevision: 2, reason: "Salah" }), (error: unknown) => error instanceof TransactionEngineError && error.code === "CONFLICT");
  assert.deepEqual(studentState(database), { balance: 1000, financial_version: 1 });
  assert.equal(count(database, "financial_audit_events"), 1);
  database.close();
});

test("concurrent SQLite writer returns retryable unavailable without replaying a delta", () => {
  const { database } = fixture();
  const competingDatabase = new Database(database.name);
  const competingEngine = createTransactionEngine(competingDatabase);
  competingDatabase.pragma("busy_timeout = 0");
  database.exec("BEGIN IMMEDIATE");
  try {
    assert.throws(() => competingEngine.create({
      actorId: "operator-1", studentId: "student-1", transactionId: crypto.randomUUID(), commandId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(), type: "DEPOSIT", amount: "1000", occurredAt: "2026-07-20T10:00:00.000Z"
    }), (error: unknown) => error instanceof TransactionEngineError && error.code === "UNAVAILABLE" && error.retryable);
  } finally {
    database.exec("ROLLBACK");
  }
  assert.deepEqual(studentState(database), { balance: 0, financial_version: 0 });
  assert.equal(count(database, "transactions"), 0);
  competingDatabase.close();
  database.close();
});
