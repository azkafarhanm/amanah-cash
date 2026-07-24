import type { AuthenticationEnvironment } from "@/auth/environment";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import type { Prisma } from "@/generated/prisma/client";
import { getPrismaClient } from "@/persistence/prisma";
import type { CorrectionDirection, TransactionType } from "@/transactions/domain";

export const TRANSACTION_PAGE_SIZE = 10;

export type TransactionHistoryItem = {
  id: string;
  type: TransactionType;
  amount: string;
  correctionDirection: CorrectionDirection | null;
  reason: string | null;
  notes: string | null;
  occurredAt: string;
  updatedAt: string;
  operator: string;
  revision: number;
  deletedAt: string | null;
};

export type TransactionHistoryResult = {
  balance: string;
  lastUpdated: string;
  recentActivity: TransactionHistoryItem | null;
  transactionCount: number;
  items: TransactionHistoryItem[];
  total: number;
  nextCursor: string | null;
  hasPrevious: boolean;
};

export type TransactionHistoryQuery = {
  type?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  cursor?: string;
};

export type StudentFinancialSummary = {
  balance: string;
  transactionCount: number;
};

export type WorkspaceTransactionItem = {
  id: string;
  studentId: string;
  studentName: string;
  studentNotes: string | null;
  studentStatus: string;
  type: TransactionType;
  amount: string;
  correctionDirection: CorrectionDirection | null;
  reason: string | null;
  notes: string | null;
  occurredAt: string;
  updatedAt: string;
  operator: string;
  revision: number;
  deletedAt: string | null;
};

export type WorkspaceTransactionQuery = TransactionHistoryQuery & {
  studentId?: string;
};

export type WorkspaceTransactionSummary = {
  todayDeposits: string;
  todayWithdrawals: string;
  todayTransactionCount: number;
};

export type WorkspaceTransactionResult = {
  items: WorkspaceTransactionItem[];
  total: number;
  nextCursor: string | null;
  hasPrevious: boolean;
  summary: WorkspaceTransactionSummary;
};

const TYPES = new Set<TransactionType>(["DEPOSIT", "WITHDRAWAL", "CORRECTION"]);

function dateBoundary(value: string | undefined, end: boolean) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T${end ? "23:59:59.999" : "00:00:00.000"}+07:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function decodeCursor(value: string | undefined) {
  if (!value) return undefined;
  try {
    const [occurredAt, id] = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown[];
    const date = typeof occurredAt === "string" ? new Date(occurredAt) : null;
    return date && !Number.isNaN(date.getTime()) && typeof id === "string" && id ? { occurredAt: date, id } : undefined;
  } catch { return undefined; }
}

function encodeCursor(value: { occurredAt: Date; id: string }) {
  return Buffer.from(JSON.stringify([value.occurredAt.toISOString(), value.id])).toString("base64url");
}

function item(value: {
  id: string; type: TransactionType; amount: bigint; correctionDirection: CorrectionDirection | null;
  reason: string | null; notes: string | null; occurredAt: Date; updatedAt: Date; revision: number;
  deletedAt: Date | null; updater: { name: string };
}): TransactionHistoryItem {
  return {
    id: value.id, type: value.type, amount: value.amount.toString(), correctionDirection: value.correctionDirection,
    reason: value.reason, notes: value.notes, occurredAt: value.occurredAt.toISOString(), updatedAt: value.updatedAt.toISOString(),
    operator: value.updater.name, revision: value.revision, deletedAt: value.deletedAt?.toISOString() ?? null
  };
}

export function transactionReadService(
  environment: AuthenticationEnvironment = loadAuthenticationEnvironment(),
  now: () => Date = () => new Date()
) {
  const prisma = getPrismaClient(environment);
  return {
    async studentSummaries(
      studentIds: string[],
      operatorId: string
    ): Promise<Record<string, StudentFinancialSummary>> {
      if (!studentIds.length) return {};
      const students = await prisma.student.findMany({
        where: { id: { in: studentIds }, operatorId },
        select: { id: true, balance: true, _count: { select: { transactions: true } } }
      });
      return Object.fromEntries(students.map((student) => [student.id, {
        balance: student.balance.toString(),
        transactionCount: student._count.transactions
      }]));
    },
    async history(studentId: string, operatorId: string, query: TransactionHistoryQuery): Promise<TransactionHistoryResult> {
      const type = typeof query.type === "string" && TYPES.has(query.type as TransactionType) ? query.type as TransactionType : undefined;
      const status = query.status === "ACTIVE" || query.status === "DELETED" ? query.status : undefined;
      const search = typeof query.search === "string" ? query.search.trim().slice(0, 100) : "";
      const from = dateBoundary(query.dateFrom, false);
      const to = dateBoundary(query.dateTo, true);
      const cursor = decodeCursor(query.cursor);
      const student = await prisma.student.findFirst({
        where: { id: studentId, operatorId },
        select: { balance: true, updatedAt: true, _count: { select: { transactions: true } } }
      });
      if (!student) throw new Error("Owned Student disappeared during financial read");
      const filteredWhere = {
        studentId,
        student: { operatorId },
        ...(type ? { type } : {}),
        ...(status === "ACTIVE" ? { deletedAt: null } : status === "DELETED" ? { deletedAt: { not: null } } : {}),
        ...(from || to ? { occurredAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
        ...(search ? { OR: [
          { notes: { contains: search } }, { reason: { contains: search } },
          { updater: { name: { contains: search } } }
        ] } : {})
      };
      const where = cursor ? { AND: [filteredWhere, { OR: [
        { occurredAt: { lt: cursor.occurredAt } },
        { occurredAt: cursor.occurredAt, id: { lt: cursor.id } }
      ] }] } : filteredWhere;
      const select = {
        id: true, type: true, amount: true, correctionDirection: true, reason: true, notes: true,
        occurredAt: true, updatedAt: true, revision: true, deletedAt: true, updater: { select: { name: true } }
      } as const;
      const [rows, total, recent, lastAudit] = await prisma.$transaction([
        prisma.transaction.findMany({ where, select, orderBy: [{ occurredAt: "desc" }, { id: "desc" }], take: TRANSACTION_PAGE_SIZE + 1 }),
        prisma.transaction.count({ where: filteredWhere }),
        prisma.transaction.findFirst({ where: { studentId, student: { operatorId } }, select, orderBy: [{ occurredAt: "desc" }, { id: "desc" }] }),
        prisma.financialAuditEvent.findFirst({ where: { studentId, student: { operatorId } }, select: { occurredAt: true }, orderBy: [{ occurredAt: "desc" }, { id: "desc" }] })
      ]);
      const visibleRows = rows.slice(0, TRANSACTION_PAGE_SIZE);
      const lastVisible = visibleRows.at(-1);
      return {
        balance: student.balance.toString(),
        lastUpdated: (lastAudit?.occurredAt ?? student.updatedAt).toISOString(),
        recentActivity: recent ? item(recent) : null,
        transactionCount: student._count.transactions,
        items: visibleRows.map(item), total,
        nextCursor: rows.length > TRANSACTION_PAGE_SIZE && lastVisible ? encodeCursor(lastVisible) : null,
        hasPrevious: Boolean(cursor)
      };
    },
    async workspaceHistory(
      operatorId: string,
      query: WorkspaceTransactionQuery
    ): Promise<WorkspaceTransactionResult> {
      const type = typeof query.type === "string" && TYPES.has(query.type as TransactionType) ? (query.type as TransactionType) : undefined;
      const status = query.status === "ACTIVE" || query.status === "DELETED" ? query.status : undefined;
      const search = typeof query.search === "string" ? query.search.trim().slice(0, 100) : "";
      const from = dateBoundary(query.dateFrom, false);
      const to = dateBoundary(query.dateTo, true);
      const cursor = decodeCursor(query.cursor);
      const studentId = typeof query.studentId === "string" && query.studentId ? query.studentId : undefined;

      const filteredWhere: Prisma.TransactionWhereInput = {
        student: {
          operatorId,
          ...(studentId ? { id: studentId } : {})
        },
        ...(type ? { type } : {}),
        ...(status === "ACTIVE" ? { deletedAt: null } : status === "DELETED" ? { deletedAt: { not: null } } : {}),
        ...(from || to ? { occurredAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
        ...(search ? { OR: [
          { student: { name: { contains: search } } },
          { notes: { contains: search } },
          { reason: { contains: search } },
          { updater: { name: { contains: search } } }
        ] } : {})
      };

      const where = cursor ? { AND: [filteredWhere, { OR: [
        { occurredAt: { lt: cursor.occurredAt } },
        { occurredAt: cursor.occurredAt, id: { lt: cursor.id } }
      ] }] } : filteredWhere;

      const select = {
        id: true,
        type: true,
        amount: true,
        correctionDirection: true,
        reason: true,
        notes: true,
        occurredAt: true,
        updatedAt: true,
        revision: true,
        deletedAt: true,
        updater: { select: { name: true } },
        student: { select: { id: true, name: true, notes: true, status: true } }
      } as const;

      const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(now());
      const todayStart = new Date(`${todayStr}T00:00:00.000+07:00`);
      const todayEnd = new Date(`${todayStr}T23:59:59.999+07:00`);

      const [rows, total, todayGroups] = await Promise.all([
        prisma.transaction.findMany({
          where,
          select,
          orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
          take: TRANSACTION_PAGE_SIZE + 1
        }),
        prisma.transaction.count({ where: filteredWhere }),
        prisma.transaction.groupBy({
          by: ["type"],
          where: {
            deletedAt: null,
            student: { operatorId },
            occurredAt: { gte: todayStart, lte: todayEnd }
          },
          _count: true,
          _sum: { amount: true }
        })
      ]);

      const visibleRows = rows.slice(0, TRANSACTION_PAGE_SIZE);
      const lastVisible = visibleRows.at(-1);

      let todayDeposits = BigInt(0);
      let todayWithdrawals = BigInt(0);
      let todayTransactionCount = 0;
      for (const group of todayGroups) {
        const amt = group._sum.amount ?? BigInt(0);
        todayTransactionCount += group._count;
        if (group.type === "DEPOSIT") todayDeposits += amt;
        if (group.type === "WITHDRAWAL") todayWithdrawals += amt;
      }

      return {
        items: visibleRows.map((row) => ({
          id: row.id,
          studentId: row.student.id,
          studentName: row.student.name,
          studentNotes: row.student.notes,
          studentStatus: row.student.status,
          type: row.type,
          amount: row.amount.toString(),
          correctionDirection: row.correctionDirection,
          reason: row.reason,
          notes: row.notes,
          occurredAt: row.occurredAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
          operator: row.updater.name,
          revision: row.revision,
          deletedAt: row.deletedAt?.toISOString() ?? null
        })),
        total,
        nextCursor: rows.length > TRANSACTION_PAGE_SIZE && lastVisible ? encodeCursor(lastVisible) : null,
        hasPrevious: Boolean(cursor),
        summary: {
          todayDeposits: todayDeposits.toString(),
          todayWithdrawals: todayWithdrawals.toString(),
          todayTransactionCount
        }
      };
    }
  };
}
