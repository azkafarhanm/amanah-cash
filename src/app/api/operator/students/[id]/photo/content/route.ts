import { withAuthorization } from "@/authorization/api";
import { studentPhotoResponse } from "@/media/student-photo-delivery";

export const dynamic = "force-dynamic";

function studentId(request: Request) {
  const segments = new URL(request.url).pathname.split("/");
  return segments[segments.indexOf("students") + 1] ?? "";
}

export const GET = withAuthorization(
  { role: "owner", studentId },
  async (request, context) => studentPhotoResponse({
    request,
    studentId: studentId(request),
    scope: { kind: "operator", operatorId: context.authorization.id }
  })
);
