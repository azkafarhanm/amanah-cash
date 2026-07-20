import { withAuthorization } from "@/authorization/api";
import { studentJson } from "@/students/http";
import { studentManagement } from "@/students/service";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuthorization({ role: "owner", studentId: () => id }, async (_request, { authorization }) =>
    studentJson(() => studentManagement().detail(id, { kind: "operator", operatorId: authorization.id }))
  )(request);
}
