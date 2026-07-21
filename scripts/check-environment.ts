import "dotenv/config";
import { loadAuthenticationEnvironment } from "../src/auth/environment";

try {
  const environment = loadAuthenticationEnvironment();
  console.log("Environment is valid.");
  console.log(`  authentication: ${environment.developmentAuth ? "local development" : "Google OAuth"}`);
  console.log(`  application URL: ${environment.nextAuthUrl}`);
  console.log(`  database: ${environment.databaseUrl}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Environment validation failed");
  process.exitCode = 1;
}
