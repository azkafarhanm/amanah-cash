import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";
import Database from "better-sqlite3";
import { openDatabase } from "../src/persistence/database.js";
import { getPrismaClient } from "../src/persistence/prisma";
import { studentManagement } from "../src/students/service";
import { StudentManagementError } from "../src/students/domain";
import { createTransactionEngine } from "../src/transactions/service";
import { withAuthorizationUsing } from "../src/authorization/api";
import { postOperatorStudentHandler } from "../src/app/api/operator/students/route";
import { createAuthorization } from "../src/authorization/core";

const root = resolve(import.meta.dirname, "..");
const temporary = join(tmpdir(), `amanah-cash-operator-provision-${crypto.randomUUID()}`);
const databasePath = join(temporary, "database.sqlite");
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

process.env.DATABASE_URL = environment.databaseUrl;
process.env.GOOGLE_CLIENT_ID = environment.googleClientId;
process.env.GOOGLE_CLIENT_SECRET = environment.googleClientSecret;
process.env.NEXTAUTH_SECRET = environment.nextAuthSecret;
process.env.NEXTAUTH_URL = environment.nextAuthUrl;

mkdirSync(temporary, { recursive: true });
openDatabase({ databasePath, migrationsPath: resolve(root, "migrations") }).close();
const database = new Database(databasePath);
database.pragma("foreign_keys = ON");

// Seed test users
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('admin-1', 'Platform Admin', 'admin@example.com', 'PLATFORM_ADMIN', 1)").run();
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-1', 'Operator Alpha', 'alpha@example.com', 'OPERATOR', 1)").run();
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-2', 'Operator Beta', 'beta@example.com', 'OPERATOR', 1)").run();
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-inactive', 'Operator Inactive', 'inactive@example.com', 'OPERATOR', 0)").run();

after(async () => {
  await getPrismaClient(environment).$disconnect();
  database.close();
  rmSync(temporary, { recursive: true, force: true });
});

test("Operator can create student assigned to self, setting status ACTIVE and recording STUDENT_CREATE audit log", async () => {
  const service = studentManagement(environment);
  const student = await service.createByOperator("operator-1", {
    name: "  Rizky   Kurniawan ",
    kelas: "10B",
    notes: "Santri baru"
  });

  assert.equal(student.name, "Rizky Kurniawan");
  assert.equal(student.notes, "10B - Santri baru");
  assert.equal(student.status, "ACTIVE");
  assert.equal(student.operator.id, "operator-1");

  // Verify OperatorAudit log in SQLite
  const audit = database.prepare("SELECT operator_id, actor_id, action, summary FROM operator_audit WHERE action = 'STUDENT_CREATE' ORDER BY created_at DESC LIMIT 1").get() as Record<string, unknown>;
  assert.deepEqual(audit, {
    operator_id: "operator-1",
    actor_id: "operator-1",
    action: "STUDENT_CREATE",
    summary: "Menambahkan siswa baru: Rizky Kurniawan"
  });
});

test("createByOperator rejects inactive operator or missing student name", async () => {
  const service = studentManagement(environment);

  await assert.rejects(
    service.createByOperator("operator-inactive", { name: "Farhan" }),
    (error: unknown) => error instanceof StudentManagementError && error.code === "INVALID_OPERATOR"
  );

  await assert.rejects(
    service.createByOperator("operator-1", { name: "   " }),
    (error: unknown) => error instanceof StudentManagementError && error.code === "VALIDATION"
  );
});

test("POST /api/operator/students ignores spoofed operatorId and binds student to session operator", async () => {
  const mockAuthService = (role: "OPERATOR" | "PLATFORM_ADMIN" | null, userId = "operator-1") => createAuthorization({
    async resolveSessionUserId() { return role ? userId : null; },
    async findActiveUser(id) {
      if (!role) return null;
      return { id, role, isActive: true };
    },
    async findOwnedStudent() { return null; }
  });

  const requestBody = JSON.stringify({
    name: "Dewi Lestari",
    kelas: "11A",
    notes: "Catatan khusus",
    operatorId: "operator-2" // Spoofed operatorId attempt from client
  });

  const request = new Request("http://localhost:3000/api/operator/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: requestBody
  });

  const handler = withAuthorizationUsing(() => mockAuthService("OPERATOR", "operator-1"), { role: "operator" }, postOperatorStudentHandler);
  const response = await handler(request);
  assert.equal(response.status, 201);

  const data = (await response.json()) as { id: string; name: string; operator: { id: string } };
  assert.equal(data.name, "Dewi Lestari");
  // Operator MUST be bound to session operator (operator-1), ignoring the client spoofed operator-2
  assert.equal(data.operator.id, "operator-1");
});

test("POST /api/operator/students rejects unauthenticated and admin requests", async () => {
  const mockAuthService = (role: "OPERATOR" | "PLATFORM_ADMIN" | null, userId = "admin-1") => createAuthorization({
    async resolveSessionUserId() { return role ? userId : null; },
    async findActiveUser(id) { return role ? { id, role, isActive: true } : null; },
    async findOwnedStudent() { return null; }
  });

  const request = new Request("http://localhost:3000/api/operator/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Testing Auth" })
  });

  // Unauthenticated returns 401
  const unauthRes = await withAuthorizationUsing(() => mockAuthService(null), { role: "operator" }, postOperatorStudentHandler)(request);
  assert.equal(unauthRes.status, 401);

  // Platform Admin returns 403
  const adminRes = await withAuthorizationUsing(() => mockAuthService("PLATFORM_ADMIN", "admin-1"), { role: "operator" }, postOperatorStudentHandler)(request);
  assert.equal(adminRes.status, 403);
});

test("Newly created student is visible to creator & admin, isolated from other operators, and can immediately receive transactions", async () => {
  const service = studentManagement(environment);
  const newStudent = await service.createByOperator("operator-2", {
    name: "Siswa Beta Direct",
    kelas: "12C"
  });

  // Creator operator-2 can detail the student
  const detailOperator2 = await service.detail(newStudent.id, { kind: "operator", operatorId: "operator-2" });
  assert.equal(detailOperator2.id, newStudent.id);

  // Platform Admin can detail the student
  const detailAdmin = await service.detail(newStudent.id, { kind: "admin" });
  assert.equal(detailAdmin.id, newStudent.id);

  // Other operator-1 CANNOT see or access this student
  await assert.rejects(
    service.detail(newStudent.id, { kind: "operator", operatorId: "operator-1" }),
    (error: unknown) => error instanceof StudentManagementError && error.code === "NOT_FOUND"
  );

  // Immediately record transaction for the newly provisioned student
  const engine = createTransactionEngine(database, () => new Date("2026-07-25T10:00:00Z"));
  const tx = engine.create({
    actorId: "operator-2",
    studentId: newStudent.id,
    transactionId: crypto.randomUUID(),
    commandId: crypto.randomUUID(),
    correlationId: crypto.randomUUID(),
    type: "DEPOSIT",
    amount: "150000",
    notes: "Setoran awal siswa baru",
    occurredAt: "2026-07-25T10:00:00Z"
  });

  assert.equal(tx.balance, "150000");
});
