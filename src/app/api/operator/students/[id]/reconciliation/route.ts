import { withAuthorization } from "@/authorization/api";
import {
  reconciliationHttpResponse,
  withPrivateNoStore
} from "@/financial-assurance/http";
import { financialAssuranceReadService } from "@/financial-assurance/read-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const response = await withAuthorization(
    { role: "operator" },
    async (_request, { authorization }) => {
      const { id } = await params;
      return reconciliationHttpResponse({
        reader: financialAssuranceReadService(),
        operatorId: authorization.id,
        studentId: id
      });
    }
  )(request);

  return withPrivateNoStore(response);
}
