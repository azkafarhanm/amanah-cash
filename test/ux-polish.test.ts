import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";
import Database from "better-sqlite3";
import { openDatabase } from "../src/persistence/database.js";
import { transactionReadService } from "../src/transactions/read-service.js";
import { createTransactionEngine } from "../src/transactions/service.js";

const root = resolve(import.meta.dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");
const temporary = join(tmpdir(), `amanah-cash-ux-polish-${crypto.randomUUID()}`);

after(() => rmSync(temporary, { recursive: true, force: true }));

test("Transaction search matches nominal amount, notes, and operator name", async () => {
  mkdirSync(temporary, { recursive: true });
  const databasePath = join(temporary, "database.sqlite");
  openDatabase({ databasePath, migrationsPath: resolve(root, "migrations") }).close();
  const database = new Database(databasePath);
  database.pragma("foreign_keys = ON");
  database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-1', 'Operator Ahmad', 'ahmad@example.com', 'OPERATOR', 1)").run();
  database.prepare("INSERT INTO students (id, name, operator_id) VALUES ('student-1', 'Alya', 'operator-1')").run();

  const engine = createTransactionEngine(database, () => new Date("2026-07-25T12:00:00.000Z"));
  engine.create({
    actorId: "operator-1", studentId: "student-1", transactionId: crypto.randomUUID(), commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(),
    type: "DEPOSIT", amount: "50000", notes: "Uang saku", occurredAt: new Date("2026-07-25T08:00:00.000Z").toISOString()
  });
  engine.create({
    actorId: "operator-1", studentId: "student-1", transactionId: crypto.randomUUID(), commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(),
    type: "WITHDRAWAL", amount: "15000", notes: "Beli buku", occurredAt: new Date("2026-07-25T09:00:00.000Z").toISOString()
  });
  database.close();

  Object.assign(process.env, {
    DATABASE_URL: `file:${databasePath}`,
    GOOGLE_CLIENT_ID: "test-client",
    GOOGLE_CLIENT_SECRET: "test-secret",
    NEXTAUTH_SECRET: "12345678901234567890123456789012",
    NEXTAUTH_URL: "http://localhost:3000"
  });

  const service = transactionReadService();
  // Search by amount 50000 (displaying as Rp 50.000)
  const amountSearch = await service.history("student-1", "operator-1", { search: "50000" });
  assert.equal(amountSearch.total, 1);
  assert.equal(amountSearch.items[0].amount, "50000");

  // Search by operator name "Ahmad"
  const operatorSearch = await service.history("student-1", "operator-1", { search: "Ahmad" });
  assert.equal(operatorSearch.total, 2);

  // Search by note "buku"
  const noteSearch = await service.history("student-1", "operator-1", { search: "buku" });
  assert.equal(noteSearch.total, 1);
  assert.equal(noteSearch.items[0].amount, "15000");
});

test("UI placeholders match QA recommendations, Correction button uses solid weight, and filter form binds date controls", () => {
  const exp = source("src/components/transactions/transaction-experience.tsx");
  const toolbar = source("src/components/transactions/workspace/workspace-filter-toolbar.tsx");
  const bizRules = source("docs/03-business-rules.md");
  const css = source("src/components/transactions/transactions.module.css");
  const studentService = source("src/students/service.ts");

  assert.match(exp, /placeholder="Cari nominal, catatan, atau operator\.\.\."/);
  assert.match(toolbar, /placeholder="Cari nominal, catatan, atau operator\.\.\."/);
  assert.match(bizRules, /BR-TXN-010: Distinction Between Edit and Correction/);
  assert.match(bizRules, /Perbaikan Data/);
  assert.match(bizRules, /Koreksi Saldo/);

  // Correction button uses solid background matching deposit/withdrawal
  assert.match(css, /\.correctionButton:not\(:disabled\) \{ color: var\(--color-text-inverse\) !important; border-color: var\(--color-warning-foreground\) !important; background: var\(--color-warning-foreground\) !important; \}/);

  // Student search in operator scope does not match operator name
  assert.match(studentService, /if \(!operatorId && search\)/);

  // TransactionExperience binds date fields to controlled state
  assert.match(exp, /value=\{dateFromValue\}/);
  assert.match(exp, /value=\{dateToValue\}/);
  assert.match(exp, /onSubmit=\{handleSubmit\}/);
  assert.match(exp, /onClick=\{handleReset\}/);
});

test("Report and Transaction CSS files define explicit cursor pointer and hover feedback rules", () => {
  const reportCss = source("src/components/reports/reports.module.css");
  const txnCss = source("src/components/transactions/transactions.module.css");

  // Enabled selects & date inputs use cursor pointer
  assert.match(reportCss, /\.field select:not\(:disabled\),\n\.field input\[type="date"\]:not\(:disabled\) \{ cursor: pointer; \}/);
  assert.match(txnCss, /\.select:not\(:disabled\), \.input\[type="date"\]:not\(:disabled\) \{ cursor: pointer; \}/);

  // Reset buttons use cursor pointer and hover background
  assert.match(reportCss, /\.filterActions \.resetButton:hover:not\(:disabled\) \{ background: var\(--color-primary-subtle\); border-color: var\(--color-action-primary\); cursor: pointer; \}/);
  assert.match(txnCss, /\.resetLink:hover:not\(:disabled\) \{ background: var\(--color-primary-subtle\); border-color: var\(--color-action-primary\); cursor: pointer; \}/);
});
