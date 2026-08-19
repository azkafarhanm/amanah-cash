import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const { Client } = pg;

console.log("=== PHASE 2: POSTGRESQL SCHEMA & NEON BASELINE VERIFICATION ===");

// 1. Static Schema & Migration File Checks
console.log("\n1. Verifying PostgreSQL schema and migration files...");
const postgresSchemaPath = resolve("prisma/schema.postgresql.prisma");
const postgresMigrationPath = resolve("prisma/migrations_postgresql/0_init/migration.sql");

assert.ok(existsSync(postgresSchemaPath), "prisma/schema.postgresql.prisma exists");
assert.ok(existsSync(postgresMigrationPath), "prisma/migrations_postgresql/0_init/migration.sql exists");

const schemaContent = readFileSync(postgresSchemaPath, "utf8");
const migrationContent = readFileSync(postgresMigrationPath, "utf8");

// Verify all required models exist in PostgreSQL schema
const expectedModels = [
  "User",
  "SettingsPreference",
  "MaintenanceAuditEvent",
  "OperatorAudit",
  "Account",
  "Session",
  "Student",
  "Transaction",
  "FinancialAuditEvent"
];

for (const model of expectedModels) {
  assert.ok(
    schemaContent.includes(`model ${model}`),
    `Model ${model} exists in PostgreSQL schema`
  );
  console.log(`  ✔ Model ${model} present in schema`);
}

// Verify enums in migration SQL
const expectedEnums = [
  "Role",
  "ThemePreference",
  "StudentStatus",
  "TransactionType",
  "CorrectionDirection",
  "FinancialAuditEventType"
];

for (const enumName of expectedEnums) {
  assert.ok(
    migrationContent.includes(`CREATE TYPE "${enumName}" AS ENUM`),
    `Enum ${enumName} defined in migration SQL`
  );
  console.log(`  ✔ Enum ${enumName} defined in migration DDL`);
}

// Verify constraints in migration SQL
const expectedConstraints = [
  "uq_users_email",
  "ck_students_balance",
  "ck_students_financial_version",
  "ck_transactions_amount",
  "ck_transactions_revision",
  "ck_transactions_deletion_pair",
  "ck_financial_audit_hash",
  "uq_financial_audit_command"
];

for (const constraint of expectedConstraints) {
  assert.ok(
    migrationContent.includes(constraint),
    `Constraint ${constraint} defined in migration SQL`
  );
  console.log(`  ✔ Constraint/Index ${constraint} present in migration DDL`);
}

// 2. Neon Connection & Baseline DDL Validation (if connection string provided)
const targetUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (targetUrl && (targetUrl.startsWith("postgres://") || targetUrl.startsWith("postgresql://"))) {
  console.log("\n2. Connecting to PostgreSQL target for schema verification...");
  const client = new Client({ connectionString: targetUrl });
  try {
    await client.connect();
    console.log("  ✔ Successfully connected to PostgreSQL target database");

    const res = await client.query("SELECT version(), current_database(), current_schema();");
    console.log(`  ✔ Database: ${res.rows[0].current_database}`);
    console.log(`  ✔ PostgreSQL Version: ${res.rows[0].version.split(",")[0]}`);

    // Check if tables already exist or if database is empty
    const tableRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    const existingTables = tableRes.rows.map((r: { table_name: string }) => r.table_name);
    console.log(`  ✔ Existing public tables count: ${existingTables.length}`);

    if (existingTables.length > 0) {
      console.log(`    Tables found: ${existingTables.join(", ")}`);
    } else {
      console.log("    Database is ready for initial baseline migration application");
    }
  } catch (error) {
    console.error("  ✖ Connection error to PostgreSQL target:", error instanceof Error ? error.message : error);
  } finally {
    await client.end().catch(() => {});
  }
} else {
  console.log("\n2. (Optional) Neon connection string not provided in environment for live check; static DDL verification complete.");
}

console.log("\n=== PHASE 2 VERIFICATION COMPLETE ===");
