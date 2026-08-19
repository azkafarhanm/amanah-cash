import "dotenv/config";
import { loadAuthenticationEnvironment } from "../src/auth/environment";
import { loadExportLimits } from "../src/exports/config";
import {
  formatProductionPreflight,
  loadProductionPreflight
} from "../src/operations/production-preflight";

try {
  if (process.argv.includes("--production")) {
    for (const line of formatProductionPreflight(loadProductionPreflight())) {
      console.log(line);
    }
    process.exit(0);
  }

  const environment = loadAuthenticationEnvironment();
  const exportLimits = loadExportLimits();
  console.log("Environment is valid.");
  console.log(`  authentication: ${environment.developmentAuth ? "local development" : "Google OAuth"}`);
  console.log(`  application URL: ${environment.nextAuthUrl}`);
  const isPostgres = process.env.DATABASE_URL?.startsWith("postgres");
  const dbLabel = isPostgres
    ? "configured PostgreSQL database (server-only location redacted)"
    : "configured SQLite file (server-only location redacted)";
  console.log(`  database: ${dbLabel}`);
  console.log(`  export maximum rows: ${exportLimits.maxRows}`);
  console.log(`  export maximum bytes: ${exportLimits.maxBytes ?? "disabled"}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Environment validation failed");
  process.exitCode = 1;
}
