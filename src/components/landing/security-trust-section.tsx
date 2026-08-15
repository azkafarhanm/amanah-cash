import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { trustPrinciples } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

const securityPanelA = trustPrinciples.slice(0, 3);
const securityPanelB = trustPrinciples.slice(3, 5);

export function SecurityTrustSection() {
  return (
    <Section
      className={styles.securitySection}
      id="keamanan"
      spacing="landing"
      surface="subtle"
    >
      <Reveal>
        <PageContainer className={styles.sectionContent}>
          <LandingSectionHeading
            eyebrow="Keamanan dan kepercayaan"
            title="Kepercayaan dibangun dari kontrol yang dapat dijelaskan"
            description="Batas akses dan pencatatan yang jelas membantu aktivitas penting tetap dapat diperiksa dan data operasional dipulihkan dengan terkendali."
          />
          {/* Desktop & Tablet: Unified 5 principles */}
          <div className={styles.securityDesktopOnly}>
            <IconTextList
              className={styles.gridFiveBalanced}
              items={trustPrinciples}
            />
          </div>
          {/* Mobile/PWA: Panel A (Principles 1–3) */}
          <div className={styles.securityMobileOnly}>
            <IconTextList
              className={styles.gridFiveBalanced}
              items={securityPanelA}
            />
          </div>
        </PageContainer>
      </Reveal>
    </Section>
  );
}

export function SecurityContinuationSection() {
  return (
    <Section
      className={styles.securityContinuationSection}
      spacing="landing"
      surface="subtle"
    >
      <Reveal>
        <PageContainer className={styles.sectionContent}>
          <LandingSectionHeading
            eyebrow="Kelanjutan perlindungan"
            title="Pemulihan data dan transparansi operasional"
            description="Prosedur backup/restore yang terkonfirmasi dan visibilitas finansial yang dapat dipertanggungjawabkan."
          />
          <IconTextList
            className={styles.gridFiveBalanced}
            items={securityPanelB}
          />
        </PageContainer>
      </Reveal>
    </Section>
  );
}
