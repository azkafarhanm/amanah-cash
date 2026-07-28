import type { AuthenticationEnvironment } from "@/auth/environment";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import type {
  FinancialAuditDetail,
  FinancialAuditFieldChange,
  FinancialAuditFieldKey,
  FinancialAuditFieldValueMap,
  FinancialAuditTimelineItem,
  FinancialAuditTimelineQuery,
  FinancialAuditTimelineResult
} from "@/financial-assurance/types";
import type { Prisma } from "@/generated/prisma/client";
import { getPrismaClient } from "@/persistence/prisma";

export const FINANCIAL_AUDIT_PAGE_SIZE = 20;

const EVENT_TYPES = new Set([
  "CREATE",
  "EDIT",
  "DELETE",
  "RESTORE",
  "OWNERSHIP_TRANSFER"
] as const);
const TRANSACTION_TYPES = new Set(["DEPOSIT", "WITHDRAWAL", "CORRECTION"] as const);
const CORRECTION_DIRECTIONS = new Set(["INCREASE", "DECREASE"] as const);
const SNAPSHOT_FIELDS = [
  "type",
  "amount",
  "correctionDirection",
  "reason",
  "notes",
  "occurredAt",
  "revision",
  "deletedAt"
] as const satisfies ReadonlyArray<FinancialAuditFieldKey>;

type SnapshotProjection = FinancialAuditFieldValueMap;
type AuditCursor = Readonly<{ committedAt: Date; auditEventId: string }>;

export class FinancialAuditReadError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "INVALID_QUERY",
    message: string,
    public readonly status: 400 | 404
  ) {
    super(message);
    this.name = "FinancialAuditReadError";
  }
}

function invalidQuery(message: string): never {
  throw new FinancialAuditReadError("INVALID_QUERY", message, 400);
}

function parseDateBoundary(value: string | undefined, end: boolean): Date | undefined {
  if (value === undefined) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return invalidQuery("Rentang tanggal audit tidak valid.");
  }
  const date = new Date(`${value}T${end ? "23:59:59.999" : "00:00:00.000"}+07:00`);
  if (Number.isNaN(date.getTime())) {
    return invalidQuery("Rentang tanggal audit tidak valid.");
  }
  const normalized = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
  if (normalized !== value) {
    return invalidQuery("Rentang tanggal audit tidak valid.");
  }
  return date;
}

export function encodeFinancialAuditCursor(cursor: AuditCursor): string {
  return Buffer.from(JSON.stringify({
    version: 1,
    committedAt: cursor.committedAt.toISOString(),
    auditEventId: cursor.auditEventId
  })).toString("base64url");
}

export function decodeFinancialAuditCursor(value: string | undefined): AuditCursor | undefined {
  if (value === undefined) return undefined;
  try {
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown;
    if (!decoded || typeof decoded !== "object") return invalidQuery("Cursor audit tidak valid.");
    const candidate = decoded as Record<string, unknown>;
    const committedAt =
      typeof candidate.committedAt === "string" ? new Date(candidate.committedAt) : null;
    if (
      candidate.version !== 1 ||
      !committedAt ||
      Number.isNaN(committedAt.getTime()) ||
      committedAt.toISOString() !== candidate.committedAt ||
      typeof candidate.auditEventId !== "string" ||
      candidate.auditEventId.length === 0
    ) {
      return invalidQuery("Cursor audit tidak valid.");
    }
    return { committedAt, auditEventId: candidate.auditEventId };
  } catch (error) {
    if (error instanceof FinancialAuditReadError) throw error;
    return invalidQuery("Cursor audit tidak valid.");
  }
}

function timelineFilters(query: FinancialAuditTimelineQuery) {
  const eventType = query.eventType;
  if (eventType !== undefined && !EVENT_TYPES.has(eventType)) {
    return invalidQuery("Jenis event audit tidak valid.");
  }
  const dateFrom = parseDateBoundary(query.dateFrom, false);
  const dateTo = parseDateBoundary(query.dateTo, true);
  if (dateFrom && dateTo && dateFrom > dateTo) {
    return invalidQuery("Rentang tanggal audit tidak valid.");
  }
  return {
    cursor: decodeFinancialAuditCursor(query.cursor),
    eventType,
    dateFrom,
    dateTo
  };
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function snapshotProjection(value: string | null): SnapshotProjection | null | undefined {
  if (value === null) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object") return undefined;
    const snapshot = parsed as Record<string, unknown>;
    if (
      typeof snapshot.type !== "string" ||
      !TRANSACTION_TYPES.has(snapshot.type as "DEPOSIT" | "WITHDRAWAL" | "CORRECTION") ||
      typeof snapshot.amount !== "string" ||
      !/^[0-9]+$/.test(snapshot.amount) ||
      !(
        snapshot.correctionDirection === null ||
        (
          typeof snapshot.correctionDirection === "string" &&
          CORRECTION_DIRECTIONS.has(snapshot.correctionDirection as "INCREASE" | "DECREASE")
        )
      ) ||
      !isNullableString(snapshot.reason) ||
      !isNullableString(snapshot.notes) ||
      typeof snapshot.occurredAt !== "string" ||
      Number.isNaN(new Date(snapshot.occurredAt).getTime()) ||
      typeof snapshot.revision !== "number" ||
      !Number.isSafeInteger(snapshot.revision) ||
      snapshot.revision < 1 ||
      !isNullableString(snapshot.deletedAt) ||
      (
        typeof snapshot.deletedAt === "string" &&
        Number.isNaN(new Date(snapshot.deletedAt).getTime())
      )
    ) {
      return undefined;
    }
    return {
      type: snapshot.type as SnapshotProjection["type"],
      amount: snapshot.amount,
      correctionDirection:
        snapshot.correctionDirection as SnapshotProjection["correctionDirection"],
      reason: snapshot.reason,
      notes: snapshot.notes,
      occurredAt: new Date(snapshot.occurredAt).toISOString(),
      revision: snapshot.revision,
      deletedAt:
        typeof snapshot.deletedAt === "string"
          ? new Date(snapshot.deletedAt).toISOString()
          : null
    };
  } catch {
    return undefined;
  }
}

export function projectFinancialAuditChanges(input: {
  schemaVersion: number;
  beforeSnapshot: string | null;
  afterSnapshot: string | null;
}): Pick<FinancialAuditDetail, "changes" | "detailAvailability"> {
  if (input.schemaVersion !== 1) {
    return { changes: [], detailAvailability: "UNSUPPORTED_SCHEMA" };
  }
  const before = snapshotProjection(input.beforeSnapshot);
  const after = snapshotProjection(input.afterSnapshot);
  if (before === undefined || after === undefined) {
    return { changes: [], detailAvailability: "UNSUPPORTED_SCHEMA" };
  }

  const changes: FinancialAuditFieldChange[] = [];
  for (const field of SNAPSHOT_FIELDS) {
    const beforeValue = before?.[field] ?? null;
    const afterValue = after?.[field] ?? null;
    if (beforeValue !== afterValue) {
      changes.push({ field, before: beforeValue, after: afterValue } as FinancialAuditFieldChange);
    }
  }
  return { changes, detailAvailability: "AVAILABLE" };
}

function balanceEvidence(value: {
  balanceBefore: bigint | null;
  balanceAfter: bigint | null;
  balanceDelta: bigint | null;
}) {
  if (
    value.balanceBefore === null ||
    value.balanceAfter === null ||
    value.balanceDelta === null
  ) {
    return null;
  }
  return {
    before: value.balanceBefore.toString(),
    after: value.balanceAfter.toString(),
    delta: value.balanceDelta.toString()
  };
}

type TimelineRow = {
  id: string;
  eventType: FinancialAuditTimelineItem["eventType"];
  occurredAt: Date;
  transactionId: string | null;
  transactionRevision: number | null;
  reason: string | null;
  balanceBefore: bigint | null;
  balanceAfter: bigint | null;
  balanceDelta: bigint | null;
  schemaVersion: number;
  actor: {
    name: string;
    role: FinancialAuditTimelineItem["actor"]["role"];
  };
};

function timelineItem(row: TimelineRow): FinancialAuditTimelineItem {
  return {
    id: row.id,
    eventType: row.eventType,
    committedAt: row.occurredAt.toISOString(),
    actor: row.actor,
    transactionId: row.transactionId,
    transactionRevision: row.transactionRevision,
    reason: row.reason,
    balanceEvidence: balanceEvidence(row),
    detailAvailability: row.schemaVersion === 1 ? "AVAILABLE" : "UNSUPPORTED_SCHEMA"
  };
}

export function financialAuditReadService(
  environment: AuthenticationEnvironment = loadAuthenticationEnvironment()
) {
  const prisma = getPrismaClient(environment);

  return {
    async timeline(
      operatorId: string,
      studentId: string,
      query: FinancialAuditTimelineQuery = {}
    ): Promise<FinancialAuditTimelineResult> {
      const filters = timelineFilters(query);
      return prisma.$transaction(async (transaction) => {
        const student = await transaction.student.findFirst({
          where: { id: studentId, operatorId },
          select: { id: true, name: true, status: true }
        });
        if (!student) {
          throw new FinancialAuditReadError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
        }

        const filteredWhere: Prisma.FinancialAuditEventWhereInput = {
          studentId: student.id,
          ...(filters.eventType ? { eventType: filters.eventType } : {}),
          ...(filters.dateFrom || filters.dateTo ? {
            occurredAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {})
            }
          } : {})
        };
        if (filters.cursor) {
          const cursorEvent = await transaction.financialAuditEvent.findFirst({
            where: {
              AND: [
                filteredWhere,
                { id: filters.cursor.auditEventId }
              ]
            },
            select: { occurredAt: true }
          });
          if (
            !cursorEvent ||
            cursorEvent.occurredAt.getTime() !== filters.cursor.committedAt.getTime()
          ) {
            throw new FinancialAuditReadError("INVALID_QUERY", "Cursor audit tidak valid.", 400);
          }
        }
        const rows = await transaction.financialAuditEvent.findMany({
          where: filteredWhere,
          ...(filters.cursor ? {
            cursor: { id: filters.cursor.auditEventId },
            skip: 1
          } : {}),
          select: {
            id: true,
            eventType: true,
            occurredAt: true,
            transactionId: true,
            transactionRevision: true,
            reason: true,
            balanceBefore: true,
            balanceAfter: true,
            balanceDelta: true,
            schemaVersion: true,
            actor: { select: { name: true, role: true } }
          },
          orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
          take: FINANCIAL_AUDIT_PAGE_SIZE + 1
        });
        const visibleRows = rows.slice(0, FINANCIAL_AUDIT_PAGE_SIZE);
        const lastVisible = visibleRows.at(-1);
        return {
          student,
          items: visibleRows.map(timelineItem),
          nextCursor:
            rows.length > FINANCIAL_AUDIT_PAGE_SIZE && lastVisible
              ? encodeFinancialAuditCursor({
                  committedAt: lastVisible.occurredAt,
                  auditEventId: lastVisible.id
                })
              : null,
          hasMore: rows.length > FINANCIAL_AUDIT_PAGE_SIZE
        };
      });
    },

    async detail(
      operatorId: string,
      studentId: string,
      auditEventId: string
    ): Promise<FinancialAuditDetail> {
      return prisma.$transaction(async (transaction) => {
        const student = await transaction.student.findFirst({
          where: { id: studentId, operatorId },
          select: { id: true }
        });
        if (!student) {
          throw new FinancialAuditReadError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
        }
        const event = await transaction.financialAuditEvent.findFirst({
          where: { id: auditEventId, studentId: student.id },
          select: {
            id: true,
            eventType: true,
            occurredAt: true,
            transactionId: true,
            transactionRevision: true,
            reason: true,
            balanceBefore: true,
            balanceAfter: true,
            balanceDelta: true,
            schemaVersion: true,
            beforeSnapshot: true,
            afterSnapshot: true,
            actor: { select: { name: true, role: true } }
          }
        });
        if (!event) {
          throw new FinancialAuditReadError("NOT_FOUND", "Audit tidak ditemukan.", 404);
        }
        const projection = projectFinancialAuditChanges(event);
        return {
          id: event.id,
          eventType: event.eventType,
          committedAt: event.occurredAt.toISOString(),
          actor: event.actor,
          transactionId: event.transactionId,
          transactionRevision: event.transactionRevision,
          reason: event.reason,
          schemaVersion: event.schemaVersion,
          balanceEvidence: balanceEvidence(event),
          changes: projection.changes,
          detailAvailability: projection.detailAvailability
        };
      });
    }
  };
}
