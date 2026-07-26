import assert from "node:assert/strict";
import { test } from "node:test";
import { withAuthorizationUsing } from "../src/authorization/api";
import { createAuthorization } from "../src/authorization/core";
import {
  reconciliationHttpResponse,
  withPrivateNoStore,
  type FinancialAssuranceReconciliationReader
} from "../src/financial-assurance/http";
import { FinancialAssuranceReadError } from "../src/financial-assurance/read-service";
import type {
  IntegrityStatus,
  ReconciliationResult
} from "../src/financial-assurance/types";

const studentId = "3f456f8a-452c-4cb7-8b38-f6209b8b0ac1";
const request = new Request(
  `https://cash.example.com/api/operator/students/${studentId}/reconciliation`
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

function result(integrityStatus: IntegrityStatus): ReconciliationResult {
  const mismatched = integrityStatus === "MISMATCHED";
  return {
    student: { id: studentId, name: "Alya", status: "ACTIVE" },
    persistedBalance: mismatched ? "1700" : "1600",
    calculatedBalance: "1600",
    difference: mismatched ? "100" : "0",
    activeTransactionCount: 4,
    financialVersion: 6,
    checkedAt: "2026-07-26T08:00:00.000Z",
    integrityStatus
  };
}

function reader(
  operation: FinancialAssuranceReconciliationReader["reconcile"]
): FinancialAssuranceReconciliationReader {
  return { reconcile: operation };
}

function protectedHandler(
  role: "OPERATOR" | "PLATFORM_ADMIN" | null,
  reconciliationReader: FinancialAssuranceReconciliationReader,
  id = studentId
) {
  const handler = withAuthorizationUsing(
    () => authorization(role),
    { role: "operator" },
    async (_request, { authorization: actor }) =>
      reconciliationHttpResponse({
        reader: reconciliationReader,
        operatorId: actor.id,
        studentId: id,
        correlationId: "test-correlation"
      })
  );

  return async () => withPrivateNoStore(await handler(request));
}

test("reconciliation endpoint returns private 401 for an unauthenticated request", async () => {
  let called = false;
  const response = await protectedHandler(null, reader(async () => {
    called = true;
    return result("MATCHED");
  }))();

  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal((await response.json()).error.code, "UNAUTHENTICATED");
  assert.equal(called, false);
});

test("reconciliation endpoint returns private 403 for Platform Admin", async () => {
  let called = false;
  const response = await protectedHandler("PLATFORM_ADMIN", reader(async () => {
    called = true;
    return result("MATCHED");
  }))();

  assert.equal(response.status, 403);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal((await response.json()).error.code, "UNAUTHORIZED");
  assert.equal(called, false);
});

test("reconciliation endpoint validates the Student UUID before invoking the reader", async () => {
  let called = false;
  const response = await protectedHandler("OPERATOR", reader(async () => {
    called = true;
    return result("MATCHED");
  }), "invalid/student")();

  assert.equal(response.status, 400);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await response.json(), {
    error: { code: "INVALID_REQUEST", correlationId: "test-correlation" }
  });
  assert.equal(called, false);
});

test("reconciliation endpoint masks missing and cross-owner Students as the same 404", async () => {
  for (const id of [studentId, "a30d3b93-41ad-49d0-8e40-d468f68cb123"]) {
    const response = await protectedHandler("OPERATOR", reader(async () => {
      throw new FinancialAssuranceReadError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
    }), id)();

    assert.equal(response.status, 404);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(await response.json(), {
      error: { code: "RESOURCE_NOT_FOUND", correlationId: "test-correlation" }
    });
  }
});

test("reconciliation endpoint returns Batch 1A MATCHED, MISMATCHED, and UNAVAILABLE DTOs unchanged", async () => {
  for (const status of ["MATCHED", "MISMATCHED", "UNAVAILABLE"] as const) {
    const expected = result(status);
    const response = await protectedHandler(
      "OPERATOR",
      reader(async (operatorId, requestedStudentId) => {
        assert.equal(operatorId, "actor-1");
        assert.equal(requestedStudentId, studentId);
        return expected;
      })
    )();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(await response.json(), expected);
  }
});

test("reconciliation endpoint maps unexpected failures without exposing raw errors", async () => {
  const response = await protectedHandler("OPERATOR", reader(async () => {
    throw new Error("raw Prisma connection detail");
  }))();
  const body = await response.text();

  assert.equal(response.status, 500);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.doesNotMatch(body, /Prisma|connection detail/);
  assert.deepEqual(JSON.parse(body), {
    error: { code: "UNAVAILABLE", correlationId: "test-correlation" }
  });
});
