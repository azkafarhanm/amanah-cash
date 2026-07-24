import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";
import Database from "better-sqlite3";
import { openDatabase } from "../src/persistence/database.js";
import { getPrismaClient } from "../src/persistence/prisma";
import { transactionReadService } from "../src/transactions/read-service";
import { createTransactionEngine } from "../src/transactions/service";
import { withAuthorizationUsing } from "../src/authorization/api";
import { GET as getWorkspaceTransactionsHandler } from "../src/app/api/operator/transactions/route";
import { createAuthorization } from "../src/authorization/core";

const root = resolve(import.meta.dirname, "..");
const temporary = join(tmpdir(), `amanah-cash-workspace-${crypto.randomUUID()}`);
const databasePath = join(temporary, "workspace.sqlite");
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

const mockNow = () => new Date("2026-07-24T10:00:00.000+07:00");

mkdirSync(temporary, { recursive: true });
openDatabase({ databasePath, migrationsPath: resolve(root, "migrations") }).close();
const database = new Database(databasePath);
database.pragma("foreign_keys = ON");

database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('admin-1', 'Admin Utama', 'admin@example.com', 'PLATFORM_ADMIN', 1)").run();
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-1', 'Operator Alpha', 'alpha@example.com', 'OPERATOR', 1)").run();
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-2', 'Operator Beta', 'beta@example.com', 'OPERATOR', 1)").run();

database.prepare("INSERT INTO students (id, name, notes, operator_id, status, created_at) VALUES ('student-1', 'Ahmad Zaky', 'Kelas 10A', 'operator-1', 'ACTIVE', '2026-07-01T01:00:00.000Z')").run();
database.prepare("INSERT INTO students (id, name, notes, operator_id, status, created_at) VALUES ('student-2', 'Budi Santoso', 'Kelas 10B', 'operator-1', 'ACTIVE', '2026-07-02T01:00:00.000Z')").run();
database.prepare("INSERT INTO students (id, name, notes, operator_id, status, created_at) VALUES ('student-3', 'Citra Dewi', 'Kelas 11A', 'operator-2', 'ACTIVE', '2026-07-03T01:00:00.000Z')").run();

const engine = createTransactionEngine(database, mockNow);

function createTx(actorId: string, studentId: string, type: "DEPOSIT" | "WITHDRAWAL" | "CORRECTION", amount: string, occurredAt: string, index: string, correctionDirection?: "INCREASE" | "DECREASE", notes?: string) {
  return engine.create({
    actorId,
    studentId,
    transactionId: `tx-${index}`,
    commandId: `cmd-${index}`,
    correlationId: `corr-${index}`,
    type,
    amount,
    correctionDirection,
    reason: type === "CORRECTION" ? "Penyesuaian saldo" : undefined,
    notes: notes ?? `Transaksi ${index}`,
    occurredAt
  });
}

// Seed transactions for Operator 1 (Ahmad & Budi)
createTx("operator-1", "student-1", "DEPOSIT", "100000", "2026-07-24T08:00:00.000+07:00", "op1-dep-1", undefined, "Setoran awal");
createTx("operator-1", "student-1", "WITHDRAWAL", "30000", "2026-07-24T09:00:00.000+07:00", "op1-wth-1", undefined, "Tarik saku");
createTx("operator-1", "student-2", "DEPOSIT", "200000", "2026-07-24T09:30:00.000+07:00", "op1-dep-2", undefined, "Setoran bulanan");

// Soft delete one transaction for testing status filter
const toDelete = createTx("operator-1", "student-1", "DEPOSIT", "15000", "2026-07-23T10:00:00.000+07:00", "op1-del-1", undefined, "Salah input");
engine.remove({ actorId: "operator-1", studentId: "student-1", transactionId: toDelete.transaction.id, commandId: "cmd-del-1", correlationId: "corr-del-1", expectedRevision: 1, reason: "Batal" });

// Seed transactions for Operator 2 (Citra) - Isolation verification
createTx("operator-2", "student-3", "DEPOSIT", "500000", "2026-07-24T08:30:00.000+07:00", "op2-dep-1", undefined, "Setoran Citra");

after(async () => {
  await getPrismaClient(environment).$disconnect();
  database.close();
  rmSync(temporary, { recursive: true, force: true });
});

test("workspaceHistory enforces operator isolation and returns correct multi-student items & summary", async () => {
  const readService = transactionReadService(environment, mockNow);
  const result = await readService.workspaceHistory("operator-1", {});

  // Should include transactions for student-1 and student-2, but exclude operator-2 (student-3)
  assert.equal(result.total, 4);
  assert.equal(result.items.length, 4);
  assert.equal(result.items.every(item => item.studentId === "student-1" || item.studentId === "student-2"), true);
  assert.equal(result.items.some(item => item.studentName === "Citra Dewi"), false);

  // Verify student notes / class identity presence
  const ahmadTx = result.items.find(item => item.studentId === "student-1");
  assert.equal(ahmadTx?.studentNotes, "Kelas 10A");

  // Verify Today's Cash Flow Summary (excluding soft deleted transaction from yesterday)
  // Today's deposits: 100,000 + 200,000 = 300,000
  // Today's withdrawals: 30,000
  assert.equal(result.summary.todayDeposits, "300000");
  assert.equal(result.summary.todayWithdrawals, "30000");
  assert.equal(result.summary.todayTransactionCount, 3);
});

test("workspaceHistory supports studentId, type, status, search, and pagination filters", async () => {
  const readService = transactionReadService(environment, mockNow);

  // Filter by specific owned student
  const student1Only = await readService.workspaceHistory("operator-1", { studentId: "student-1" });
  assert.equal(student1Only.total, 3);
  assert.equal(student1Only.items.every(item => item.studentId === "student-1"), true);

  // Filter by unowned student returns empty result (ownership isolation)
  const unownedStudent = await readService.workspaceHistory("operator-1", { studentId: "student-3" });
  assert.equal(unownedStudent.total, 0);
  assert.equal(unownedStudent.items.length, 0);

  // Filter by status (ACTIVE vs DELETED)
  const activeOnly = await readService.workspaceHistory("operator-1", { status: "ACTIVE" });
  assert.equal(activeOnly.total, 3);
  const deletedOnly = await readService.workspaceHistory("operator-1", { status: "DELETED" });
  assert.equal(deletedOnly.total, 1);
  assert.equal(deletedOnly.items[0].id, "tx-op1-del-1");

  // Filter by search keyword (matches student name or notes)
  const searchBudi = await readService.workspaceHistory("operator-1", { search: "Budi" });
  assert.equal(searchBudi.total, 1);
  assert.equal(searchBudi.items[0].studentName, "Budi Santoso");

  // Filter by type
  const withdrawals = await readService.workspaceHistory("operator-1", { type: "WITHDRAWAL" });
  assert.equal(withdrawals.total, 1);
  assert.equal(withdrawals.items[0].type, "WITHDRAWAL");
});

test("GET /api/operator/transactions API route enforces authorization, operator role, and returns 403 for Admin", async () => {
  const mockAuthService = (role: "OPERATOR" | "PLATFORM_ADMIN" | null, userId = "operator-1") => createAuthorization({
    async resolveSessionUserId() { return role ? userId : null; },
    async findActiveUser(id) { return role ? { id, role, isActive: true } : null; },
    async findOwnedStudent() { return null; }
  });

  const request = new Request("http://localhost:3000/api/operator/transactions");

  // 1. Unauthenticated request returns 401
  const unauthHandler = withAuthorizationUsing(() => mockAuthService(null), { role: "operator" }, getWorkspaceTransactionsHandler);
  const unauthRes = await unauthHandler(request);
  assert.equal(unauthRes.status, 401);

  // 2. Platform Admin request returns 403 Forbidden
  const adminHandler = withAuthorizationUsing(() => mockAuthService("PLATFORM_ADMIN", "admin-1"), { role: "operator" }, getWorkspaceTransactionsHandler);
  const adminRes = await adminHandler(request);
  assert.equal(adminRes.status, 403);
});
