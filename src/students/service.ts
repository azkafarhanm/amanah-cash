import { createHash } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import type { AuthenticationEnvironment } from "@/auth/environment";
import { getPrismaClient } from "@/persistence/prisma";
import { createStudentManagement, StudentManagementError, type StudentRecord, type StudentRepository, type StudentStatus } from "@/students/domain";

const select = {
  id: true, name: true, notes: true, status: true, balance: true, createdAt: true, updatedAt: true,
  photoObjectKey: true, photoUpdatedAt: true, archivedAt: true,
  operator: { select: { id: true, name: true, email: true } }
} as const;

function formatStudent(row: {
  id: string; name: string; notes: string | null; status: StudentStatus; balance: bigint; createdAt: Date; updatedAt: Date;
  photoObjectKey: string | null; photoUpdatedAt: Date | null; archivedAt: Date | null;
  operator: { id: string; name: string; email: string };
}): StudentRecord {
  return {
    id: row.id,
    name: row.name,
    notes: row.notes,
    status: row.status,
    balance: row.balance.toString(),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    photoObjectKey: row.photoObjectKey,
    photoUpdatedAt: row.photoUpdatedAt,
    archivedAt: row.archivedAt,
    operator: row.operator
  };
}

export function studentManagement(environment: AuthenticationEnvironment = loadAuthenticationEnvironment()) {
  const prisma = getPrismaClient(environment);
  const repository: StudentRepository = {
    activeOperator: (id) => prisma.user.findFirst({ where: { id, role: "OPERATOR", isActive: true, deletedAt: null }, select: { id: true, name: true, email: true } }),
    activeOperators: () => prisma.user.findMany({ where: { role: "OPERATOR", isActive: true, deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
    async audit(data) { await prisma.operatorAudit.create({ data }); },
    async create(data) {
      try {
        const created = await prisma.student.create({ data, select });
        return formatStudent(created);
      }
      catch (error) {
        if (typeof error === "object" && error && "code" in error && error.code === "P2002") throw new StudentManagementError("DUPLICATE_NAME", "Nama Siswa tersebut sudah terdaftar.", 409);
        throw error;
      }
    },
    async update(id, data, expectedOperatorId, ownershipTransfer) {
      try {
        return await prisma.$transaction(async (transaction) => {
          const result = await transaction.student.updateMany({
            where: { id, operatorId: expectedOperatorId },
            data
          });
          if (result.count !== 1) {
            throw new StudentManagementError("CONFLICT", "Kepemilikan Siswa berubah secara bersamaan. Muat ulang lalu coba lagi.", 409);
          }
          if (ownershipTransfer) {
            const commandPayloadHash = createHash("sha256").update(JSON.stringify({
              operation: "OWNERSHIP_TRANSFER",
              actorId: ownershipTransfer.actorId,
              studentId: id,
              oldOperatorId: ownershipTransfer.oldOperatorId,
              newOperatorId: ownershipTransfer.newOperatorId,
              reason: ownershipTransfer.reason
            })).digest("hex");
            await transaction.financialAuditEvent.create({ data: {
              id: crypto.randomUUID(),
              commandId: ownershipTransfer.commandId,
              commandPayloadHash,
              eventType: "OWNERSHIP_TRANSFER",
              actorId: ownershipTransfer.actorId,
              actorRole: "PLATFORM_ADMIN",
              studentId: id,
              reason: ownershipTransfer.reason,
              oldOperatorId: ownershipTransfer.oldOperatorId,
              newOperatorId: ownershipTransfer.newOperatorId,
              correlationId: ownershipTransfer.correlationId
            } });
          }
          const updated = await transaction.student.findUnique({ where: { id }, select });
          if (!updated) throw new StudentManagementError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
          return formatStudent(updated);
        });
      }
      catch (error) {
        if (typeof error === "object" && error && "code" in error && error.code === "P2002") throw new StudentManagementError("DUPLICATE_NAME", "Nama Siswa tersebut sudah terdaftar.", 409);
        throw error;
      }
    },
    async setArchived({ id, operatorId, actorId, archived }) {
      return prisma.$transaction(async (transaction) => {
        // One conditional UPDATE does the check and the change together. On
        // PostgreSQL it waits for any transaction-engine write holding this
        // Student's row and re-evaluates the WHERE against the committed
        // balance, so a deposit that lands first makes this match nothing.
        const changed = await transaction.student.updateMany({
          where: archived
            ? { id, operatorId, status: { not: "ARCHIVED" }, balance: BigInt(0) }
            : { id, operatorId, status: "ARCHIVED" },
          data: archived
            ? { status: "ARCHIVED", archivedAt: new Date() }
            : { status: "ACTIVE", archivedAt: null }
        });
        if (changed.count !== 1) {
          const existing = await transaction.student.findFirst({ where: { id, operatorId }, select: { status: true } });
          if (!existing) return { outcome: "NOT_FOUND" as const };
          if ((existing.status === "ARCHIVED") === archived) return { outcome: "ALREADY" as const };
          return { outcome: "BALANCE_NOT_ZERO" as const };
        }
        const student = await transaction.student.findUniqueOrThrow({ where: { id }, select });
        await transaction.operatorAudit.create({ data: {
          operatorId,
          actorId,
          action: archived ? "STUDENT_ARCHIVE" : "STUDENT_RESTORE",
          summary: archived ? `Mengarsipkan siswa: ${student.name}` : `Memulihkan siswa dari arsip: ${student.name}`
        } });
        return { outcome: "UPDATED" as const, student: formatStudent(student) };
      });
    },
    find: async (id, operatorId) => {
      const found = await prisma.student.findFirst({ where: { id, ...(operatorId ? { operatorId } : {}) }, select });
      return found ? formatStudent(found) : null;
    },
    async list({ search, status, operatorId, skip, take }) {
      const searchOR: Prisma.StudentWhereInput[] = [
        { name: { contains: search } },
        { notes: { contains: search } }
      ];
      if (!operatorId && search) {
        searchOR.push({ operator: { name: { contains: search } } });
      }
      const where: Prisma.StudentWhereInput = {
        ...(operatorId ? { operatorId } : {}),
        // No status asked for means everyday work: archived Students are left
        // out, and appear only when the "Diarsipkan" filter asks for them.
        status: status ?? { not: "ARCHIVED" },
        ...(search ? { OR: searchOR } : {})
      };
      const [items, total] = await prisma.$transaction([
        prisma.student.findMany({ where, skip, take, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select }),
        prisma.student.count({ where })
      ]);
      return { items: items.map(formatStudent), total };
    }
  };

  return createStudentManagement(repository);
}
