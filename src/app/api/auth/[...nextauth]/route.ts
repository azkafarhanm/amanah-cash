import NextAuth from "next-auth";
import { AuthenticationConfigurationError } from "@/auth/environment";
import { buildAuthOptions } from "@/auth/options";

type RouteContext = { params: Promise<{ nextauth: string[] }> };

async function authHandler(request: Request, context: RouteContext) {
  try {
    return NextAuth(buildAuthOptions())(request, context);
  } catch (error) {
    if (error instanceof AuthenticationConfigurationError) {
      return Response.json(
        { error: "Authentication service is not configured." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }
    throw error;
  }
}

export { authHandler as GET, authHandler as POST };
