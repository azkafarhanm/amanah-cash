import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  developmentTunnelOrigin,
  isDevelopmentTunnelHost
} from "../src/auth/dev-tunnel";
import { buildAuthOptions } from "../src/auth/options";
import type { AuthenticationEnvironment } from "../src/auth/environment";

const projectRoot = resolve(import.meta.dirname, "..");

function readSource(relativePath: string): string {
  return readFileSync(join(projectRoot, relativePath), "utf8");
}

function makeEnvironment(overrides: Partial<AuthenticationEnvironment> = {}): AuthenticationEnvironment {
  return {
    databaseUrl: `file:${join(mkdtempSync(join(tmpdir(), "dev-tunnel-")), "test.db")}`,
    googleClientId: "google-client-id",
    googleClientSecret: "google-client-secret",
    nextAuthSecret: "a-secure-secret-with-at-least-32-characters",
    nextAuthUrl: "http://localhost:3000",
    production: false,
    developmentAuth: true,
    developmentAdminEmail: "admin@example.com",
    developmentOperatorEmail: "operator@example.com",
    ...overrides
  };
}

type RedirectCallback = (input: { url: string; baseUrl: string }) => Promise<string>;

function redirectCallbackFor(
  environment: AuthenticationEnvironment,
  requestHost: string | null
): RedirectCallback {
  const options = buildAuthOptions(environment, {
    readRequestHost: async () => requestHost
  });
  return options.callbacks!.redirect as unknown as RedirectCallback;
}

test("isDevelopmentTunnelHost accepts only dev requests on trycloudflare subdomains", () => {
  assert.equal(isDevelopmentTunnelHost("exact-wish-luther-about.trycloudflare.com", false), true);
  assert.equal(isDevelopmentTunnelHost("Exact-Wish.tryCloudflare.com:443", false), true);
  assert.equal(isDevelopmentTunnelHost("localhost:3000", false), false);
  assert.equal(isDevelopmentTunnelHost("trycloudflare.com", false), false);
  assert.equal(isDevelopmentTunnelHost(".trycloudflare.com", false), false);
  assert.equal(isDevelopmentTunnelHost(null, false), false);
  // Tunnel suffix must be a subdomain boundary, not a string suffix.
  assert.equal(isDevelopmentTunnelHost("nottrycloudflare.com", false), false);
  assert.equal(isDevelopmentTunnelHost("tunnel.trycloudflare.com.evil.example", false), false);
  // Production never trusts a tunnel host.
  assert.equal(isDevelopmentTunnelHost("exact-wish-luther-about.trycloudflare.com", true), false);
});

test("developmentTunnelOrigin builds an https origin from a host header", () => {
  assert.equal(developmentTunnelOrigin("exact-wish-luther-about.trycloudflare.com"), "https://exact-wish-luther-about.trycloudflare.com");
  assert.equal(developmentTunnelOrigin("Host.TryCloudFlare.com:443"), "https://host.trycloudflare.com");
});

test("redirect callback keeps login redirects on the dev tunnel origin", async () => {
  const redirect = redirectCallbackFor(makeEnvironment(), "exact-wish-luther-about.trycloudflare.com");
  const baseUrl = "http://localhost:3000";

  // Relative callback URLs (client signIn/signOut send these) stay on the tunnel.
  assert.equal(await redirect({ url: "/app", baseUrl }), "https://exact-wish-luther-about.trycloudflare.com/app");
  assert.equal(await redirect({ url: "/login", baseUrl }), "https://exact-wish-luther-about.trycloudflare.com/login");
  // Absolute tunnel URLs are preserved; anything else falls back to the tunnel app.
  assert.equal(
    await redirect({ url: "https://exact-wish-luther-about.trycloudflare.com/app", baseUrl }),
    "https://exact-wish-luther-about.trycloudflare.com/app"
  );
  assert.equal(
    await redirect({ url: "https://evil.example/app", baseUrl }),
    "https://exact-wish-luther-about.trycloudflare.com/app"
  );
});

test("redirect callback is unchanged for localhost development and production", async () => {
  const baseUrl = "http://localhost:3000";

  // No host (outside request scope) or a plain localhost host: canonical behavior.
  const noHost = redirectCallbackFor(makeEnvironment(), null);
  assert.equal(await noHost({ url: "/app", baseUrl }), "http://localhost:3000/app");
  assert.equal(
    await noHost({ url: "https://evil.example/app", baseUrl }),
    "http://localhost:3000/app"
  );

  const localhost = redirectCallbackFor(makeEnvironment(), "localhost:3000");
  assert.equal(await localhost({ url: "/app", baseUrl }), "http://localhost:3000/app");

  // Production never rewrites to a tunnel origin, even when the request host is one.
  const production = redirectCallbackFor(
    makeEnvironment({ production: true, developmentAuth: false, developmentAdminEmail: null, developmentOperatorEmail: null }),
    "exact-wish-luther-about.trycloudflare.com"
  );
  assert.equal(await production({ url: "/app", baseUrl }), "http://localhost:3000/app");
});

test("login page keeps the canonical-origin guard but exempts dev tunnels", () => {
  const loginPage = readSource("src/app/(auth)/login/page.tsx");
  assert.match(loginPage, /isDevelopmentTunnelHost/);
  assert.match(loginPage, /!isDevTunnelHost && requestHost/);
});
