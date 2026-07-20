"use client";

import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function SessionProvider({ session, children }: { session: Session | null; children: ReactNode }) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>;
}
