import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const { Client } = pg;

async function main() {
  const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!directUrl || (!directUrl.startsWith("postgres://") && !directUrl.startsWith("postgresql://"))) {
    console.error("ERROR: DIRECT_URL or DATABASE_URL must be provided as a PostgreSQL connection string.");
    console.error("Example usage: DIRECT_URL=\"postgresql://...\" npx tsx scripts/apply-neon-baseline.ts");
    process.exit(1);
  }

  console.log("=== PHASE 3A: NEON BASELINE APPLICATION & VERIFICATION ===");
  console.log("Connecting to Neon database...");

  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    const serverInfo = await client.query("SELECT version(), current_database(), current_schema();");
    console.log(`✔ Connected to database: ${serverInfo.rows[0].current_database}`);
    console.log(`✔ Server version: ${serverInfo.rows[0].version.split(",")[0]}`);
    console.log(`✔ Current schema: ${serverInfo.rows[0].current_schema}`);

    // Check existing tables
    const tableCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    const existingTables = tableCheck.rows.map((r: { table_name: string }) => r.table_name);

    if (existingTables.length === 0) {
      console.log("\nApplying baseline PostgreSQL migration (prisma/migrations_postgresql/0_init/migration.sql)...");
      const migrationSqlPath = resolve("prisma/migrations_postgresql/0_init/migration.sql");
      const migrationSql = readFileSync(migrationSqlPath, "utf8");

      await client.query("BEGIN;");
      try {
        await client.query(migrationSql);
        await client.query("COMMIT;");
        console.log("✔ Baseline migration executed and committed successfully.");
      } catch (err) {
        await client.query("ROLLBACK;");
        throw err;
      }
    } else {
      console.log(`\nFound existing tables (${existingTables.length}): ${existingTables.join(", ")}`);
      console.log("Skipping DDL execution to avoid modifying existing schema.");
    }

    // 1. Verify 9 Tables
    console.log("\n1. Verifying Tables in 'public' schema...");
    const expectedTables = [
      "users",
      "settings_preferences",
      "maintenance_audit_events",
      "operator_audit",
      "accounts",
      "sessions",
      "students",
      "transactions",
      "financial_audit_events"
    ];

    const currentTablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    const currentTableNames = currentTablesResult.rows.map((r: { table_name: string }) => r.table_name);

    for (const table of expectedTables) {
      assert.ok(currentTableNames.includes(table), `Table '${table}' must exist in public schema`);
      console.log(`  ✔ Table '${table}' verified.`);
    }

    // 2. Verify 6 Enums
    console.log("\n2. Verifying PostgreSQL Enums...");
    const expectedEnums: Record<string, string[]> = {
      Role: ["PLATFORM_ADMIN", "OPERATOR"],
      ThemePreference: ["LIGHT", "DARK", "SYSTEM"],
      StudentStatus: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      TransactionType: ["DEPOSIT", "WITHDRAWAL", "CORRECTION"],
      CorrectionDirection: ["INCREASE", "DECREASE"],
      FinancialAuditEventType: ["CREATE", "EDIT", "DELETE", "RESTORE", "OWNERSHIP_TRANSFER"]
    };

    const enumResult = await client.query(`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      ORDER BY t.typname, e.enumsortorder;
    `);

    const enumMap = new Map<string, string[]>();
    for (const row of enumResult.rows as Array<{ enum_name: string; enum_value: string }>) {
      const list = enumMap.get(row.enum_name) ?? [];
      list.push(row.enum_value);
      enumMap.set(row.enum_name, list);
    }

    for (const [enumName, expectedValues] of Object.entries(expectedEnums)) {
      assert.ok(enumMap.has(enumName), `Enum '${enumName}' must exist`);
      const actualValues = enumMap.get(enumName) ?? [];
      assert.deepEqual(
        actualValues,
        expectedValues,
        `Enum '${enumName}' values mismatch: expected ${JSON.stringify(expectedValues)}, got ${JSON.stringify(actualValues)}`
      );
      console.log(`  ✔ Enum '${enumName}' verified: [${actualValues.join(", ")}]`);
    }

    // 3. Verify Constraints (Primary keys, Foreign keys, Check constraints)
    console.log("\n3. Verifying Table Constraints (FKs, PKs, CHECKs)...");
    const constraintResult = await client.query(`
      SELECT
        conname as constraint_name,
        contype as constraint_type,
        relname as table_name,
        pg_get_constraintdef(c.oid) as constraint_definition
      FROM pg_constraint c
      JOIN pg_class cl ON cl.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = cl.relnamespace
      WHERE n.nspname = 'public'
      ORDER BY relname, conname;
    `);

    const constraintRows = constraintResult.rows as Array<{
      constraint_name: string;
      constraint_type: string;
      table_name: string;
      constraint_definition: string;
    }>;
    const constraintNames = constraintRows.map((r) => r.constraint_name);

    const expectedCheckConstraints = [
      "ck_students_balance",
      "ck_students_financial_version",
      "ck_transactions_amount",
      "ck_transactions_revision",
      "ck_transactions_deletion_pair",
      "ck_financial_audit_hash"
    ];

    for (const ck of expectedCheckConstraints) {
      assert.ok(constraintNames.includes(ck), `CHECK constraint '${ck}' must exist`);
      const row = constraintRows.find((r) => r.constraint_name === ck);
      console.log(`  ✔ CHECK constraint '${ck}' verified on table '${row?.table_name}': ${row?.constraint_definition}`);
    }

    const expectedForeignKeys = [
      "settings_preferences_user_id_fkey",
      "accounts_user_id_fkey",
      "sessions_user_id_fkey",
      "students_operator_id_fkey",
      "transactions_student_id_fkey",
      "transactions_created_by_fkey",
      "transactions_updated_by_fkey",
      "transactions_deleted_by_fkey",
      "financial_audit_events_actor_id_fkey",
      "financial_audit_events_student_id_fkey",
      "financial_audit_events_transaction_id_fkey"
    ];

    for (const fk of expectedForeignKeys) {
      assert.ok(constraintNames.includes(fk), `Foreign key '${fk}' must exist`);
      const row = constraintRows.find((r) => r.constraint_name === fk);
      console.log(`  ✔ Foreign Key '${fk}' verified on table '${row?.table_name}': ${row?.constraint_definition}`);
    }

    // 4. Verify Unique Constraints and Unique Indexes
    console.log("\n4. Verifying Unique Constraints & Unique Indexes...");
    const uniqueIndexResult = await client.query(`
      SELECT
        i.relname AS index_name,
        t.relname AS table_name,
        a.attname AS column_name,
        ix.indisunique AS is_unique,
        ix.indisprimary AS is_primary,
        pg_get_indexdef(ix.indexrelid) AS index_definition
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public' AND ix.indisunique = true AND ix.indisprimary = false
      ORDER BY t.relname, i.relname;
    `);

    const uniqueIndexRows = uniqueIndexResult.rows as Array<{
      index_name: string;
      table_name: string;
      column_name: string;
      is_unique: boolean;
      is_primary: boolean;
      index_definition: string;
    }>;

    const expectedUniques = [
      { name: "uq_users_email", table: "users", column: "email" },
      { name: "uq_financial_audit_command", table: "financial_audit_events", column: "command_id" }
    ];

    for (const expected of expectedUniques) {
      const match = uniqueIndexRows.find(
        (r) => r.index_name === expected.name && r.table_name === expected.table && r.column_name === expected.column
      );
      assert.ok(
        match && match.is_unique,
        `Unique constraint/index '${expected.name}' on ${expected.table}(${expected.column}) must exist and be unique`
      );
      console.log(`  ✔ Unique constraint/index '${expected.name}' verified on ${expected.table}.${expected.column} (is_unique: ${match.is_unique})`);
      console.log(`      Definition: ${match.index_definition}`);
    }

    // 5. Verify Secondary & Composite Indexes
    console.log("\n5. Verifying Performance & Composite Indexes...");
    const indexResult = await client.query(`
      SELECT indexname, tablename, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);
    const indexRows = indexResult.rows as Array<{ indexname: string; tablename: string; indexdef: string }>;
    const indexNames = indexRows.map((r) => r.indexname);

    const expectedIndexes = [
      "ix_maintenance_audit_occurred",
      "ix_operator_audit_operator",
      "ix_accounts_user",
      "ix_sessions_user",
      "ix_sessions_expires",
      "ix_students_operator",
      "ix_transactions_student_history",
      "ix_transactions_student_active_history",
      "ix_transactions_student_type_date",
      "ix_financial_audit_student",
      "ix_financial_audit_transaction_revision"
    ];

    for (const ix of expectedIndexes) {
      assert.ok(indexNames.includes(ix), `Index '${ix}' must exist`);
      const row = indexRows.find((r) => r.indexname === ix);
      console.log(`  ✔ Index '${ix}' verified on table '${row?.tablename}': ${row?.indexdef}`);
    }

    // 6. Verify Zero Rows Across Application Tables
    console.log("\n6. Verifying Row Counts across all 9 application tables...");
    let totalRows = 0;
    const rowCounts: Record<string, number> = {};

    for (const table of expectedTables) {
      const countRes = await client.query(`SELECT count(*)::int as count FROM "${table}";`);
      const count = countRes.rows[0].count;
      rowCounts[table] = count;
      totalRows += count;
      console.log(`  ✔ Table '${table}': ${count} rows`);
      assert.equal(count, 0, `Table '${table}' must have 0 rows prior to migration, found ${count}`);
    }

    console.log(`\n✔ Total rows across all tables: ${totalRows} (Zero rows confirmed)`);
    console.log("\n=== PHASE 3A NEON BASELINE APPLICATION & PRE-MIGRATION AUDIT PASSED ===");

    return {
      serverInfo: serverInfo.rows[0],
      tables: currentTableNames,
      enums: Array.from(enumMap.entries()),
      rowCounts
    };
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
