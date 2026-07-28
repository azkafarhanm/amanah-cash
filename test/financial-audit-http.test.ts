import assert from "node:assert/strict";
import { test } from "node:test";
import { withAuthorizationUsing } from "../src/authorization/api";
import { createAuthorization } from "../src/authorization/core";
import {
  financialAuditDetailHttpResponse,
  financialAuditTimelineHttpResponse,
  withPrivateNoStore,
  type FinancialAuditReader
} from "../src/financial-assurance/http";
import { FinancialAuditReadError } from "../src/financial-assurance/audit-read-service";
import type {
  FinancialAuditDetail,
  FinancialAuditTimelineResult
} from "../src/financial-assurance/types";

const studentId = "3f456f8a-452c-4cb7-8b38-f6209b8b0ac1";
const auditEventId = "a30d3b93-41ad-49d0-8e40-d468f68cb123";
const request = new Request(
  `https://cash.example.com/api/operator/reconciliation/students/${studentId}/audit?cursor=opaque-cursor&eventType=CREATE&startDate=2026-07-20&endDate=2026-07-21`
);

function authorization(role: "OPERATOR" | "PLATFORM_ADMIN" | null) {
  return createAuthorization({
    async resolveSessionUserId() {
      return role ? "actor-1" : null;
    },
    async findActiveUser(id) {
      return role ? { id, role, isActive: true } : null;
    },
    async findOwnedStudent() {
      return null;
    }
  });
}

function timelineResult(): FinancialAuditTimelineResult {
  return {
    student: { id: studentId, name: "Alya", status: "ACTIVE" },
    items: [{
      id: auditEventId,
      eventType: "CREATE",
      committedAt: "2026-07-21T08:00:00.000Z",
      actor: { name: "Operator Satu", role: "OPERATOR" },
      transactionId: "transaction-1",
      transactionRevision: 1,
      reason: null,
      balanceEvidence: { before: "0", after: "1000", delta: "1000" },
      detailAvailability: "AVAILABLE"
    }],
    nextCursor: "opaque-cursor",
    hasMore: true
  };
}

function detailResult(availability: FinancialAuditDetail["detailAvailability"]): FinancialAuditDetail {
  return {
    id: auditEventId,
    eventType: "CREATE",
    committedAt: "2026-07-21T08:00:00.000Z",
    actor: { name: "Operator Satu", role: "OPERATOR" },
    transactionId: "transaction-1",
    transactionRevision: 1,
    reason: null,
    schemaVersion: availability === "AVAILABLE" ? 1 : 99,
    balanceEvidence: { before: "0", after: "1000", delta: "1000" },
    changes: [],
    detailAvailability: availability
  };
}

function reader(input: FinancialAuditReader): FinancialAuditReader {
  return input;
}

function protectedTimeline(
  role: "OPERATOR" | "PLATFORM_ADMIN" | null,
  auditReader: FinancialAuditReader,
  id = studentId,
  parameters = new URL(request.url).searchParams
) {
  const handler = withAuthorizationUsing(
    () => authorization(role),
    { role: "operator" },
    async (_request, { authorization: actor }) => financialAuditTimelineHttpResponse({
      reader: auditReader,
      operatorId: actor.id,
      studentId: id,
      parameters,
      correlationId: "test-correlation"
    })
  );
  return async () => withPrivateNoStore(await handler(request));
}

function protectedDetail(
  role: "OPERATOR" | "PLATFORM_ADMIN" | null,
  auditReader: FinancialAuditReader,
  id = studentId,
  eventId = auditEventId
) {
  const handler = withAuthorizationUsing(
    () => authorization(role),
    { role: "operator" },
    async (_request, { authorization: actor }) => financialAuditDetailHttpResponse({
      reader: auditReader,
      operatorId: actor.id,
      studentId: id,
      auditEventId: eventId,
      correlationId: "test-correlation"
    })
  );
  return async () => withPrivateNoStore(await handler(request));
}

test("audit timeline endpoint requires an authenticated Operator", async () => {
  for (const role of [null, "PLATFORM_ADMIN"] as const) {
    let called = false;
    const response = await protectedTimeline(role, reader({
      async timeline() {
        called = true;
        return timelineResult();
      },
      async detail() {
        return detailResult("AVAILABLE");
      }
    }))();
    assert.equal(response.status, role === null ? 401 : 403);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(called, false);
  }
});

test("audit timeline endpoint forwards typed query parameters and DTO unchanged", async () => {
  const expected = timelineResult();
  const response = await protectedTimeline("OPERATOR", reader({
    async timeline(operatorId, requestedStudentId, query) {
      assert.equal(operatorId, "actor-1");
      assert.equal(requestedStudentId, studentId);
      assert.deepEqual(query, {
        cursor: "opaque-cursor",
        eventType: "CREATE",
        dateFrom: "2026-07-20",
        dateTo: "2026-07-21"
      });
      return expected;
    },
    async detail() {
      return detailResult("AVAILABLE");
    }
  }))();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await response.json(), expected);
});

test("audit timeline maps malformed filters and missing or cross-owner Students safely", async () => {
  const failures = [
    new FinancialAuditReadError("INVALID_QUERY", "Cursor audit tidak valid.", 400),
    new FinancialAuditReadError("NOT_FOUND", "Siswa tidak ditemukan.", 404)
  ];
  for (const failure of failures) {
    const response = await protectedTimeline("OPERATOR", reader({
      async timeline() {
        throw failure;
      },
      async detail() {
        return detailResult("AVAILABLE");
      }
    }))();
    assert.equal(response.status, failure.status);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(await response.json(), {
      error: {
        code: failure.code === "INVALID_QUERY" ? "INVALID_QUERY" : "RESOURCE_NOT_FOUND",
        correlationId: "test-correlation"
      }
    });
  }
});

test("audit endpoints reject malformed UUID parameters before invoking the reader", async () => {
  let called = false;
  const auditReader = reader({
    async timeline() {
      called = true;
      return timelineResult();
    },
    async detail() {
      called = true;
      return detailResult("AVAILABLE");
    }
  });
  const timeline = await protectedTimeline("OPERATOR", auditReader, "bad-student")();
  const detail = await protectedDetail("OPERATOR", auditReader, studentId, "bad-event")();

  for (const response of [timeline, detail]) {
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: { code: "INVALID_REQUEST", correlationId: "test-correlation" }
    });
  }
  assert.equal(called, false);
});

test("audit detail preserves the typed unsupported-schema response", async () => {
  const expected = detailResult("UNSUPPORTED_SCHEMA");
  const response = await protectedDetail("OPERATOR", reader({
    async timeline() {
      return timelineResult();
    },
    async detail(operatorId, requestedStudentId, requestedAuditEventId) {
      assert.equal(operatorId, "actor-1");
      assert.equal(requestedStudentId, studentId);
      assert.equal(requestedAuditEventId, auditEventId);
      return expected;
    }
  }))();

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), expected);
});

test("audit detail masks a missing event and never exposes internal failures", async () => {
  const notFound = await protectedDetail("OPERATOR", reader({
    async timeline() {
      return timelineResult();
    },
    async detail() {
      throw new FinancialAuditReadError("NOT_FOUND", "Audit tidak ditemukan.", 404);
    }
  }))();
  assert.equal(notFound.status, 404);
  assert.deepEqual(await notFound.json(), {
    error: { code: "RESOURCE_NOT_FOUND", correlationId: "test-correlation" }
  });

  const unavailable = await protectedDetail("OPERATOR", reader({
    async timeline() {
      return timelineResult();
    },
    async detail() {
      throw new Error("raw Prisma snapshot");
    }
  }))();
  assert.equal(unavailable.status, 500);
  assert.doesNotMatch(await unavailable.text(), /Prisma|snapshot/);
});
