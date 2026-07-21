import type { CorrectionDirection, TransactionType } from "@/transactions/domain";

export type ReportPeriod = "TODAY" | "WEEK" | "MONTH" | "CUSTOM" | "ALL";
export type ReportSort = "occurredAt" | "amount" | "student";
export type ReportDirection = "asc" | "desc";

export type ReportQuery = {
  studentId?: string;
  type?: string;
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  search?: string;
  sort?: string;
  direction?: string;
  page?: string;
};

export type NormalizedReportFilters = {
  studentId?: string;
  type?: TransactionType;
  period: ReportPeriod;
  dateFrom?: string;
  dateTo?: string;
  from?: Date;
  to?: Date;
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  search: string;
  sort: ReportSort;
  direction: ReportDirection;
  page: number;
};

export type ReportStudentOption = {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
};

export type OperatorReportRow = {
  id: string;
  studentId: string;
  studentName: string;
  studentStatus: ReportStudentOption["status"];
  type: TransactionType;
  amount: string;
  correctionDirection: CorrectionDirection | null;
  reason: string | null;
  notes: string | null;
  occurredAt: string;
  updatedAt: string;
  operatorName: string;
  revision: number;
  balanceAfter: string | null;
  auditId: string | null;
};

export type OperatorReportResult = {
  filters: NormalizedReportFilters;
  students: ReportStudentOption[];
  summary: {
    deposits: string;
    withdrawals: string;
    netMovement: string;
    transactionCount: number;
    activeStudents: number;
    periodLabel: string;
  };
  items: OperatorReportRow[];
  total: number;
  page: number;
  pages: number;
};

export type AdminReportKind = "OPERATOR_ACTIVITY" | "OWNERSHIP_CHANGE" | "STUDENT_ASSIGNMENT";

export type AdminReportQuery = {
  kind?: string;
  action?: string;
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: string;
};

export type AdminReportRow = {
  id: string;
  kind: AdminReportKind;
  subject: string;
  description: string;
  occurredAt: string;
  href?: string;
};

export type AdminReportResult = {
  query: Required<Pick<AdminReportQuery, "kind" | "period" | "search">> & Omit<AdminReportQuery, "kind" | "period" | "search">;
  periodLabel: string;
  items: AdminReportRow[];
  total: number;
  page: number;
  pages: number;
};
