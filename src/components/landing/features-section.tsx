import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { features } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

const featuresPanelA = features.slice(0, 5);
const featuresPanelB = features.slice(5, 10);

export function FeaturesSection() {
  return (
    <Section
      className={styles.featuresSection}
      id="fitur"
      spacing="landing"
      surface="canvas"
    >
      <Reveal>
        <PageContainer className={styles.sectionContent}>
          <LandingSectionHeading
            eyebrow="Kemampuan yang tersedia"
            title="Fitur untuk pekerjaan harian yang nyata"
            description="Setiap fitur mendukung pencatatan, peninjauan, pengendalian akses, atau keberlanjutan operasional."
          />
          {/* Desktop & Tablet: Unified 10-card list */}
          <div className={styles.featuresDesktopOnly}>
            <IconTextList
              className={styles.featuresList}
              itemClassName={styles.featureItem}
              items={features}
            />
          </div>
          {/* Mobile/PWA: Panel A (Cards 1–5) */}
          <div className={styles.featuresMobileOnly}>
            <IconTextList
              className={styles.featuresList}
              itemClassName={styles.featureItem}
              items={featuresPanelA}
            />
          </div>
        </PageContainer>
      </Reveal>
    </Section>
  );
}

export function FeaturesContinuationSection() {
  return (
    <Section
      className={styles.featuresContinuationSection}
      spacing="landing"
      surface="canvas"
    >
      <Reveal>
        <PageContainer className={styles.sectionContent}>
          <LandingSectionHeading
            eyebrow="Kelanjutan fitur"
            title="Dukungan operasional & keamanan"
            description="Fitur lanjutan untuk memperkuat kontrol akses, perlindungan data, dan fleksibilitas penggunaan."
          />
          <IconTextList
            className={styles.featuresList}
            itemClassName={styles.featureItem}
            items={featuresPanelB}
          />
        </PageContainer>
      </Reveal>
    </Section>
  );
}
