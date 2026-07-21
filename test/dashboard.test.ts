import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";
import Database from "better-sqlite3";
import { dashboardReadService } from "../src/dashboard/read-service";
import { getPrismaClient } from "../src/persistence/prisma";
import { openDatabase } from "../src/persistence/database.js";
import { createTransactionEngine } from "../src/transactions/service";

const root = resolve(import.meta.dirname, "..");
const temporary = join(tmpdir(), `amanah-cash-dashboard-${crypto.randomUUID()}`);
const databasePath = join(temporary, "dashboard.sqlite");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");
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

mkdirSync(temporary, { recursive: true });
openDatabase({ databasePath, migrationsPath: resolve(root, "migrations") }).close();
const database = new Database(databasePath);
database.pragma("foreign_keys = ON");
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('admin-1', 'Admin', 'admin@example.com', 'PLATFORM_ADMIN', 1)").run();
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-1', 'Operator Satu', 'one@example.com', 'OPERATOR', 1)").run();
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-2', 'Operator Dua', 'two@example.com', 'OPERATOR', 1)").run();
database.prepare("INSERT INTO students (id, name, operator_id, status) VALUES ('student-1', 'Alya', 'operator-1', 'ACTIVE')").run();
database.prepare("INSERT INTO students (id, name, operator_id, status) VALUES ('student-2', 'Bima', 'operator-1', 'INACTIVE')").run();
database.prepare("INSERT INTO students (id, name, operator_id, status) VALUES ('student-3', 'Citra', 'operator-1', 'ARCHIVED')").run();
database.prepare("INSERT INTO students (id, name, operator_id, status) VALUES ('student-4', 'Dina', 'operator-2', 'ACTIVE')").run();
database.prepare("INSERT INTO operator_audit (id, operator_id, actor_id, action, summary) VALUES ('operator-audit-1', 'operator-removed', 'admin-1', 'ACTIVATED', 'Akun operator diaktifkan.')").run();

const now = () => new Date("2026-07-21T05:00:00.000Z");
const engine = createTransactionEngine(database, now);
function create(actorId: string, studentId: string, type: "DEPOSIT" | "WITHDRAWAL", amount: string, occurredAt: string) {
  return engine.create({
    actorId, studentId, transactionId: crypto.randomUUID(), commandId: crypto.randomUUID(), correlationId: crypto.randomUUID(),
    type, amount, notes: type === "DEPOSIT" ? "Dashboard fixture" : undefined, occurredAt
  });
}
create("operator-1", "student-1", "DEPOSIT", "1000", "2026-07-21T01:00:00.000Z");
create("operator-1", "student-1", "WITHDRAWAL", "200", "2026-07-21T02:00:00.000Z");
create("operator-2", "student-4", "DEPOSIT", "9999", "2026-07-21T01:30:00.000Z");
database.prepare(`INSERT INTO financial_audit_events
  (id, command_id, command_payload_hash, event_type, actor_id, actor_role, student_id, reason,
   old_operator_id, new_operator_id, correlation_id)
  VALUES ('transfer-audit-1', 'transfer-command-1', ?, 'OWNERSHIP_TRANSFER', 'admin-1', 'PLATFORM_ADMIN',
    'student-1', 'Penyesuaian wilayah', 'operator-2', 'operator-1', 'transfer-correlation-1')`).run("a".repeat(64));

after(async () => {
  await getPrismaClient(environment).$disconnect();
  database.close();
  rmSync(temporary, { recursive: true, force: true });
});

test("Admin dashboard aggregates administration without exposing financial data", async () => {
  const dashboard = await dashboardReadService(environment, now).admin();
  assert.deepEqual(dashboard.operators, { total: 2, active: 2, inactive: 0 });
  assert.deepEqual(dashboard.students, { total: 4, active: 2, inactive: 1, archived: 1 });
  assert.deepEqual(dashboard.studentDistribution.map(({ operatorName, studentCount }) => ({ operatorName, studentCount })), [
    { operatorName: "Operator Dua", studentCount: 1 },
    { operatorName: "Operator Satu", studentCount: 3 }
  ]);
  assert.equal(dashboard.administrativeActivity[0].kind, "STATUS_CHANGE");
  assert.equal(dashboard.administrativeActivity[0].title, "Operator yang telah dihapus");
  assert.equal(dashboard.administrativeActivity[0].href, undefined);
  assert.equal(dashboard.ownershipChanges[0].description.includes("Operator Dua → Operator Satu"), true);
  const serialized = JSON.stringify(dashboard);
  assert.doesNotMatch(serialized, /managedBalance|balanceBefore|balanceAfter|balanceDelta|transactionRevision|beforeSnapshot|afterSnapshot/);
});

test("Operator dashboard is ownership-scoped and uses persisted balances and Jakarta business time", async () => {
  const dashboard = await dashboardReadService(environment, now).operator("operator-1");
  assert.deepEqual(dashboard.students, { total: 3, active: 1, inactive: 1, archived: 1, activeToday: 1 });
  assert.equal(dashboard.managedBalance, "800");
  assert.deepEqual(dashboard.today, {
    deposits: { count: 1, amount: "1000" },
    withdrawals: { count: 1, amount: "200" }
  });
  assert.equal(dashboard.recentTransactions.length, 2);
  assert.equal(dashboard.recentTransactions.every((transaction) => transaction.studentId === "student-1"), true);
  assert.equal(JSON.stringify(dashboard).includes("9999"), false);

  const other = await dashboardReadService(environment, now).operator("operator-2");
  assert.equal(other.managedBalance, "9999");
  assert.equal(other.recentTransactions.every((transaction) => transaction.studentId === "student-4"), true);
});

test("Dashboard empty projections return meaningful zero data without special-case queries", async () => {
  const dashboard = await dashboardReadService(environment, now).operator("operator-without-students");
  assert.deepEqual(dashboard.students, { total: 0, active: 0, inactive: 0, archived: 0, activeToday: 0 });
  assert.equal(dashboard.managedBalance, "0");
  assert.deepEqual(dashboard.recentTransactions, []);
  assert.deepEqual(dashboard.recentlyUpdatedStudents, []);
});

test("Dashboard presentation is reusable, read-only, responsive, and accessible", () => {
  const cards = source("src/components/dashboard/dashboard-cards.tsx");
  const styles = source("src/components/dashboard/dashboard.module.css");
  const readService = source("src/dashboard/read-service.ts");
  const adminPage = source("src/app/(app)/(admin)/admin/page.tsx");
  const operatorPage = source("src/app/(app)/(operator)/operator/page.tsx");
  for (const component of ["StatisticCard", "TrendCard", "ActivityCard", "SummaryCard", "QuickActionCard", "DashboardSkeleton"]) {
    assert.match(cards, new RegExp(`function ${component}`));
  }
  assert.match(cards, /aria-labelledby/);
  assert.match(cards, /role="region"/);
  assert.match(cards, /emptyMessage/);
  assert.match(styles, /@media \(max-width: 48rem\)/);
  assert.match(styles, /grid-template-columns: minmax\(0, 1fr\)/);
  assert.doesNotMatch(styles, /overflow-x/);
  assert.match(readService, /Promise\.all/);
  assert.match(readService, /take: ACTIVITY_LIMIT/);
  assert.doesNotMatch(readService, /\.create\(|\.update\(|\.delete\(|transactionEngine/);
  assert.doesNotMatch(adminPage, /balance|Transaction|financialAuditEvent|FeaturePlaceholder/i);
  assert.match(operatorPage, /currentOperator\(\)/);
  assert.doesNotMatch(operatorPage, /transactionEngine|\.create\(|\.edit\(|\.remove\(|\.restore\(/);
});
