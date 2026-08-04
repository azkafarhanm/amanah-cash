import { withAuthorization } from "@/authorization/api";
import { studentPhotoResponse } from "@/media/student-photo-delivery";

export const dynamic = "force-dynamic";

export const GET = withAuthorization({ role: "admin" }, async (request) => {
  const segments = new URL(request.url).pathname.split("/");
  const studentId = segments[segments.indexOf("students") + 1] ?? "";
  return studentPhotoResponse({ request, studentId, scope: { kind: "admin" } });
});
