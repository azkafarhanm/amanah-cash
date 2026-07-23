import { withAuthorization } from "@/authorization/api";
import { exportCoordinator } from "@/exports/coordinator";
import { exportResponse } from "@/exports/http";

export const dynamic = "force-dynamic";

export const GET = withAuthorization({ role: "operator" }, async (request, { authorization }) =>
  exportResponse(() => exportCoordinator().operator({ operatorId: authorization.id, parameters: new URL(request.url).searchParams }))
);
