import { withAuthorization } from "@/authorization/api";
import {
  financialAuditTimelineHttpResponse,
  withPrivateNoStore
} from "@/financial-assurance/http";
import { financialAuditReadService } from "@/financial-assurance/audit-read-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const response = await withAuthorization(
    { role: "operator" },
    async (authorizedRequest, { authorization }) => {
      const { studentId } = await params;
      return financialAuditTimelineHttpResponse({
        reader: financialAuditReadService(),
        operatorId: authorization.id,
        studentId,
        parameters: new URL(authorizedRequest.url).searchParams
      });
    }
  )(request);

  return withPrivateNoStore(response);
}
