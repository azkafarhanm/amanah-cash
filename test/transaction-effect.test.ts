import assert from "node:assert/strict";
import { test } from "node:test";
import { effect, TransactionEngineError } from "../src/transactions/effect";

test("effect() computes the signed Balance delta for every valid Transaction shape", () => {
  assert.equal(effect({ type: "DEPOSIT", amount: 500n, correctionDirection: null }), 500n);
  assert.equal(effect({ type: "WITHDRAWAL", amount: 500n, correctionDirection: null }), -500n);
  assert.equal(effect({ type: "CORRECTION", amount: 500n, correctionDirection: "INCREASE" }), 500n);
  assert.equal(effect({ type: "CORRECTION", amount: 500n, correctionDirection: "DECREASE" }), -500n);
});

test("effect() rejects a Correction with no direction instead of guessing one", () => {
  // A CORRECTION row should never reach here with a null direction -- transactionValues()
  // requires one at creation -- but if legacy or corrupted data does, effect() must refuse
  // rather than silently pick a sign. The client dialog's balanceEffect() relies on this
  // throwing so it can fall back to "unknown balance" instead of reading it as an increase.
  assert.throws(
    () => effect({ type: "CORRECTION", amount: 500n, correctionDirection: null }),
    (error: unknown) => error instanceof TransactionEngineError && error.code === "VALIDATION"
  );
});
