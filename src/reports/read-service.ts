import type { AuthenticationEnvironment } from "@/auth/environment";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import type { Prisma } from "@/generated/prisma/client";
import { getPrismaClient } from "@/persistence/prisma";
import { normalizeAdminReportQuery, normalizeReportFilters, periodLabel } from "@/reports/filters";
import type { AdminReportQuery, AdminReportResult, OperatorReportResult, ReportQuery } from "@/reports/types";
import { effect } from "@/transactions/domain";

export const REPORT_PAGE_SIZE = 20;

function transactionOrder(filters: ReturnType<typeof normalizeReportFilters>): Prisma.TransactionOrderByWithRelationInput[] {
  if (filters.sort === "amount") return [{ amount: filters.direction }, { occurredAt: "desc" }, { id: "desc" }];
  if (filters.sort === "student") return [{ student: { name: filters.direction } }, { occurredAt: "desc" }, { id: "desc" }];
  return [{ occurredAt: filters.direction }, { id: filters.direction }];
}

function pageCount(total: number) {
  return Math.max(1, Math.ceil(total / REPORT_PAGE_SIZE));
}

export function reportReadService(
  environment: AuthenticationEnvironment = loadAuthenticationEnvironment(),
  now: () => Date = () => new Date()
) {
  const prisma = getPrismaClient(environment);

  return {
    async operator(operatorId: string, query: ReportQuery): Promise<OperatorReportResult> {
      const filters = normalizeReportFilters(query, now());
      const ownedStudentWhere: Prisma.StudentWhereInput = {
        operatorId,
        ...(filters.studentId ? { id: filters.studentId } : {}),
        ...(filters.status ? { status: filters.status } : {})
      };
      const where: Prisma.TransactionWhereInput = {
        deletedAt: null,
        student: ownedStudentWhere,
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.from || filters.to ? { occurredAt: {
          ...(filters.from ? { gte: filters.from } : {}),
          ...(filters.to ? { lte: filters.to } : {})
        } } : {}),
        ...(filters.search ? { OR: [
          { student: { operatorId, name: { contains: filters.search } } },
          { notes: { contains: filters.search } },
          { reason: { contains: filters.search } },
          { updater: { name: { contains: filters.search } } }
        ] } : {})
      };
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
        updater: { select: { name: true } },
        student: { select: { id: true, name: true, status: true } }
      } as const;
      const [items, total, groups, activeStudents, students] = await Promise.all([
        prisma.transaction.findMany({
          where,
          select,
          orderBy: transactionOrder(filters),
          skip: (filters.page - 1) * REPORT_PAGE_SIZE,
          take: REPORT_PAGE_SIZE
        }),
        prisma.transaction.count({ where }),
        prisma.transaction.groupBy({
          by: ["type", "correctionDirection"],
          where,
          orderBy: [{ type: "asc" }, { correctionDirection: "asc" }],
          _count: true,
          _sum: { amount: true }
        }),
        filters.status && filters.status !== "ACTIVE"
          ? Promise.resolve(0)
          : prisma.student.count({ where: {
            operatorId,
            status: "ACTIVE",
            ...(filters.studentId ? { id: filters.studentId } : {})
          } }),
        prisma.student.findMany({
          where: { operatorId },
          select: { id: true, name: true, status: true },
          orderBy: [{ name: "asc" }, { id: "asc" }]
        })
      ]);
      const audits = items.length ? await prisma.financialAuditEvent.findMany({
        where: {
          student: { operatorId },
          transactionId: { in: items.map((item) => item.id) }
        },
        select: { id: true, transactionId: true, transactionRevision: true, balanceAfter: true, occurredAt: true },
        orderBy: [{ occurredAt: "desc" }, { id: "desc" }]
      }) : [];
      const auditByRevision = new Map<string, (typeof audits)[number]>();
      for (const audit of audits) {
        if (audit.transactionId && audit.transactionRevision !== null) {
          const key = `${audit.transactionId}:${audit.transactionRevision}`;
          if (!auditByRevision.has(key)) auditByRevision.set(key, audit);
        }
      }
      let deposits = BigInt(0);
      let withdrawals = BigInt(0);
      let netMovement = BigInt(0);
      let transactionCount = 0;
      for (const group of groups) {
        const amount = group._sum.amount ?? BigInt(0);
        transactionCount += group._count;
        if (group.type === "DEPOSIT") deposits += amount;
        if (group.type === "WITHDRAWAL") withdrawals += amount;
        netMovement += effect({ type: group.type, amount, correctionDirection: group.correctionDirection });
      }
      return {
        filters,
        students,
        summary: {
          deposits: deposits.toString(),
          withdrawals: withdrawals.toString(),
          netMovement: netMovement.toString(),
          transactionCount,
          activeStudents,
          periodLabel: periodLabel(filters.period, filters.dateFrom, filters.dateTo)
        },
        items: items.map((item) => {
          const audit = auditByRevision.get(`${item.id}:${item.revision}`);
          return {
            id: item.id,
            studentId: item.student.id,
            studentName: item.student.name,
            studentStatus: item.student.status,
            type: item.type,
            amount: item.amount.toString(),
            correctionDirection: item.correctionDirection,
            reason: item.reason,
            notes: item.notes,
            occurredAt: item.occurredAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
            operatorName: item.updater.name,
            revision: item.revision,
            balanceAfter: audit?.balanceAfter?.toString() ?? null,
            auditId: audit?.id ?? null
          };
        }),
        total,
        page: Math.min(filters.page, pageCount(total)),
        pages: pageCount(total)
      };
    },

    async admin(query: AdminReportQuery): Promise<AdminReportResult> {
      const filters = normalizeAdminReportQuery(query, now());
      const occurredAt = filters.from || filters.to ? {
        ...(filters.from ? { gte: filters.from } : {}),
        ...(filters.to ? { lte: filters.to } : {})
      } : undefined;
      const skip = (filters.page - 1) * REPORT_PAGE_SIZE;

      if (filters.kind === "OWNERSHIP_CHANGE") {
        const where: Prisma.FinancialAuditEventWhereInput = {
          eventType: "OWNERSHIP_TRANSFER",
          ...(occurredAt ? { occurredAt } : {}),
          ...(filters.search ? { OR: [
            { student: { name: { contains: filters.search } } },
            { reason: { contains: filters.search } }
          ] } : {})
        };
        const [items, total, operators] = await Promise.all([
          prisma.financialAuditEvent.findMany({
            where,
            select: { id: true, reason: true, oldOperatorId: true, newOperatorId: true, occurredAt: true, student: { select: { id: true, name: true } } },
            orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
            skip,
            take: REPORT_PAGE_SIZE
          }),
          prisma.financialAuditEvent.count({ where }),
          prisma.user.findMany({ where: { role: "OPERATOR" }, select: { id: true, name: true } })
        ]);
        const operatorName = new Map(operators.map((operator) => [operator.id, operator.name]));
        return {
          query: { kind: filters.kind, period: filters.period, search: filters.search, action: filters.action, dateFrom: filters.dateFrom, dateTo: filters.dateTo, page: String(filters.page) },
          periodLabel: periodLabel(filters.period, filters.dateFrom, filters.dateTo),
          items: items.map((item) => ({
            id: item.id,
            kind: "OWNERSHIP_CHANGE",
            subject: item.student.name,
            description: `${operatorName.get(item.oldOperatorId ?? "") ?? "Operator sebelumnya"} → ${operatorName.get(item.newOperatorId ?? "") ?? "Operator baru"}. ${item.reason ?? "Alasan tidak tersedia."}`,
            occurredAt: item.occurredAt.toISOString(),
            href: `/admin/students/${encodeURIComponent(item.student.id)}`
          })),
          total,
          page: Math.min(filters.page, pageCount(total)),
          pages: pageCount(total)
        };
      }

      if (filters.kind === "STUDENT_ASSIGNMENT") {
        const where: Prisma.StudentWhereInput = {
          ...(occurredAt ? { createdAt: occurredAt } : {}),
          ...(filters.search ? { OR: [
            { name: { contains: filters.search } },
            { operator: { name: { contains: filters.search } } }
          ] } : {})
        };
        const [items, total] = await Promise.all([
          prisma.student.findMany({ where, select: { id: true, name: true, createdAt: true, operator: { select: { name: true } } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip, take: REPORT_PAGE_SIZE }),
          prisma.student.count({ where })
        ]);
        return {
          query: { kind: filters.kind, period: filters.period, search: filters.search, action: filters.action, dateFrom: filters.dateFrom, dateTo: filters.dateTo, page: String(filters.page) },
          periodLabel: periodLabel(filters.period, filters.dateFrom, filters.dateTo),
          items: items.map((item) => ({ id: item.id, kind: "STUDENT_ASSIGNMENT", subject: item.name, description: `Penugasan awal kepada ${item.operator.name}.`, occurredAt: item.createdAt.toISOString(), href: `/admin/students/${encodeURIComponent(item.id)}` })),
          total,
          page: Math.min(filters.page, pageCount(total)),
          pages: pageCount(total)
        };
      }

      const matchingOperators = filters.search ? await prisma.user.findMany({
        where: { role: "OPERATOR", name: { contains: filters.search } },
        select: { id: true }
      }) : [];
      const where: Prisma.OperatorAuditWhereInput = {
        ...(occurredAt ? { createdAt: occurredAt } : {}),
        ...(filters.action ? { action: filters.action } : {}),
        ...(filters.search ? { OR: [
          { summary: { contains: filters.search } },
          { operatorId: { in: matchingOperators.map((operator) => operator.id) } }
        ] } : {})
      };
      const [items, total, operators] = await Promise.all([
        prisma.operatorAudit.findMany({ where, select: { id: true, operatorId: true, action: true, summary: true, createdAt: true }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip, take: REPORT_PAGE_SIZE }),
        prisma.operatorAudit.count({ where }),
        prisma.user.findMany({ where: { role: "OPERATOR" }, select: { id: true, name: true, deletedAt: true } })
      ]);
      const operatorById = new Map(operators.map((operator) => [operator.id, operator]));
      return {
        query: { kind: filters.kind, period: filters.period, search: filters.search, action: filters.action, dateFrom: filters.dateFrom, dateTo: filters.dateTo, page: String(filters.page) },
        periodLabel: periodLabel(filters.period, filters.dateFrom, filters.dateTo),
        items: items.map((item) => {
          const operator = operatorById.get(item.operatorId);
          return {
            id: item.id,
            kind: "OPERATOR_ACTIVITY",
            subject: operator?.name ?? "Operator yang telah dihapus",
            description: `${item.action}: ${item.summary}`,
            occurredAt: item.createdAt.toISOString(),
            href: operator && !operator.deletedAt ? `/admin/operators/${encodeURIComponent(item.operatorId)}` : undefined
          };
        }),
        total,
        page: Math.min(filters.page, pageCount(total)),
        pages: pageCount(total)
      };
    }
  };
}
