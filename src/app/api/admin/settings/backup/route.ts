import packageMetadata from "../../../../../../package.json";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { withAuthorization } from "@/authorization/api";
import {
  createBackupArtifact,
  recordMaintenanceEvent
} from "@/settings/backup";

export const dynamic = "force-dynamic";

export const GET = withAuthorization({ role: "admin" }, async (_request, { authorization }) => {
  const environment = loadAuthenticationEnvironment();
  try {
    const { bytes, metadata } = await createBackupArtifact(
      environment.databaseUrl,
      packageMetadata.version
    );
    recordMaintenanceEvent(environment.databaseUrl, {
      actorId: authorization.id,
      operation: "BACKUP",
      outcome: "SUCCESS",
      metadata
    });
    const timestamp = metadata.createdAt.replace(/[:.]/g, "-");
    const body = new Uint8Array(bytes.byteLength);
    body.set(bytes);
    return new Response(body, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="amanah-cash-backup-${timestamp}.acbackup"`,
        "Content-Length": String(bytes.byteLength),
        "Content-Type": "application/vnd.amanah-cash.backup+json",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    try {
      recordMaintenanceEvent(environment.databaseUrl, {
        actorId: authorization.id,
        operation: "BACKUP",
        outcome: "FAILURE"
      });
    } catch {}
    return Response.json(
      { error: { code: "BACKUP_FAILED" } },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
});
