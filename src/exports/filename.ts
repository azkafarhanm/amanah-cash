import type { AdminReportKind, AdminReportResult, NormalizedReportFilters, ReportPeriod } from "@/reports/types";

const ADMIN_KIND_SEGMENT: Record<AdminReportKind, string> = {
  OPERATOR_ACTIVITY: "aktivitas-operator",
  OWNERSHIP_CHANGE: "perubahan-kepemilikan",
  STUDENT_ASSIGNMENT: "penugasan-siswa"
};

function jakartaParts(value: Date) {
  return Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Jakarta"
  }).formatToParts(value).map((part) => [part.type, part.value]));
}

function generationStamp(value: Date) {
  const parts = jakartaParts(value);
  return `${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}`;
}

function periodSegment(filters: { period: ReportPeriod; dateFrom?: string; dateTo?: string }) {
  if (filters.period === "ALL") return "semua-periode";
  if (filters.period === "MONTH" && filters.dateFrom) return filters.dateFrom.slice(0, 7);
  if (filters.dateFrom && filters.dateTo && filters.dateFrom === filters.dateTo) return filters.dateFrom;
  if (filters.dateFrom && filters.dateTo) return `${filters.dateFrom}_sampai_${filters.dateTo}`;
  if (filters.dateFrom) return `mulai_${filters.dateFrom}`;
  if (filters.dateTo) return `sampai_${filters.dateTo}`;
  return filters.period.toLocaleLowerCase("en-US");
}

export function operatorExportFileName(filters: NormalizedReportFilters, generatedAt: Date, fileExtension: string) {
  return `laporan-keuangan-${periodSegment(filters)}-${generationStamp(generatedAt)}.${fileExtension}`;
}

export function adminExportFileName(result: AdminReportResult, generatedAt: Date, fileExtension: string) {
  const kind = result.query.kind as AdminReportKind;
  return `laporan-administratif-${ADMIN_KIND_SEGMENT[kind]}-${periodSegment({
    period: result.query.period as ReportPeriod,
    dateFrom: result.query.dateFrom,
    dateTo: result.query.dateTo
  })}-${generationStamp(generatedAt)}.${fileExtension}`;
}
