"use server";

import { authorizeServerAction } from "@/authorization/actions";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { getPrismaClient } from "@/persistence/prisma";
import { saveThemePreference } from "@/settings/service";
import { isThemePreference, type ThemePreference } from "@/settings/theme";

export type SaveThemeResult =
  | { status: "success"; theme: ThemePreference }
  | { status: "error"; message: string };

export async function updateThemePreference(value: string): Promise<SaveThemeResult> {
  if (!isThemePreference(value)) {
    return { status: "error", message: "Pilihan tema tidak valid." };
  }

  try {
    const user = await authorizeServerAction({ role: "authenticated" });
    const prisma = getPrismaClient(loadAuthenticationEnvironment());
    const theme = await saveThemePreference(prisma, user.id, value);
    return { status: "success", theme };
  } catch {
    return {
      status: "error",
      message: "Tema belum dapat disimpan. Pilihan sebelumnya tetap digunakan."
    };
  }
}
