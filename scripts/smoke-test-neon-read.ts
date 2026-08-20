import assert from "node:assert/strict";
import dns from "node:dns";
import { getPrismaClient } from "../src/persistence/prisma";
import { loadAuthenticationEnvironment } from "../src/auth/environment";
import { studentManagement } from "../src/students/service";
import { transactionReadService } from "../src/transactions/read-service";
import { dashboardReadService } from "../src/dashboard/read-service";
import { reportReadService } from "../src/reports/read-service";
import { financialAuditReadService } from "../src/financial-assurance/audit-read-service";

dns.setDefaultResultOrder("ipv4first");

async function main() {
  const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!directUrl || (!directUrl.startsWith("postgres://") && !directUrl.startsWith("postgresql://"))) {
    console.error("ERROR: DIRECT_URL or DATABASE_URL must be provided as a PostgreSQL connection string.");
    process.exit(1);
  }

  // Ensure environment is configured for PostgreSQL
  process.env.DATABASE_URL = directUrl;
  process.env.AUTH_DEV_MODE = "true";
  process.env.DEV_SEED_ADMIN_EMAIL = "admin@amanah.local";
  process.env.DEV_SEED_OPERATOR_EMAIL = "operator@amanah.local";
  process.env.NEXTAUTH_SECRET = "12345678901234567890123456789012";
  process.env.NEXTAUTH_URL = "http://localhost:3000";

  const env = loadAuthenticationEnvironment();
  console.log("===============================================================");
  console.log("=== PHASE 4: POST-WRITE APPLICATION SMOKE TEST ON NEON ===");
  console.log("===============================================================");
  console.log(`Database URL: ${env.databaseUrl.replace(/:[^:@]+@/, ":***@")}`);

  const prisma = getPrismaClient(env);

  // 1. Test Users via Prisma Client
  console.log("\n1. Testing User queries via Prisma (Neon PostgreSQL)...");
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { settings: true, accounts: true }
  });
  console.log(`  ✔ Found ${users.length} users:`);
  for (const u of users) {
    console.log(`    - ${u.name} (${u.email}) [Role: ${u.role}, Active: ${u.isActive}, Theme: ${u.settings?.theme ?? "NONE"}]`);
  }
  assert.equal(users.length, 4, `Expected 4 users, got ${users.length}`);

  // Find operators
  const operators = users.filter((u) => u.role === "OPERATOR" && u.isActive);
  assert.ok(operators.length > 0, "Expected at least 1 active operator");
  const mainOperator = operators[0];

  // 2. Test Student Management Read Service
  console.log("\n2. Testing Student Management Service (src/students/service.ts)...");
  const studentSvc = studentManagement(env);
  const studentList = await studentSvc.list({ kind: "admin" }, { pageSize: 50 });
  console.log(`  ✔ Found ${studentList.items.length} students via studentManagement.list:`);
  let totalStudentBalanceBigInt = 0n;
  for (const s of studentList.items) {
    const bal = BigInt(s.balance ?? 0);
    totalStudentBalanceBigInt += bal;
    console.log(`    - [${s.id}] ${s.name}: Rp ${bal.toLocaleString("id-ID")} (Status: ${s.status}, Operator: ${s.operator.name})`);
  }
  assert.equal(studentList.items.length, 4, `Expected 4 students, got ${studentList.items.length}`);
  assert.equal(totalStudentBalanceBigInt, 519000n, `Expected total student balance 519000, got ${totalStudentBalanceBigInt}`);

  // Verify dev-student state specifically
  const devStudent = await prisma.student.findUnique({
    where: { id: "dev-student" }
  });
  assert.ok(devStudent, "'dev-student' must exist");
  assert.equal(BigInt(devStudent.balance), 3000n, `'dev-student' balance must be 3000, got ${devStudent.balance}`);
  assert.equal(Number(devStudent.financialVersion), 9, `'dev-student' financial_version must be 9, got ${devStudent.financialVersion}`);
  console.log(`  ✔ 'dev-student' post-write state verified: balance Rp ${BigInt(devStudent.balance).toLocaleString("id-ID")}, financial_version ${devStudent.financialVersion}`);

  // 3. Test Transactions & Workspace History Read Service
  console.log("\n3. Testing Transaction Read Service (src/transactions/read-service.ts)...");
  const allTransactions = await prisma.transaction.findMany({
    orderBy: { occurredAt: "desc" },
    include: { student: { select: { name: true } }, creator: { select: { name: true } } }
  });
  console.log(`  ✔ Total transactions in Neon: ${allTransactions.length}`);
  assert.equal(allTransactions.length, 44, `Expected 44 transactions, got ${allTransactions.length}`);

  const activeTxs = allTransactions.filter((t) => !t.deletedAt);
  const deletedTxs = allTransactions.filter((t) => t.deletedAt);
  console.log(`    - Active transactions: ${activeTxs.length}`);
  console.log(`    - Soft-deleted transactions: ${deletedTxs.length}`);

  // Test workspaceHistory & history for operator
  const txReadSvc = transactionReadService(env);
  const workspaceData = await txReadSvc.workspaceHistory(mainOperator.id, {});
  console.log(`  ✔ transactionReadService.workspaceHistory for operator ${mainOperator.name}: ${workspaceData.total} total transactions, summary:`, workspaceData.summary);

  const firstStudent = studentList.items[0];
  const historyData = await txReadSvc.history(firstStudent.id, firstStudent.operator.id, {});
  console.log(`  ✔ transactionReadService.history for student ${firstStudent.name}: ${historyData.total} items, balance: Rp ${BigInt(historyData.balance).toLocaleString("id-ID")}`);

  // 4. Test Financial Audit Events & Audit Read Service
  console.log("\n4. Testing Financial Audit Read Service (src/financial-assurance/audit-read-service.ts)...");
  const auditEvents = await prisma.financialAuditEvent.findMany({
    orderBy: { occurredAt: "desc" }
  });
  console.log(`  ✔ Total financial audit events in Neon: ${auditEvents.length}`);
  assert.equal(auditEvents.length, 51, `Expected 51 financial audit events, got ${auditEvents.length}`);

  // Validate audit invariants across all events
  for (const fa of auditEvents) {
    assert.equal(fa.commandPayloadHash.length, 64, `Audit ${fa.id} payload hash length must be 64`);
    if (fa.eventType !== "OWNERSHIP_TRANSFER" && fa.balanceBefore !== null && fa.balanceAfter !== null && fa.balanceDelta !== null) {
      const before = BigInt(fa.balanceBefore);
      const delta = BigInt(fa.balanceDelta);
      const after = BigInt(fa.balanceAfter);
      assert.equal(before + delta, after, `Audit ${fa.id} balance math mismatch: ${before} + ${delta} !== ${after}`);
    }
  }
  console.log(`  ✔ All 51 financial audit events verified (64-char hash and balance transition math).`);

  const auditSvc = financialAuditReadService(env);
  const auditTimeline = await auditSvc.timeline(firstStudent.operator.id, firstStudent.id, {});
  console.log(`  ✔ financialAuditReadService.timeline for ${firstStudent.name}: ${auditTimeline.items.length} events returned`);

  // 5. Test Dashboard Read Service
  console.log("\n5. Testing Dashboard Read Service (src/dashboard/read-service.ts)...");
  const dashboardSvc = dashboardReadService(env);
  const operatorDashboard = await dashboardSvc.operator(mainOperator.id);
  console.log(`  ✔ Operator dashboard (${mainOperator.name}): Managed Students=${operatorDashboard.students.total}, Managed Balance=Rp ${BigInt(operatorDashboard.managedBalance).toLocaleString("id-ID")}`);

  const adminDashboard = await dashboardSvc.admin();
  console.log(`  ✔ Admin dashboard: Active Operators=${adminDashboard.operators.active}, Total Students=${adminDashboard.students.total}, Distribution: ${adminDashboard.studentDistribution.map(d => `${d.operatorName}: ${d.studentCount} students`).join(", ")}`);

  // 6. Test Reports Read Service (Operator & Admin)
  console.log("\n6. Testing Reports Read Service (src/reports/read-service.ts)...");
  const reportSvc = reportReadService(env);
  const opReport = await reportSvc.operator(mainOperator.id, { period: "all" });
  console.log(`  ✔ Operator report generated: ${opReport.items.length} items, total: ${opReport.total}`);

  const adminReport = await reportSvc.admin({ period: "all" });
  console.log(`  ✔ Admin report generated: ${adminReport.items.length} items, total: ${adminReport.total}`);

  // 7. Verify Total Rows across All 9 Tables
  console.log("\n7. Verifying total row counts across all 9 application tables...");
  const tableCounts = {
    users: await prisma.user.count(),
    settings_preferences: await prisma.settingsPreference.count(),
    accounts: await prisma.account.count(),
    sessions: await prisma.session.count(),
    operator_audit: await prisma.operatorAudit.count(),
    maintenance_audit_events: await prisma.maintenanceAuditEvent.count(),
    students: await prisma.student.count(),
    transactions: await prisma.transaction.count(),
    financial_audit_events: await prisma.financialAuditEvent.count()
  };

  let totalRows = 0;
  for (const [t, count] of Object.entries(tableCounts)) {
    totalRows += count;
    console.log(`    - ${t}: ${count} rows`);
  }
  assert.equal(totalRows, 116, `Expected 116 total rows, got ${totalRows}`);
  console.log(`  ✔ Total rows in Neon: ${totalRows} (112 initial + 2 transactions + 2 audits = 116 rows confirmed)`);

  console.log("\n===============================================================");
  console.log("=== ALL POST-WRITE APPLICATION SMOKE TESTS PASSED (100%) ===");
  console.log("===============================================================");
}

main().catch((err) => {
  console.error("\n✖ SMOKE TEST FAILED:", err);
  process.exit(1);
});
