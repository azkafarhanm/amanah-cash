import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

export function openDatabase({ databasePath, migrationsPath }) {
  if (databasePath !== ":memory:") {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  const connection = new DatabaseSync(databasePath);
  connection.exec("PRAGMA foreign_keys = ON");
  runMigrations(connection, migrationsPath);

  return {
    connection,
    isConnected() {
      return connection.prepare("SELECT 1 AS connected").get().connected === 1;
    },
    close() {
      connection.close();
    }
  };
}

function runMigrations(connection, migrationsPath) {
  connection.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ) STRICT;
  `);

  const applied = connection
    .prepare("SELECT version FROM schema_migrations")
    .all()
    .map(({ version }) => version);

  for (const filename of readdirSync(migrationsPath).filter((name) => name.endsWith(".sql")).sort()) {
    if (applied.includes(filename)) continue;

    const sql = readFileSync(resolve(migrationsPath, filename), "utf8");
    connection.exec("BEGIN IMMEDIATE");
    try {
      connection.exec(sql);
      connection.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(filename);
      connection.exec("COMMIT");
    } catch (error) {
      connection.exec("ROLLBACK");
      throw error;
    }
  }
}
