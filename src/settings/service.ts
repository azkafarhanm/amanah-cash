import type { PrismaClient } from "@/generated/prisma/client";
import type { ThemePreference } from "@/settings/theme";
import { DEFAULT_THEME_PREFERENCE, isThemePreference } from "@/settings/theme";
import {
  DEFAULT_PAGE_SIZE,
  resolvePageSize,
  type PageSizePreference
} from "@/settings/preferences";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { getPrismaClient } from "@/persistence/prisma";

type SettingsPrisma = Pick<PrismaClient, "settingsPreference">;

export type UserSettingsPreferences = {
  theme: ThemePreference;
  defaultPageSize: PageSizePreference;
};

export async function readSettingsPreferences(
  prisma: SettingsPrisma,
  userId: string
): Promise<UserSettingsPreferences> {
  const preference = await prisma.settingsPreference.findUnique({
    where: { userId },
    select: { theme: true, defaultPageSize: true }
  });

  return {
    theme: isThemePreference(preference?.theme)
      ? preference.theme
      : DEFAULT_THEME_PREFERENCE,
    defaultPageSize: resolvePageSize(preference?.defaultPageSize, DEFAULT_PAGE_SIZE)
  };
}

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

export async function readDefaultPageSize(
  prisma: SettingsPrisma,
  userId: string
): Promise<PageSizePreference> {
  const preference = await prisma.settingsPreference.findUnique({
    where: { userId },
    select: { defaultPageSize: true }
  });
  return resolvePageSize(preference?.defaultPageSize);
}

export function readCurrentDefaultPageSize(userId: string): Promise<PageSizePreference> {
  return readDefaultPageSize(
    getPrismaClient(loadAuthenticationEnvironment()),
    userId
  );
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

export async function saveDefaultPageSize(
  prisma: SettingsPrisma,
  userId: string,
  defaultPageSize: PageSizePreference
): Promise<PageSizePreference> {
  const preference = await prisma.settingsPreference.upsert({
    where: { userId },
    create: { userId, defaultPageSize },
    update: { defaultPageSize },
    select: { defaultPageSize: true }
  });
  return resolvePageSize(preference.defaultPageSize);
}
