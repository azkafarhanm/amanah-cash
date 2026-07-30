import { loadAuthenticationEnvironment } from "@/auth/environment";
import { withAuthorization } from "@/authorization/api";
import {
  currentSchemaVersion,
  inspectBackupArtifact,
  restoreBackupArtifact
} from "@/settings/backup";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

async function artifactFromRequest(request: Request): Promise<Buffer> {
  const form = await request.formData();
  const artifact = form.get("artifact");
  if (!(artifact instanceof File) || artifact.size === 0 || artifact.size > MAX_UPLOAD_BYTES) {
    throw new Error("INVALID_UPLOAD");
  }
  return Buffer.from(await artifact.arrayBuffer());
}

export const POST = withAuthorization({ role: "admin" }, async (request) => {
  try {
    const bytes = await artifactFromRequest(request);
    const metadata = await inspectBackupArtifact(bytes);
    if (metadata.schemaVersion !== currentSchemaVersion(loadAuthenticationEnvironment().databaseUrl)) {
      throw new Error("UNSUPPORTED_SCHEMA_VERSION");
    }
    return Response.json(
      { metadata },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json(
      { error: { code: "INVALID_BACKUP" } },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
});

export const PUT = withAuthorization({ role: "admin" }, async (request, { authorization }) => {
  try {
    const bytes = await artifactFromRequest(request);
    const metadata = await restoreBackupArtifact(
      loadAuthenticationEnvironment().databaseUrl,
      bytes,
      authorization.id
    );
    return Response.json(
      { metadata, sessionEnded: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json(
      { error: { code: "RESTORE_FAILED" } },
      { status: 409, headers: { "Cache-Control": "no-store" } }
    );
  }
});
