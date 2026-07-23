import { isExportError } from "@/exports/errors";
import type { ExportResult } from "@/exports/types";

export async function exportResponse(operation: () => Promise<ExportResult>) {
  try {
    const result = await operation();
    const body = new ArrayBuffer(result.bytes.byteLength);
    new Uint8Array(body).set(result.bytes);
    return new Response(body, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "Content-Type": result.mediaType,
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    if (!isExportError(error)) throw error;
    return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  }
}
