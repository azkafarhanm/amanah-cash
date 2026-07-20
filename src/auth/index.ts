import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { buildAuthOptions } from "@/auth/options";

export type AuthenticatedUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export async function auth() {
  return getServerSession(buildAuthOptions());
}

export async function currentUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email) return null;

  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email,
    image: user.image ?? null
  };
}

export async function requireAuthentication(): Promise<AuthenticatedUser> {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
