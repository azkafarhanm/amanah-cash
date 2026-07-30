"use server";

import { authorizeServerAction } from "@/authorization/actions";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { getPrismaClient } from "@/persistence/prisma";
import {
  saveDefaultPageSize,
  saveThemePreference
} from "@/settings/service";
import {
  isPageSizePreference,
  type PageSizePreference
} from "@/settings/preferences";
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

export type SavePageSizeResult =
  | { status: "success"; defaultPageSize: PageSizePreference }
  | { status: "error"; message: string };

export async function updateDefaultPageSize(value: number): Promise<SavePageSizeResult> {
  if (!isPageSizePreference(value)) {
    return { status: "error", message: "Jumlah item per halaman tidak valid." };
  }
  try {
    const user = await authorizeServerAction({ role: "authenticated" });
    const prisma = getPrismaClient(loadAuthenticationEnvironment());
    const defaultPageSize = await saveDefaultPageSize(prisma, user.id, value);
    return { status: "success", defaultPageSize };
  } catch {
    return { status: "error", message: "Preferensi belum dapat disimpan." };
  }
}
