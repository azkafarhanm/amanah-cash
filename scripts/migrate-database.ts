import "dotenv/config";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAuthenticationEnvironment } from "../src/auth/environment";
import { openDatabase } from "../src/persistence/database.js";

const projectRoot = resolve(import.meta.dirname, "..");

try {
  const environment = loadAuthenticationEnvironment();
  const isPostgres =
    environment.databaseUrl.startsWith("postgres://") ||
    environment.databaseUrl.startsWith("postgresql://");

  if (isPostgres) {
    const prismaCommand = process.platform === "win32" ? "prisma.cmd" : "prisma";
    const result = spawnSync(prismaCommand, ["migrate", "deploy"], {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit"
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`PostgreSQL migration exited with status ${result.status ?? "unknown"}`);
    }
    console.log("Database migrations are current for the configured PostgreSQL target.");
    process.exit(0);
  }

  const databasePathValue = environment.databaseUrl.slice("file:".length);

  if (!databasePathValue || databasePathValue.includes("?") || databasePathValue.includes("#")) {
    throw new Error("DATABASE_URL must be a plain SQLite file: path");
  }

  const databasePath = databasePathValue.startsWith("//")
    ? fileURLToPath(environment.databaseUrl)
    : resolve(projectRoot, databasePathValue);
  const database = openDatabase({
    databasePath,
    migrationsPath: resolve(projectRoot, "migrations")
  });

  database.close();
  console.log("Database migrations are current for the configured SQLite target.");
} catch {
  console.error(
    "Database migration failed. Verify the server-only DATABASE_URL, file permissions, and ordered migration files."
  );
  process.exitCode = 1;
}
