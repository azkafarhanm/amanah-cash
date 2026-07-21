import "dotenv/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAuthenticationEnvironment } from "../src/auth/environment";
import { openDatabase } from "../src/persistence/database.js";

const projectRoot = resolve(import.meta.dirname, "..");
const environment = loadAuthenticationEnvironment();
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
console.log(`Database migrations are current: ${environment.databaseUrl}`);
