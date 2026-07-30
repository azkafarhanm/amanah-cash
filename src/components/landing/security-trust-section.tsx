import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { trustPrinciples } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

export function SecurityTrustSection() {
  return (
    <Reveal>
    <Section id="keamanan" spacing="landing" surface="subtle">
      <PageContainer
        className={`${styles.sectionContent} desktop:grid-cols-2`}
      >
        <LandingSectionHeading
          eyebrow="Keamanan dan kepercayaan"
          title="Kepercayaan dibangun dari kontrol yang dapat dijelaskan"
          description="Batas akses dan pencatatan yang jelas membantu aktivitas penting tetap dapat diperiksa dan data operasional dipulihkan dengan terkendali."
        />
        <IconTextList items={trustPrinciples} />
      </PageContainer>
    </Section>
    </Reveal>
  );
}
