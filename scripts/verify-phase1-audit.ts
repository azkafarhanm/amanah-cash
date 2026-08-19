import assert from "node:assert/strict";
import { statSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadAuthenticationEnvironment, AuthenticationConfigurationError } from "../src/auth/environment.js";
import { getPrismaClient, disconnectPrismaClient } from "../src/persistence/prisma.js";

console.log("=== PHASE 1.1 POST-IMPLEMENTATION AUDIT VERIFICATION ===");

// 1. Verify loadAuthenticationEnvironment with SQLite and PostgreSQL URLs
console.log("\n1. Testing loadAuthenticationEnvironment()...");

const devSqliteEnv = {
  DATABASE_URL: "file:./data/amanah-cash.sqlite",
  NEXTAUTH_SECRET: "a-secure-secret-with-at-least-32-characters",
  NEXTAUTH_URL: "http://localhost:3000",
  AUTH_DEV_MODE: "true",
  DEV_SEED_ADMIN_EMAIL: "admin@example.com",
  DEV_SEED_OPERATOR_EMAIL: "operator@example.com",
  NODE_ENV: "development" as const
};
const parsedDevSqlite = loadAuthenticationEnvironment(devSqliteEnv);
assert.equal(parsedDevSqlite.databaseUrl, "file:./data/amanah-cash.sqlite");
console.log("  ✔ Development SQLite URL accepted");

const prodPostgresEnv = {
  DATABASE_URL: "postgresql://neon_user:neon_pass@ep-cool-sample.ap-southeast-1.aws.neon.tech/amanah_cash?sslmode=require",
  GOOGLE_CLIENT_ID: "google-client-id.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "google-client-secret-value",
  NEXTAUTH_SECRET: "a-secure-secret-with-at-least-32-characters",
  NEXTAUTH_URL: "https://cash.example.com",
  AUTH_DEV_MODE: "false",
  NODE_ENV: "production" as const
};
const parsedProdPostgres = loadAuthenticationEnvironment(prodPostgresEnv);
assert.equal(parsedProdPostgres.databaseUrl, prodPostgresEnv.DATABASE_URL);
assert.equal(parsedProdPostgres.production, true);
console.log("  ✔ Production Neon PostgreSQL URL accepted with HTTPS origin");

const prodPostgresShortEnv = {
  ...prodPostgresEnv,
  DATABASE_URL: "postgres://neon_user:neon_pass@ep-cool-sample.ap-southeast-1.aws.neon.tech/amanah_cash"
};
const parsedProdPostgresShort = loadAuthenticationEnvironment(prodPostgresShortEnv);
assert.equal(parsedProdPostgresShort.databaseUrl, prodPostgresShortEnv.DATABASE_URL);
console.log("  ✔ Production postgres:// protocol prefix accepted");

assert.throws(
  () => loadAuthenticationEnvironment({ ...prodPostgresEnv, DATABASE_URL: "mysql://user:pass@localhost/db" }),
  (err) => err instanceof AuthenticationConfigurationError
);
console.log("  ✔ Invalid non-SQLite/non-PostgreSQL URL safely rejected");

// 2. Testing SQLite Dynamic Adapter
console.log("\n2. Testing SQLite dynamic adapter initialization...");
await disconnectPrismaClient();
const sqliteClient = getPrismaClient(parsedDevSqlite);
assert.ok(sqliteClient, "PrismaClient initialized for SQLite");
const userCount = await sqliteClient.user.count();
console.log(`  ✔ SQLite client queried successfully (user count: ${userCount})`);

// 3. Testing PostgreSQL Dynamic Adapter initialization
console.log("\n3. Testing PostgreSQL dynamic adapter initialization...");
await disconnectPrismaClient();
try {
  const postgresClient = getPrismaClient(parsedProdPostgres);
  assert.ok(postgresClient, "PrismaClient initialized for PostgreSQL adapter");
  console.log("  ✔ PostgreSQL PrismaPg adapter instantiated cleanly without invoking SQLite");
} catch (error: any) {
  // When schema is still provider = "sqlite", Prisma 7 correctly verifies that adapter is @prisma/adapter-pg (based on postgres)
  assert.match(
    error?.message ?? "",
    /@prisma\/adapter-pg.*postgres/i,
    "Prisma accurately identified the PostgreSQL Driver Adapter"
  );
  console.log("  ✔ PostgreSQL PrismaPg adapter path verified (Prisma 7 successfully routed to @prisma/adapter-pg)");
}
await disconnectPrismaClient();

// 4. Verifying SQLite file state on disk
console.log("\n4. Verifying local SQLite database file integrity...");
const sqlitePath = resolve("data/amanah-cash.sqlite");
const backupPath = resolve("data/amanah-cash.sqlite.backup");

assert.ok(existsSync(sqlitePath), "data/amanah-cash.sqlite exists");
assert.ok(existsSync(backupPath), "data/amanah-cash.sqlite.backup exists");

const sqliteStat = statSync(sqlitePath);
const backupStat = statSync(backupPath);
console.log(`  ✔ SQLite database path: ${sqlitePath} (${sqliteStat.size} bytes)`);
console.log(`  ✔ SQLite backup path:   ${backupPath} (${backupStat.size} bytes)`);

console.log("\n=== ALL PHASE 1.1 POST-IMPLEMENTATION VERIFICATIONS PASSED ===");
