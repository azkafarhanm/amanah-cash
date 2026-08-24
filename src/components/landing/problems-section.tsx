import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { problems } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

export function ProblemsSection() {
  return (
    <Section className={styles.problemsSection} spacing="landing" surface="subtle">
      <Reveal>
        <PageContainer className={styles.sectionContent}>
          <LandingSectionHeading
            eyebrow="Masalah yang nyata"
            title="Pencatatan manual membuat informasi sulit diikuti"
            description="Ketika transaksi tersebar di buku, pesan, atau lembar kerja, saldo dan riwayat siswa membutuhkan lebih banyak waktu untuk diperiksa."
          />
          <IconTextList
            className={styles.gridFiveBalanced}
            items={problems}
          />
        </PageContainer>
      </Reveal>
    </Section>
  );
}
