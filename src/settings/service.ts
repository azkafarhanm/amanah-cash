import type { PrismaClient } from "@/generated/prisma/client";
import type { ThemePreference } from "@/settings/theme";
import { DEFAULT_THEME_PREFERENCE, isThemePreference } from "@/settings/theme";

type SettingsPrisma = Pick<PrismaClient, "settingsPreference">;

export async function readThemePreference(
  prisma: SettingsPrisma,
  userId: string
): Promise<ThemePreference> {
  const preference = await prisma.settingsPreference.findUnique({
    where: { userId },
    select: { theme: true }
  });

  return isThemePreference(preference?.theme)
    ? preference.theme
    : DEFAULT_THEME_PREFERENCE;
}

export async function saveThemePreference(
  prisma: SettingsPrisma,
  userId: string,
  theme: ThemePreference
): Promise<ThemePreference> {
  const preference = await prisma.settingsPreference.upsert({
    where: { userId },
    create: { userId, theme },
    update: { theme },
    select: { theme: true }
  });

  return preference.theme;
}
