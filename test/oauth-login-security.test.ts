import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import type { AdapterSession } from "next-auth/adapters";
import {
  describeOAuthLoginError,
  isCrossUserSessionUpgrade,
  resolveActiveSessionUserId,
  shouldRedirectAuthenticatedVisitor
} from "../src/auth/oauth-security";
import { evaluateGoogleAdmission, isGoogleAccountBindingValid } from "../src/auth/admission";
import { buildAuthOptions } from "../src/auth/options";
import { getPrismaClient } from "../src/persistence/prisma";
import { openDatabase } from "../src/persistence/database.js";

const AZKA_USER_ID = "operator-1";
const ADMIN_USER_ID = "dev-platform-admin";

type SignInInput = {
  account: { provider: string; providerAccountId: string };
  profile: { email: string; email_verified: boolean; picture?: string };
};

function googleSignInInput(email: string, providerAccountId: string): SignInInput {
  return {
    account: { provider: "google", providerAccountId },
    profile: { email, email_verified: true }
  };
}

test("login policy keeps the authenticated redirect only when no OAuth error is present", () => {
  // Scenario 1: valid session + no OAuth error -> existing redirect to /app.
  assert.equal(shouldRedirectAuthenticatedVisitor(undefined), true);
  // Scenario 2: valid session + OAuthCallback error -> must NOT redirect /app.
  assert.equal(shouldRedirectAuthenticatedVisitor("OAuthCallback"), false);
  assert.equal(shouldRedirectAuthenticatedVisitor("AccessDenied"), false);
});

test("login policy describes OAuth errors so the failure stays visible", () => {
  // Scenario 3: OAuth error -> the user stays on the login/error state.
  const described = describeOAuthLoginError("OAuthCallback");
  assert.equal(typeof described, "string");
  assert.match(described!, /login Google/i);
  assert.equal(describeOAuthLoginError(undefined), null);
  assert.equal(typeof describeOAuthLoginError("SomethingUnexpected"), "string");
});

test("session upgrade conflict is detected only across different users", () => {
  assert.equal(isCrossUserSessionUpgrade(null, ADMIN_USER_ID), false);
  assert.equal(isCrossUserSessionUpgrade(AZKA_USER_ID, AZKA_USER_ID), false);
  // Scenario 4/7: a Google identity for the admin must not upgrade Azka's session.
  assert.equal(isCrossUserSessionUpgrade(AZKA_USER_ID, ADMIN_USER_ID), true);
});

test("active session user resolution tolerates missing tokens and lookup failures", async () => {
  assert.equal(await resolveActiveSessionUserId(undefined, async () => null), null);
  assert.equal(
    await resolveActiveSessionUserId("token", async () => {
      throw new Error("adapter unavailable");
    }),
    null
  );
  assert.equal(
    await resolveActiveSessionUserId("token", async () => ({ user: { id: AZKA_USER_ID } })),
    AZKA_USER_ID
  );
});

test("pre-provisioned Google admission still maps by verified email", async () => {
  // Scenario 6: nauvalnauvan0@gmail.com is the pre-provisioned PLATFORM_ADMIN.
  const decision = await evaluateGoogleAdmission({
    provider: "google",
    profile: { email: "NAUVALNAUVAN0@GMAIL.COM", email_verified: true },
    users: {
      async findByNormalizedEmail(email) {
        assert.equal(email, "nauvalnauvan0@gmail.com");
        return { id: ADMIN_USER_ID, email, isActive: true };
      }
    }
  });
  assert.equal(decision.allowed, true);
  if (decision.allowed) {
    assert.equal(decision.user.id, ADMIN_USER_ID);
  }
  // A first-time Google identity (no accounts row yet) may bind to its own user...
  assert.equal(isGoogleAccountBindingValid(ADMIN_USER_ID, null), true);
  // ...and never to somebody else's existing binding.
  assert.equal(isGoogleAccountBindingValid(ADMIN_USER_ID, AZKA_USER_ID), false);
});

test("Google sign-in guard blocks cross-user session upgrades end to end", async () => {
  const projectRoot = resolve(import.meta.dirname, "..");
  const directory = join(tmpdir(), `amanah-cash-oauth-guard-${crypto.randomUUID()}`);
  const databasePath = join(directory, "oauth-guard.sqlite");
  mkdirSync(directory);
  const database = openDatabase({ databasePath, migrationsPath: resolve(projectRoot, "migrations") });
  database.connection
    .prepare(
      "INSERT INTO users (id, name, email, role, is_active) VALUES (?, ?, ?, 'OPERATOR', 1)"
    )
    .run(AZKA_USER_ID, "Azka Parhan Muzahid", "azkafarhanm@gmail.com");
  database.connection
    .prepare(
      "INSERT INTO users (id, name, email, role, is_active) VALUES (?, ?, ?, 'PLATFORM_ADMIN', 1)"
    )
    .run(ADMIN_USER_ID, "Nauvan", "nauvalnauvan0@gmail.com");
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
  const sessionToken = "azka-active-session";

  try {
    const options = buildAuthOptions(environment, {
      readSessionCookie: async () => sessionToken
    });
    await options.adapter!.createSession!({
      sessionToken,
      userId: AZKA_USER_ID,
      expires: new Date("2099-07-20T16:00:00.000Z")
    } satisfies AdapterSession);
    const signIn = options.callbacks!.signIn as unknown as (input: SignInInput) => Promise<boolean>;

    // Scenario 4: Nauvan's Google identity must NOT become (or link to) Azka
    // while Azka's session is active.
    assert.equal(
      await signIn(googleSignInInput("nauvalnauvan0@gmail.com", "google-sub-nauval")),
      false
    );
    assert.equal(
      await prisma.account.findUnique({
        where: {
          provider_providerAccountId: { provider: "google", providerAccountId: "google-sub-nauval" }
        }
      }),
      null,
      "blocked sign-in must not leave a cross-user account link behind"
    );

    // Scenario 5: Azka's own Google identity still signs in on Azka's session.
    assert.equal(
      await signIn(googleSignInInput("azkafarhanm@gmail.com", "google-sub-azka")),
      true
    );

    // Scenario 7 (positive control): with no active session cookie, Nauvan's
    // pre-provisioned identity is admitted and may bind to its own user.
    const freshOptions = buildAuthOptions(environment, {
      readSessionCookie: async () => undefined
    });
    const freshSignIn = freshOptions.callbacks!.signIn as unknown as (input: SignInInput) => Promise<boolean>;
    assert.equal(
      await freshSignIn(googleSignInInput("nauvalnauvan0@gmail.com", "google-sub-nauval")),
      true
    );
  } finally {
    await prisma.$disconnect();
    rmSync(directory, { recursive: true, force: true });
  }
});
