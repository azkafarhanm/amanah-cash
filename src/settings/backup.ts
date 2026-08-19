import { createHash, timingSafeEqual } from "node:crypto";
import { mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { disconnectPrismaClient } from "@/persistence/prisma";

import { getPrismaClient } from "@/persistence/prisma";
import { loadAuthenticationEnvironment } from "@/auth/environment";

const FORMAT = "amanah-cash-backup";
const FORMAT_VERSION = 1;
const MAX_ARTIFACT_BYTES = 100 * 1024 * 1024;

type BackupEnvelope = {
  format: typeof FORMAT;
  formatVersion: typeof FORMAT_VERSION;
  applicationVersion: string;
  schemaVersion: string;
  createdAt: string;
  digest: string;
  payload: string;
};

export type BackupMetadata = Omit<BackupEnvelope, "payload">;

type MaintenanceOperation = "BACKUP" | "RESTORE";
type MaintenanceOutcome = "SUCCESS" | "FAILURE";

function isPostgresUrl(databaseUrl: string): boolean {
  return databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");
}

function databasePath(databaseUrl: string): string {
  const value = databaseUrl.slice("file:".length);
  if (!value || value.includes("?") || value.includes("#")) {
    throw new Error("INVALID_DATABASE_URL");
  }
  if (value.startsWith("//")) return fileURLToPath(databaseUrl);
  return isAbsolute(value)
    ? value
    : resolve(/* turbopackIgnore: true */ process.cwd(), value);
}

function sha256(value: Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function recordMaintenanceEvent(
  databaseUrl: string,
  input: {
    actorId?: string;
    operation: MaintenanceOperation;
    outcome: MaintenanceOutcome;
    metadata?: BackupMetadata;
  }
): void {
  if (isPostgresUrl(databaseUrl)) {
    const prisma = getPrismaClient(loadAuthenticationEnvironment());
    void prisma.maintenanceAuditEvent
      .create({
        data: {
          id: crypto.randomUUID(),
          actorId: input.actorId ?? null,
          operation: input.operation,
          outcome: input.outcome,
          artifactCreatedAt: input.metadata?.createdAt
            ? new Date(input.metadata.createdAt)
            : null,
          applicationVersion: input.metadata?.applicationVersion ?? null,
          schemaVersion: input.metadata?.schemaVersion ?? null,
          occurredAt: new Date()
        }
      })
      .catch(() => {});
    return;
  }

  const database = new Database(databasePath(databaseUrl));
  try {
    database.prepare(`
      INSERT INTO maintenance_audit_events (
        id, actor_id, operation, outcome, artifact_created_at,
        application_version, schema_version, occurred_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      input.actorId ?? null,
      input.operation,
      input.outcome,
      input.metadata?.createdAt ?? null,
      input.metadata?.applicationVersion ?? null,
      input.metadata?.schemaVersion ?? null,
      new Date().toISOString()
    );
  } finally {
    database.close();
  }
}

function schemaVersion(database: Database.Database): string {
  const row = database
    .prepare("SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1")
    .get() as { version?: string } | undefined;
  if (!row?.version) throw new Error("MISSING_SCHEMA_VERSION");
  return row.version;
}

export function currentSchemaVersion(databaseUrl: string): string {
  if (isPostgresUrl(databaseUrl)) {
    return "postgresql-schema";
  }
  const database = new Database(databasePath(databaseUrl), {
    readonly: true,
    fileMustExist: true
  });
  try {
    return schemaVersion(database);
  } finally {
    database.close();
  }
}

function sanitizeSnapshot(path: string): void {
  const database = new Database(path);
  try {
    database.pragma("foreign_keys = ON");
    database.exec(`
      DELETE FROM sessions;
      UPDATE accounts
      SET refresh_token = NULL,
          access_token = NULL,
          expires_at = NULL,
          token_type = NULL,
          scope = NULL,
          id_token = NULL,
          session_state = NULL;
      VACUUM;
    `);
  } finally {
    database.close();
  }
}

function verifySnapshot(path: string): string {
  const database = new Database(path, { readonly: true, fileMustExist: true });
  try {
    const integrity = database.pragma("integrity_check", { simple: true });
    if (integrity !== "ok") throw new Error("INTEGRITY_CHECK_FAILED");
    const foreignKeys = database.pragma("foreign_key_check") as unknown[];
    if (foreignKeys.length) throw new Error("FOREIGN_KEY_CHECK_FAILED");

    const required = [
      "users",
      "settings_preferences",
      "maintenance_audit_events",
      "students",
      "transactions",
      "financial_audit_events",
      "schema_migrations"
    ];
    const tables = new Set(
      (database.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as Array<{ name: string }>)
        .map(({ name }) => name)
    );
    if (required.some((table) => !tables.has(table))) throw new Error("MISSING_REQUIRED_TABLE");

    const mismatch = database.prepare(`
      SELECT s.id
      FROM students s
      LEFT JOIN (
        SELECT
          student_id,
          SUM(
            CASE
              WHEN deleted_at IS NOT NULL THEN 0
              WHEN type = 'DEPOSIT' THEN amount
              WHEN type = 'WITHDRAWAL' THEN -amount
              WHEN type = 'CORRECTION' AND correction_direction = 'INCREASE' THEN amount
              WHEN type = 'CORRECTION' AND correction_direction = 'DECREASE' THEN -amount
              ELSE 0
            END
          ) AS expected_balance
        FROM transactions
        GROUP BY student_id
      ) effects ON effects.student_id = s.id
      WHERE s.balance != COALESCE(effects.expected_balance, 0)
      LIMIT 1
    `).get();
    if (mismatch) throw new Error("BALANCE_CHECK_FAILED");

    return schemaVersion(database);
  } finally {
    database.close();
  }
}

function parseEnvelope(bytes: Buffer): { envelope: BackupEnvelope; payload: Buffer } {
  if (bytes.byteLength > MAX_ARTIFACT_BYTES) throw new Error("ARTIFACT_TOO_LARGE");
  let candidate: unknown;
  try {
    candidate = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error("INVALID_ARTIFACT");
  }
  if (!candidate || typeof candidate !== "object") throw new Error("INVALID_ARTIFACT");
  const envelope = candidate as Partial<BackupEnvelope>;
  if (
    envelope.format !== FORMAT ||
    envelope.formatVersion !== FORMAT_VERSION ||
    typeof envelope.applicationVersion !== "string" ||
    typeof envelope.schemaVersion !== "string" ||
    typeof envelope.createdAt !== "string" ||
    typeof envelope.digest !== "string" ||
    typeof envelope.payload !== "string"
  ) {
    throw new Error("INVALID_ARTIFACT");
  }

  const payload = Buffer.from(envelope.payload, "base64");
  const expected = Buffer.from(envelope.digest, "hex");
  const actual = Buffer.from(sha256(payload), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error("DIGEST_MISMATCH");
  }
  return { envelope: envelope as BackupEnvelope, payload };
}

function metadataOf(envelope: BackupEnvelope): BackupMetadata {
  return {
    format: envelope.format,
    formatVersion: envelope.formatVersion,
    applicationVersion: envelope.applicationVersion,
    schemaVersion: envelope.schemaVersion,
    createdAt: envelope.createdAt,
    digest: envelope.digest
  };
}

export async function createBackupArtifact(
  databaseUrl: string,
  applicationVersion: string
): Promise<{ bytes: Buffer; metadata: BackupMetadata }> {
  if (isPostgresUrl(databaseUrl)) {
    throw new Error("CLOUD_BACKUP_UNAVAILABLE");
  }
  const sourcePath = databasePath(databaseUrl);
  const temporaryDirectory = await mkdtemp(resolve(dirname(sourcePath), ".amanah-backup-"));
  const snapshotPath = resolve(temporaryDirectory, "snapshot.sqlite");
  const source = new Database(sourcePath, { readonly: true, fileMustExist: true });
  try {
    await source.backup(snapshotPath);
  } finally {
    source.close();
  }

  try {
    sanitizeSnapshot(snapshotPath);
    const payload = await readFile(snapshotPath);
    const createdAt = new Date().toISOString();
    const metadata: BackupMetadata = {
      format: FORMAT,
      formatVersion: FORMAT_VERSION,
      applicationVersion,
      schemaVersion: verifySnapshot(snapshotPath),
      createdAt,
      digest: sha256(payload)
    };
    const bytes = Buffer.from(JSON.stringify({
      ...metadata,
      payload: payload.toString("base64")
    } satisfies BackupEnvelope));
    return { bytes, metadata };
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

export async function inspectBackupArtifact(bytes: Buffer): Promise<BackupMetadata> {
  const { envelope, payload } = parseEnvelope(bytes);
  const temporaryDirectory = await mkdtemp(resolve(tmpdir(), "amanah-inspect-"));
  const snapshotPath = resolve(temporaryDirectory, "snapshot.sqlite");
  try {
    await writeFile(snapshotPath, payload);
    const actualSchema = verifySnapshot(snapshotPath);
    if (actualSchema !== envelope.schemaVersion) throw new Error("SCHEMA_VERSION_MISMATCH");
    return metadataOf(envelope);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

export async function restoreBackupArtifact(
  databaseUrl: string,
  bytes: Buffer,
  actorId?: string
): Promise<BackupMetadata> {
  if (isPostgresUrl(databaseUrl)) {
    throw new Error("CLOUD_RESTORE_UNAVAILABLE");
  }
  const { envelope, payload } = parseEnvelope(bytes);
  const targetPath = databasePath(databaseUrl);
  const temporaryDirectory = await mkdtemp(resolve(dirname(targetPath), ".amanah-restore-"));
  const candidatePath = resolve(temporaryDirectory, "candidate.sqlite");
  const safetyPath = `${targetPath}.pre-restore-${Date.now()}.sqlite`;

  try {
    await writeFile(candidatePath, payload);
    const actualSchema = verifySnapshot(candidatePath);
    if (actualSchema !== envelope.schemaVersion) throw new Error("SCHEMA_VERSION_MISMATCH");
    const metadata = metadataOf(envelope);
    recordMaintenanceEvent(`file:${candidatePath}`, {
      actorId,
      operation: "RESTORE",
      outcome: "SUCCESS",
      metadata
    });
    verifySnapshot(candidatePath);

    const current = new Database(targetPath, { readonly: true, fileMustExist: true });
    try {
      const currentSchema = schemaVersion(current);
      if (currentSchema !== envelope.schemaVersion) throw new Error("UNSUPPORTED_SCHEMA_VERSION");
      await current.backup(safetyPath);
    } finally {
      current.close();
    }
    verifySnapshot(safetyPath);

    await disconnectPrismaClient();
    await rename(candidatePath, targetPath);
    return metadata;
  } catch (error) {
    await rm(safetyPath, { force: true });
    throw error;
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}
