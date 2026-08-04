export type DashboardActivityKind =
  | "ADMINISTRATIVE"
  | "FINANCIAL"
  | "OWNERSHIP_CHANGE"
  | "STATUS_CHANGE";

export type DashboardActivityItem = {
  id: string;
  kind: DashboardActivityKind;
  title: string;
  description: string;
  occurredAt: string;
  href?: string;
  studentId?: string;
  studentPhotoObjectKey?: string | null;
  studentPhotoUpdatedAt?: string | null;
};

export type AdminDashboardResult = {
  operators: { total: number; active: number; inactive: number };
  students: { total: number; active: number; inactive: number; archived: number };
  studentDistribution: Array<{ operatorId: string; operatorName: string; studentCount: number; operatorImage?: string | null }>;
  administrativeActivity: DashboardActivityItem[];
  ownershipChanges: DashboardActivityItem[];
  latestAssignments: DashboardActivityItem[];
};

export type OperatorDashboardResult = {
  students: { total: number; active: number; inactive: number; archived: number; activeToday: number };
  managedBalance: string;
  today: {
    deposits: { count: number; amount: string };
    withdrawals: { count: number; amount: string };
  };
  month: {
    deposits: { count: number; amount: string };
    withdrawals: { count: number; amount: string };
    netCashFlow: { amount: string; isPositive: boolean };
  };
  attentionStudents: Array<{
    id: string;
    name: string;
    reason: "ZERO_BALANCE" | "NO_TRANSACTIONS" | "INACTIVE_WITH_BALANCE";
    balance: string;
    updatedAt: string;
    photoObjectKey: string | null;
    photoUpdatedAt: string | null;
  }>;
  recentTransactions: Array<{
    id: string;
    studentId: string;
    studentName: string;
    type: "DEPOSIT" | "WITHDRAWAL" | "CORRECTION";
    amount: string;
    correctionDirection: "INCREASE" | "DECREASE" | null;
    deleted: boolean;
    occurredAt: string;
    studentPhotoObjectKey: string | null;
    studentPhotoUpdatedAt: string | null;
  }>;
  recentCorrections: Array<{
    id: string;
    studentId: string;
    studentName: string;
    amount: string;
    correctionDirection: "INCREASE" | "DECREASE" | null;
    reason: string | null;
    occurredAt: string;
  }>;
  recentWithdrawals: Array<{
    id: string;
    studentId: string;
    studentName: string;
    amount: string;
    occurredAt: string;
  }>;
  recentlyUpdatedStudents: Array<{
    id: string;
    name: string;
    status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
    updatedAt: string;
    photoObjectKey: string | null;
    photoUpdatedAt: string | null;
  }>;
};
