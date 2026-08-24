import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true
  },
  // Development-only origin allowlist (ignored in production builds).
  // Next.js dev blocks cross-origin requests to /_next/* resources
  // (including the /_next/webpack-hmr HMR websocket) unless the Origin
  // host is allowlisted — the block also writes a bare "Unauthorized"
  // string on websocket upgrades, which surfaces in cloudflared as
  // `malformed HTTP response "Unauthorized"`. Quick Tunnels get a random
  // <sub>.trycloudflare.com domain on every run, so allow the suffix
  // via the official wildcard matching (subdomain-scoped, "*.com"-style
  // bare TLD wildcards are rejected by Next's matcher).
  allowedDevOrigins: ["*.trycloudflare.com"]
};

export default nextConfig;
