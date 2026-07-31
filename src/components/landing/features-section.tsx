import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { features } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

export function FeaturesSection() {
  return (
    <Reveal>
    <Section id="fitur" spacing="landing" surface="canvas">
      <PageContainer className={styles.sectionContent}>
        <LandingSectionHeading
          eyebrow="Kemampuan yang tersedia"
          title="Fitur untuk pekerjaan harian yang nyata"
          description="Setiap fitur mendukung pencatatan, peninjauan, pengendalian akses, atau keberlanjutan operasional."
        />
        <IconTextList
          className="tablet:grid-cols-2 desktop:grid-cols-3"
          items={features}
        />
      </PageContainer>
    </Section>
    </Reveal>
  );
}
