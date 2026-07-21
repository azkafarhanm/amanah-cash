import { OperatorManagementError } from "@/operators/domain";

export async function operatorBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid body");
    return value as Record<string, unknown>;
  } catch {
    throw new OperatorManagementError("VALIDATION", "Body JSON tidak valid.", 400);
  }
}

export async function operatorJson<T>(operation: () => Promise<T>, successStatus = 200) {
  try {
    const data = await operation();
    return data === undefined
      ? new Response(null, { status: 204 })
      : Response.json(data, { status: successStatus, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (!(error instanceof OperatorManagementError)) throw error;
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
