import assert from "node:assert/strict";
import { test } from "node:test";
import { formatTimelineGroup } from "../src/presentation/formatting.js";

test("formatTimelineGroup categorizes dates correctly into Hari ini, Kemarin, and Month Year", () => {
  const mockNow = new Date("2026-07-25T10:00:00.000Z"); // 25 July 2026

  // Today
  assert.equal(formatTimelineGroup("2026-07-25T08:30:00.000Z", mockNow), "Hari ini");
  // Yesterday
  assert.equal(formatTimelineGroup("2026-07-24T15:00:00.000Z", mockNow), "Kemarin");
  // Older dates in same month
  assert.equal(formatTimelineGroup("2026-07-20T10:00:00.000Z", mockNow), "Juli 2026");
  // Invalid date
  assert.equal(formatTimelineGroup("invalid-date", mockNow), "Tanggal tidak valid");
});
