import assert from "node:assert/strict";
import dns from "node:dns";
import { resolve } from "node:path";
import Database from "better-sqlite3";
import pg from "pg";

dns.setDefaultResultOrder("ipv4first");

const { Client } = pg;

// Financial invariant helper
function effect(type: string, amount: bigint, correctionDirection: string | null): bigint {
  if (type === "DEPOSIT") return amount;
  if (type === "WITHDRAWAL") return -amount;
  if (type === "CORRECTION") {
    return correctionDirection === "INCREASE" ? amount : -amount;
  }
  throw new Error(`Unknown transaction type: ${type}`);
}

type SqliteUserData = {
  id: string;
  name: string;
  email: string;
  email_verified: string | null;
  image: string | null;
  role: string;
  is_active: number | bigint;
  created_at: string;
  last_login_at: string | null;
  deleted_at: string | null;
};

type SqliteSettingsPreferenceData = {
  user_id: string;
  theme: string;
  default_page_size: number;
  created_at: string;
  updated_at: string;
};

type SqliteAccountData = {
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
};

type SqliteSessionData = {
  session_token: string;
  user_id: string;
  expires: string;
};

type SqliteOperatorAuditData = {
  id: string;
  operator_id: string;
  actor_id: string;
  action: string;
  summary: string;
  created_at: string;
};

type SqliteMaintenanceAuditData = {
  id: string;
  actor_id: string | null;
  operation: string;
  outcome: string;
  artifact_created_at: string | null;
  application_version: string | null;
  schema_version: string | null;
  occurred_at: string;
};

type SqliteStudentData = {
  id: string;
  name: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  operator_id: string;
  balance: number | bigint;
  financial_version: number | bigint;
  photo_object_key: string | null;
  photo_updated_at: string | null;
};

type SqliteTransactionData = {
  id: string;
  student_id: string;
  type: string;
  amount: number | bigint;
  correction_direction: string | null;
  reason: string | null;
  notes: string | null;
  occurred_at: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  revision: number | bigint;
  deleted_at: string | null;
  deleted_by: string | null;
};

type SqliteFinancialAuditData = {
  id: string;
  command_id: string;
  command_payload_hash: string;
  event_type: string;
  actor_id: string;
  actor_role: string;
  student_id: string;
  transaction_id: string | null;
  transaction_revision: number | bigint | null;
  reason: string | null;
  before_snapshot: string | null;
  after_snapshot: string | null;
  balance_before: number | bigint | null;
  balance_after: number | bigint | null;
  balance_delta: number | bigint | null;
  old_operator_id: string | null;
  new_operator_id: string | null;
  occurred_at: string;
  schema_version: number | bigint;
  correlation_id: string;
};

export async function runMigration(options: {
  sqlitePath?: string;
  directUrl?: string;
  execute?: boolean;
}) {
  const isExecute = options.execute ?? process.argv.includes("--execute");
  const sqlitePath = options.sqlitePath ?? resolve("data/amanah-cash.sqlite");
  const directUrl = options.directUrl ?? process.env.DIRECT_URL ?? process.env.DATABASE_URL;

  console.log("===============================================================");
  console.log(`=== AMANAH CASH DATA MIGRATION: SQLITE -> NEON POSTGRESQL ===`);
  console.log(`=== Mode: ${isExecute ? "LIVE EXECUTION" : "DRY-RUN / PREFLIGHT AUDIT ONLY"} ===`);
  console.log("===============================================================\n");

  // Step 1: Open SQLite source in strictly READ-ONLY mode
  console.log(`1. Reading source data from SQLite (${sqlitePath})...`);
  const sqliteDb = new Database(sqlitePath, { readonly: true });

  const users = sqliteDb.prepare("SELECT * FROM users ORDER BY created_at ASC;").all() as SqliteUserData[];
  const settings = sqliteDb.prepare("SELECT * FROM settings_preferences ORDER BY created_at ASC;").all() as SqliteSettingsPreferenceData[];
  const accounts = sqliteDb.prepare("SELECT * FROM accounts;").all() as SqliteAccountData[];
  const sessions = sqliteDb.prepare("SELECT * FROM sessions;").all() as SqliteSessionData[];
  const operatorAudits = sqliteDb.prepare("SELECT * FROM operator_audit ORDER BY created_at ASC;").all() as SqliteOperatorAuditData[];
  const maintenanceAudits = sqliteDb.prepare("SELECT * FROM maintenance_audit_events ORDER BY occurred_at ASC;").all() as SqliteMaintenanceAuditData[];
  const students = sqliteDb.prepare("SELECT * FROM students ORDER BY created_at ASC;").all() as SqliteStudentData[];
  const transactions = sqliteDb.prepare("SELECT * FROM transactions ORDER BY occurred_at ASC, id ASC;").all() as SqliteTransactionData[];
  const financialAudits = sqliteDb.prepare("SELECT * FROM financial_audit_events ORDER BY occurred_at ASC, id ASC;").all() as SqliteFinancialAuditData[];

  sqliteDb.close();

  console.log(`  ✔ Extracted ${users.length} users`);
  console.log(`  ✔ Extracted ${settings.length} settings preferences`);
  console.log(`  ✔ Extracted ${accounts.length} accounts`);
  console.log(`  ✔ Extracted ${sessions.length} sessions`);
  console.log(`  ✔ Extracted ${operatorAudits.length} operator audits`);
  console.log(`  ✔ Extracted ${maintenanceAudits.length} maintenance audits`);
  console.log(`  ✔ Extracted ${students.length} students`);
  console.log(`  ✔ Extracted ${transactions.length} transactions`);
  console.log(`  ✔ Extracted ${financialAudits.length} financial audit events`);

  // Step 2: Pre-migration Data Integrity & Relational Invariant Validation
  console.log("\n2. Performing pre-migration data integrity & invariant checks...");

  // 2a. Check Users
  const userIds = new Set<string>();
  const userEmails = new Set<string>();
  for (const u of users) {
    assert.ok(u.id, "User ID must exist");
    assert.ok(!userIds.has(u.id), `Duplicate user ID: ${u.id}`);
    userIds.add(u.id);

    const normEmail = u.email.trim().toLowerCase();
    assert.ok(!userEmails.has(normEmail), `Duplicate user email: ${normEmail}`);
    userEmails.add(normEmail);

    assert.ok(["PLATFORM_ADMIN", "OPERATOR"].includes(u.role), `Invalid user role: ${u.role}`);
  }
  console.log("  ✔ Users unique IDs, unique emails, and roles verified.");

  // 2b. Check Settings & Accounts Foreign Keys
  for (const s of settings) {
    assert.ok(userIds.has(s.user_id), `Settings references missing user: ${s.user_id}`);
    assert.ok(["LIGHT", "DARK", "SYSTEM"].includes(s.theme), `Invalid theme: ${s.theme}`);
  }
  for (const a of accounts) {
    assert.ok(userIds.has(a.user_id), `Account references missing user: ${a.user_id}`);
  }
  for (const sess of sessions) {
    assert.ok(userIds.has(sess.user_id), `Session references missing user: ${sess.user_id}`);
  }
  console.log("  ✔ Settings, accounts, and sessions foreign keys verified.");

  // 2c. Check Students Foreign Keys & Status
  const studentIds = new Set<string>();
  for (const st of students) {
    assert.ok(st.id, "Student ID must exist");
    assert.ok(!studentIds.has(st.id), `Duplicate student ID: ${st.id}`);
    studentIds.add(st.id);

    assert.ok(userIds.has(st.operator_id), `Student ${st.id} references missing operator: ${st.operator_id}`);
    assert.ok(["ACTIVE", "INACTIVE", "ARCHIVED"].includes(st.status), `Invalid student status: ${st.status}`);
    assert.ok(BigInt(st.balance) >= 0n, `Student ${st.id} has negative balance: ${st.balance}`);
    assert.ok(Number(st.financial_version) >= 0, `Student ${st.id} has invalid financial_version: ${st.financial_version}`);
  }
  console.log("  ✔ Students unique IDs, operators, status, and non-negative balance verified.");

  // 2d. Check Transactions Foreign Keys, Invariants & Derived Balance
  const transactionIds = new Set<string>();
  const studentCalculatedBalances = new Map<string, bigint>();
  for (const st of students) {
    studentCalculatedBalances.set(st.id, 0n);
  }

  for (const tx of transactions) {
    assert.ok(tx.id, "Transaction ID must exist");
    assert.ok(!transactionIds.has(tx.id), `Duplicate transaction ID: ${tx.id}`);
    transactionIds.add(tx.id);

    assert.ok(studentIds.has(tx.student_id), `Transaction ${tx.id} references missing student: ${tx.student_id}`);
    assert.ok(userIds.has(tx.created_by), `Transaction ${tx.id} references missing creator: ${tx.created_by}`);
    assert.ok(userIds.has(tx.updated_by), `Transaction ${tx.id} references missing updater: ${tx.updated_by}`);
    if (tx.deleted_by) {
      assert.ok(userIds.has(tx.deleted_by), `Transaction ${tx.id} references missing deleter: ${tx.deleted_by}`);
    }

    assert.ok(["DEPOSIT", "WITHDRAWAL", "CORRECTION"].includes(tx.type), `Invalid transaction type: ${tx.type}`);
    const amount = BigInt(tx.amount);
    assert.ok(amount > 0n, `Transaction ${tx.id} has non-positive amount: ${amount}`);

    if (tx.type === "CORRECTION") {
      assert.ok(["INCREASE", "DECREASE"].includes(tx.correction_direction ?? ""), `Correction transaction ${tx.id} missing valid direction`);
      assert.ok(tx.reason && tx.reason.trim().length > 0, `Correction transaction ${tx.id} missing reason`);
    } else {
      assert.ok(tx.correction_direction === null, `Non-correction transaction ${tx.id} has non-null direction`);
    }

    // Deletion pair invariant
    const hasDeletedAt = tx.deleted_at !== null;
    const hasDeletedBy = tx.deleted_by !== null;
    assert.equal(hasDeletedAt, hasDeletedBy, `Transaction ${tx.id} has mismatched deleted_at / deleted_by pair`);

    // Accumulate active transactions for balance verification
    if (!tx.deleted_at) {
      const current = studentCalculatedBalances.get(tx.student_id) ?? 0n;
      const txEffect = effect(tx.type, amount, tx.correction_direction);
      studentCalculatedBalances.set(tx.student_id, current + txEffect);
    }
  }

  // Reconcile calculated balance vs stored student balance
  let totalStudentBalance = 0n;
  for (const st of students) {
    const storedBalance = BigInt(st.balance);
    const calculatedBalance = studentCalculatedBalances.get(st.id) ?? 0n;
    assert.equal(
      storedBalance,
      calculatedBalance,
      `Student ${st.name} (${st.id}) balance mismatch! Stored: ${storedBalance}, Calculated from active transactions: ${calculatedBalance}`
    );
    totalStudentBalance += storedBalance;
    console.log(`    Student '${st.name}': balance Rp ${storedBalance.toLocaleString("id-ID")} (matches active transactions exactly)`);
  }
  console.log(`  ✔ Transactions invariants, foreign keys, and 100% exact student balance reconciliation verified.`);
  console.log(`    Total active balance across all students: Rp ${totalStudentBalance.toLocaleString("id-ID")}`);

  // 2e. Check Financial Audit Events
  const commandIds = new Set<string>();
  for (const fa of financialAudits) {
    assert.ok(!commandIds.has(fa.command_id), `Duplicate command ID in audit: ${fa.command_id}`);
    commandIds.add(fa.command_id);

    assert.equal(fa.command_payload_hash.length, 64, `Audit ${fa.id} payload hash length must be 64`);
    assert.ok(userIds.has(fa.actor_id), `Audit ${fa.id} references missing actor: ${fa.actor_id}`);
    assert.ok(studentIds.has(fa.student_id), `Audit ${fa.id} references missing student: ${fa.student_id}`);
    if (fa.transaction_id) {
      assert.ok(transactionIds.has(fa.transaction_id), `Audit ${fa.id} references missing transaction: ${fa.transaction_id}`);
    }

    if (fa.event_type !== "OWNERSHIP_TRANSFER" && fa.balance_before !== null && fa.balance_after !== null && fa.balance_delta !== null) {
      const bBefore = BigInt(fa.balance_before);
      const bAfter = BigInt(fa.balance_after);
      const bDelta = BigInt(fa.balance_delta);
      assert.equal(bBefore + bDelta, bAfter, `Audit ${fa.id} balance math mismatch: ${bBefore} + ${bDelta} !== ${bAfter}`);
    }
  }
  console.log("  ✔ Financial audit trail commands, payload hashes, and balance transitions verified.");

  // If dry-run only, finish here
  if (!isExecute) {
    console.log("\n===============================================================");
    console.log("=== PREFLIGHT DRY-RUN AUDIT COMPLETED SUCCESSFULLY ===");
    console.log("=== 0 data anomalies detected. All relational and financial ===");
    console.log("=== invariants match perfectly. Ready for live migration. ===");
    console.log("===============================================================");
    return {
      dryRun: true,
      counts: {
        users: users.length,
        settings: settings.length,
        accounts: accounts.length,
        sessions: sessions.length,
        operatorAudits: operatorAudits.length,
        maintenanceAudits: maintenanceAudits.length,
        students: students.length,
        transactions: transactions.length,
        financialAudits: financialAudits.length
      },
      totalStudentBalance: totalStudentBalance.toString()
    };
  }

  // Step 3: Live PostgreSQL Insertion inside a Single Atomic Transaction
  if (!directUrl) {
    throw new Error("DIRECT_URL or DATABASE_URL is required for live execution.");
  }

  console.log("\n3. Connecting to PostgreSQL/Neon target for atomic live migration...");
  const pgClient = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false }
  });

  await pgClient.connect();

  try {
    // Check that target database is currently empty
    const checkEmpty = await pgClient.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    const tables = checkEmpty.rows.map((r: { table_name: string }) => r.table_name);
    for (const t of tables) {
      const res = await pgClient.query(`SELECT count(*)::int as count FROM "${t}";`);
      if (res.rows[0].count > 0) {
        throw new Error(`Target table '${t}' is not empty (${res.rows[0].count} rows). Aborting to prevent data corruption.`);
      }
    }

    console.log("  ✔ Target database verified empty across all tables. Starting transaction (BEGIN)...");
    await pgClient.query("BEGIN;");

    // 3a. Insert Users
    console.log(`  Inserting ${users.length} users...`);
    for (const u of users) {
      await pgClient.query(
        `INSERT INTO users (id, name, email, email_verified, image, role, is_active, created_at, last_login_at, deleted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          u.id,
          u.name,
          u.email.trim().toLowerCase(),
          u.email_verified ? new Date(u.email_verified) : null,
          u.image,
          u.role,
          Boolean(Number(u.is_active)),
          new Date(u.created_at),
          u.last_login_at ? new Date(u.last_login_at) : null,
          u.deleted_at ? new Date(u.deleted_at) : null
        ]
      );
    }

    // 3b. Insert Settings Preferences
    console.log(`  Inserting ${settings.length} settings preferences...`);
    for (const s of settings) {
      await pgClient.query(
        `INSERT INTO settings_preferences (user_id, theme, default_page_size, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5);`,
        [
          s.user_id,
          s.theme,
          Number(s.default_page_size),
          new Date(s.created_at),
          new Date(s.updated_at)
        ]
      );
    }

    // 3c. Insert Accounts
    console.log(`  Inserting ${accounts.length} accounts...`);
    for (const a of accounts) {
      await pgClient.query(
        `INSERT INTO accounts (user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
        [
          a.user_id,
          a.type,
          a.provider,
          a.provider_account_id,
          a.refresh_token,
          a.access_token,
          a.expires_at ? Number(a.expires_at) : null,
          a.token_type,
          a.scope,
          a.id_token,
          a.session_state
        ]
      );
    }

    // 3d. Insert Sessions
    console.log(`  Inserting ${sessions.length} sessions...`);
    for (const sess of sessions) {
      await pgClient.query(
        `INSERT INTO sessions (session_token, user_id, expires)
         VALUES ($1, $2, $3);`,
        [sess.session_token, sess.user_id, new Date(sess.expires)]
      );
    }

    // 3e. Insert Operator Audits
    console.log(`  Inserting ${operatorAudits.length} operator audits...`);
    for (const oa of operatorAudits) {
      await pgClient.query(
        `INSERT INTO operator_audit (id, operator_id, actor_id, action, summary, created_at)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [oa.id, oa.operator_id, oa.actor_id, oa.action, oa.summary, new Date(oa.created_at)]
      );
    }

    // 3f. Insert Maintenance Audits
    console.log(`  Inserting ${maintenanceAudits.length} maintenance audits...`);
    for (const ma of maintenanceAudits) {
      await pgClient.query(
        `INSERT INTO maintenance_audit_events (id, actor_id, operation, outcome, artifact_created_at, application_version, schema_version, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [
          ma.id,
          ma.actor_id,
          ma.operation,
          ma.outcome,
          ma.artifact_created_at ? new Date(ma.artifact_created_at) : null,
          ma.application_version,
          ma.schema_version,
          new Date(ma.occurred_at)
        ]
      );
    }

    // 3g. Insert Students
    console.log(`  Inserting ${students.length} students...`);
    for (const st of students) {
      await pgClient.query(
        `INSERT INTO students (id, name, notes, status, created_at, updated_at, operator_id, balance, financial_version, photo_object_key, photo_updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
        [
          st.id,
          st.name,
          st.notes,
          st.status,
          new Date(st.created_at),
          new Date(st.updated_at),
          st.operator_id,
          st.balance.toString(),
          Number(st.financial_version),
          st.photo_object_key,
          st.photo_updated_at ? new Date(st.photo_updated_at) : null
        ]
      );
    }

    // 3h. Insert Transactions
    console.log(`  Inserting ${transactions.length} transactions...`);
    for (const tx of transactions) {
      await pgClient.query(
        `INSERT INTO transactions (id, student_id, type, amount, correction_direction, reason, notes, occurred_at, created_at, created_by, updated_at, updated_by, revision, deleted_at, deleted_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);`,
        [
          tx.id,
          tx.student_id,
          tx.type,
          tx.amount.toString(),
          tx.correction_direction,
          tx.reason,
          tx.notes,
          new Date(tx.occurred_at),
          new Date(tx.created_at),
          tx.created_by,
          new Date(tx.updated_at),
          tx.updated_by,
          Number(tx.revision),
          tx.deleted_at ? new Date(tx.deleted_at) : null,
          tx.deleted_by
        ]
      );
    }

    // 3i. Insert Financial Audit Events
    console.log(`  Inserting ${financialAudits.length} financial audit events...`);
    for (const fa of financialAudits) {
      await pgClient.query(
        `INSERT INTO financial_audit_events (id, command_id, command_payload_hash, event_type, actor_id, actor_role, student_id, transaction_id, transaction_revision, reason, before_snapshot, after_snapshot, balance_before, balance_after, balance_delta, old_operator_id, new_operator_id, occurred_at, schema_version, correlation_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20);`,
        [
          fa.id,
          fa.command_id,
          fa.command_payload_hash,
          fa.event_type,
          fa.actor_id,
          fa.actor_role,
          fa.student_id,
          fa.transaction_id,
          fa.transaction_revision !== null ? Number(fa.transaction_revision) : null,
          fa.reason,
          fa.before_snapshot,
          fa.after_snapshot,
          fa.balance_before !== null ? fa.balance_before.toString() : null,
          fa.balance_after !== null ? fa.balance_after.toString() : null,
          fa.balance_delta !== null ? fa.balance_delta.toString() : null,
          fa.old_operator_id,
          fa.new_operator_id,
          new Date(fa.occurred_at),
          Number(fa.schema_version),
          fa.correlation_id
        ]
      );
    }

    // Step 4: Live PostgreSQL Post-Migration Reconciliation inside Transaction
    console.log("\n4. Running live PostgreSQL post-migration reconciliation inside transaction...");

    const checkCounts: Record<string, number> = {
      users: users.length,
      settings_preferences: settings.length,
      accounts: accounts.length,
      sessions: sessions.length,
      operator_audit: operatorAudits.length,
      maintenance_audit_events: maintenanceAudits.length,
      students: students.length,
      transactions: transactions.length,
      financial_audit_events: financialAudits.length
    };

    for (const [table, expectedCount] of Object.entries(checkCounts)) {
      const res = await pgClient.query(`SELECT count(*)::int as count FROM "${table}";`);
      const actualCount = res.rows[0].count;
      assert.equal(actualCount, expectedCount, `Table '${table}' row count mismatch: expected ${expectedCount}, got ${actualCount}`);
      console.log(`  ✔ Table '${table}' count matches exactly: ${actualCount} rows`);
    }

    // Reconcile balances in PostgreSQL
    const pgBalanceRes = await pgClient.query(`SELECT sum(balance)::bigint as total_balance FROM students;`);
    const pgTotalBalance = BigInt(pgBalanceRes.rows[0].total_balance);
    assert.equal(pgTotalBalance, totalStudentBalance, `PostgreSQL total student balance mismatch: expected ${totalStudentBalance}, got ${pgTotalBalance}`);
    console.log(`  ✔ PostgreSQL sum of student balances matches exactly: Rp ${pgTotalBalance.toLocaleString("id-ID")}`);

    // Commit Transaction
    console.log("\nAll reconciliations passed! Committing transaction (COMMIT)...");
    await pgClient.query("COMMIT;");
    console.log("✔ Transaction successfully committed to Neon.");

    console.log("\n===============================================================");
    console.log("=== SQLITE -> NEON DATA MIGRATION COMPLETED SUCCESSFULLY ===");
    console.log("===============================================================");

    return {
      success: true,
      counts: checkCounts,
      totalStudentBalance: pgTotalBalance.toString()
    };
  } catch (error) {
    console.error("\n✖ MIGRATION FAILED! Executing ROLLBACK on PostgreSQL/Neon...");
    try {
      await pgClient.query("ROLLBACK;");
      console.log("✔ ROLLBACK executed. Neon database remains unchanged and clean.");
    } catch (rbErr) {
      console.error("Failed to rollback:", rbErr);
    }
    throw error;
  } finally {
    await pgClient.end().catch(() => {});
  }
}

// Direct invocation
if (process.argv[1]?.endsWith("migrate-data-to-postgres.ts")) {
  runMigration({}).catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
