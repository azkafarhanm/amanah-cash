import { getPrismaClient } from "@/persistence/prisma";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { createOperatorManagement, OperatorManagementError, type OperatorRecord, type OperatorRepository } from "@/operators/domain";

function shape(user: {
  id: string; name: string; email: string; isActive: boolean; createdAt: Date;
  lastLoginAt: Date | null; deletedAt: Date | null; _count: { students: number };
}): OperatorRecord {
  return { ...user, assignedStudentCount: user._count.students };
}

export function operatorManagement() {
  const prisma = getPrismaClient(loadAuthenticationEnvironment());
  const select = {
    id: true, name: true, email: true, isActive: true, createdAt: true,
    lastLoginAt: true, deletedAt: true, _count: { select: { students: true } }
  } as const;
  const repository: OperatorRepository = {
    findByEmail: (email) => prisma.user.findUnique({ where: { email }, select: { id: true } }),
    async create(data) {
      try {
        return shape(await prisma.user.create({ data: { ...data, role: "OPERATOR", isActive: false }, select }));
      } catch (error) {
        if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
          throw new OperatorManagementError("DUPLICATE_EMAIL", "Email tersebut sudah terdaftar.", 409);
        }
        throw error;
      }
    },
    async find(id) {
      const user = await prisma.user.findFirst({ where: { id, role: "OPERATOR" }, select });
      return user ? shape(user) : null;
    },
    async update(id, data) {
      return shape(await prisma.user.update({ where: { id }, data, select }));
    },
    async revokeSessions(id) { await prisma.session.deleteMany({ where: { userId: id } }); },
    async audit(data) { await prisma.operatorAudit.create({ data }); },
    audits: (id) => prisma.operatorAudit.findMany({ where: { operatorId: id }, orderBy: { createdAt: "desc" }, take: 10, select: { action: true, summary: true, createdAt: true } }),
    async list({ search, status, skip, take }) {
      const where = {
        role: "OPERATOR" as const,
        deletedAt: null,
        ...(status ? { isActive: status === "active" } : {}),
        ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {})
      };
      const [users, total] = await prisma.$transaction([
        prisma.user.findMany({ where, skip, take, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select }),
        prisma.user.count({ where })
      ]);
      return { items: users.map(shape), total };
    }
  };
  return createOperatorManagement(repository);
}
