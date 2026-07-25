import type { AuthenticationEnvironment } from "@/auth/environment";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { getPrismaClient } from "@/persistence/prisma";
import type {
  AdminDashboardResult,
  DashboardActivityItem,
  OperatorDashboardResult
} from "@/dashboard/types";

const ACTIVITY_LIMIT = 6;

function jakartaDay(now: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(now).filter(({ type }) => type !== "literal").map(({ type, value }) => [type, value])
  );
  const start = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00.000+07:00`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

function jakartaMonth(now: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit"
    }).formatToParts(now).filter(({ type }) => type !== "literal").map(({ type, value }) => [type, value])
  );
  const start = new Date(`${parts.year}-${parts.month}-01T00:00:00.000+07:00`);
  return { start };
}

function countFor<T extends string>(
  groups: Array<{ status: T; _count: number }>,
  status: T
) {
  return groups.find((group) => group.status === status)?._count ?? 0;
}

function operatorAuditKind(action: string): DashboardActivityItem["kind"] {
  return action === "ACTIVATED" || action === "DEACTIVATED" || action === "DELETED"
    ? "STATUS_CHANGE"
    : "ADMINISTRATIVE";
}

export function dashboardReadService(
  environment: AuthenticationEnvironment = loadAuthenticationEnvironment(),
  now: () => Date = () => new Date()
) {
  const prisma = getPrismaClient(environment);

  return {
    async admin(): Promise<AdminDashboardResult> {
      const [operatorGroups, studentGroups, distribution, audits, transfers, assignments, operatorNames] =
        await Promise.all([
          prisma.user.groupBy({
            by: ["isActive"],
            where: { role: "OPERATOR", deletedAt: null },
            orderBy: { isActive: "asc" },
            _count: true
          }),
          prisma.student.groupBy({ by: ["status"], orderBy: { status: "asc" }, _count: true }),
          prisma.user.findMany({
            where: { role: "OPERATOR", deletedAt: null },
            select: { id: true, name: true, _count: { select: { students: true } } },
            orderBy: [{ name: "asc" }, { id: "asc" }]
          }),
          prisma.operatorAudit.findMany({
            select: { id: true, operatorId: true, action: true, summary: true, createdAt: true },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: ACTIVITY_LIMIT
          }),
          prisma.financialAuditEvent.findMany({
            where: { eventType: "OWNERSHIP_TRANSFER" },
            select: {
              id: true,
              reason: true,
              oldOperatorId: true,
              newOperatorId: true,
              occurredAt: true,
              student: { select: { id: true, name: true } }
            },
            orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
            take: ACTIVITY_LIMIT
          }),
          prisma.student.findMany({
            select: {
              id: true,
              name: true,
              createdAt: true,
              operator: { select: { name: true } }
            },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: ACTIVITY_LIMIT
          }),
          prisma.user.findMany({
            where: { role: "OPERATOR" },
            select: { id: true, name: true, deletedAt: true }
          })
        ]);

      const operatorById = new Map(operatorNames.map((operator) => [operator.id, operator]));
      const activeOperators = operatorGroups.find((group) => group.isActive)?._count ?? 0;
      const inactiveOperators = operatorGroups.find((group) => !group.isActive)?._count ?? 0;
      const activeStudents = countFor(studentGroups, "ACTIVE");
      const inactiveStudents = countFor(studentGroups, "INACTIVE");
      const archivedStudents = countFor(studentGroups, "ARCHIVED");

      return {
        operators: {
          total: activeOperators + inactiveOperators,
          active: activeOperators,
          inactive: inactiveOperators
        },
        students: {
          total: activeStudents + inactiveStudents + archivedStudents,
          active: activeStudents,
          inactive: inactiveStudents,
          archived: archivedStudents
        },
        studentDistribution: distribution.map((operator) => ({
          operatorId: operator.id,
          operatorName: operator.name,
          studentCount: operator._count.students
        })),
        administrativeActivity: audits.map((audit) => {
          const operator = operatorById.get(audit.operatorId);

          return {
            id: audit.id,
            kind: operatorAuditKind(audit.action),
            title: operator?.name ?? "Operator yang telah dihapus",
            description: audit.summary,
            occurredAt: audit.createdAt.toISOString(),
            href: operator && !operator.deletedAt
              ? `/admin/operators/${encodeURIComponent(audit.operatorId)}`
              : undefined
          };
        }),
        ownershipChanges: transfers.map((transfer) => ({
          id: transfer.id,
          kind: "OWNERSHIP_CHANGE",
          title: transfer.student.name,
          description: `${operatorById.get(transfer.oldOperatorId ?? "")?.name ?? "Operator sebelumnya"} → ${operatorById.get(transfer.newOperatorId ?? "")?.name ?? "Operator baru"}. ${transfer.reason ?? "Alasan tidak tersedia."}`,
          occurredAt: transfer.occurredAt.toISOString(),
          href: `/admin/students/${encodeURIComponent(transfer.student.id)}`
        })),
        latestAssignments: assignments.map((student) => ({
          id: student.id,
          kind: "OWNERSHIP_CHANGE",
          title: student.name,
          description: `Ditugaskan kepada ${student.operator.name}.`,
          occurredAt: student.createdAt.toISOString(),
          href: `/admin/students/${encodeURIComponent(student.id)}`
        }))
      };
    },

    async operator(operatorId: string): Promise<OperatorDashboardResult> {
      const { start: todayStart, end: todayEnd } = jakartaDay(now());
      const { start: monthStart } = jakartaMonth(now());

      const [
        studentGroups,
        managed,
        activeToday,
        todayTransactions,
        monthTransactions,
        zeroBalanceStudents,
        noTxnStudents,
        inactiveWithBalanceStudents,
        recentTransactions,
        recentCorrections,
        recentWithdrawals,
        recentStudents
      ] = await Promise.all([
        prisma.student.groupBy({
          by: ["status"],
          where: { operatorId },
          orderBy: { status: "asc" },
          _count: true
        }),
        prisma.student.aggregate({
          where: { operatorId },
          _sum: { balance: true }
        }),
        prisma.student.count({
          where: {
            operatorId,
            status: "ACTIVE",
            transactions: { some: { deletedAt: null, occurredAt: { gte: todayStart, lt: todayEnd } } }
          }
        }),
        prisma.transaction.groupBy({
          by: ["type"],
          where: {
            student: { operatorId },
            deletedAt: null,
            occurredAt: { gte: todayStart, lt: todayEnd },
            type: { in: ["DEPOSIT", "WITHDRAWAL"] }
          },
          orderBy: { type: "asc" },
          _count: true,
          _sum: { amount: true }
        }),
        prisma.transaction.groupBy({
          by: ["type"],
          where: {
            student: { operatorId },
            deletedAt: null,
            occurredAt: { gte: monthStart, lt: todayEnd },
            type: { in: ["DEPOSIT", "WITHDRAWAL"] }
          },
          orderBy: { type: "asc" },
          _count: true,
          _sum: { amount: true }
        }),
        prisma.student.findMany({
          where: { operatorId, status: "ACTIVE", balance: 0 },
          select: { id: true, name: true, balance: true, updatedAt: true },
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          take: 5
        }),
        prisma.student.findMany({
          where: { operatorId, status: "ACTIVE", transactions: { none: {} } },
          select: { id: true, name: true, balance: true, updatedAt: true },
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          take: 5
        }),
        prisma.student.findMany({
          where: { operatorId, status: { in: ["INACTIVE", "ARCHIVED"] }, balance: { gt: 0 } },
          select: { id: true, name: true, balance: true, updatedAt: true },
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          take: 5
        }),
        prisma.transaction.findMany({
          where: { student: { operatorId } },
          select: {
            id: true,
            type: true,
            amount: true,
            correctionDirection: true,
            deletedAt: true,
            occurredAt: true,
            student: { select: { id: true, name: true } }
          },
          orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
          take: ACTIVITY_LIMIT
        }),
        prisma.transaction.findMany({
          where: { student: { operatorId }, type: "CORRECTION", deletedAt: null },
          select: {
            id: true,
            amount: true,
            correctionDirection: true,
            reason: true,
            occurredAt: true,
            student: { select: { id: true, name: true } }
          },
          orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
          take: ACTIVITY_LIMIT
        }),
        prisma.transaction.findMany({
          where: { student: { operatorId }, type: "WITHDRAWAL", deletedAt: null },
          select: {
            id: true,
            amount: true,
            occurredAt: true,
            student: { select: { id: true, name: true } }
          },
          orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
          take: ACTIVITY_LIMIT
        }),
        prisma.student.findMany({
          where: { operatorId },
          select: { id: true, name: true, status: true, updatedAt: true },
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          take: ACTIVITY_LIMIT
        })
      ]);

      const activeStudents = countFor(studentGroups, "ACTIVE");
      const inactiveStudents = countFor(studentGroups, "INACTIVE");
      const archivedStudents = countFor(studentGroups, "ARCHIVED");
      const todayDeposits = todayTransactions.find((group) => group.type === "DEPOSIT");
      const todayWithdrawals = todayTransactions.find((group) => group.type === "WITHDRAWAL");
      const monthDeposits = monthTransactions.find((group) => group.type === "DEPOSIT");
      const monthWithdrawals = monthTransactions.find((group) => group.type === "WITHDRAWAL");

      const monthDepBigInt = monthDeposits?._sum.amount ?? BigInt(0);
      const monthWithBigInt = monthWithdrawals?._sum.amount ?? BigInt(0);
      const netBigInt = monthDepBigInt - monthWithBigInt;
      const isNetPositive = netBigInt >= 0n;
      const absNetBigInt = netBigInt < 0n ? -netBigInt : netBigInt;

      // Deduplicate attention students
      const attentionMap = new Map<string, {
        id: string;
        name: string;
        reason: "ZERO_BALANCE" | "NO_TRANSACTIONS" | "INACTIVE_WITH_BALANCE";
        balance: string;
        updatedAt: string;
      }>();

      for (const s of inactiveWithBalanceStudents) {
        if (!attentionMap.has(s.id)) {
          attentionMap.set(s.id, {
            id: s.id,
            name: s.name,
            reason: "INACTIVE_WITH_BALANCE",
            balance: s.balance.toString(),
            updatedAt: s.updatedAt.toISOString()
          });
        }
      }
      for (const s of noTxnStudents) {
        if (!attentionMap.has(s.id)) {
          attentionMap.set(s.id, {
            id: s.id,
            name: s.name,
            reason: "NO_TRANSACTIONS",
            balance: s.balance.toString(),
            updatedAt: s.updatedAt.toISOString()
          });
        }
      }
      for (const s of zeroBalanceStudents) {
        if (!attentionMap.has(s.id)) {
          attentionMap.set(s.id, {
            id: s.id,
            name: s.name,
            reason: "ZERO_BALANCE",
            balance: s.balance.toString(),
            updatedAt: s.updatedAt.toISOString()
          });
        }
      }

      const attentionStudents = Array.from(attentionMap.values()).slice(0, 5);

      return {
        students: {
          total: activeStudents + inactiveStudents + archivedStudents,
          active: activeStudents,
          inactive: inactiveStudents,
          archived: archivedStudents,
          activeToday
        },
        managedBalance: (managed._sum.balance ?? BigInt(0)).toString(),
        today: {
          deposits: {
            count: todayDeposits?._count ?? 0,
            amount: (todayDeposits?._sum.amount ?? BigInt(0)).toString()
          },
          withdrawals: {
            count: todayWithdrawals?._count ?? 0,
            amount: (todayWithdrawals?._sum.amount ?? BigInt(0)).toString()
          }
        },
        month: {
          deposits: {
            count: monthDeposits?._count ?? 0,
            amount: monthDepBigInt.toString()
          },
          withdrawals: {
            count: monthWithdrawals?._count ?? 0,
            amount: monthWithBigInt.toString()
          },
          netCashFlow: {
            amount: absNetBigInt.toString(),
            isPositive: isNetPositive
          }
        },
        attentionStudents,
        recentTransactions: recentTransactions.map((transaction) => ({
          id: transaction.id,
          studentId: transaction.student.id,
          studentName: transaction.student.name,
          type: transaction.type,
          amount: transaction.amount.toString(),
          correctionDirection: transaction.correctionDirection,
          deleted: Boolean(transaction.deletedAt),
          occurredAt: transaction.occurredAt.toISOString()
        })),
        recentCorrections: recentCorrections.map((transaction) => ({
          id: transaction.id,
          studentId: transaction.student.id,
          studentName: transaction.student.name,
          amount: transaction.amount.toString(),
          correctionDirection: transaction.correctionDirection,
          reason: transaction.reason,
          occurredAt: transaction.occurredAt.toISOString()
        })),
        recentWithdrawals: recentWithdrawals.map((transaction) => ({
          id: transaction.id,
          studentId: transaction.student.id,
          studentName: transaction.student.name,
          amount: transaction.amount.toString(),
          occurredAt: transaction.occurredAt.toISOString()
        })),
        recentlyUpdatedStudents: recentStudents.map((student) => ({
          id: student.id,
          name: student.name,
          status: student.status,
          updatedAt: student.updatedAt.toISOString()
        }))
      };
    }
  };
}

