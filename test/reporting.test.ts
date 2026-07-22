import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";
import Database from "better-sqlite3";
import { normalizeReportFilters } from "../src/reports/filters";
import { reportReadService } from "../src/reports/read-service";
import { getPrismaClient } from "../src/persistence/prisma";
import { openDatabase } from "../src/persistence/database.js";
import { createTransactionEngine } from "../src/transactions/service";

const root = resolve(import.meta.dirname, "..");
const temporary = join(tmpdir(), `amanah-cash-reporting-${crypto.randomUUID()}`);
const databasePath = join(temporary, "reporting.sqlite");
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
const now = () => new Date("2026-07-21T05:00:00.000Z");

mkdirSync(temporary, { recursive: true });
openDatabase({ databasePath, migrationsPath: resolve(root, "migrations") }).close();
const database = new Database(databasePath);
database.pragma("foreign_keys = ON");
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('admin-1', 'Admin', 'admin@example.com', 'PLATFORM_ADMIN', 1)").run();
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-1', 'Operator Satu', 'one@example.com', 'OPERATOR', 1)").run();
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-2', 'Operator Dua', 'two@example.com', 'OPERATOR', 1)").run();
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-3', 'Operator Kosong', 'empty@example.com', 'OPERATOR', 1)").run();
database.prepare("INSERT INTO students (id, name, operator_id, status, created_at) VALUES ('student-1', 'Alya', 'operator-1', 'ACTIVE', '2026-07-01T01:00:00.000Z')").run();
database.prepare("INSERT INTO students (id, name, operator_id, status, created_at) VALUES ('student-2', 'Bima', 'operator-1', 'INACTIVE', '2026-07-02T01:00:00.000Z')").run();
database.prepare("INSERT INTO students (id, name, operator_id, status, created_at) VALUES ('student-3', 'Citra', 'operator-2', 'ACTIVE', '2026-07-03T01:00:00.000Z')").run();
const engine = createTransactionEngine(database, now);

function create(actorId: string, studentId: string, type: "DEPOSIT" | "WITHDRAWAL" | "CORRECTION", amount: string, occurredAt: string, index: string, correctionDirection?: "INCREASE" | "DECREASE") {
  return engine.create({
    actorId,
    studentId,
    transactionId: `transaction-${index}`,
    commandId: `command-${index}`,
    correlationId: `correlation-${index}`,
    type,
    amount,
    correctionDirection,
    reason: type === "CORRECTION" ? "Penyesuaian laporan" : undefined,
    notes: `Catatan laporan ${index}`,
    occurredAt
  });
}

create("operator-1", "student-1", "DEPOSIT", "50", "2026-06-30T08:00:00.000Z", "june");
create("operator-1", "student-1", "DEPOSIT", "100", "2026-07-01T08:00:00.000Z", "month-start");
for (let index = 0; index < 25; index += 1) create("operator-1", "student-1", "DEPOSIT", "10", `2026-07-10T${String(index % 10).padStart(2, "0")}:00:00.000Z`, `page-${index}`);
create("operator-1", "student-1", "DEPOSIT", "300", "2026-07-20T08:00:00.000Z", "week");
create("operator-1", "student-1", "DEPOSIT", "1000", "2026-07-21T01:00:00.000Z", "today-deposit");
create("operator-1", "student-1", "WITHDRAWAL", "200", "2026-07-21T02:00:00.000Z", "today-withdrawal");
create("operator-1", "student-1", "CORRECTION", "50", "2026-07-21T03:00:00.000Z", "today-correction", "DECREASE");
const removed = create("operator-1", "student-1", "DEPOSIT", "20", "2026-07-21T04:00:00.000Z", "deleted");
engine.remove({ actorId: "operator-1", studentId: "student-1", transactionId: removed.transaction.id, commandId: "command-delete", correlationId: "correlation-delete", expectedRevision: 1, reason: "Duplikat laporan" });
create("operator-2", "student-3", "DEPOSIT", "9999", "2026-07-21T01:30:00.000Z", "other-owner");

for (let index = 0; index < 22; index += 1) database.prepare("INSERT INTO operator_audit (id, operator_id, actor_id, action, summary, created_at) VALUES (?, 'operator-1', 'admin-1', ?, ?, ?)").run(`admin-audit-${index}`, index % 2 ? "UPDATED" : "ACTIVATED", `Aktivitas Operator ${index}`, `2026-07-${String(21 - (index % 20)).padStart(2, "0")}T04:00:00.000Z`);
database.prepare(`INSERT INTO financial_audit_events
  (id, command_id, command_payload_hash, event_type, actor_id, actor_role, student_id, reason, old_operator_id, new_operator_id, correlation_id, occurred_at)
  VALUES ('ownership-report', 'ownership-report-command', ?, 'OWNERSHIP_TRANSFER', 'admin-1', 'PLATFORM_ADMIN', 'student-1', 'Perubahan wilayah', 'operator-2', 'operator-1', 'ownership-report-correlation', '2026-07-21T04:30:00.000Z')`).run("b".repeat(64));

after(async () => {
  await getPrismaClient(environment).$disconnect();
  database.close();
  rmSync(temporary, { recursive: true, force: true });
});

test("report periods use Jakarta boundaries and normalize reversed custom ranges", () => {
  const today = normalizeReportFilters({ period: "TODAY" }, now());
  assert.equal(today.dateFrom, "2026-07-21");
  assert.equal(today.dateTo, "2026-07-21");
  const week = normalizeReportFilters({ period: "WEEK" }, now());
  assert.equal(week.dateFrom, "2026-07-20");
  assert.equal(week.dateTo, "2026-07-21");
  const custom = normalizeReportFilters({ period: "CUSTOM", dateFrom: "2026-07-21", dateTo: "2026-07-01" }, now());
  assert.equal(custom.dateFrom, "2026-07-01");
  assert.equal(custom.dateTo, "2026-07-21");
});

test("Operator report is ownership-scoped, accurate, and excludes soft-deleted transactions", async () => {
  const report = await reportReadService(environment, now).operator("operator-1", {});
  assert.deepEqual(report.summary, {
    deposits: "1650",
    withdrawals: "200",
    netMovement: "1400",
    transactionCount: 30,
    activeStudents: 1,
    periodLabel: "1 Jul 2026 – 21 Jul 2026"
  });
  assert.equal(report.total, 30);
  assert.equal(report.items.length, 20);
  assert.equal(report.pages, 2);
  assert.equal(report.items.every((item) => item.studentId === "student-1"), true);
  assert.equal(report.items.some((item) => item.balanceAfter !== null && item.auditId !== null), true);
  assert.equal(JSON.stringify(report).includes("9999"), false);
  assert.equal(JSON.stringify(report).includes("transaction-deleted"), false);
});

test("Operator report composes type, date, search, Student, status, sorting, and pagination filters", async () => {
  const service = reportReadService(environment, now);
  const today = await service.operator("operator-1", { period: "TODAY" });
  assert.deepEqual(today.summary, { deposits: "1000", withdrawals: "200", netMovement: "750", transactionCount: 3, activeStudents: 1, periodLabel: "21 Jul 2026" });
  const withdrawals = await service.operator("operator-1", { period: "ALL", type: "WITHDRAWAL" });
  assert.equal(withdrawals.total, 1);
  assert.equal(withdrawals.items[0].type, "WITHDRAWAL");
  const searched = await service.operator("operator-1", { period: "ALL", search: "month-start" });
  assert.equal(searched.total, 1);
  const noOwnedActivity = await service.operator("operator-1", { period: "ALL", studentId: "student-2", status: "INACTIVE" });
  assert.equal(noOwnedActivity.total, 0);
  const crossOwner = await service.operator("operator-1", { period: "ALL", studentId: "student-3" });
  assert.equal(crossOwner.total, 0);
  const second = await service.operator("operator-1", { page: "2", sort: "amount", direction: "asc" });
  assert.equal(second.page, 2);
  assert.equal(second.items.length, 10);
});

test("Operator report returns an explicit empty ownership scope without broadening access", async () => {
  const report = await reportReadService(environment, now).operator("operator-3", {});
  assert.equal(report.students.length, 0);
  assert.equal(report.items.length, 0);
  assert.equal(report.total, 0);
  assert.equal(report.summary.transactionCount, 0);
  assert.equal(report.summary.activeStudents, 0);
});

test("Admin reports paginate administrative data and expose only privacy-minimized ownership evidence", async () => {
  const service = reportReadService(environment, now);
  const activity = await service.admin({ period: "ALL" });
  assert.equal(activity.total, 22);
  assert.equal(activity.items.length, 20);
  assert.equal(activity.pages, 2);
  const second = await service.admin({ period: "ALL", page: "2", action: "UPDATED" });
  assert.equal(second.items.every((item) => item.description.startsWith("UPDATED:")), true);
  const ownership = await service.admin({ kind: "OWNERSHIP_CHANGE", period: "TODAY" });
  assert.equal(ownership.total, 1);
  assert.match(ownership.items[0].description, /Operator Dua → Operator Satu/);
  assert.doesNotMatch(JSON.stringify(ownership), /balanceBefore|balanceAfter|balanceDelta|transactionRevision|beforeSnapshot|afterSnapshot|amount/);
  const assignments = await service.admin({ kind: "STUDENT_ASSIGNMENT", period: "MONTH", search: "Alya" });
  assert.equal(assignments.total, 1);
});

test("Reporting presentation is reusable, read-only, responsive, accessible, and export-neutral", () => {
  const service = source("src/reports/read-service.ts");
  const components = source("src/components/reports/report-components.tsx");
  const filterForm = source("src/components/reports/report-filter-form.tsx");
  const styles = source("src/components/reports/reports.module.css");
  const operatorPage = source("src/app/(app)/(operator)/operator/reports/page.tsx");
  const adminPage = source("src/app/(app)/(admin)/admin/reports/page.tsx");
  assert.doesNotMatch(service, /\.create\(|\.update\(|\.delete\(|transactionEngine/);
  assert.match(service, /effect\(/);
  assert.match(service, /skip:/);
  assert.match(service, /take: REPORT_PAGE_SIZE/);
  assert.match(components, /<table/);
  assert.match(components, /ariaLabel="Filter laporan keuangan"/);
  assert.match(filterForm, /aria-label=\{ariaLabel\}/);
  assert.match(filterForm, /aria-busy=\{pending\}/);
  assert.match(filterForm, /disabled=\{\(!hasActiveFilters && !dirty\) \|\| pending\}/);
  assert.match(filterForm, /period !== "CUSTOM"/);
  assert.match(filterForm, /role="group"/);
  assert.match(filterForm, /Pilih periode Rentang khusus/);
  assert.match(components, /aria-label="Paginasi laporan"/);
  assert.match(components, /aria-sort=/);
  assert.match(components, /<caption/);
  assert.match(components, /Pencarian tidak menemukan transaksi/);
  assert.match(components, /Tidak ada transaksi setelah difilter/);
  assert.match(components, /Belum ada Siswa yang ditugaskan/);
  assert.match(components, /disabled=\{students.length === 0\}/);
  assert.match(components, /Hapus pencarian/);
  assert.match(components, /ReportEmptyIcon/);
  assert.match(components, /aria-live="polite"/);
  assert.match(components, /Belum ada setoran pada periode ini/);
  assert.match(components, /placeholder="Cari nama Siswa, catatan, atau alasan"/);
  assert.match(components, /name="sort"/);
  assert.match(components, /name="direction"/);
  assert.match(components, /aria-disabled="true"/);
  assert.doesNotMatch(components, /placeholder="[^"]*Operator[^"]*"/);
  assert.match(components, /ReportSkeleton/);
  assert.match(styles, /@media \(max-width: 48rem\)/);
  assert.match(styles, /tr:hover/);
  assert.match(styles, /tr:focus-within/);
  assert.doesNotMatch(styles, /overflow-x/);
  assert.match(operatorPage, /currentOperator\(\)/);
  assert.match(adminPage, /requirePlatformAdmin\(\)/);
  assert.doesNotMatch(adminPage, /balance|transaction|financialAuditEvent/i);
  assert.match(source("src/reports/export-contract.ts"), /interface ReportExportAdapter/);
});
