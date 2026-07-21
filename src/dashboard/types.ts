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
};

export type AdminDashboardResult = {
  operators: { total: number; active: number; inactive: number };
  students: { total: number; active: number; inactive: number; archived: number };
  studentDistribution: Array<{ operatorId: string; operatorName: string; studentCount: number }>;
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
  recentTransactions: Array<{
    id: string;
    studentId: string;
    studentName: string;
    type: "DEPOSIT" | "WITHDRAWAL" | "CORRECTION";
    amount: string;
    correctionDirection: "INCREASE" | "DECREASE" | null;
    deleted: boolean;
    occurredAt: string;
  }>;
  recentlyUpdatedStudents: Array<{
    id: string;
    name: string;
    status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
    updatedAt: string;
  }>;
};
