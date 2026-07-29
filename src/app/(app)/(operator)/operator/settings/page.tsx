import { protectRoute } from "@/authorization/routes";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { getPrismaClient } from "@/persistence/prisma";
import { readThemePreference } from "@/settings/service";

export default async function OperatorSettingsPage() {
  const user = await protectRoute("operator");
  const theme = await readThemePreference(
    getPrismaClient(loadAuthenticationEnvironment()),
    user.id
  );

  return (
    <ContentWrapper>
      <SectionHeader
        title="Pengaturan"
        description="Atur tampilan Amanah Cash untuk akun Anda."
      />
      <ThemeSettings initialTheme={theme} />
    </ContentWrapper>
  );
}
