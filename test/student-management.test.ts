import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, test } from "node:test";
import Database from "better-sqlite3";
import { createStudentManagement, StudentManagementError, type StudentRecord, type StudentRepository } from "../src/students/domain";
import { studentManagement } from "../src/students/service";
import { studentBody, studentJson } from "../src/students/http";
import { getPrismaClient } from "../src/persistence/prisma";
import { openDatabase } from "../src/persistence/database.js";

const root = resolve(import.meta.dirname, "..");
const directories: string[] = [];

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

const operators = [
  { id: "operator-1", name: "Satu", email: "satu@example.com", active: true },
  { id: "operator-2", name: "Dua", email: "dua@example.com", active: true },
  { id: "operator-inactive", name: "Tidak Aktif", email: "inactive@example.com", active: false }
];

function fixture(seed: Array<Partial<StudentRecord> & { operatorId?: string }> = []) {
  const students: StudentRecord[] = seed.map((item, index) => {
    const owner = operators.find((operator) => operator.id === (item.operatorId ?? "operator-1"))!;
    return { id: item.id ?? `student-${index + 1}`, name: item.name ?? `Siswa ${index + 1}`, notes: item.notes ?? null, status: item.status ?? "ACTIVE", createdAt: item.createdAt ?? new Date("2026-07-20"), updatedAt: item.updatedAt ?? new Date("2026-07-20"), operator: { id: owner.id, name: owner.name, email: owner.email } };
  });
  const repository: StudentRepository = {
    async activeOperator(id) { const found = operators.find((item) => item.id === id && item.active); return found ? { id: found.id, name: found.name, email: found.email } : null; },
    async activeOperators() { return operators.filter((item) => item.active).map(({ id, name, email }) => ({ id, name, email })); },
    async create(data) { const owner = operators.find((item) => item.id === data.operatorId)!; const student = { id: data.id, name: data.name, notes: data.notes, status: data.status, createdAt: new Date(), updatedAt: new Date(), operator: { id: owner.id, name: owner.name, email: owner.email } }; students.push(student); return student; },
    async update(id, data) { const student = students.find((item) => item.id === id)!; const owner = operators.find((item) => item.id === data.operatorId)!; Object.assign(student, { ...data, operator: { id: owner.id, name: owner.name, email: owner.email }, updatedAt: new Date() }); return student; },
    async find(id, operatorId) { return students.find((item) => item.id === id && (!operatorId || item.operator.id === operatorId)) ?? null; },
    async list({ search, status, operatorId, skip, take }) { const filtered = students.filter((item) => (!operatorId || item.operator.id === operatorId) && (!status || item.status === status) && (!search || item.name.toLowerCase().includes(search.toLowerCase()) || item.operator.name.toLowerCase().includes(search.toLowerCase()))); return { items: filtered.slice(skip, skip + take), total: filtered.length }; }
  };
  return { service: createStudentManagement(repository), students };
}

test("Platform Admin creates a normalized Student assigned to an active Operator", async () => {
  const { service } = fixture(); const student = await service.create({ name: "  Alya   Putri ", notes: "  Catatan  ", status: "ACTIVE", operatorId: "operator-1" });
  assert.equal(student.name, "Alya Putri"); assert.equal(student.notes, "Catatan"); assert.equal(student.operator.id, "operator-1");
});

test("create and edit reject missing fields, invalid status, and inactive Operators", async () => {
  const { service } = fixture();
  await assert.rejects(service.create({ name: "", notes: null, status: "ACTIVE", operatorId: "operator-1" }), StudentManagementError);
  await assert.rejects(service.create({ name: "Alya", notes: null, status: "UNKNOWN", operatorId: "operator-1" }), StudentManagementError);
  await assert.rejects(service.create({ name: "Alya", notes: null, status: "ACTIVE", operatorId: "operator-inactive" }), (error: unknown) => error instanceof StudentManagementError && error.code === "INVALID_OPERATOR");
});

test("malformed Student API JSON returns a stable validation response", async () => {
  const response = await studentJson(async () => studentBody(new Request("https://cash.example.com/api/admin/students", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "["
  })));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "VALIDATION");
});

test("edit updates fields and changing Operator transfers ownership", async () => {
  const { service } = fixture([{ id: "student-1" }]);
  await assert.rejects(
    service.edit("student-1", { name: "Nama Baru", notes: "Baru", status: "INACTIVE", operatorId: "operator-2" }, "admin-1"),
    (error: unknown) => error instanceof StudentManagementError && error.code === "VALIDATION"
  );
  const student = await service.edit("student-1", { name: "Nama Baru", notes: "Baru", status: "INACTIVE", operatorId: "operator-2", ownershipTransferReason: "Perubahan penanggung jawab" }, "admin-1");
  assert.equal(student.operator.id, "operator-2"); assert.equal(student.status, "INACTIVE"); assert.equal(student.notes, "Baru");
});

test("ownership transfer and immutable audit commit atomically in SQLite", async () => {
  const directory = join(tmpdir(), `amanah-cash-student-transfer-${crypto.randomUUID()}`);
  mkdirSync(directory, { recursive: true });
  directories.push(directory);
  const databasePath = join(directory, "database.sqlite");
  openDatabase({ databasePath, migrationsPath: resolve(root, "migrations") }).close();
  const database = new Database(databasePath);
  database.pragma("foreign_keys = ON");
  database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('admin-1', 'Admin', 'admin@example.com', 'PLATFORM_ADMIN', 1)").run();
  database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-1', 'Satu', 'one@example.com', 'OPERATOR', 1)").run();
  database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-2', 'Dua', 'two@example.com', 'OPERATOR', 1)").run();
  database.prepare("INSERT INTO students (id, name, operator_id) VALUES ('student-1', 'Alya', 'operator-1')").run();
  database.exec("CREATE TRIGGER fail_transfer_audit BEFORE INSERT ON financial_audit_events WHEN NEW.event_type = 'OWNERSHIP_TRANSFER' BEGIN SELECT RAISE(ABORT, 'forced transfer audit failure'); END");

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
  const service = studentManagement(environment);
  const input = { name: "Alya", notes: null, status: "ACTIVE", operatorId: "operator-2", ownershipTransferReason: "Rotasi wilayah" } as const;
  await assert.rejects(service.edit("student-1", input, "admin-1"));
  assert.equal((database.prepare("SELECT operator_id FROM students WHERE id = 'student-1'").get() as { operator_id: string }).operator_id, "operator-1");
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM financial_audit_events").get() as { count: number }).count, 0);

  database.exec("DROP TRIGGER fail_transfer_audit");
  const student = await service.edit("student-1", input, "admin-1");
  assert.equal(student.operator.id, "operator-2");
  const audit = database.prepare("SELECT event_type, actor_id, actor_role, student_id, transaction_id, reason, old_operator_id, new_operator_id, balance_before FROM financial_audit_events").get() as Record<string, unknown>;
  assert.deepEqual(audit, {
    event_type: "OWNERSHIP_TRANSFER", actor_id: "admin-1", actor_role: "PLATFORM_ADMIN", student_id: "student-1",
    transaction_id: null, reason: "Rotasi wilayah", old_operator_id: "operator-1", new_operator_id: "operator-2", balance_before: null
  });
  assert.throws(() => database.prepare("UPDATE financial_audit_events SET reason = 'changed'").run(), /immutable/);
  database.close();
  await getPrismaClient(environment).$disconnect();
});

test("Operator visibility is ownership-scoped while Platform Admin sees all Students", async () => {
  const { service } = fixture([{ operatorId: "operator-1" }, { operatorId: "operator-2" }]);
  assert.equal((await service.list({ kind: "admin" }, {})).total, 2);
  assert.equal((await service.list({ kind: "operator", operatorId: "operator-1" }, {})).total, 1);
  await assert.rejects(service.detail("student-2", { kind: "operator", operatorId: "operator-1" }), (error: unknown) => error instanceof StudentManagementError && error.code === "NOT_FOUND");
});

test("search covers Student, Operator, status, and server-side pagination", async () => {
  const seed = Array.from({ length: 23 }, (_, index) => ({ name: index === 12 ? "Alya Khusus" : `Siswa ${index}`, operatorId: index % 2 ? "operator-1" : "operator-2", status: index % 2 ? "ACTIVE" as const : "ARCHIVED" as const }));
  const { service } = fixture(seed);
  assert.equal((await service.list({ kind: "admin" }, { search: "khusus" })).total, 1);
  assert.equal((await service.list({ kind: "admin" }, { search: "Satu" })).total, 11);
  const second = await service.list({ kind: "admin" }, { status: "ARCHIVED", page: 2 }); assert.equal(second.total, 12); assert.equal(second.items.length, 2);
});
