import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { features } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";

export function FeaturesSection() {
  return (
    <Section id="fitur" spacing="landing" surface="canvas">
      <PageContainer className={styles.sectionContent}>
        <LandingSectionHeading
          title="Fitur inti untuk pencatatan sehari-hari"
          description="Setiap fitur mendukung alur kerja yang singkat, jelas, dan mudah digunakan melalui ponsel."
        />
        <IconTextList
          className="tablet:grid-cols-2 desktop:grid-cols-3"
          items={features}
        />
      </PageContainer>
    </Section>
  );
}
