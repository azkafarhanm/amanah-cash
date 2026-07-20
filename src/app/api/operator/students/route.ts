import { withAuthorization } from "@/authorization/api";
import { studentJson } from "@/students/http";
import { studentManagement } from "@/students/service";

export const GET = withAuthorization({ role: "operator" }, async (request, { authorization }) => {
  const query = new URL(request.url).searchParams;
  return studentJson(() => studentManagement().list({ kind: "operator", operatorId: authorization.id }, { search: query.get("search"), status: query.get("status"), page: query.get("page") }));
});
