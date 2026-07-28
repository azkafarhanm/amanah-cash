import { withAuthorization } from "@/authorization/api";
import {
  financialAuditDetailHttpResponse,
  withPrivateNoStore
} from "@/financial-assurance/http";
import { financialAuditReadService } from "@/financial-assurance/audit-read-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string; auditEventId: string }> }
) {
  const response = await withAuthorization(
    { role: "operator" },
    async (_authorizedRequest, { authorization }) => {
      const { studentId, auditEventId } = await params;
      return financialAuditDetailHttpResponse({
        reader: financialAuditReadService(),
        operatorId: authorization.id,
        studentId,
        auditEventId
      });
    }
  )(request);

  return withPrivateNoStore(response);
}
