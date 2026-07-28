import {
  FinancialAssuranceReadError,
  financialAssuranceReadService
} from "@/financial-assurance/read-service";
import {
  FinancialAuditReadError,
  financialAuditReadService
} from "@/financial-assurance/audit-read-service";
import type {
  FinancialAuditDetail,
  FinancialAuditTimelineQuery,
  FinancialAuditTimelineResult
} from "@/financial-assurance/types";

export type FinancialAssuranceReconciliationReader = Pick<
  ReturnType<typeof financialAssuranceReadService>,
  "reconcile"
>;

export type FinancialAuditReader = Pick<
  ReturnType<typeof financialAuditReadService>,
  "timeline" | "detail"
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

function response<T>(data: T): Response {
  return Response.json(data, {
    status: 200,
    headers: { "Cache-Control": PRIVATE_NO_STORE }
  });
}

function errorResponse(
  code: "INVALID_REQUEST" | "INVALID_QUERY" | "RESOURCE_NOT_FOUND" | "UNAVAILABLE",
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

export function financialAuditTimelineQuery(parameters: URLSearchParams): FinancialAuditTimelineQuery {
  return {
    cursor: parameters.get("cursor") ?? undefined,
    eventType: (parameters.get("eventType") ?? undefined) as FinancialAuditTimelineQuery["eventType"],
    dateFrom: parameters.get("startDate") ?? undefined,
    dateTo: parameters.get("endDate") ?? undefined
  };
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

export async function financialAuditTimelineHttpResponse(input: {
  reader: FinancialAuditReader;
  operatorId: string;
  studentId: string;
  parameters: URLSearchParams;
  correlationId?: string;
}): Promise<Response> {
  const correlationId = input.correlationId ?? crypto.randomUUID();

  try {
    const studentId = financialAssuranceStudentId(input.studentId);
    return response<FinancialAuditTimelineResult>(await input.reader.timeline(
      input.operatorId,
      studentId,
      financialAuditTimelineQuery(input.parameters)
    ));
  } catch (error) {
    if (error instanceof FinancialAssuranceRequestError) {
      return errorResponse("INVALID_REQUEST", 400, correlationId);
    }
    if (error instanceof FinancialAuditReadError) {
      return errorResponse(
        error.code === "INVALID_QUERY" ? "INVALID_QUERY" : "RESOURCE_NOT_FOUND",
        error.status,
        correlationId
      );
    }
    return errorResponse("UNAVAILABLE", 500, correlationId);
  }
}

export async function financialAuditDetailHttpResponse(input: {
  reader: FinancialAuditReader;
  operatorId: string;
  studentId: string;
  auditEventId: string;
  correlationId?: string;
}): Promise<Response> {
  const correlationId = input.correlationId ?? crypto.randomUUID();

  try {
    const studentId = financialAssuranceStudentId(input.studentId);
    const auditEventId = financialAssuranceStudentId(input.auditEventId);
    return response<FinancialAuditDetail>(await input.reader.detail(
      input.operatorId,
      studentId,
      auditEventId
    ));
  } catch (error) {
    if (error instanceof FinancialAssuranceRequestError) {
      return errorResponse("INVALID_REQUEST", 400, correlationId);
    }
    if (error instanceof FinancialAuditReadError) {
      return errorResponse("RESOURCE_NOT_FOUND", 404, correlationId);
    }
    return errorResponse("UNAVAILABLE", 500, correlationId);
  }
}

export function withPrivateNoStore(responseValue: Response): Response {
  responseValue.headers.set("Cache-Control", PRIVATE_NO_STORE);
  return responseValue;
}
