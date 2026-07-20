import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import type { AuthenticationEnvironment } from "@/auth/environment";

const globalPrisma = globalThis as typeof globalThis & {
  amanahCashPrisma?: PrismaClient;
  amanahCashDatabaseUrl?: string;
};

export function getPrismaClient(environment: AuthenticationEnvironment): PrismaClient {
  if (
    globalPrisma.amanahCashPrisma &&
    globalPrisma.amanahCashDatabaseUrl === environment.databaseUrl
  ) {
    return globalPrisma.amanahCashPrisma;
  }

  const adapter = new PrismaBetterSqlite3({ url: environment.databaseUrl });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalPrisma.amanahCashPrisma = client;
    globalPrisma.amanahCashDatabaseUrl = environment.databaseUrl;
  }

  return client;
}
