import { withAuthorization } from "@/authorization/api";
import { studentBody, studentJson } from "@/students/http";
import { studentManagement } from "@/students/service";

export const dynamic = "force-dynamic";

export const GET = withAuthorization({ role: "admin" }, async (request) => {
  const query = new URL(request.url).searchParams;
  return studentJson(() => studentManagement().list({ kind: "admin" }, { search: query.get("search"), status: query.get("status"), page: query.get("page") }));
});

export const POST = withAuthorization({ role: "admin" }, async (request) => studentJson(async () => {
  const input = await studentBody(request);
  return studentManagement().create({ name: input.name, notes: input.notes, status: input.status, operatorId: input.operatorId });
}, 201));
