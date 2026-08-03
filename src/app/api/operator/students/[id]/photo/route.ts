import { withAuthorization } from "@/authorization/api";
import { ProfilePhotoValidationError } from "@/media/validation";
import { StudentPhotoUploadError } from "@/media/student-photo";
import { studentPhotoUploadService } from "@/media/student-photo-service";

export const dynamic = "force-dynamic";

const developmentDiagnostics = process.env.NODE_ENV !== "production";

function logStage(stage: string) {
  if (developmentDiagnostics) console.info(`[student-photo][route] ${stage}`);
}

function logException(error: unknown, origin: string) {
  if (!developmentDiagnostics) return;
  const exception = error instanceof Error ? error : new Error(String(error));
  console.error("[student-photo][route] exception", {
    class: exception.constructor.name,
    message: exception.message,
    stack: exception.stack,
    origin
  });
}

const messages: Record<string, string> = {
  EMPTY_FILE: "Pilih foto terlebih dahulu.",
  FILE_TOO_LARGE: "Ukuran foto maksimal 5 MB.",
  UNSUPPORTED_MIME_TYPE: "Gunakan foto JPEG, PNG, atau WebP statis.",
  MIME_TYPE_MISMATCH: "Jenis file tidak sesuai dengan isi foto.",
  INVALID_DIMENSIONS: "Dimensi foto tidak valid.",
  DIMENSIONS_TOO_LARGE: "Dimensi foto maksimal 8.192 × 8.192 piksel.",
  PIXEL_COUNT_TOO_LARGE: "Resolusi foto terlalu besar. Maksimal 25 megapiksel.",
  ANIMATED_IMAGE: "Foto animasi tidak didukung.",
  INVALID_IMAGE: "File foto rusak atau tidak dapat dibaca.",
  INVALID_CROP: "Area crop tidak valid. Atur ulang crop lalu coba lagi."
};

function cropValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") throw new ProfilePhotoValidationError("INVALID_CROP");
  try {
    return JSON.parse(value) as { left: number; top: number; size: number };
  } catch {
    throw new ProfilePhotoValidationError("INVALID_CROP");
  }
}

export async function postStudentPhotoHandler(
  request: Request,
  context: { authorization: { id: string } },
  studentId: string
) {
  logStage("request received");
  logStage("authorization passed");
  try {
    const form = await request.formData();
    const photo = form.get("photo");
    if (!(photo instanceof File)) throw new ProfilePhotoValidationError("EMPTY_FILE");
    logStage("file parsed");
    const stored = await studentPhotoUploadService()({
      studentId,
      operatorId: context.authorization.id,
      bytes: new Uint8Array(await photo.arrayBuffer()),
      declaredMimeType: photo.type,
      crop: cropValue(form.get("crop"))
    });
    return Response.json({ data: { photoUpdatedAt: stored.storedAt.toISOString() } }, {
      status: 201,
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    logException(error, "src/app/api/operator/students/[id]/photo/route.ts:postStudentPhotoHandler");
    if (error instanceof ProfilePhotoValidationError) {
      return Response.json({ error: { code: error.code, message: messages[error.code] } }, { status: 400 });
    }
    if (error instanceof StudentPhotoUploadError) {
      const status = error.code === "NOT_FOUND" ? 404 : error.code === "CONFLICT" ? 409 : 503;
      return Response.json({ error: { code: error.code, message: error.message } }, { status });
    }
    return Response.json({
      error: { code: "UPLOAD_FAILED", message: "Foto belum dapat disimpan. Silakan coba lagi." }
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export const POST = withAuthorization(
  { role: "owner", studentId: (request) => new URL(request.url).pathname.split("/").at(-2) ?? "" },
  async (request, context) => {
    const studentId = new URL(request.url).pathname.split("/").at(-2) ?? "";
    return postStudentPhotoHandler(request, context, studentId);
  }
);
