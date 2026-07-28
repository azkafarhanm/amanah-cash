import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";
import Database from "better-sqlite3";
import {
  FINANCIAL_AUDIT_PAGE_SIZE,
  FinancialAuditReadError,
  financialAuditReadService,
  projectFinancialAuditChanges
} from "../src/financial-assurance/audit-read-service";
import { openDatabase } from "../src/persistence/database.js";
import { getPrismaClient } from "../src/persistence/prisma";
import { createTransactionEngine } from "../src/transactions/service";

const root = resolve(import.meta.dirname, "..");
const temporary = join(tmpdir(), `amanah-cash-audit-read-${crypto.randomUUID()}`);
const databasePath = join(temporary, "audit-read.sqlite");
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
const committedAt = new Date("2026-07-25T08:00:00.000Z");

mkdirSync(temporary, { recursive: true });
openDatabase({ databasePath, migrationsPath: resolve(root, "migrations") }).close();

const database = new Database(databasePath);
database.pragma("foreign_keys = ON");
database.defaultSafeIntegers(true);
database.exec(`
  INSERT INTO users (id, name, email, role, is_active)
  VALUES
    ('operator-1', 'Operator Satu', 'one@example.com', 'OPERATOR', 1),
    ('operator-2', 'Operator Dua', 'two@example.com', 'OPERATOR', 1);
  INSERT INTO students (id, name, operator_id, status)
  VALUES
    ('student-1', 'Alya', 'operator-1', 'ACTIVE'),
    ('student-empty', 'Bima', 'operator-1', 'ACTIVE'),
    ('student-transferred', 'Citra', 'operator-2', 'ACTIVE');
`);

const engine = createTransactionEngine(database, () => committedAt);
for (let index = 1; index <= FINANCIAL_AUDIT_PAGE_SIZE + 3; index += 1) {
  engine.create({
    actorId: "operator-1",
    studentId: "student-1",
    transactionId: `transaction-${index}`,
    commandId: `command-${index}`,
    correlationId: `correlation-${index}`,
    type: index % 2 === 0 ? "WITHDRAWAL" : "DEPOSIT",
    amount: index % 2 === 0 ? "1" : "10",
    notes: `Catatan ${index}`,
    occurredAt: committedAt.toISOString()
  });
}
engine.remove({
  actorId: "operator-1",
  studentId: "student-1",
  transactionId: "transaction-1",
  commandId: "command-delete",
  correlationId: "correlation-delete",
  expectedRevision: 1,
  reason: "Duplikat"
});

database.prepare(`
  INSERT INTO financial_audit_events (
    id, command_id, command_payload_hash, event_type, actor_id, actor_role,
    student_id, reason, old_operator_id, new_operator_id, occurred_at,
    schema_version, correlation_id
  ) VALUES (
    'transferred-event', 'transferred-command', ?, 'OWNERSHIP_TRANSFER',
    'operator-2', 'OPERATOR', 'student-transferred', 'Riwayat lama',
    'operator-1', 'operator-2',
    '2026-07-24T08:00:00.000Z', 1, 'transferred-correlation'
  )
`).run("a".repeat(64));

const unsupportedEventId = "unsupported-schema-event";
database.prepare(`
  INSERT INTO financial_audit_events (
    id, command_id, command_payload_hash, event_type, actor_id, actor_role,
    student_id, transaction_id, transaction_revision, after_snapshot,
    balance_before, balance_after, balance_delta, occurred_at, schema_version,
    correlation_id
  ) VALUES (
    ?, 'unsupported-schema-command', ?, 'CREATE', 'operator-1', 'OPERATOR',
    'student-1', 'transaction-1', 1, '{}', 0, 10, 10,
    '2026-07-23T08:00:00.000Z', 99, 'unsupported-schema-correlation'
  )
`).run(unsupportedEventId, "b".repeat(64));

const service = financialAuditReadService(environment);

function persistedState() {
  const students = database.prepare(
    "SELECT id, balance, financial_version FROM students ORDER BY id"
  ).all().map((row) => {
    const value = row as { id: string; balance: bigint; financial_version: bigint };
    return [value.id, value.balance.toString(), value.financial_version.toString()];
  });
  const counts = database.prepare(`
    SELECT
      (SELECT COUNT(*) FROM students) AS students,
      (SELECT COUNT(*) FROM transactions) AS transactions,
      (SELECT COUNT(*) FROM financial_audit_events) AS audits
  `).get() as { students: bigint; transactions: bigint; audits: bigint };
  return {
    students,
    counts: {
      students: counts.students.toString(),
      transactions: counts.transactions.toString(),
      audits: counts.audits.toString()
    }
  };
}

after(async () => {
  await getPrismaClient(environment).$disconnect();
  database.close();
  rmSync(temporary, { recursive: true, force: true });
});

test("timeline is ownership-scoped, immutable, and cursor-paginated by committedAt then id", async () => {
  const before = persistedState();
  const first = await service.timeline("operator-1", "student-1");

  assert.equal(first.items.length, FINANCIAL_AUDIT_PAGE_SIZE);
  assert.equal(first.hasMore, true);
  assert.ok(first.nextCursor);
  assert.deepEqual(
    first.items,
    [...first.items].sort(
      (left, right) =>
        right.committedAt.localeCompare(left.committedAt) ||
        right.id.localeCompare(left.id)
    )
  );

  const second = await service.timeline("operator-1", "student-1", {
    cursor: first.nextCursor!
  });
  assert.equal(second.hasMore, false);
  assert.equal(
    new Set([...first.items, ...second.items].map((item) => item.id)).size,
    FINANCIAL_AUDIT_PAGE_SIZE + 5
  );
  assert.deepEqual(persistedState(), before);
});

test("timeline supports event and optional Jakarta date-range filters", async () => {
  const creates = await service.timeline("operator-1", "student-1", {
    eventType: "CREATE",
    dateFrom: "2026-07-25",
    dateTo: "2026-07-25"
  });
  assert.equal(creates.items.length, FINANCIAL_AUDIT_PAGE_SIZE);
  assert.equal(creates.items.every((item) => item.eventType === "CREATE"), true);

  const outside = await service.timeline("operator-1", "student-1", {
    dateFrom: "2026-07-26",
    dateTo: "2026-07-26"
  });
  assert.deepEqual(outside.items, []);
  assert.equal(outside.nextCursor, null);
  assert.equal(outside.hasMore, false);
});

test("timeline returns an explicit empty owned history", async () => {
  const result = await service.timeline("operator-1", "student-empty");
  assert.equal(result.student.name, "Bima");
  assert.deepEqual(result.items, []);
  assert.equal(result.nextCursor, null);
});

test("missing and cross-owner resources share NOT_FOUND behavior, including transferred ownership", async () => {
  for (const studentId of ["missing", "student-transferred"]) {
    await assert.rejects(
      service.timeline("operator-1", studentId),
      (error: unknown) =>
        error instanceof FinancialAuditReadError &&
        error.code === "NOT_FOUND" &&
        error.status === 404
    );
  }
  const visibleToCurrentOwner = await service.timeline("operator-2", "student-transferred");
  assert.equal(visibleToCurrentOwner.items.length, 1);

  await assert.rejects(
    service.detail("operator-1", "student-1", "transferred-event"),
    (error: unknown) =>
      error instanceof FinancialAuditReadError &&
      error.code === "NOT_FOUND" &&
      error.status === 404
  );
});

test("detail decodes schema v1 into allow-listed typed changes without raw snapshots", async () => {
  const event = database.prepare(`
    SELECT id FROM financial_audit_events
    WHERE student_id = 'student-1' AND event_type = 'DELETE'
    LIMIT 1
  `).get() as { id: string };
  const detail = await service.detail("operator-1", "student-1", event.id);
  const serialized = JSON.stringify(detail);

  assert.equal(detail.detailAvailability, "AVAILABLE");
  assert.deepEqual(detail.changes.map((change) => change.field), ["revision", "deletedAt"]);
  assert.doesNotMatch(serialized, /beforeSnapshot|afterSnapshot|createdBy|updatedBy|deletedBy/);
  assert.equal(detail.balanceEvidence?.delta, "-10");
});

test("unsupported schema returns a typed unavailable detail without snapshot exposure", async () => {
  const detail = await service.detail("operator-1", "student-1", unsupportedEventId);
  assert.equal(detail.schemaVersion, 99);
  assert.equal(detail.detailAvailability, "UNSUPPORTED_SCHEMA");
  assert.deepEqual(detail.changes, []);
  assert.doesNotMatch(JSON.stringify(detail), /Snapshot|Catatan/);
});

test("projection rejects malformed schema-v1 snapshots and allow-lists supported fields", () => {
  assert.deepEqual(
    projectFinancialAuditChanges({
      schemaVersion: 1,
      beforeSnapshot: "{not-json",
      afterSnapshot: null
    }),
    { changes: [], detailAvailability: "UNSUPPORTED_SCHEMA" }
  );

  const projected = projectFinancialAuditChanges({
    schemaVersion: 1,
    beforeSnapshot: null,
    afterSnapshot: JSON.stringify({
      id: "private-transaction-id",
      studentId: "private-student-id",
      type: "DEPOSIT",
      amount: "100",
      correctionDirection: null,
      reason: null,
      notes: "Amanah",
      occurredAt: committedAt.toISOString(),
      createdAt: committedAt.toISOString(),
      createdBy: "private-actor-id",
      updatedAt: committedAt.toISOString(),
      updatedBy: "private-actor-id",
      revision: 1,
      deletedAt: null,
      deletedBy: null
    })
  });
  assert.equal(projected.detailAvailability, "AVAILABLE");
  assert.deepEqual(
    projected.changes.map((change) => change.field),
    ["type", "amount", "notes", "occurredAt", "revision"]
  );
});

test("malformed cursor and filters fail deterministically before data is returned", async () => {
  const invalidQueries = [
    { cursor: "not-a-cursor" },
    { eventType: "UNKNOWN" },
    { dateFrom: "2026-02-30" },
    { dateFrom: "2026-07-26", dateTo: "2026-07-25" }
  ];
  for (const query of invalidQueries) {
    await assert.rejects(
      service.timeline("operator-1", "student-1", query as never),
      (error: unknown) =>
        error instanceof FinancialAuditReadError &&
        error.code === "INVALID_QUERY" &&
        error.status === 400
    );
  }
});
