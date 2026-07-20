import type { ReactNode } from "react";
import { protectRoute } from "@/authorization/routes";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await protectRoute("admin");
  return children;
}
