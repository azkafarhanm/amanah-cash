import { loadAuthenticationEnvironment } from "@/auth/environment";
import { VercelBlobStorage } from "@/media/vercel-blob-storage";
import type { ProfilePhotoRenditionWidth } from "@/media/types";
import { getPrismaClient } from "@/persistence/prisma";

const widths = new Set<number>([64, 96, 128]);

export async function studentPhotoResponse(input: {
  request: Request;
  studentId: string;
  scope: { kind: "admin" } | { kind: "operator"; operatorId: string };
}) {
  const requestedWidth = Number(new URL(input.request.url).searchParams.get("width"));
  if (!widths.has(requestedWidth)) return new Response(null, { status: 404 });

  const prisma = getPrismaClient(loadAuthenticationEnvironment());
  const student = await prisma.student.findFirst({
    where: {
      id: input.studentId,
      ...(input.scope.kind === "operator" ? { operatorId: input.scope.operatorId } : {})
    },
    select: { photoObjectKey: true }
  });
  if (!student?.photoObjectKey) return new Response(null, { status: 404 });

  const width = requestedWidth as ProfilePhotoRenditionWidth;
  const key = `${student.photoObjectKey}/${width}.webp`;
  const storage = new VercelBlobStorage(process.env.BLOB_READ_WRITE_TOKEN ?? "");
  const object = await storage.get(key);
  if (!object) return new Response(null, { status: 404 });

  if (input.request.headers.get("if-none-match") === object.etag) {
    return new Response(null, {
      status: 304,
      headers: { ETag: object.etag, "Cache-Control": "private, max-age=31536000, immutable" }
    });
  }
  return new Response(object.bytes as BodyInit, {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(object.bytes.byteLength),
      "Cache-Control": "private, max-age=31536000, immutable",
      ETag: object.etag,
      "X-Content-Type-Options": "nosniff"
    }
  });
}
