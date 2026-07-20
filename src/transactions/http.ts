import { TransactionEngineError } from "@/transactions/domain";

export async function transactionBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid body");
    return value as Record<string, unknown>;
  } catch {
    throw new TransactionEngineError("VALIDATION", "Body JSON tidak valid.", 400);
  }
}

export async function transactionJson<T>(operation: () => T | Promise<T>, successStatus = 200) {
  try {
    return Response.json(await operation(), { status: successStatus, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (!(error instanceof TransactionEngineError)) throw error;
    return Response.json({ error: { code: error.code, message: error.message, retryable: error.retryable } }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  }
}
