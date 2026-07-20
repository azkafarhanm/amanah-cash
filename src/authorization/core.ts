import type { Role } from "@/generated/prisma/enums";
import {
  OwnershipNotFoundError,
  UnauthenticatedError,
  UnauthorizedError
} from "@/authorization/errors";

const VALID_ROLES = new Set<Role>(["PLATFORM_ADMIN", "OPERATOR"]);

export type AuthorizationUser = {
  id: string;
  role: Role;
};

export type OperatorContext = AuthorizationUser & {
  role: "OPERATOR";
};

export type AuthorizationDependencies = {
  resolveSessionUserId(): Promise<string | null>;
  findActiveUser(userId: string): Promise<{ id: string; role: string; isActive: boolean } | null>;
  findOwnedStudent(studentId: string, operatorId: string): Promise<{ id: string } | null>;
};

export type OwnershipOptions = {
  maskExistence?: boolean;
};

export type AuthorizationPolicy =
  | { role: "authenticated" }
  | { role: "admin" }
  | { role: "operator" }
  | { role: "owner"; studentId: string; maskExistence?: boolean };

export function createAuthorization(dependencies: AuthorizationDependencies) {
  let resolvedUser: Promise<AuthorizationUser> | undefined;

  async function requireAuthenticatedUser(): Promise<AuthorizationUser> {
    resolvedUser ??= (async () => {
      const sessionUserId = await dependencies.resolveSessionUserId();
      if (!sessionUserId) throw new UnauthenticatedError();

      const user = await dependencies.findActiveUser(sessionUserId);
      if (!user?.isActive || !VALID_ROLES.has(user.role as Role)) {
        throw new UnauthenticatedError();
      }

      return { id: user.id, role: user.role as Role };
    })();
    return resolvedUser;
  }

  async function currentRole(): Promise<Role> {
    return (await requireAuthenticatedUser()).role;
  }

  async function requirePlatformAdmin(): Promise<AuthorizationUser & { role: "PLATFORM_ADMIN" }> {
    const user = await requireAuthenticatedUser();
    if (user.role !== "PLATFORM_ADMIN") throw new UnauthorizedError();
    return user as AuthorizationUser & { role: "PLATFORM_ADMIN" };
  }

  async function requireOperator(): Promise<OperatorContext> {
    const user = await requireAuthenticatedUser();
    if (user.role !== "OPERATOR") throw new UnauthorizedError();
    return user as OperatorContext;
  }

  async function currentOperator(): Promise<OperatorContext> {
    return requireOperator();
  }

  async function canAccessStudent(studentId: string): Promise<boolean> {
    if (!studentId) return false;
    const operator = await requireOperator();
    return Boolean(await dependencies.findOwnedStudent(studentId, operator.id));
  }

  async function canManageStudent(studentId: string): Promise<boolean> {
    return canAccessStudent(studentId);
  }

  async function requireOwnership(
    studentId: string,
    { maskExistence = true }: OwnershipOptions = {}
  ): Promise<OperatorContext> {
    const operator = await requireOperator();
    const owned = studentId
      ? await dependencies.findOwnedStudent(studentId, operator.id)
      : null;
    if (!owned) {
      if (maskExistence) throw new OwnershipNotFoundError();
      throw new UnauthorizedError();
    }
    return operator;
  }

  async function authorize(policy: AuthorizationPolicy): Promise<AuthorizationUser> {
    if (policy.role === "admin") return requirePlatformAdmin();
    if (policy.role === "operator") return requireOperator();
    if (policy.role === "owner") {
      return requireOwnership(policy.studentId, { maskExistence: policy.maskExistence });
    }
    return requireAuthenticatedUser();
  }

  return {
    requireAuthenticatedUser,
    requirePlatformAdmin,
    requireOperator,
    requireOwnership,
    canAccessStudent,
    canManageStudent,
    currentRole,
    currentOperator,
    authorize
  };
}

export type AuthorizationService = ReturnType<typeof createAuthorization>;
