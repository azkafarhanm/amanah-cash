import { withAuthorization } from "@/authorization/api";
import { operatorManagement } from "@/operators/service";
import { operatorJson } from "@/operators/http";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return withAuthorization({ role: "admin" }, async () => operatorJson(async () => {
    const service = operatorManagement();
    const [operator, audit] = await Promise.all([service.detail(id), service.audits(id)]);
    return { operator, audit };
  }))(request);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return withAuthorization({ role: "admin" }, async (authorizedRequest, { authorization }) => operatorJson(async () => {
    const body: unknown = await authorizedRequest.json();
    const input = typeof body === "object" && body ? body as Record<string, unknown> : {};
    return operatorManagement().edit(id, { name: input.name, isActive: input.isActive }, authorization.id);
  }))(request);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return withAuthorization({ role: "admin" }, async (_request, { authorization }) =>
    operatorJson(() => operatorManagement().remove(id, authorization.id))
  )(request);
}
