import { authorization } from "@/authorization";
import type { AuthorizationPolicy, AuthorizationUser } from "@/authorization/core";
import { isAuthorizationError } from "@/authorization/errors";

export type ApiAuthorizationPolicy =
  | { role: "authenticated" }
  | { role: "admin" }
  | { role: "operator" }
  | {
      role: "owner";
      studentId(request: Request): string | Promise<string>;
      maskExistence?: boolean;
    };

export type AuthorizedApiHandler = (
  request: Request,
  context: { authorization: AuthorizationUser }
) => Response | Promise<Response>;

export function withAuthorizationUsing(
  serviceFactory: typeof authorization,
  policy: ApiAuthorizationPolicy,
  handler: AuthorizedApiHandler
) {
  return async (request: Request): Promise<Response> => {
    const correlationId = crypto.randomUUID();
    try {
      const service = serviceFactory();
      let resolvedPolicy: AuthorizationPolicy;
      if (policy.role === "owner") {
        const studentId = await policy.studentId(request);
        resolvedPolicy = { role: "owner", studentId, maskExistence: policy.maskExistence };
      } else resolvedPolicy = policy;
      const user = await service.authorize(resolvedPolicy);

      return await handler(request, { authorization: user });
    } catch (error) {
      if (!isAuthorizationError(error)) throw error;
      return Response.json(
        { error: { code: error.code, correlationId } },
        { status: error.status, headers: { "Cache-Control": "no-store" } }
      );
    }
  };
}

export function withAuthorization(policy: ApiAuthorizationPolicy, handler: AuthorizedApiHandler) {
  return withAuthorizationUsing(authorization, policy, handler);
}
