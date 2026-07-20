import { withAuthorization } from "@/authorization/api";
import { transactionBody, transactionJson } from "@/transactions/http";
import { transactionRouteIds } from "@/transactions/routes";
import { transactionEngine } from "@/transactions/service";

export const POST = withAuthorization(
  { role: "owner", studentId: (request) => transactionRouteIds(request).studentId },
  async (request, { authorization }) => {
    const { studentId } = transactionRouteIds(request);
    return transactionJson(async () => {
      const body = await transactionBody(request);
      return transactionEngine().create({
        actorId: authorization.id,
        studentId,
        transactionId: body.transactionId,
        commandId: body.commandId,
        correlationId: crypto.randomUUID(),
        type: body.type,
        amount: body.amount,
        correctionDirection: body.correctionDirection,
        reason: body.reason,
        occurredAt: body.occurredAt
      });
    }, 201);
  }
);
