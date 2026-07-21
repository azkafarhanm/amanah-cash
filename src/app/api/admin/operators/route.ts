import { withAuthorization } from "@/authorization/api";
import { operatorManagement } from "@/operators/service";
import { operatorBody, operatorJson } from "@/operators/http";

export const dynamic = "force-dynamic";

export const GET = withAuthorization({ role: "admin" }, async (request) => {
  const query = new URL(request.url).searchParams;
  return operatorJson(() => operatorManagement().list({ search: query.get("search"), status: query.get("status"), page: query.get("page") }));
});

export const POST = withAuthorization({ role: "admin" }, async (request, { authorization }) =>
  operatorJson(async () => {
    const input = await operatorBody(request);
    return operatorManagement().create({ name: input.name, email: input.email }, authorization.id);
  }, 201)
);
