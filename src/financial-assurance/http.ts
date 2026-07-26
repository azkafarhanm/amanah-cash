import {
  FinancialAssuranceReadError,
  financialAssuranceReadService
} from "@/financial-assurance/read-service";
import type { ReconciliationResult } from "@/financial-assurance/types";

export type FinancialAssuranceReconciliationReader = Pick<
  ReturnType<typeof financialAssuranceReadService>,
  "reconcile"
>;

const PRIVATE_NO_STORE = "private, no-store";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class FinancialAssuranceRequestError extends Error {
  constructor() {
    super("Permintaan pemeriksaan keuangan tidak valid.");
    this.name = "FinancialAssuranceRequestError";
  }
}

function response(data: ReconciliationResult): Response {
  return Response.json(data, {
    status: 200,
    headers: { "Cache-Control": PRIVATE_NO_STORE }
  });
}

function errorResponse(
  code: "INVALID_REQUEST" | "RESOURCE_NOT_FOUND" | "UNAVAILABLE",
  status: 400 | 404 | 500,
  correlationId: string
): Response {
  return Response.json(
    { error: { code, correlationId } },
    {
      status,
      headers: { "Cache-Control": PRIVATE_NO_STORE }
    }
  );
}

export function financialAssuranceStudentId(value: string): string {
  const studentId = value.trim();
  if (!UUID_PATTERN.test(studentId)) {
    throw new FinancialAssuranceRequestError();
  }
  return studentId;
}

export async function reconciliationHttpResponse(input: {
  reader: FinancialAssuranceReconciliationReader;
  operatorId: string;
  studentId: string;
  correlationId?: string;
}): Promise<Response> {
  const correlationId = input.correlationId ?? crypto.randomUUID();

  try {
    const studentId = financialAssuranceStudentId(input.studentId);
    return response(await input.reader.reconcile(input.operatorId, studentId));
  } catch (error) {
    if (error instanceof FinancialAssuranceRequestError) {
      return errorResponse("INVALID_REQUEST", 400, correlationId);
    }
    if (error instanceof FinancialAssuranceReadError) {
      return errorResponse("RESOURCE_NOT_FOUND", 404, correlationId);
    }
    return errorResponse("UNAVAILABLE", 500, correlationId);
  }
}

export function withPrivateNoStore(responseValue: Response): Response {
  responseValue.headers.set("Cache-Control", PRIVATE_NO_STORE);
  return responseValue;
}
