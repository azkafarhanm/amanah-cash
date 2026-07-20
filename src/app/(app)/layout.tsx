import { Suspense, type ReactNode } from "react";
import { auth } from "@/auth";
import { protectRoute } from "@/authorization/routes";
import { AppLoading } from "@/components/app-shell/app-loading";
import { AppShell } from "@/components/app-shell/app-shell";
import { SessionProvider } from "@/components/app-shell/session-provider";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const [authorizationContext, session] = await Promise.all([
    protectRoute("authenticated"),
    auth()
  ]);

  return (
    <SessionProvider session={session}>
      <AppShell role={authorizationContext.role} user={session?.user ?? {}}>
        <Suspense fallback={<AppLoading />}>{children}</Suspense>
      </AppShell>
    </SessionProvider>
  );
}
