import dns from "node:dns";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import type { AuthenticationEnvironment } from "@/auth/environment";

if (typeof dns?.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const { Pool } = pg;

const globalPrisma = globalThis as typeof globalThis & {
  amanahCashPrisma?: PrismaClient;
  amanahCashDatabaseUrl?: string;
  amanahCashPgPool?: pg.Pool;
};

export function getPrismaClient(environment: AuthenticationEnvironment): PrismaClient {
  if (
    globalPrisma.amanahCashPrisma &&
    globalPrisma.amanahCashDatabaseUrl === environment.databaseUrl
  ) {
    return globalPrisma.amanahCashPrisma;
  }

  const isPostgres =
    environment.databaseUrl.startsWith("postgres://") ||
    environment.databaseUrl.startsWith("postgresql://");

  let adapter;
  if (isPostgres) {
    if (
      globalPrisma.amanahCashPgPool &&
      globalPrisma.amanahCashDatabaseUrl !== environment.databaseUrl
    ) {
      void globalPrisma.amanahCashPgPool.end().catch(() => {});
      globalPrisma.amanahCashPgPool = undefined;
    }
    const pool =
      globalPrisma.amanahCashPgPool ??
      new Pool({
        connectionString: environment.databaseUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });
    globalPrisma.amanahCashPgPool = pool;
    adapter = new PrismaPg(pool);
  } else {
    if (globalPrisma.amanahCashPgPool) {
      void globalPrisma.amanahCashPgPool.end().catch(() => {});
      globalPrisma.amanahCashPgPool = undefined;
    }
    adapter = new PrismaBetterSqlite3({ url: environment.databaseUrl });
  }

  const client = new PrismaClient({ adapter });

  globalPrisma.amanahCashPrisma = client;
  globalPrisma.amanahCashDatabaseUrl = environment.databaseUrl;

  return client;
}

export async function disconnectPrismaClient(): Promise<void> {
  if (globalPrisma.amanahCashPrisma) {
    await globalPrisma.amanahCashPrisma.$disconnect();
  }
  if (globalPrisma.amanahCashPgPool) {
    await globalPrisma.amanahCashPgPool.end();
  }
  delete globalPrisma.amanahCashPrisma;
  delete globalPrisma.amanahCashDatabaseUrl;
  delete globalPrisma.amanahCashPgPool;
}

