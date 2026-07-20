import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, Profile } from "next-auth";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import { createAuthenticationAdapter } from "@/auth/adapter";
import {
  evaluateGoogleAdmission,
  isGoogleAccountBindingValid,
  normalizeGoogleEmail
} from "@/auth/admission";
import {
  loadAuthenticationEnvironment,
  type AuthenticationEnvironment
} from "@/auth/environment";
import { getPrismaClient } from "@/persistence/prisma";

export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
export const SESSION_UPDATE_AGE_SECONDS = 15 * 60;

const Google = ((GoogleProvider as unknown as { default?: typeof GoogleProvider }).default ??
  GoogleProvider) as typeof GoogleProvider;

function isVerifiedGoogleProfile(profile: Profile | undefined): profile is GoogleProfile {
  return Boolean(profile && "email_verified" in profile);
}

export function buildAuthOptions(
  environment: AuthenticationEnvironment = loadAuthenticationEnvironment()
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

  return {
    adapter,
    secret: environment.nextAuthSecret,
    session: {
      strategy: "database",
      maxAge: SESSION_MAX_AGE_SECONDS,
      updateAge: SESSION_UPDATE_AGE_SECONDS
    },
    useSecureCookies: secureCookies,
    cookies: {
      sessionToken: {
        name: secureCookies ? "__Secure-next-auth.session-token" : "next-auth.session-token",
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
    providers: [
      Google({
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
      })
    ],
    callbacks: {
      async signIn({ account, profile }) {
        const decision = await evaluateGoogleAdmission({
          provider: account?.provider,
          profile: isVerifiedGoogleProfile(profile) ? profile : undefined,
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
          await prisma.user.update({ where: { id: decision.user.id }, data: { lastLoginAt: new Date() } });
        }
        return bindingValid;
      },
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
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
