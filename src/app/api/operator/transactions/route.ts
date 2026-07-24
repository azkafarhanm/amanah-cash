import { withAuthorization } from "@/authorization/api";
import { transactionJson } from "@/transactions/http";
import { transactionReadService } from "@/transactions/read-service";

export const GET = withAuthorization({ role: "operator" }, async (request, { authorization }) => {
  const params = new URL(request.url).searchParams;
  const query = {
    studentId: params.get("studentId") ?? undefined,
    type: params.get("type") ?? undefined,
    status: params.get("status") ?? undefined,
    search: params.get("search") ?? undefined,
    period: params.get("period") ?? undefined,
    dateFrom: params.get("dateFrom") ?? undefined,
    dateTo: params.get("dateTo") ?? undefined,
    cursor: params.get("cursor") ?? undefined
  };

  return transactionJson(() =>
    transactionReadService().workspaceHistory(authorization.id, query)
  );
});
