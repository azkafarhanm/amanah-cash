import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { problems } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

const problemsPanelA = problems.slice(0, 3);
const problemsPanelB = problems.slice(3, 5);

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
          {/* Desktop & Tablet: Unified 5-item layout */}
          <div className={styles.problemsDesktopOnly}>
            <IconTextList
              className={styles.gridFiveBalanced}
              items={problems}
            />
          </div>
          {/* Mobile/PWA: Panel A (Items 1–3) */}
          <div className={styles.problemsMobileOnly}>
            <IconTextList
              className={styles.gridFiveBalanced}
              items={problemsPanelA}
            />
          </div>
        </PageContainer>
      </Reveal>
    </Section>
  );
}

export function ProblemsContinuationSection() {
  return (
    <Section
      className={styles.problemsContinuationSection}
      spacing="landing"
      surface="subtle"
    >
      <Reveal>
        <PageContainer className={styles.sectionContent}>
          <LandingSectionHeading
            eyebrow="Dampak pencatatan terpisah"
            title="Laporan dan koreksi yang memakan waktu"
            description="Rekap transaksi dan penemuan kekeliruan menjadi lambat tanpa alur pencatatan yang terintegrasi."
          />
          <IconTextList
            className={styles.gridFiveBalanced}
            items={problemsPanelB}
          />
        </PageContainer>
      </Reveal>
    </Section>
  );
}

