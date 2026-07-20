import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { resolve } from "node:path";
import { createGetSystemStatus } from "../src/application/get-system-status.js";
import { openDatabase } from "../src/persistence/database.js";
import { createServer } from "../src/presentation/server.js";

const root = resolve(import.meta.dirname, "..");
let database;
let server;
let origin;

before(async () => {
  database = openDatabase({ databasePath: ":memory:", migrationsPath: resolve(root, "migrations") });
  server = createServer({
    getSystemStatus: createGetSystemStatus({ database }),
    publicPath: resolve(root, "public")
  });
  await new Promise((resolveListening) => server.listen(0, "127.0.0.1", resolveListening));
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolveClosed) => server.close(resolveClosed));
  database.close();
});

test("schema creates only approved financial, authentication, and Operator persistence tables", () => {
  const tables = database.connection
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map(({ name }) => name);

  assert.deepEqual(tables, ["accounts", "financial_audit_events", "operator_audit", "schema_migrations", "sessions", "students", "transactions", "users"]);
  assert.equal(database.connection.prepare("PRAGMA table_info(students)").all().some(({ name }) => name === "balance"), true);
  assert.equal(database.connection.prepare("PRAGMA table_info(transactions)").all().some(({ name }) => name === "balance"), false);
});

test("server health proves the server-to-database boundary", async () => {
  const response = await fetch(`${origin}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    application: "amanah-cash",
    status: "ready",
    database: "connected"
  });
});

test("client shell is served through the server boundary", async () => {
  const response = await fetch(origin);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Student Detail/);
});

test("PWA manifest defines standalone metadata and scalable icons", () => {
  const manifest = JSON.parse(readFileSync(resolve(root, "public", "manifest.webmanifest"), "utf8"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/#students");
  assert.deepEqual(manifest.icons.map(({ sizes }) => sizes), ["192x192", "512x512"]);
});

test("server serves the PWA manifest with its registered media type", async () => {
  const response = await fetch(`${origin}/manifest.webmanifest`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/manifest+json");
});

test("mobile layout establishes the approved width and touch target", () => {
  const css = readFileSync(resolve(root, "public", "styles.css"), "utf8");
  assert.match(css, /min-width:\s*320px/);
  assert.match(css, /width:\s*min\(100%, 480px\)/);
  assert.match(css, /min-height:\s*44px/);
});
