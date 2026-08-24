import NextAuth from "next-auth";
import { AuthenticationConfigurationError } from "@/auth/environment";
import {
  developmentTunnelOrigin,
  isDevelopmentTunnelHost
} from "@/auth/dev-tunnel";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { buildAuthOptions } from "@/auth/options";

type RouteContext = { params: Promise<{ nextauth: string[] }> };

/**
 * Development Quick Tunnels: next-auth pins every internal redirect (success
 * callbacks, error pages) to the canonical NEXTAUTH_URL origin, which is the
 * developer's localhost — a phone browsing through the tunnel cannot reach
 * it. When the request arrived on a *.trycloudflare.com host (development
 * only), rewrite redirect locations and JSON `{url}` payloads that point at
 * the canonical origin back onto the tunnel origin. Production responses are
 * returned untouched.
 */
async function rewriteDevTunnelRedirects(
  response: Response,
  host: string,
  canonicalOrigin: string
): Promise<Response> {
  const tunnelOrigin = developmentTunnelOrigin(host);
  const location = response.headers.get("Location");
  if (location && location.startsWith(canonicalOrigin)) {
    const rewritten = tunnelOrigin + location.slice(canonicalOrigin.length);
    const headers = new Headers(response.headers);
    headers.set("Location", rewritten);
    return new Response(null, { status: response.status, headers });
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    // Read from a clone so the original response body stays unconsumed when
    // no rewrite is needed.
    const body = (await response.clone().json().catch(() => null)) as { url?: unknown } | null;
    if (body && typeof body.url === "string" && body.url.startsWith(canonicalOrigin)) {
      const headers = new Headers(response.headers);
      return new Response(JSON.stringify({ ...body, url: tunnelOrigin + body.url.slice(canonicalOrigin.length) }), {
        status: response.status,
        headers
      });
    }
  }

  return response;
}

async function authHandler(request: Request, context: RouteContext) {
  try {
    const environment = loadAuthenticationEnvironment();
    const response = await NextAuth(buildAuthOptions())(request, context);
    if (!environment.production) {
      const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
      if (isDevelopmentTunnelHost(host, environment.production)) {
        return await rewriteDevTunnelRedirects(
          response,
          host as string,
          new URL(environment.nextAuthUrl).origin
        );
      }
    }
    return response;
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
