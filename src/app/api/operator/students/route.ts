import { withAuthorization } from "@/authorization/api";
import { studentBody, studentJson } from "@/students/http";
import { studentManagement } from "@/students/service";

export const dynamic = "force-dynamic";

export const GET = withAuthorization({ role: "operator" }, async (request, { authorization }) => {
  const query = new URL(request.url).searchParams;
  return studentJson(() => studentManagement().list({ kind: "operator", operatorId: authorization.id }, { search: query.get("search"), status: query.get("status"), page: query.get("page") }));
});

export async function postOperatorStudentHandler(request: Request, { authorization }: { authorization: { id: string } }) {
  const input = await studentBody(request);
  return studentJson(() => studentManagement().createByOperator(authorization.id, { name: input.name, kelas: input.kelas, notes: input.notes }), 201);
}

export const POST = withAuthorization({ role: "operator" }, postOperatorStudentHandler);


