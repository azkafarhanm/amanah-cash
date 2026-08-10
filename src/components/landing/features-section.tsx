import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { features } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

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
          <IconTextList
            className={styles.featuresList}
            itemClassName={styles.featureItem}
            items={features}
          />
        </PageContainer>
      </Reveal>
    </Section>
  );
}
