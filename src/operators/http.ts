import { OperatorManagementError } from "@/operators/domain";

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
