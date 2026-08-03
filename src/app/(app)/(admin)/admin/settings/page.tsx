import { protectRoute } from "@/authorization/routes";
import { auth } from "@/auth";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { AccountSettings } from "@/components/settings/account-settings";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { PreferencesSettings } from "@/components/settings/preferences-settings";
import { DataSettings } from "@/components/settings/data-settings";
import {
  AboutSettings,
  SecuritySettings
} from "@/components/settings/security-about-settings";
import { ContentWrapper, SectionDivider, SectionHeader } from "@/components/ui";
import { getPrismaClient } from "@/persistence/prisma";
import { readSettingsPreferences } from "@/settings/service";
import { APPLICATION_VERSION } from "@/settings/about";
import styles from "@/components/settings/settings-sections.module.css";

export default async function AdminSettingsPage() {
  const [user, session] = await Promise.all([
    protectRoute("admin"),
    auth()
  ]);
  const preferences = await readSettingsPreferences(
    getPrismaClient(loadAuthenticationEnvironment()),
    user.id
  );

  return (
    <ContentWrapper className={styles.page}>
      <SectionHeader
        title="Pengaturan"
        description="Atur tampilan dan preferensi Amanah Cash untuk akun Anda."
      />
      <SectionDivider />
      <AccountSettings user={session?.user ?? {}} />
      <ThemeSettings initialTheme={preferences.theme} />
      <PreferencesSettings
        initialPageSize={preferences.defaultPageSize}
      />
      <DataSettings />
      <SecuritySettings />
      <AboutSettings version={APPLICATION_VERSION} />
    </ContentWrapper>
  );
}
