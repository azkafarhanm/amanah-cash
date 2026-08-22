import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, Profile } from "next-auth";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { createAuthenticationAdapter } from "@/auth/adapter";
import {
  evaluateGoogleAdmission,
  isGoogleAccountBindingValid,
  normalizeGoogleEmail
} from "@/auth/admission";
import {
  isCrossUserSessionUpgrade,
  resolveActiveSessionUserId
} from "@/auth/oauth-security";
import {
  loadAuthenticationEnvironment,
  type AuthenticationEnvironment
} from "@/auth/environment";
import { getPrismaClient } from "@/persistence/prisma";

export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
export const SESSION_UPDATE_AGE_SECONDS = 15 * 60;

const Google = ((GoogleProvider as unknown as { default?: typeof GoogleProvider }).default ??
  GoogleProvider) as typeof GoogleProvider;
const Credentials = ((CredentialsProvider as unknown as { default?: typeof CredentialsProvider }).default ??
  CredentialsProvider) as typeof CredentialsProvider;

function isVerifiedGoogleProfile(profile: Profile | undefined): profile is GoogleProfile {
  return Boolean(profile && "email_verified" in profile);
}

export type BuildAuthOptionsOverrides = {
  /**
   * Reads the active NextAuth session cookie. Injectable so the sign-in
   * session-conflict guard can be exercised outside a request scope.
   */
  readSessionCookie?: () => Promise<string | undefined>;
};

export function buildAuthOptions(
  environment: AuthenticationEnvironment = loadAuthenticationEnvironment(),
  overrides: BuildAuthOptionsOverrides = {}
): NextAuthOptions {
  const prisma = getPrismaClient(environment);
  const prismaAdapter = PrismaAdapter(prisma);
  const adapter = createAuthenticationAdapter({
    baseAdapter: prismaAdapter,
    sessions: {
      async deleteManyForUser(userId) {
        await prisma.session.deleteMany({ where: { userId } });
      }
    }
  });
  const secureCookies = new URL(environment.nextAuthUrl).protocol === "https:";
  const sessionCookieName = secureCookies
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
  const getSessionAndUser = adapter.getSessionAndUser!;
  const readSessionCookie =
    overrides.readSessionCookie ??
    (async () => {
      const store = await cookies();
      return store.get(sessionCookieName)?.value;
    });

  async function activeSessionUserId(): Promise<string | null> {
    try {
      return await resolveActiveSessionUserId(await readSessionCookie(), getSessionAndUser);
    } catch {
      // Outside a request scope (scripts/tests) there is no session cookie to
      // consult; the sign-in guard simply stays inactive.
      return null;
    }
  }
  const googleProvider = Google({
    clientId: environment.googleClientId,
    clientSecret: environment.googleClientSecret,
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: {
        scope: "openid email profile"
      }
    },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name ?? null,
        email: profile.email ? normalizeGoogleEmail(profile.email) : null,
        image: profile.picture ?? null
      };
    }
  });
  const credentialsProvider = Credentials({
    name: "Local development",
    credentials: { email: { label: "Seeded email", type: "email" } },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLocaleLowerCase("en-US");
      const allowedEmails = new Set([
        environment.developmentAdminEmail,
        environment.developmentOperatorEmail
      ]);
      if (!email || !allowedEmails.has(email)) return null;

      const user = await prisma.user.findFirst({
        where: { email, isActive: true, deletedAt: null },
        select: { id: true, name: true, email: true, image: true }
      });
      return user ?? null;
    }
  });
  const hasGoogleCredentials = Boolean(environment.googleClientId && environment.googleClientSecret);
  const providers = environment.developmentAuth
    ? hasGoogleCredentials
      ? [credentialsProvider, googleProvider]
      : [credentialsProvider]
    : [googleProvider];

  return {
    adapter,
    secret: environment.nextAuthSecret,
    session: {
      strategy: environment.developmentAuth ? "jwt" : "database",
      maxAge: SESSION_MAX_AGE_SECONDS,
      updateAge: SESSION_UPDATE_AGE_SECONDS
    },
    useSecureCookies: secureCookies,
    cookies: {
      sessionToken: {
        name: sessionCookieName,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: secureCookies
        }
      }
    },
    pages: {
      signIn: "/login",
      error: "/access-denied"
    },
    providers,
    callbacks: {
      async signIn({ account, profile }) {
        if (environment.developmentAuth) {
          if (account?.provider === "credentials") return true;
          if (account?.provider === "google") {
            // Fall through to Google admission logic below
          } else {
            return false;
          }
        }
        const googleProfile = isVerifiedGoogleProfile(profile) ? profile : undefined;
        const decision = await evaluateGoogleAdmission({
          provider: account?.provider,
          profile: googleProfile,
          users: {
            async findByNormalizedEmail(email) {
              return prisma.user.findFirst({
                where: { email, deletedAt: null },
                select: { id: true, email: true, isActive: true }
              });
            }
          }
        });
        if (!decision.allowed || !account?.providerAccountId) return false;

        // NextAuth v4 upgrades an existing session when the OAuth callback
        // arrives with a still-valid session cookie, which would link the
        // fresh Google identity to the *session* user. Block that whenever the
        // active session belongs to a different user than the admitted one, so
        // a Google identity can never attach to an unrelated application user.
        // (callbacks.signIn runs before callbackHandler/linkAccount, so
        // returning false here prevents the link entirely.)
        const sessionUserId = await activeSessionUserId();
        if (isCrossUserSessionUpgrade(sessionUserId, decision.user.id)) return false;

        const linkedAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "google",
              providerAccountId: account.providerAccountId
            }
          },
          select: { userId: true }
        });
        const bindingValid = isGoogleAccountBindingValid(decision.user.id, linkedAccount?.userId ?? null);
        if (bindingValid) {
          const lastLoginAt = new Date();
          if (googleProfile?.picture) {
            await prisma.$transaction([
              prisma.user.updateMany({
                where: { id: decision.user.id, image: null },
                data: { image: googleProfile.picture }
              }),
              prisma.user.update({
                where: { id: decision.user.id },
                data: { lastLoginAt }
              })
            ]);
          } else {
            await prisma.user.update({
              where: { id: decision.user.id },
              data: { lastLoginAt }
            });
          }
        }
        return bindingValid;
      },
      async jwt({ token, user }) {
        if (user) token.userId = user.id;
        return token;
      },
      async session({ session, user, token }) {
        if (session.user) {
          session.user.id = environment.developmentAuth ? String(token.userId ?? "") : user.id;
        }
        return session;
      },
      async redirect({ url, baseUrl }) {
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        try {
          return new URL(url).origin === baseUrl ? url : `${baseUrl}/app`;
        } catch {
          return `${baseUrl}/app`;
        }
      }
    }
  };
}
