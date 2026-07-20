import { withAuthorization } from "@/authorization/api";
import { studentJson } from "@/students/http";
import { studentManagement } from "@/students/service";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  return withAuthorization({ role: "admin" }, async () => studentJson(() => studentManagement().detail(id, { kind: "admin" })))(request);
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  return withAuthorization({ role: "admin" }, async (authorizedRequest) => studentJson(async () => {
    const body: unknown = await authorizedRequest.json();
    const input = typeof body === "object" && body ? body as Record<string, unknown> : {};
    return studentManagement().edit(id, { name: input.name, notes: input.notes, status: input.status, operatorId: input.operatorId });
  }))(request);
}
