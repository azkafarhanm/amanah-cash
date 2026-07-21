import type { AdminReportKind, AdminReportQuery, NormalizedReportFilters, ReportPeriod, ReportQuery } from "@/reports/types";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const JAKARTA_OFFSET = "+07:00";

function text(value: unknown, maximum = 100) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function validDate(value: unknown) {
  const result = text(value, 10);
  if (!DATE.test(result)) return undefined;
  const parsed = new Date(`${result}T00:00:00.000${JAKARTA_OFFSET}`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  const normalized = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(parsed);
  return normalized === result ? result : undefined;
}

function jakartaDate(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
}

function shiftDate(value: string, days: number) {
  const date = new Date(`${value}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function reportPeriod(value: unknown): ReportPeriod {
  return value === "TODAY" || value === "WEEK" || value === "MONTH" || value === "CUSTOM" || value === "ALL" ? value : "MONTH";
}

export function periodDates(period: ReportPeriod, now: Date, customFrom?: string, customTo?: string) {
  const today = jakartaDate(now);
  let from: string | undefined;
  let to: string | undefined;
  if (period === "TODAY") from = to = today;
  if (period === "WEEK") {
    const weekday = new Date(`${today}T12:00:00.000Z`).getUTCDay();
    from = shiftDate(today, -(weekday === 0 ? 6 : weekday - 1));
    to = today;
  }
  if (period === "MONTH") {
    from = `${today.slice(0, 7)}-01`;
    to = today;
  }
  if (period === "CUSTOM") {
    from = validDate(customFrom);
    to = validDate(customTo);
    if (from && to && from > to) [from, to] = [to, from];
  }
  return {
    dateFrom: from,
    dateTo: to,
    from: from ? new Date(`${from}T00:00:00.000${JAKARTA_OFFSET}`) : undefined,
    to: to ? new Date(`${to}T23:59:59.999${JAKARTA_OFFSET}`) : undefined
  };
}

export function periodLabel(period: ReportPeriod, dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return "Seluruh periode";
  const format = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(`${value}T00:00:00.000${JAKARTA_OFFSET}`));
  if (dateFrom === dateTo) return format(dateFrom!);
  return `${dateFrom ? format(dateFrom) : "Awal"} – ${dateTo ? format(dateTo) : "Sekarang"}`;
}

export function normalizeReportFilters(query: ReportQuery, now = new Date()): NormalizedReportFilters {
  const period = reportPeriod(query.period);
  const dates = periodDates(period, now, query.dateFrom, query.dateTo);
  const page = Number.parseInt(text(query.page, 8), 10);
  return {
    ...(text(query.studentId) ? { studentId: text(query.studentId) } : {}),
    ...(query.type === "DEPOSIT" || query.type === "WITHDRAWAL" || query.type === "CORRECTION" ? { type: query.type } : {}),
    period,
    ...dates,
    ...(query.status === "ACTIVE" || query.status === "INACTIVE" || query.status === "ARCHIVED" ? { status: query.status } : {}),
    search: text(query.search),
    sort: query.sort === "amount" || query.sort === "student" ? query.sort : "occurredAt",
    direction: query.direction === "asc" ? "asc" : "desc",
    page: Number.isSafeInteger(page) && page > 0 ? page : 1
  };
}

export function normalizeAdminReportQuery(query: AdminReportQuery, now = new Date()) {
  const period = reportPeriod(query.period);
  const dates = periodDates(period, now, query.dateFrom, query.dateTo);
  const page = Number.parseInt(text(query.page, 8), 10);
  const kind: AdminReportKind = query.kind === "OWNERSHIP_CHANGE" || query.kind === "STUDENT_ASSIGNMENT" ? query.kind : "OPERATOR_ACTIVITY";
  const actions = new Set(["CREATED", "UPDATED", "ACTIVATED", "DEACTIVATED", "DELETED"]);
  return {
    kind,
    period,
    ...dates,
    search: text(query.search),
    action: actions.has(text(query.action)) ? text(query.action) : undefined,
    page: Number.isSafeInteger(page) && page > 0 ? page : 1
  };
}
