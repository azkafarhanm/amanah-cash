import { createHash } from "node:crypto";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import type { AuthenticationEnvironment } from "@/auth/environment";
import { getPrismaClient } from "@/persistence/prisma";
import { createStudentManagement, StudentManagementError, type StudentRecord, type StudentRepository } from "@/students/domain";

const select = {
  id: true, name: true, notes: true, status: true, createdAt: true, updatedAt: true,
  operator: { select: { id: true, name: true, email: true } }
} as const;

export function studentManagement(environment: AuthenticationEnvironment = loadAuthenticationEnvironment()) {
  const prisma = getPrismaClient(environment);
  const repository: StudentRepository = {
    activeOperator: (id) => prisma.user.findFirst({ where: { id, role: "OPERATOR", isActive: true, deletedAt: null }, select: { id: true, name: true, email: true } }),
    activeOperators: () => prisma.user.findMany({ where: { role: "OPERATOR", isActive: true, deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
    async create(data) {
      try { return await prisma.student.create({ data, select }) as StudentRecord; }
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
          return updated as StudentRecord;
        });
      }
      catch (error) {
        if (typeof error === "object" && error && "code" in error && error.code === "P2002") throw new StudentManagementError("DUPLICATE_NAME", "Nama Siswa tersebut sudah terdaftar.", 409);
        throw error;
      }
    },
    find: (id, operatorId) => prisma.student.findFirst({ where: { id, ...(operatorId ? { operatorId } : {}) }, select }) as Promise<StudentRecord | null>,
    async list({ search, status, operatorId, skip, take }) {
      const where = {
        ...(operatorId ? { operatorId } : {}), ...(status ? { status } : {}),
        ...(search ? { OR: [{ name: { contains: search } }, { operator: { name: { contains: search } } }] } : {})
      };
      const [items, total] = await prisma.$transaction([
        prisma.student.findMany({ where, skip, take, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select }),
        prisma.student.count({ where })
      ]);
      return { items: items as StudentRecord[], total };
    }
  };
  return createStudentManagement(repository);
}
