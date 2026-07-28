import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const seed = readFileSync(resolve(root, "scripts/seed-development.ts"), "utf8");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test("development seed uses a stable production-valid UUID for its Student", () => {
  const match = seed.match(/const DEVELOPMENT_STUDENT_ID = "([^"]+)"/);

  assert.ok(match);
  assert.match(match[1], UUID_PATTERN);
  assert.match(seed, /where: \{ id: DEVELOPMENT_STUDENT_ID \}/);
  assert.match(seed, /id: DEVELOPMENT_STUDENT_ID,/);
  assert.doesNotMatch(seed, /dev-student/);
});
