import type { CorrectionDirection, FinancialEventType, TransactionType } from "@/transactions/domain";

export type IntegrityStatus = "MATCHED" | "MISMATCHED" | "UNAVAILABLE";

export type FinancialAssuranceStudentStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type FinancialAssuranceStudent = Readonly<{
  id: string;
  name: string;
  status: FinancialAssuranceStudentStatus;
}>;

export type ReconciliationResult = Readonly<{
  student: FinancialAssuranceStudent;
  persistedBalance: string;
  calculatedBalance: string;
  difference: string;
  activeTransactionCount: number;
  financialVersion: number;
  checkedAt: string;
  integrityStatus: IntegrityStatus;
}>;

export type FinancialAuditEventType = FinancialEventType | "OWNERSHIP_TRANSFER";

export type FinancialAuditActorRole = "OPERATOR" | "PLATFORM_ADMIN";

export type FinancialAuditActor = Readonly<{
  name: string;
  role: FinancialAuditActorRole;
}>;

export type FinancialAuditBalanceEvidence = Readonly<{
  before: string;
  after: string;
  delta: string;
}>;

export type FinancialAuditDetailAvailability = "AVAILABLE" | "UNSUPPORTED_SCHEMA";

export type FinancialAuditTimelineQuery = Readonly<{
  cursor?: string;
  eventType?: FinancialAuditEventType;
  dateFrom?: string;
  dateTo?: string;
}>;

export type FinancialAuditTimelineItem = Readonly<{
  id: string;
  eventType: FinancialAuditEventType;
  committedAt: string;
  actor: FinancialAuditActor;
  transactionId: string | null;
  transactionRevision: number | null;
  reason: string | null;
  balanceEvidence: FinancialAuditBalanceEvidence | null;
  detailAvailability: FinancialAuditDetailAvailability;
}>;

export type FinancialAuditTimelineResult = Readonly<{
  student: FinancialAssuranceStudent;
  items: ReadonlyArray<FinancialAuditTimelineItem>;
  nextCursor: string | null;
  hasMore: boolean;
}>;

export type FinancialAuditFieldValueMap = {
  type: TransactionType;
  amount: string;
  correctionDirection: CorrectionDirection | null;
  reason: string | null;
  notes: string | null;
  occurredAt: string;
  revision: number;
  deletedAt: string | null;
};

export type FinancialAuditFieldKey = keyof FinancialAuditFieldValueMap;

export type FinancialAuditFieldChange = {
  [Key in FinancialAuditFieldKey]: Readonly<{
    field: Key;
    before: FinancialAuditFieldValueMap[Key] | null;
    after: FinancialAuditFieldValueMap[Key] | null;
  }>;
}[FinancialAuditFieldKey];

export type FinancialAuditDetail = Readonly<{
  id: string;
  eventType: FinancialAuditEventType;
  committedAt: string;
  actor: FinancialAuditActor;
  transactionId: string | null;
  transactionRevision: number | null;
  reason: string | null;
  schemaVersion: number;
  balanceEvidence: FinancialAuditBalanceEvidence | null;
  changes: ReadonlyArray<FinancialAuditFieldChange>;
  detailAvailability: FinancialAuditDetailAvailability;
}>;
