import { loadAuthenticationEnvironment } from "@/auth/environment";
import { getPrismaClient } from "@/persistence/prisma";
import { createStudentManagement, StudentManagementError, type StudentRecord, type StudentRepository } from "@/students/domain";

const select = {
  id: true, name: true, notes: true, status: true, createdAt: true, updatedAt: true,
  operator: { select: { id: true, name: true, email: true } }
} as const;

export function studentManagement() {
  const prisma = getPrismaClient(loadAuthenticationEnvironment());
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
    async update(id, data) {
      try { return await prisma.student.update({ where: { id }, data, select }) as StudentRecord; }
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
