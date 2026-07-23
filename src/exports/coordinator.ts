import { adminExportDocument, operatorExportDocument } from "@/exports/documents";
import { ExportValidationError } from "@/exports/errors";
import { adminExportFileName, operatorExportFileName } from "@/exports/filename";
import { enforceExportPreflight, enforceRenderedExportSize } from "@/exports/guardrails";
import { exportRegistry } from "@/exports/registry";
import { loadExportLimits, type ExportLimits } from "@/exports/config";
import type { ExportResult } from "@/exports/types";
import { reportReadService } from "@/reports/read-service";
import type { AdminReportQuery, AdminReportResult, OperatorReportResult, ReportQuery } from "@/reports/types";

type ReportReader = Pick<ReturnType<typeof reportReadService>, "operator" | "admin">;
type Registry = typeof exportRegistry;

const OPERATOR_QUERY_KEYS = ["studentId", "type", "period", "dateFrom", "dateTo", "status", "search", "sort", "direction"] as const;
const ADMIN_QUERY_KEYS = ["kind", "action", "period", "dateFrom", "dateTo", "search"] as const;

function queryFrom<TKey extends string>(parameters: URLSearchParams, keys: ReadonlyArray<TKey>) {
  const query: Partial<Record<TKey, string>> = {};
  for (const key of keys) {
    const value = parameters.get(key);
    if (value !== null) query[key] = value;
  }
  return query;
}

async function completeOperatorReport(reader: ReportReader, operatorId: string, query: ReportQuery, generatedAt: Date, limits: ExportLimits) {
  const first = await reader.operator(operatorId, { ...query, page: "1" });
  enforceExportPreflight({ limits, sampleDocument: operatorExportDocument(first, generatedAt), totalRows: first.total });
  const items = [...first.items];
  for (let page = 2; page <= first.pages; page += 1) {
    const next = await reader.operator(operatorId, { ...query, page: String(page) });
    items.push(...next.items);
  }
  return { ...first, items, page: 1 } satisfies OperatorReportResult;
}

async function completeAdminReport(reader: ReportReader, query: AdminReportQuery, generatedAt: Date, limits: ExportLimits) {
  const first = await reader.admin({ ...query, page: "1" });
  enforceExportPreflight({ limits, sampleDocument: adminExportDocument(first, generatedAt), totalRows: first.total });
  const items = [...first.items];
  for (let page = 2; page <= first.pages; page += 1) {
    const next = await reader.admin({ ...query, page: String(page) });
    items.push(...next.items);
  }
  return { ...first, items, page: 1 } satisfies AdminReportResult;
}

export function createExportCoordinator({
  reader = reportReadService(),
  registry = exportRegistry,
  now = () => new Date(),
  limits = loadExportLimits()
}: {
  reader?: ReportReader;
  registry?: Registry;
  now?: () => Date;
  limits?: ExportLimits;
} = {}) {
  return {
    async operator({ operatorId, parameters }: { operatorId: string; parameters: URLSearchParams }): Promise<ExportResult> {
      if (!operatorId) throw new ExportValidationError("Operator ekspor tidak valid.");
      const { format, adapter } = registry.resolve(parameters.get("format"));
      const query = queryFrom(parameters, OPERATOR_QUERY_KEYS) as ReportQuery;
      const generatedAt = now();
      const report = await completeOperatorReport(reader, operatorId, query, generatedAt, limits);
      const bytes = await adapter.render(operatorExportDocument(report, generatedAt));
      enforceRenderedExportSize(bytes.byteLength, limits);
      return { bytes, format, mediaType: adapter.mediaType, fileName: operatorExportFileName(report.filters, generatedAt, adapter.fileExtension) };
    },
    async admin({ parameters }: { parameters: URLSearchParams }): Promise<ExportResult> {
      const { format, adapter } = registry.resolve(parameters.get("format"));
      const query = queryFrom(parameters, ADMIN_QUERY_KEYS) as AdminReportQuery;
      const generatedAt = now();
      const report = await completeAdminReport(reader, query, generatedAt, limits);
      const bytes = await adapter.render(adminExportDocument(report, generatedAt));
      enforceRenderedExportSize(bytes.byteLength, limits);
      return { bytes, format, mediaType: adapter.mediaType, fileName: adminExportFileName(report, generatedAt, adapter.fileExtension) };
    }
  };
}

export const exportCoordinator = () => createExportCoordinator();
