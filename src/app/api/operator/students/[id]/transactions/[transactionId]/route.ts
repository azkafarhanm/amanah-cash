import { withAuthorization } from "@/authorization/api";
import { transactionBody, transactionJson } from "@/transactions/http";
import { transactionRouteIds } from "@/transactions/routes";
import { transactionEngine } from "@/transactions/service";

const owner = { role: "owner" as const, studentId: (request: Request) => transactionRouteIds(request).studentId };

export const PATCH = withAuthorization(owner, async (request, { authorization }) => {
  const { studentId, transactionId } = transactionRouteIds(request);
  return transactionJson(async () => {
    const body = await transactionBody(request);
    return transactionEngine().edit({
      actorId: authorization.id, studentId, transactionId,
      commandId: body.commandId, correlationId: crypto.randomUUID(), expectedRevision: body.expectedRevision,
      type: body.type, amount: body.amount, correctionDirection: body.correctionDirection,
      reason: body.reason, notes: body.notes, occurredAt: body.occurredAt, editReason: body.editReason
    });
  });
});

export const DELETE = withAuthorization(owner, async (request, { authorization }) => {
  const { studentId, transactionId } = transactionRouteIds(request);
  return transactionJson(async () => {
    const body = await transactionBody(request);
    return transactionEngine().remove({
      actorId: authorization.id, studentId, transactionId,
      commandId: body.commandId, correlationId: crypto.randomUUID(), expectedRevision: body.expectedRevision, reason: body.reason
    });
  });
});
