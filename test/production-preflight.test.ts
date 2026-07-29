import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  formatProductionPreflight,
  loadProductionPreflight
} from "../src/operations/production-preflight";

const validProductionEnvironment = {
  DATABASE_URL: "file:./data/private-production.sqlite",
  AUTH_DEV_MODE: "false",
  GOOGLE_CLIENT_ID: "google-client-id.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "private-google-client-secret",
  NEXTAUTH_SECRET: "private-next-auth-secret-with-at-least-32-characters",
  NEXTAUTH_URL: "https://cash.example.com",
  EXPORT_MAX_ROWS: "2500",
  EXPORT_MAX_BYTES: "10485760"
};

test("production preflight requires Google OAuth and rejects development authentication", () => {
  assert.throws(
    () =>
      loadProductionPreflight({
        ...validProductionEnvironment,
        AUTH_DEV_MODE: "true"
      }),
    /AUTH_DEV_MODE cannot be enabled in production/
  );

  assert.throws(
    () =>
      loadProductionPreflight({
        ...validProductionEnvironment,
        GOOGLE_CLIENT_SECRET: ""
      }),
    /GOOGLE_CLIENT_SECRET is required/
  );
});

test("production preflight validates limits and emits a redacted operational summary", () => {
  const preflight = loadProductionPreflight(validProductionEnvironment);
  const summary = formatProductionPreflight(preflight).join("\n");

  assert.match(summary, /Production environment is valid/);
  assert.match(summary, /Google OAuth with database sessions/);
  assert.match(summary, /https:\/\/cash\.example\.com/);
  assert.match(summary, /server-only location redacted/);
  assert.match(summary, /export maximum rows: 2500/);
  assert.match(summary, /export maximum bytes: 10485760/);
  assert.doesNotMatch(summary, /private-production/);
  assert.doesNotMatch(summary, /private-google-client-secret/);
  assert.doesNotMatch(summary, /private-next-auth-secret/);
  assert.doesNotMatch(summary, /google-client-id/);
});

test("production preflight rejects unsafe origins and invalid export limits", () => {
  assert.throws(
    () =>
      loadProductionPreflight({
        ...validProductionEnvironment,
        NEXTAUTH_URL: "http://cash.example.com"
      }),
    /NEXTAUTH_URL must use HTTPS/
  );

  assert.throws(
    () =>
      loadProductionPreflight({
        ...validProductionEnvironment,
        EXPORT_MAX_ROWS: "0"
      }),
    /EXPORT_MAX_ROWS must be a positive integer/
  );
});

test("operational scripts redact database targets and migration failures", () => {
  const environmentScript = readFileSync("scripts/check-environment.ts", "utf8");
  const migrationScript = readFileSync("scripts/migrate-database.ts", "utf8");

  assert.match(environmentScript, /server-only location redacted/);
  assert.doesNotMatch(environmentScript, /environment\.databaseUrl/);
  assert.match(migrationScript, /Database migrations are current for the configured SQLite target/);
  assert.match(migrationScript, /Database migration failed/);
  assert.doesNotMatch(migrationScript, /console\.(?:log|error)\([^)]*environment\.databaseUrl/);
  assert.doesNotMatch(migrationScript, /console\.error\(error/);
});
