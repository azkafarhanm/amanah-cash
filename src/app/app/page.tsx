import { redirect } from "next/navigation";
import { protectRoute, roleHome } from "@/authorization/routes";

export const dynamic = "force-dynamic";

export default async function AuthenticatedApplicationEntry() {
  const user = await protectRoute("authenticated");
  redirect(roleHome(user.role));
}
