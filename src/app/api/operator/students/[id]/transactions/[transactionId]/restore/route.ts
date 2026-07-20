import { withAuthorization } from "@/authorization/api";
import { transactionBody, transactionJson } from "@/transactions/http";
import { transactionRouteIds } from "@/transactions/routes";
import { transactionEngine } from "@/transactions/service";

export const POST = withAuthorization(
  { role: "owner", studentId: (request) => transactionRouteIds(request).studentId },
  async (request, { authorization }) => {
    const { studentId, transactionId } = transactionRouteIds(request);
    return transactionJson(async () => {
      const body = await transactionBody(request);
      return transactionEngine().restore({
        actorId: authorization.id, studentId, transactionId,
        commandId: body.commandId, correlationId: crypto.randomUUID(), expectedRevision: body.expectedRevision, reason: body.reason
      });
    });
  }
);
