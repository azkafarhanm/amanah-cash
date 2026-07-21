import { StudentManagementError } from "@/students/domain";

export async function studentBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid body");
    return value as Record<string, unknown>;
  } catch {
    throw new StudentManagementError("VALIDATION", "Body JSON tidak valid.", 400);
  }
}

export async function studentJson<T>(operation: () => Promise<T>, successStatus = 200) {
  try {
    const data = await operation();
    return Response.json(data, { status: successStatus, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (!(error instanceof StudentManagementError)) throw error;
    return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  }
}
