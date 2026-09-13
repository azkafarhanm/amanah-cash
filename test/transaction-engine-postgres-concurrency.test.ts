import assert from "node:assert/strict";
import crypto from "node:crypto";
import { test } from "node:test";
import type { PrismaClient } from "../src/generated/prisma/client";
import { TransactionEngineError } from "../src/transactions/domain";
import { createPrismaTransactionEngine } from "../src/transactions/service";

class FakePrismaKnownRequestError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "PrismaClientKnownRequestError";
  }
}

function fakeClient(transactionError: unknown): PrismaClient {
  return { $transaction: async () => { throw transactionError; } } as unknown as PrismaClient;
}

const validCreate = () => ({
  actorId: "operator-1", studentId: "student-1", transactionId: crypto.randomUUID(), commandId: crypto.randomUUID(),
  correlationId: crypto.randomUUID(), type: "DEPOSIT" as const, amount: "1000", occurredAt: "2026-07-20T10:00:00.000Z"
});

test("a second writer that loses the row-lock race past Prisma's interactive-transaction budget (P2028) is reported as retryable, not a raw 500", async () => {
  const engine = createPrismaTransactionEngine(fakeClient(new FakePrismaKnownRequestError("P2028", "Transaction API error: Transaction already closed: A query cannot be executed on an expired transaction. The timeout for this transaction was 5000 ms, however 5123 ms passed since the start of the transaction.")));
  await assert.rejects(
    () => engine.create(validCreate()),
    (error: unknown) => error instanceof TransactionEngineError && error.code === "UNAVAILABLE" && error.status === 503 && error.retryable === true
  );
});

test("an unrelated Prisma error code is not misclassified as a retryable busy error", async () => {
  const engine = createPrismaTransactionEngine(fakeClient(new FakePrismaKnownRequestError("P2025", "An operation failed because it depends on one or more records that were required but not found.")));
  await assert.rejects(
    () => engine.create(validCreate()),
    (error: unknown) => error instanceof FakePrismaKnownRequestError && error.code === "P2025"
  );
});
