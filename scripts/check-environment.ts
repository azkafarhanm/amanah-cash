import "dotenv/config";
import { loadAuthenticationEnvironment } from "../src/auth/environment";
import { loadExportLimits } from "../src/exports/config";

try {
  const environment = loadAuthenticationEnvironment();
  const exportLimits = loadExportLimits();
  console.log("Environment is valid.");
  console.log(`  authentication: ${environment.developmentAuth ? "local development" : "Google OAuth"}`);
  console.log(`  application URL: ${environment.nextAuthUrl}`);
  console.log(`  database: ${environment.databaseUrl}`);
  console.log(`  export maximum rows: ${exportLimits.maxRows}`);
  console.log(`  export maximum bytes: ${exportLimits.maxBytes ?? "disabled"}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Environment validation failed");
  process.exitCode = 1;
}
