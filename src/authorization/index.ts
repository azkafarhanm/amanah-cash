import { currentUser } from "@/auth";
import { createAuthorization } from "@/authorization/core";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { getPrismaClient } from "@/persistence/prisma";

export * from "@/authorization/core";
export * from "@/authorization/errors";

export function authorization() {
  const prisma = getPrismaClient(loadAuthenticationEnvironment());
  return createAuthorization({
    async resolveSessionUserId() {
      return (await currentUser())?.id ?? null;
    },
    async findActiveUser(userId) {
      return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, isActive: true }
      });
    },
    async findOwnedStudent(studentId, operatorId) {
      return prisma.student.findFirst({
        where: { id: studentId, operatorId },
        select: { id: true }
      });
    }
  });
}

export const requireAuthenticatedUser = () => authorization().requireAuthenticatedUser();
export const requirePlatformAdmin = () => authorization().requirePlatformAdmin();
export const requireOperator = () => authorization().requireOperator();
export const requireOwnership = (studentId: string, options?: { maskExistence?: boolean }) =>
  authorization().requireOwnership(studentId, options);
export const canAccessStudent = (studentId: string) => authorization().canAccessStudent(studentId);
export const canManageStudent = (studentId: string) => authorization().canManageStudent(studentId);
export const currentRole = () => authorization().currentRole();
export const currentOperator = () => authorization().currentOperator();
