import { authorization } from "@/authorization";
import type { AuthorizationPolicy } from "@/authorization/core";

export type ServerActionPolicy = AuthorizationPolicy;

export async function authorizeServerActionWith(
  service: ReturnType<typeof authorization>,
  policy: ServerActionPolicy
) {
  return service.authorize(policy);
}

export async function authorizeServerAction(policy: ServerActionPolicy) {
  return authorizeServerActionWith(authorization(), policy);
}
