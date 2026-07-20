import { forbidden, redirect } from "next/navigation";
import type { AuthorizationService, AuthorizationUser } from "@/authorization/core";
import { authorization } from "@/authorization";
import { UnauthenticatedError, UnauthorizedError } from "@/authorization/errors";

export type ProtectedRoute = "authenticated" | "admin" | "operator";

export function roleHome(role: AuthorizationUser["role"]): "/admin" | "/operator" {
  return role === "PLATFORM_ADMIN" ? "/admin" : "/operator";
}

export async function authorizeRoute(
  service: AuthorizationService,
  route: ProtectedRoute
): Promise<AuthorizationUser> {
  if (route === "admin") return service.requirePlatformAdmin();
  if (route === "operator") return service.requireOperator();
  return service.requireAuthenticatedUser();
}

export async function protectRoute(route: ProtectedRoute): Promise<AuthorizationUser> {
  try {
    return await authorizeRoute(authorization(), route);
  } catch (error) {
    if (error instanceof UnauthenticatedError) redirect("/login");
    if (error instanceof UnauthorizedError) forbidden();
    throw error;
  }
}
