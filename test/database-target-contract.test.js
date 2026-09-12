import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

function generatedOutput(schema) {
  const match = schema.match(/output\s*=\s*"([^"]+)"/);
  assert.ok(match, "Prisma schema must define a generated client output");
  return match[1];
}

test("all Prisma providers use the runtime generated-client seam", async () => {
  const [sqliteSchema, postgresSchema, runtime, testConfig] = await Promise.all([
    readFile("prisma/schema.prisma", "utf8"),
    readFile("prisma/schema.postgresql.prisma", "utf8"),
    readFile("src/persistence/prisma.ts", "utf8"),
    readFile("tsconfig.test.json", "utf8")
  ]);

  const sqliteOutput = generatedOutput(sqliteSchema);
  const postgresOutput = generatedOutput(postgresSchema);

  assert.equal(sqliteOutput, postgresOutput);
  assert.equal(sqliteOutput, "../src/generated/prisma");
  assert.match(runtime, /@\/generated\/prisma\/client/);
  assert.doesNotMatch(testConfig, /generated\/prisma-sqlite/);
});

test("PostgreSQL migration branch executes Prisma deploy", async () => {
  const migrationScript = await readFile("scripts/migrate-database.ts", "utf8");
  const baselineScript = await readFile("scripts/apply-neon-baseline.ts", "utf8");

  assert.match(migrationScript, /spawnSync|execFileSync/);
  assert.match(migrationScript, /["']migrate["']\s*,\s*["']deploy["']/);
  assert.match(baselineScript, /["']migrate["']\s*,\s*["']resolve["']/);
  assert.match(baselineScript, /["']--applied["']\s*,\s*["']0_init["']/);
});

test("the release build refuses to ship ahead of the database", async () => {
  const [packageSource, check] = await Promise.all([
    readFile("package.json", "utf8"),
    readFile("scripts/check-pending-migrations.ts", "utf8")
  ]);
  const { scripts } = JSON.parse(packageSource);

  assert.match(scripts.prebuild, /db:check/);
  assert.match(scripts["db:check"], /check-pending-migrations/);
  assert.match(check, /["']migrate["']\s*,\s*["']status["']/);
  assert.match(check, /have not yet been applied/);
  assert.match(check, /process\.exit\(1\)/);
});

test("PostgreSQL financial writes lock the Student row before authorization", async () => {
  const transactionService = await readFile("src/transactions/service.ts", "utf8");

  assert.match(transactionService, /\$queryRaw[\s\S]*FOR UPDATE/);
});

test("PostgreSQL integrity migration protects financial shape and immutability", async () => {
  const integrityMigration = await readFile(
    "prisma/migrations_postgresql/20260908000000_integrity_guards/migration.sql",
    "utf8"
  );

  for (const invariant of [
    "ck_transactions_correction",
    "ck_financial_audit_shape",
    "trg_transactions_no_hard_delete",
    "trg_financial_audit_no_update",
    "trg_financial_audit_no_delete"
  ]) {
    assert.match(integrityMigration, new RegExp(invariant));
  }
});
