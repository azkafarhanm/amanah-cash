import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

export function loadConfig(environment = process.env) {
  return {
    host: environment.HOST ?? "127.0.0.1",
    port: Number.parseInt(environment.PORT ?? "3000", 10),
    databasePath: environment.DATABASE_PATH ?? resolve(projectRoot, "data", "amanah-cash.sqlite"),
    migrationsPath: resolve(projectRoot, "migrations"),
    publicPath: resolve(projectRoot, "public")
  };
}
