import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";
import Database from "better-sqlite3";
import {
  FinancialAssuranceReadError,
  financialAssuranceReadService
} from "../src/financial-assurance/read-service";
import { openDatabase } from "../src/persistence/database.js";
import { getPrismaClient } from "../src/persistence/prisma";
import { createTransactionEngine } from "../src/transactions/service";

const root = resolve(import.meta.dirname, "..");
const temporary = join(tmpdir(), `amanah-cash-financial-assurance-${crypto.randomUUID()}`);
const databasePath = join(temporary, "financial-assurance.sqlite");
const environment = {
  databaseUrl: `file:${databasePath}`,
  googleClientId: "test-client",
  googleClientSecret: "test-secret",
  nextAuthSecret: "12345678901234567890123456789012",
  nextAuthUrl: "http://localhost:3000",
  production: false,
  developmentAuth: false,
  developmentAdminEmail: null,
  developmentOperatorEmail: null
};
const checkedAt = new Date("2026-07-26T08:00:00.000Z");

mkdirSync(temporary, { recursive: true });
openDatabase({ databasePath, migrationsPath: resolve(root, "migrations") }).close();

const database = new Database(databasePath);
database.pragma("foreign_keys = ON");
database.prepare(
  "INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-1', 'Operator Satu', 'one@example.com', 'OPERATOR', 1)"
).run();
database.prepare(
  "INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-2', 'Operator Dua', 'two@example.com', 'OPERATOR', 1)"
).run();
database.prepare(
  "INSERT INTO students (id, name, operator_id, status) VALUES ('student-1', 'Alya', 'operator-1', 'ACTIVE')"
).run();
database.prepare(
  "INSERT INTO students (id, name, operator_id, status) VALUES ('student-2', 'Bima', 'operator-2', 'ACTIVE')"
).run();

const engine = createTransactionEngine(database, () => checkedAt);
let sequence = 0;

function create(
  actorId: string,
  studentId: string,
  type: "DEPOSIT" | "WITHDRAWAL" | "CORRECTION",
  amount: string,
  correctionDirection?: "INCREASE" | "DECREASE"
) {
  sequence += 1;
  return engine.create({
    actorId,
    studentId,
    transactionId: `transaction-${sequence}`,
    commandId: `command-${sequence}`,
    correlationId: `correlation-${sequence}`,
    type,
    amount,
    correctionDirection,
    reason: type === "CORRECTION" ? "Penyesuaian saldo" : undefined,
    notes: `Catatan ${sequence}`,
    occurredAt: checkedAt.toISOString()
  });
}

create("operator-1", "student-1", "DEPOSIT", "2000");
create("operator-1", "student-1", "WITHDRAWAL", "500");
create("operator-1", "student-1", "CORRECTION", "200", "INCREASE");
create("operator-1", "student-1", "CORRECTION", "100", "DECREASE");
const deleted = create("operator-1", "student-1", "DEPOSIT", "300");
engine.remove({
  actorId: "operator-1",
  studentId: "student-1",
  transactionId: deleted.transaction.id,
  commandId: "command-delete",
  correlationId: "correlation-delete",
  expectedRevision: 1,
  reason: "Duplikat"
});
create("operator-2", "student-2", "DEPOSIT", "9999");

const service = financialAssuranceReadService(environment, () => checkedAt);

function tableCounts() {
  const count = (table: string) =>
    Number((database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number }).count);

  return {
    students: count("students"),
    transactions: count("transactions"),
    audits: count("financial_audit_events")
  };
}

after(async () => {
  await getPrismaClient(environment).$disconnect();
  database.close();
  rmSync(temporary, { recursive: true, force: true });
});

test("reconciliation returns MATCHED from active Transaction effects without writing", async () => {
  const before = tableCounts();
  const result = await service.reconcile("operator-1", "student-1");

  assert.deepEqual(result, {
    student: { id: "student-1", name: "Alya", status: "ACTIVE" },
    persistedBalance: "1600",
    calculatedBalance: "1600",
    difference: "0",
    activeTransactionCount: 4,
    financialVersion: 6,
    checkedAt: checkedAt.toISOString(),
    integrityStatus: "MATCHED"
  });
  assert.deepEqual(tableCounts(), before);
});

test("reconciliation returns MISMATCHED without repairing persisted Balance", async () => {
  database.prepare(
    "UPDATE students SET balance = 1700 WHERE id = 'student-1'"
  ).run();
  const before = tableCounts();

  const result = await service.reconcile("operator-1", "student-1");

  assert.equal(result.persistedBalance, "1700");
  assert.equal(result.calculatedBalance, "1600");
  assert.equal(result.difference, "100");
  assert.equal(result.integrityStatus, "MISMATCHED");
  assert.deepEqual(tableCounts(), before);
  assert.equal(
    (database.prepare("SELECT balance FROM students WHERE id = 'student-1'").get() as { balance: bigint }).balance,
    BigInt(1700)
  );
});

test("reconciliation masks missing and cross-Operator Students before returning financial data", async () => {
  await assert.rejects(
    service.reconcile("operator-1", "student-2"),
    (error: unknown) =>
      error instanceof FinancialAssuranceReadError &&
      error.code === "NOT_FOUND" &&
      error.status === 404
  );
  await assert.rejects(
    service.reconcile("operator-1", "missing-student"),
    (error: unknown) =>
      error instanceof FinancialAssuranceReadError &&
      error.code === "NOT_FOUND" &&
      error.status === 404
  );
});
