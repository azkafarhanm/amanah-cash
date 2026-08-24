/**
 * Development-only Cloudflare Quick Tunnel detection.
 *
 * During development the app is sometimes exposed through a Cloudflare Quick
 * Tunnel (`https://<random>.trycloudflare.com`) so it can be opened on a
 * phone. Quick Tunnel hostnames are random per run, so they cannot be listed
 * in `NEXTAUTH_URL`; instead auth flows that run inside a tunnel request must
 * keep redirects on the tunnel origin — a phone cannot reach the developer's
 * `http://localhost:3000`.
 *
 * Scope: the suffix check is intentionally narrow (must end with
 * `.trycloudflare.com` and have a non-empty subdomain) and every consumer
 * must also gate on `production === false`. Production builds never treat a
 * tunnel host as trusted, and nothing here affects authentication,
 * authorization, or session validation — only where the browser is sent
 * next after login/logout.
 */

const DEV_TUNNEL_HOST_SUFFIX = ".trycloudflare.com";

function normalizeHost(host: string): string {
  // Host headers may carry an explicit port; tunnel hostnames never need one.
  return host.trim().toLowerCase().replace(/:\d+$/, "");
}

export function isDevelopmentTunnelHost(
  host: string | null | undefined,
  production: boolean
): boolean {
  if (production) return false;
  if (!host) return false;
  const hostname = normalizeHost(host);
  if (hostname.length <= DEV_TUNNEL_HOST_SUFFIX.length) return false;
  return hostname.endsWith(DEV_TUNNEL_HOST_SUFFIX);
}

export function developmentTunnelOrigin(host: string): string {
  return `https://${normalizeHost(host)}`;
}
