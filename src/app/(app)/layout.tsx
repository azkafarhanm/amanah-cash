import { Suspense, type ReactNode } from "react";
import { auth } from "@/auth";
import { protectRoute } from "@/authorization/routes";
import { AppLoading } from "@/components/app-shell/app-loading";
import { AppShell } from "@/components/app-shell/app-shell";
import { SessionProvider } from "@/components/app-shell/session-provider";
import { ThemeProvider } from "@/components/settings/theme-provider";
import { ToastProvider } from "@/components/ui";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { getPrismaClient } from "@/persistence/prisma";
import { readThemePreference } from "@/settings/service";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const [authorizationContext, session] = await Promise.all([
    protectRoute("authenticated"),
    auth()
  ]);
  const theme = await readThemePreference(
    getPrismaClient(loadAuthenticationEnvironment()),
    authorizationContext.id
  );

  return (
    <SessionProvider session={session}>
      <ThemeProvider preference={theme}>
        <ToastProvider>
          <AppShell role={authorizationContext.role} user={session?.user ?? {}}>
            <Suspense fallback={<AppLoading />}>{children}</Suspense>
          </AppShell>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

