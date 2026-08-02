import { protectRoute } from "@/authorization/routes";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { PreferencesSettings } from "@/components/settings/preferences-settings";
import {
  AboutSettings,
  SecuritySettings
} from "@/components/settings/security-about-settings";
import { ContentWrapper, SectionDivider, SectionHeader } from "@/components/ui";
import { getPrismaClient } from "@/persistence/prisma";
import { readSettingsPreferences } from "@/settings/service";
import { APPLICATION_VERSION } from "@/settings/about";
import styles from "@/components/settings/settings-sections.module.css";

export default async function OperatorSettingsPage() {
  const user = await protectRoute("operator");
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
      <ThemeSettings initialTheme={preferences.theme} />
      <PreferencesSettings
        initialPageSize={preferences.defaultPageSize}
      />
      <SecuritySettings />
      <AboutSettings version={APPLICATION_VERSION} />
    </ContentWrapper>
  );
}
