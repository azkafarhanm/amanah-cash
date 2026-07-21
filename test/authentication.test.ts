import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import type { Adapter, AdapterSession, AdapterUser } from "next-auth/adapters";
import { createAuthenticationAdapter } from "../src/auth/adapter";
import {
  evaluateGoogleAdmission,
  isGoogleAccountBindingValid,
  normalizeGoogleEmail
} from "../src/auth/admission";
import {
  AuthenticationConfigurationError,
  loadAuthenticationEnvironment
} from "../src/auth/environment";
import { LOGOUT_REDIRECT } from "../src/components/auth/logout-button";
import { buildAuthOptions } from "../src/auth/options";
import { getPrismaClient } from "../src/persistence/prisma";
import { openDatabase } from "../src/persistence/database.js";

const projectRoot = resolve(import.meta.dirname, "..");

const activeUser = {
  id: "operator-1",
  name: "Operator",
  email: "operator@example.com",
  emailVerified: null,
  image: null,
  isActive: true
} satisfies AdapterUser & { isActive: boolean };

test("successful Google login admits the registered active user", async () => {
  const decision = await evaluateGoogleAdmission({
    provider: "google",
    profile: { email: " Operator@Example.com ", email_verified: true },
    users: {
      async findByNormalizedEmail(email) {
        assert.equal(email, "operator@example.com");
        return { id: activeUser.id, email, isActive: true };
      }
    }
  });

  assert.equal(decision.allowed, true);
  assert.equal(normalizeGoogleEmail(" Operator@Example.com "), "operator@example.com");
});

test("inactive and unknown users receive the same admission denial", async () => {
  for (const user of [{ id: "inactive", email: "operator@example.com", isActive: false }, null]) {
    const decision = await evaluateGoogleAdmission({
      provider: "google",
      profile: { email: "operator@example.com", email_verified: true },
      users: { async findByNormalizedEmail() { return user; } }
    });
    assert.deepEqual(decision, { allowed: false, reason: "UNKNOWN_OR_INACTIVE" });
  }
});

test("callback failure or unverified Google identity is denied", async () => {
  const users = {
    async findByNormalizedEmail() {
      throw new Error("lookup must not run for invalid callbacks");
    }
  };

  assert.deepEqual(
    await evaluateGoogleAdmission({ provider: "google", profile: undefined, users }),
    { allowed: false, reason: "UNVERIFIED_EMAIL" }
  );
  assert.deepEqual(
    await evaluateGoogleAdmission({
      provider: "google",
      profile: { email: "operator@example.com", email_verified: false },
      users
    }),
    { allowed: false, reason: "UNVERIFIED_EMAIL" }
  );
  assert.deepEqual(
    await evaluateGoogleAdmission({
      provider: "another-provider",
      profile: { email: "operator@example.com", email_verified: true },
      users
    }),
    { allowed: false, reason: "INVALID_PROVIDER" }
  );
});

test("an existing Google subject cannot cross-link to a different admitted user", () => {
  assert.equal(isGoogleAccountBindingValid("user-1", null), true);
  assert.equal(isGoogleAccountBindingValid("user-1", "user-1"), true);
  assert.equal(isGoogleAccountBindingValid("user-1", "user-2"), false);
});

function inMemorySessionAdapter({
  user = activeUser,
  now = new Date("2026-07-20T08:00:00.000Z")
}: {
  user?: AdapterUser & { isActive: boolean };
  now?: Date;
} = {}) {
  const stored = new Map<string, AdapterSession>();
  const revokedUsers: string[] = [];
  const baseAdapter: Adapter = {
    async createUser() { throw new Error("not used"); },
    async getUser() { return user; },
    async getUserByEmail() { return user; },
    async getUserByAccount() { return user; },
    async updateUser() { return user; },
    async linkAccount() { return undefined; },
    async createSession(session) {
      stored.set(session.sessionToken, session);
      return session;
    },
    async getSessionAndUser(sessionToken) {
      const session = stored.get(sessionToken);
      return session ? { session, user } : null;
    },
    async updateSession(session) {
      const current = stored.get(session.sessionToken);
      if (!current) return null;
      const updated = { ...current, ...session };
      stored.set(session.sessionToken, updated);
      return updated;
    },
    async deleteSession(sessionToken) {
      const session = stored.get(sessionToken) ?? null;
      stored.delete(sessionToken);
      return session;
    }
  };
  const adapter = createAuthenticationAdapter({
    baseAdapter,
    sessions: {
      async deleteManyForUser(userId) {
        revokedUsers.push(userId);
        for (const [token, session] of stored) {
          if (session.userId === userId) stored.delete(token);
        }
      }
    },
    now: () => now
  });
  return { adapter, stored, revokedUsers };
}

const validSession = (token: string): AdapterSession => ({
  sessionToken: token,
  userId: activeUser.id,
  expires: new Date("2026-07-20T16:00:00.000Z")
});

test("database sessions are created independently for multiple devices", async () => {
  const { adapter, stored } = inMemorySessionAdapter();
  await adapter.createSession!(validSession("device-one"));
  await adapter.createSession!(validSession("device-two"));

  assert.equal(stored.size, 2);
  assert.equal((await adapter.getSessionAndUser!("device-one"))?.user.id, activeUser.id);
  assert.equal((await adapter.getSessionAndUser!("device-two"))?.user.id, activeUser.id);
});

test("expired database session is destroyed and rejected", async () => {
  const { adapter, stored } = inMemorySessionAdapter({ now: new Date("2026-07-20T17:00:00.000Z") });
  await adapter.createSession!(validSession("expired"));

  assert.equal(await adapter.getSessionAndUser!("expired"), null);
  assert.equal(stored.has("expired"), false);
});

test("inactive account revokes all of its database sessions", async () => {
  const { adapter, stored, revokedUsers } = inMemorySessionAdapter({
    user: { ...activeUser, isActive: false }
  });
  await adapter.createSession!(validSession("revoked-one"));
  await adapter.createSession!(validSession("revoked-two"));

  assert.equal(await adapter.getSessionAndUser!("revoked-one"), null);
  assert.deepEqual(revokedUsers, [activeUser.id]);
  assert.equal(stored.size, 0);
});

test("logout destroys only the presented session and returns to login", async () => {
  const { adapter, stored } = inMemorySessionAdapter();
  await adapter.createSession!(validSession("logout-session"));
  await adapter.deleteSession!("logout-session");

  assert.equal(stored.has("logout-session"), false);
  assert.equal(LOGOUT_REDIRECT, "/login");
});

test("Prisma adapter creates, resolves, and destroys a real database session", async () => {
  const directory = join(tmpdir(), `amanah-cash-auth-${crypto.randomUUID()}`);
  const databasePath = join(directory, "authentication.sqlite");
  mkdirSync(directory);
  const database = openDatabase({ databasePath, migrationsPath: resolve(projectRoot, "migrations") });
  database.connection
    .prepare(
      "INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-1', 'Operator', 'operator@example.com', 'OPERATOR', 1)"
    )
    .run();
  database.connection
    .prepare(
      "INSERT INTO users (id, name, email, role, is_active) VALUES ('admin-1', 'Admin', 'admin@example.com', 'PLATFORM_ADMIN', 1)"
    )
    .run();
  database.close();

  const environment = {
    databaseUrl: `file:${databasePath}`,
    googleClientId: "google-client-id",
    googleClientSecret: "google-client-secret",
    nextAuthSecret: "a-secure-secret-with-at-least-32-characters",
    nextAuthUrl: "http://localhost:3000",
    production: false,
    developmentAuth: false,
    developmentAdminEmail: null,
    developmentOperatorEmail: null
  };
  const prisma = getPrismaClient(environment);

  try {
    const productionLikeOptions = buildAuthOptions(environment);
    assert.equal(productionLikeOptions.session?.strategy, "database");
    assert.equal(productionLikeOptions.providers[0].id, "google");
    const developmentOptions = buildAuthOptions({
      ...environment,
      developmentAuth: true,
      developmentAdminEmail: "admin@example.com",
      developmentOperatorEmail: "operator@example.com"
    });
    assert.equal(developmentOptions.session?.strategy, "jwt");
    assert.equal(developmentOptions.providers[0].id, "credentials");
    const authorizeDevelopment = (
      developmentOptions.providers[0] as unknown as {
        options: {
          authorize(credentials: { email: string }): Promise<{ id: string } | null>;
        };
      }
    ).options.authorize;
    assert.equal((await authorizeDevelopment({ email: "admin@example.com" }))?.id, "admin-1");
    assert.equal((await authorizeDevelopment({ email: " OPERATOR@EXAMPLE.COM " }))?.id, "operator-1");
    assert.equal(await authorizeDevelopment({ email: "unknown@example.com" }), null);

    const adapter = productionLikeOptions.adapter!;
    assert.equal((await adapter.getUserByEmail!("operator@example.com"))?.id, "operator-1");

    await adapter.createSession!({
      sessionToken: "real-session",
      userId: "operator-1",
      expires: new Date("2099-07-20T16:00:00.000Z")
    });
    assert.equal((await adapter.getSessionAndUser!("real-session"))?.user.id, "operator-1");

    await adapter.deleteSession!("real-session");
    assert.equal(await adapter.getSessionAndUser!("real-session"), null);
  } finally {
    await prisma.$disconnect();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("authentication environment enforces secrets and production HTTPS", () => {
  const validEnvironment = {
    DATABASE_URL: "file:./data/amanah-cash.sqlite",
    GOOGLE_CLIENT_ID: "google-client-id",
    GOOGLE_CLIENT_SECRET: "google-client-secret",
    NEXTAUTH_SECRET: "a-secure-secret-with-at-least-32-characters",
    NEXTAUTH_URL: "https://cash.example.com",
    NODE_ENV: "production" as const
  } satisfies NodeJS.ProcessEnv;
  assert.equal(loadAuthenticationEnvironment(validEnvironment).nextAuthUrl, "https://cash.example.com");

  assert.throws(
    () => loadAuthenticationEnvironment({ ...validEnvironment, NEXTAUTH_SECRET: "too-short" }),
    AuthenticationConfigurationError
  );
  assert.throws(
    () => loadAuthenticationEnvironment({ ...validEnvironment, NEXTAUTH_URL: "http://cash.example.com" }),
    /HTTPS/
  );
  assert.doesNotThrow(() =>
    loadAuthenticationEnvironment({ ...validEnvironment, NODE_ENV: "development", NEXTAUTH_URL: "http://localhost:3000" })
  );
  assert.throws(
    () => loadAuthenticationEnvironment({ ...validEnvironment, AUTH_DEV_MODE: "true" }),
    /cannot be enabled in production/
  );
  const development = loadAuthenticationEnvironment({
    DATABASE_URL: "file:./data/amanah-cash.sqlite",
    NEXTAUTH_SECRET: "a-secure-secret-with-at-least-32-characters",
    NEXTAUTH_URL: "http://localhost:3000",
    AUTH_DEV_MODE: "true",
    DEV_SEED_ADMIN_EMAIL: "ADMIN@EXAMPLE.COM",
    DEV_SEED_OPERATOR_EMAIL: "OPERATOR@EXAMPLE.COM",
    NODE_ENV: "development"
  });
  assert.equal(development.developmentAuth, true);
  assert.equal(development.developmentAdminEmail, "admin@example.com");
  assert.equal(development.googleClientId, "");
});
