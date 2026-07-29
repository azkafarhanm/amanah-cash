import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { problems } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";

export function ProblemsSection() {
  return (
    <Section spacing="landing" surface="subtle">
      <PageContainer
        className={`${styles.sectionContent} desktop:grid-cols-2`}
      >
        <LandingSectionHeading
          title="Pencatatan keuangan siswa seharusnya tidak merepotkan"
          description="Ketika catatan tersebar dan saldo harus dihitung ulang, aktivitas sederhana dapat menyita waktu lebih banyak dari yang seharusnya."
        />
        <IconTextList
          className="tablet:grid-cols-2 desktop:grid-cols-1"
          items={problems}
        />
      </PageContainer>
    </Section>
  );
}
