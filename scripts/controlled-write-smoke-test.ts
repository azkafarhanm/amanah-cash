import assert from "node:assert/strict";
import crypto from "node:crypto";
import dns from "node:dns";
import { getPrismaClient } from "../src/persistence/prisma";
import { loadAuthenticationEnvironment } from "../src/auth/environment";
import { createPrismaTransactionEngine } from "../src/transactions/service";

dns.setDefaultResultOrder("ipv4first");

export async function runControlledWriteSmokeTest(options: { execute?: boolean } = {}) {
  const isExecute = options.execute ?? process.argv.includes("--execute");

  const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!directUrl || (!directUrl.startsWith("postgres://") && !directUrl.startsWith("postgresql://"))) {
    console.error("ERROR: DIRECT_URL or DATABASE_URL must be provided as a PostgreSQL connection string.");
    console.error("Usage: DIRECT_URL=\"postgresql://...\" npx tsx scripts/controlled-write-smoke-test.ts --execute");
    process.exit(1);
  }

  if (!isExecute) {
    console.log("===============================================================");
    console.log("=== CONTROLLED WRITE SMOKE TEST: SAFETY GATE ACTIVE ===");
    console.log("===============================================================");
    console.log("Safety gate active: No writes performed.");
    console.log("To execute the controlled write smoke test, add the --execute flag:");
    console.log("Usage: DIRECT_URL=\"postgresql://...\" npx tsx scripts/controlled-write-smoke-test.ts --execute");
    return;
  }

  process.env.DATABASE_URL = directUrl;
  process.env.AUTH_DEV_MODE = "true";
  process.env.DEV_SEED_ADMIN_EMAIL = "admin@amanah.local";
  process.env.DEV_SEED_OPERATOR_EMAIL = "operator@amanah.local";
  process.env.NEXTAUTH_SECRET = "12345678901234567890123456789012";
  process.env.NEXTAUTH_URL = "http://localhost:3000";

  const env = loadAuthenticationEnvironment();
  console.log("===============================================================");
  console.log("=== CONTROLLED WRITE SMOKE TEST: NEON POSTGRESQL ===");
  console.log("===============================================================");
  console.log(`Database URL: ${env.databaseUrl.replace(/:[^:@]+@/, ":***@")}`);

  const prisma = getPrismaClient(env);
  const engine = createPrismaTransactionEngine(prisma);

  // -------------------------------------------------------------
  // STEP 1: Read & Record Initial State
  // -------------------------------------------------------------
  console.log("\n[STEP 1] Reading and recording state of 'dev-student'...");
  const initialStudent = await prisma.student.findUnique({
    where: { id: "dev-student" },
    include: { operator: true }
  });
  assert.ok(initialStudent, "Student 'dev-student' must exist in Neon");
  assert.equal(initialStudent.status, "ACTIVE", "'dev-student' must be ACTIVE");

  const initialBalance = BigInt(initialStudent.balance);
  const initialFinancialVersion = Number(initialStudent.financialVersion);
  const initialGlobalTxCount = await prisma.transaction.count();
  const initialGlobalAuditCount = await prisma.financialAuditEvent.count();
  const initialStudentTxCount = await prisma.transaction.count({ where: { studentId: "dev-student" } });
  const initialStudentAuditCount = await prisma.financialAuditEvent.count({ where: { studentId: "dev-student" } });
  const initialAllBalances = await prisma.student.aggregate({ _sum: { balance: true } });
  const initialTotalBalance = BigInt(initialAllBalances._sum.balance ?? 0n);

  console.log("  Initial State Recorded:");
  console.log(`    - Student: ${initialStudent.name} (${initialStudent.id})`);
  console.log(`    - Operator: ${initialStudent.operator.name} (${initialStudent.operator.id})`);
  console.log(`    - Balance: Rp ${initialBalance.toLocaleString("id-ID")}`);
  console.log(`    - Financial Version: ${initialFinancialVersion}`);
  console.log(`    - Student Transactions: ${initialStudentTxCount}`);
  console.log(`    - Student Audit Events: ${initialStudentAuditCount}`);
  console.log(`    - Global Transactions: ${initialGlobalTxCount}`);
  console.log(`    - Global Audit Events: ${initialGlobalAuditCount}`);
  console.log(`    - Total Student Balance: Rp ${initialTotalBalance.toLocaleString("id-ID")}`);

  // -------------------------------------------------------------
  // STEP 2: Execute Controlled DEPOSIT Rp 5.000
  // -------------------------------------------------------------
  console.log("\n[STEP 2] Executing 1 controlled DEPOSIT Rp 5.000 using createPrismaTransactionEngine...");
  const depositTxId = crypto.randomUUID();
  const depositCommandId = crypto.randomUUID();
  const depositCorrelationId = crypto.randomUUID();
  const depositOccurredAt = new Date().toISOString();

  const depositResult = await engine.create({
    actorId: initialStudent.operatorId,
    studentId: initialStudent.id,
    transactionId: depositTxId,
    commandId: depositCommandId,
    correlationId: depositCorrelationId,
    type: "DEPOSIT",
    amount: 5000,
    notes: "Controlled Write Smoke Test: DEPOSIT Rp5.000",
    occurredAt: depositOccurredAt
  });

  console.log("  ✔ DEPOSIT committed to Neon:");
  console.log(`    - Transaction ID: ${depositResult.transaction.id}`);
  console.log(`    - Result Balance: Rp ${BigInt(depositResult.balance).toLocaleString("id-ID")}`);
  console.log(`    - Result Balance Delta: +Rp ${BigInt(depositResult.balanceDelta).toLocaleString("id-ID")}`);
  console.log(`    - Replayed: ${depositResult.replayed}`);

  // -------------------------------------------------------------
  // STEP 3: Verify Post-DEPOSIT Read-Back from PostgreSQL
  // -------------------------------------------------------------
  console.log("\n[STEP 3] Verifying Post-DEPOSIT state via direct read-back from Neon...");
  const postDepositStudent = await prisma.student.findUnique({
    where: { id: "dev-student" }
  });
  assert.ok(postDepositStudent);
  const postDepositBalance = BigInt(postDepositStudent.balance);
  const postDepositFinancialVersion = Number(postDepositStudent.financialVersion);
  const postDepositGlobalTxCount = await prisma.transaction.count();
  const postDepositGlobalAuditCount = await prisma.financialAuditEvent.count();

  const depositTxRecord = await prisma.transaction.findUnique({
    where: { id: depositTxId }
  });
  assert.ok(depositTxRecord, "Deposit transaction must exist in transactions table");
  assert.equal(depositTxRecord.type, "DEPOSIT");
  assert.equal(BigInt(depositTxRecord.amount), 5000n);
  assert.equal(depositTxRecord.studentId, "dev-student");
  assert.equal(depositTxRecord.createdBy, initialStudent.operatorId);
  assert.equal(depositTxRecord.revision, 1);
  assert.equal(depositTxRecord.deletedAt, null);

  const depositAuditEvent = await prisma.financialAuditEvent.findUnique({
    where: { commandId: depositCommandId }
  });
  assert.ok(depositAuditEvent, "Deposit audit event must exist in financial_audit_events table");
  assert.equal(depositAuditEvent.eventType, "CREATE");
  assert.equal(depositAuditEvent.studentId, "dev-student");
  assert.equal(depositAuditEvent.actorId, initialStudent.operatorId);
  assert.equal(depositAuditEvent.transactionId, depositTxId);
  assert.equal(BigInt(depositAuditEvent.balanceBefore ?? 0n), initialBalance);
  assert.equal(BigInt(depositAuditEvent.balanceDelta ?? 0n), 5000n);
  assert.equal(BigInt(depositAuditEvent.balanceAfter ?? 0n), initialBalance + 5000n);
  assert.equal(depositAuditEvent.commandPayloadHash.length, 64);

  assert.equal(postDepositBalance, initialBalance + 5000n);
  assert.equal(postDepositFinancialVersion, initialFinancialVersion + 1);
  assert.equal(postDepositGlobalTxCount, initialGlobalTxCount + 1);
  assert.equal(postDepositGlobalAuditCount, initialGlobalAuditCount + 1);

  console.log("  ✔ Post-DEPOSIT verifications PASSED:");
  console.log(`    - dev-student balance: Rp ${postDepositBalance.toLocaleString("id-ID")}`);
  console.log(`    - financial_version: ${postDepositFinancialVersion} (+1)`);
  console.log(`    - global transactions: ${postDepositGlobalTxCount}`);
  console.log(`    - global audit events: ${postDepositGlobalAuditCount}`);
  console.log(`    - audit math: ${depositAuditEvent.balanceBefore} + ${depositAuditEvent.balanceDelta} = ${depositAuditEvent.balanceAfter} (Verified)`);
  console.log(`    - payload hash: ${depositAuditEvent.commandPayloadHash} (Length: 64)`);

  // -------------------------------------------------------------
  // STEP 4: Execute Controlled Reversal WITHDRAWAL Rp 5.000
  // -------------------------------------------------------------
  console.log("\n[STEP 4] Executing controlled reversal: WITHDRAWAL Rp 5.000 on 'dev-student'...");
  const withdrawalTxId = crypto.randomUUID();
  const withdrawalCommandId = crypto.randomUUID();
  const withdrawalCorrelationId = crypto.randomUUID();
  const withdrawalOccurredAt = new Date().toISOString();

  const withdrawalResult = await engine.create({
    actorId: initialStudent.operatorId,
    studentId: initialStudent.id,
    transactionId: withdrawalTxId,
    commandId: withdrawalCommandId,
    correlationId: withdrawalCorrelationId,
    type: "WITHDRAWAL",
    amount: 5000,
    notes: "Controlled Write Smoke Test: WITHDRAWAL Reversal Rp5.000",
    occurredAt: withdrawalOccurredAt
  });

  console.log("  ✔ WITHDRAWAL reversal committed to Neon:");
  console.log(`    - Transaction ID: ${withdrawalResult.transaction.id}`);
  console.log(`    - Result Balance: Rp ${BigInt(withdrawalResult.balance).toLocaleString("id-ID")}`);
  console.log(`    - Result Balance Delta: -Rp ${(-BigInt(withdrawalResult.balanceDelta)).toLocaleString("id-ID")}`);
  console.log(`    - Replayed: ${withdrawalResult.replayed}`);

  // -------------------------------------------------------------
  // STEP 5: Verify Final State after Reversal
  // -------------------------------------------------------------
  console.log("\n[STEP 5] Verifying final reconciled state from Neon...");
  const finalStudent = await prisma.student.findUnique({
    where: { id: "dev-student" }
  });
  assert.ok(finalStudent);
  const finalBalance = BigInt(finalStudent.balance);
  const finalFinancialVersion = Number(finalStudent.financialVersion);
  const finalGlobalTxCount = await prisma.transaction.count();
  const finalGlobalAuditCount = await prisma.financialAuditEvent.count();
  const finalAllBalances = await prisma.student.aggregate({ _sum: { balance: true } });
  const finalTotalBalance = BigInt(finalAllBalances._sum.balance ?? 0n);

  const withdrawalTxRecord = await prisma.transaction.findUnique({
    where: { id: withdrawalTxId }
  });
  assert.ok(withdrawalTxRecord, "Withdrawal transaction must exist in transactions table");
  assert.equal(withdrawalTxRecord.type, "WITHDRAWAL");
  assert.equal(BigInt(withdrawalTxRecord.amount), 5000n);

  const withdrawalAuditEvent = await prisma.financialAuditEvent.findUnique({
    where: { commandId: withdrawalCommandId }
  });
  assert.ok(withdrawalAuditEvent, "Withdrawal audit event must exist in financial_audit_events table");
  assert.equal(withdrawalAuditEvent.eventType, "CREATE");
  assert.equal(BigInt(withdrawalAuditEvent.balanceBefore ?? 0n), postDepositBalance);
  assert.equal(BigInt(withdrawalAuditEvent.balanceDelta ?? 0n), -5000n);
  assert.equal(BigInt(withdrawalAuditEvent.balanceAfter ?? 0n), initialBalance);
  assert.equal(withdrawalAuditEvent.commandPayloadHash.length, 64);

  assert.equal(finalBalance, initialBalance);
  assert.equal(finalTotalBalance, initialTotalBalance);
  assert.equal(finalFinancialVersion, initialFinancialVersion + 2);
  assert.equal(finalGlobalTxCount, initialGlobalTxCount + 2);
  assert.equal(finalGlobalAuditCount, initialGlobalAuditCount + 2);

  console.log("  ✔ Final state verifications PASSED:");
  console.log(`    - dev-student balance: Rp ${finalBalance.toLocaleString("id-ID")} (Exact match initial)`);
  console.log(`    - Total student balance: Rp ${finalTotalBalance.toLocaleString("id-ID")} (Exact match initial)`);
  console.log(`    - financial_version: ${finalFinancialVersion} (initial + 2)`);
  console.log(`    - Final global transactions: ${finalGlobalTxCount} (+2)`);
  console.log(`    - Final global audit events: ${finalGlobalAuditCount} (+2)`);
  console.log(`    - withdrawal audit math: ${withdrawalAuditEvent.balanceBefore} + (${withdrawalAuditEvent.balanceDelta}) = ${withdrawalAuditEvent.balanceAfter} (Verified)`);

  console.log("\n===============================================================");
  console.log("=== CONTROLLED WRITE SMOKE TEST COMPLETED SUCCESSFULLY ===");
  console.log("===============================================================");
}

if (process.argv[1]?.endsWith("controlled-write-smoke-test.ts")) {
  runControlledWriteSmokeTest().catch((err) => {
    console.error("\n✖ WRITE SMOKE TEST FAILED:", err);
    process.exit(1);
  });
}
