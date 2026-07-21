import assert from "node:assert/strict";
import { test } from "node:test";
import { createOperatorManagement, OperatorManagementError, type OperatorRecord, type OperatorRepository } from "../src/operators/domain";
import { operatorBody, operatorJson } from "../src/operators/http";

function fixture(seed: Partial<OperatorRecord>[] = []) {
  const operators = seed.map((value, index): OperatorRecord => ({ id: `operator-${index + 1}`, name: "Operator", email: `operator${index + 1}@example.com`, isActive: false, createdAt: new Date("2026-07-20T00:00:00Z"), lastLoginAt: null, deletedAt: null, assignedStudentCount: 0, ...value }));
  const audit: Array<{ operatorId: string; actorId: string; action: string; summary: string; createdAt: Date }> = [];
  const revoked: string[] = [];
  const repository: OperatorRepository = {
    async findByEmail(email) { return operators.find((item) => item.email === email) ?? null; },
    async create(data) { const item: OperatorRecord = { id: `operator-${operators.length + 1}`, ...data, isActive: false, createdAt: new Date(), lastLoginAt: null, deletedAt: null, assignedStudentCount: 0 }; operators.push(item); return item; },
    async find(id) { return operators.find((item) => item.id === id) ?? null; },
    async update(id, data) { const item = operators.find((candidate) => candidate.id === id)!; Object.assign(item, data); return item; },
    async revokeSessions(id) { revoked.push(id); },
    async audit(data) { audit.push({ ...data, createdAt: new Date() }); },
    async audits(id) { return audit.filter((item) => item.operatorId === id); },
    async list({ search, status, skip, take }) { const filtered = operators.filter((item) => !item.deletedAt && (!search || item.name.toLowerCase().includes(search.toLowerCase()) || item.email.includes(search.toLowerCase())) && (!status || item.isActive === (status === "active"))); return { items: filtered.slice(skip, skip + take), total: filtered.length }; }
  };
  return { service: createOperatorManagement(repository), operators, audit, revoked };
}

test("create normalizes email and provisions an inactive Operator", async () => {
  const { service, audit } = fixture();
  const operator = await service.create({ name: "  Siti   Aminah ", email: " SITI@Example.COM " }, "admin");
  assert.equal(operator.name, "Siti Aminah"); assert.equal(operator.email, "siti@example.com"); assert.equal(operator.isActive, false); assert.equal(audit[0].action, "CREATED");
});

test("duplicate and invalid email are rejected server-side", async () => {
  const { service } = fixture([{ email: "siti@example.com" }]);
  await assert.rejects(service.create({ name: "Siti", email: "SITI@example.com" }, "admin"), (error: unknown) => error instanceof OperatorManagementError && error.code === "DUPLICATE_EMAIL");
  await assert.rejects(service.create({ name: "Siti", email: "not-an-email" }, "admin"), (error: unknown) => error instanceof OperatorManagementError && error.code === "VALIDATION");
});

test("malformed Operator API JSON returns a stable validation response", async () => {
  const response = await operatorJson(async () => operatorBody(new Request("https://cash.example.com/api/admin/operators", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{"
  })));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "VALIDATION");
});

test("edit changes name and activation status but never accepts identity fields", async () => {
  const { service, operators } = fixture([{ email: "fixed@example.com" }]);
  const updated = await service.edit("operator-1", { name: "Nama Baru", isActive: true }, "admin");
  assert.equal(updated.name, "Nama Baru"); assert.equal(updated.isActive, true); assert.equal(operators[0].email, "fixed@example.com");
});

test("inactive Operator remains provisioned but cannot be inferred as active", async () => {
  const { service } = fixture([{}]);
  assert.equal((await service.detail("operator-1")).isActive, false);
});

test("deactivation fails while Students remain assigned", async () => {
  const { service } = fixture([{ isActive: true, assignedStudentCount: 2 }]);
  await assert.rejects(service.edit("operator-1", { name: "Operator", isActive: false }, "admin"), (error: unknown) => error instanceof OperatorManagementError && error.code === "ASSIGNED_STUDENTS");
});

test("deactivation succeeds with no Students and revokes sessions", async () => {
  const { service, revoked } = fixture([{ isActive: true }]);
  assert.equal((await service.edit("operator-1", { name: "Operator", isActive: false }, "admin")).isActive, false); assert.deepEqual(revoked, ["operator-1"]);
});

test("delete is soft, preserves audit, and only succeeds without assigned Students", async () => {
  const blocked = fixture([{ assignedStudentCount: 1 }]);
  await assert.rejects(blocked.service.remove("operator-1", "admin"), (error: unknown) => error instanceof OperatorManagementError && error.code === "ASSIGNED_STUDENTS");
  const allowed = fixture([{}]); await allowed.service.remove("operator-1", "admin");
  assert.ok(allowed.operators[0].deletedAt); assert.equal(allowed.operators[0].isActive, false); assert.equal(allowed.audit.at(-1)?.action, "DELETED");
});

test("search, status filtering, and pagination are server-side", async () => {
  const seed = Array.from({ length: 23 }, (_, index) => ({ name: index === 12 ? "Siti Khusus" : `Operator ${index}`, email: `person${index}@example.com`, isActive: index % 2 === 0 }));
  const { service } = fixture(seed);
  const search = await service.list({ search: "khusus", page: 1 }); assert.equal(search.total, 1);
  const page = await service.list({ status: "active", page: 2 }); assert.equal(page.total, 12); assert.equal(page.items.length, 2); assert.equal(page.pages, 2);
});
