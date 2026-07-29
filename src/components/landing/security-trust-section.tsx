import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { trustPrinciples } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";

export function SecurityTrustSection() {
  return (
    <Section spacing="landing" surface="subtle">
      <PageContainer
        className={`${styles.sectionContent} desktop:grid-cols-2`}
      >
        <LandingSectionHeading
          title="Kepercayaan dibangun dari catatan yang jelas"
          description="Setiap perubahan saldo dapat dijelaskan melalui transaksi aktif dan catatan audit yang mendasarinya."
        />
        <IconTextList items={trustPrinciples} />
      </PageContainer>
    </Section>
  );
}
