import type { ExportFormat } from "@/exports/types";
import type { NormalizedReportFilters, ReportQuery } from "@/reports/types";
export { reportDate } from "@/presentation/formatting";

export function reportHref(basePath: string, filters: NormalizedReportFilters, overrides: Partial<ReportQuery> = {}) {
  const params = new URLSearchParams();
  const values: ReportQuery = {
    ...(filters.studentId ? { studentId: filters.studentId } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    period: filters.period,
    ...(filters.period === "CUSTOM" && filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.period === "CUSTOM" && filters.dateTo ? { dateTo: filters.dateTo } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search ? { search: filters.search } : {}),
    sort: filters.sort,
    direction: filters.direction,
    page: String(filters.page),
    ...overrides
  };
  for (const [key, value] of Object.entries(values)) if (value) params.set(key, value);
  return `${basePath}?${params}`;
}

export function adminReportHref(basePath: string, query: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...query, page: String(page) })) if (value) params.set(key, value);
  return `${basePath}?${params}`;
}

export function operatorReportExportHref(basePath: string, filters: NormalizedReportFilters, format: ExportFormat) {
  return `${reportHref(basePath, filters, { page: "1" })}&format=${encodeURIComponent(format)}`;
}

export function adminReportExportHref(basePath: string, query: Record<string, string | undefined>, format: ExportFormat) {
  return `${adminReportHref(basePath, query, 1)}&format=${encodeURIComponent(format)}`;
}
