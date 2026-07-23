import { withAuthorization } from "@/authorization/api";
import { exportCoordinator } from "@/exports/coordinator";
import { exportResponse } from "@/exports/http";

export const dynamic = "force-dynamic";

export const GET = withAuthorization({ role: "admin" }, async (request) =>
  exportResponse(() => exportCoordinator().admin({ parameters: new URL(request.url).searchParams }))
);
