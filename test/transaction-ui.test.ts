import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";
import Database from "better-sqlite3";
import { openDatabase } from "../src/persistence/database.js";
import { rupiah, transactionSign } from "../src/components/transactions/presentation";
import { transactionReadService } from "../src/transactions/read-service";
import { createTransactionEngine } from "../src/transactions/service";

const root = resolve(import.meta.dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");
const temporary = join(tmpdir(), `amanah-cash-transaction-ui-${crypto.randomUUID()}`);

after(() => rmSync(temporary, { recursive: true, force: true }));

test("Transaction UI uses accessible dialogs, mobile money input, filters, lifecycle controls, and live outcomes", () => {
  const dialog = source("src/components/transactions/transaction-dialog.tsx");
  const experience = source("src/components/transactions/transaction-experience.tsx");
  const styles = source("src/components/transactions/transactions.module.css");
  assert.match(dialog, /<dialog/);
  assert.match(dialog, /aria-labelledby=/);
  assert.match(dialog, /aria-haspopup="dialog"/);
  assert.match(dialog, /inputMode="numeric"/);
  assert.match(dialog, /role="alert"/);
  assert.match(dialog, /errorSummary\.current\?\.focus\(\)/);
  assert.match(dialog, /kind === "DELETE"/);
  assert.match(dialog, /kind === "RESTORE"/);
  assert.match(dialog, /selectedType === "DEPOSIT"/);
  assert.match(experience, /aria-live="polite"/);
  assert.match(experience, /Alasan koreksi/);
  assert.match(experience, /name="dateFrom"/);
  assert.match(experience, /name="dateTo"/);
  assert.match(experience, /name="status"/);
  assert.match(experience, /name="search"/);
  assert.match(styles, /@media \(max-width: 48rem\)/);
  assert.match(styles, /:focus-visible/);
});

test("financial presentation formats exact whole Rupiah and explicit direction", () => {
  assert.equal(rupiah("75000"), "Rp 75.000");
  assert.equal(transactionSign({ type: "DEPOSIT", correctionDirection: null }), "+");
  assert.equal(transactionSign({ type: "CORRECTION", correctionDirection: "DECREASE" }), "−");
});

test("ownership-scoped read model returns overview, newest-first filtered history, and pagination", async () => {
  mkdirSync(temporary, { recursive: true });
  const databasePath = join(temporary, "database.sqlite");
  openDatabase({ databasePath, migrationsPath: resolve(root, "migrations") }).close();
  const database = new Database(databasePath);
  database.pragma("foreign_keys = ON");
  database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-1', 'Operator Satu', 'one@example.com', 'OPERATOR', 1)").run();
  database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-2', 'Operator Dua', 'two@example.com', 'OPERATOR', 1)").run();
  database.prepare("INSERT INTO students (id, name, operator_id) VALUES ('student-1', 'Alya', 'operator-1')").run();
  const engine = createTransactionEngine(database, () => new Date("2026-07-21T12:00:00.000Z"));
  const records = [];
  for (let index = 0; index < 12; index += 1) {
    const type = index === 10 ? "CORRECTION" : index === 11 ? "WITHDRAWAL" : "DEPOSIT";
    records.push(engine.create({
      actorId: "operator-1", studentId: "student-1", transactionId: crypto.randomUUID(), commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(),
      type, amount: index === 0 ? "1000" : type === "WITHDRAWAL" ? "50" : "10", notes: `Catatan ${index}`,
      correctionDirection: type === "CORRECTION" ? "INCREASE" : undefined,
      reason: type === "CORRECTION" ? "Penyesuaian ledger" : undefined,
      occurredAt: new Date(Date.UTC(2026, 6, 1 + index, 8)).toISOString()
    }));
  }
  engine.remove({ actorId: "operator-1", studentId: "student-1", transactionId: records[2].transaction.id, commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(), expectedRevision: 1, reason: "Duplikat" });
  database.close();

  Object.assign(process.env, {
    DATABASE_URL: `file:${databasePath}`,
    GOOGLE_CLIENT_ID: "test-client",
    GOOGLE_CLIENT_SECRET: "test-secret",
    NEXTAUTH_SECRET: "12345678901234567890123456789012",
    NEXTAUTH_URL: "http://localhost:3000"
  });
  const service = transactionReadService();
  const summaries = await service.studentSummaries(["student-1"], "operator-1");
  assert.equal(summaries["student-1"].balance, "1040");
  assert.equal(summaries["student-1"].transactionCount, 12);
  assert.deepEqual(await service.studentSummaries(["student-1"], "operator-2"), {});
  const first = await service.history("student-1", "operator-1", {});
  assert.equal(first.balance, "1040");
  assert.equal(first.transactionCount, 12);
  assert.equal(first.items.length, 10);
  assert.ok(first.nextCursor);
  assert.equal(first.items[0].type, "WITHDRAWAL");
  const older = await service.history("student-1", "operator-1", { cursor: first.nextCursor! });
  assert.equal(older.items.length, 2);
  assert.equal(older.hasPrevious, true);
  const correction = await service.history("student-1", "operator-1", { type: "CORRECTION" });
  assert.equal(correction.total, 1);
  const deleted = await service.history("student-1", "operator-1", { status: "DELETED" });
  assert.equal(deleted.total, 1);
  const searched = await service.history("student-1", "operator-1", { search: "Catatan 3" });
  assert.equal(searched.total, 1);
});
