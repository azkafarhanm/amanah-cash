import assert from "node:assert/strict";
import { test } from "node:test";
import { reconciliationResult } from "../src/financial-assurance/read-service";

const student = {
  id: "student-1",
  name: "Alya",
  status: "ACTIVE"
} as const;
const checkedAt = new Date("2026-07-26T08:00:00.000Z");

test("reconciliation domain evaluation returns MATCHED for equal exact-IDR balances", () => {
  assert.deepEqual(reconciliationResult({
    student,
    persistedBalance: BigInt(1600),
    calculatedBalance: BigInt(1600),
    activeTransactionCount: 4,
    financialVersion: 6,
    checkedAt
  }), {
    student,
    persistedBalance: "1600",
    calculatedBalance: "1600",
    difference: "0",
    activeTransactionCount: 4,
    financialVersion: 6,
    checkedAt: checkedAt.toISOString(),
    integrityStatus: "MATCHED"
  });
});

test("reconciliation domain evaluation returns MISMATCHED with an exact signed difference", () => {
  const result = reconciliationResult({
    student,
    persistedBalance: BigInt(1500),
    calculatedBalance: BigInt(1600),
    activeTransactionCount: 4,
    financialVersion: 6,
    checkedAt
  });

  assert.equal(result.difference, "-100");
  assert.equal(result.integrityStatus, "MISMATCHED");
});
