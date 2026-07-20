import type { ReactNode } from "react";
import { protectRoute } from "@/authorization/routes";

export const dynamic = "force-dynamic";

export default async function OperatorLayout({ children }: { children: ReactNode }) {
  await protectRoute("operator");
  return children;
}
