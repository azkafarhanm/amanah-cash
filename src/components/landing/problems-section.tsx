import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { problems } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

export function ProblemsSection() {
  return (
    <Reveal>
    <Section spacing="landing" surface="subtle">
      <PageContainer
        className={`${styles.sectionContent} desktop:grid-cols-2`}
      >
        <LandingSectionHeading
          eyebrow="Masalah yang nyata"
          title="Pencatatan manual membuat informasi sulit diikuti"
          description="Ketika transaksi tersebar di buku, pesan, atau lembar kerja, saldo dan riwayat siswa membutuhkan lebih banyak waktu untuk diperiksa."
        />
        <IconTextList
          className="tablet:grid-cols-2 desktop:grid-cols-1"
          items={problems}
        />
      </PageContainer>
    </Section>
    </Reveal>
  );
}
