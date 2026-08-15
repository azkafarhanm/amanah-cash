import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { solutions } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

const solutionPanelA = solutions.slice(0, 3);
const solutionPanelB = solutions.slice(3, 5);

export function SolutionSection() {
  return (
    <Section className={styles.solutionSection} id="solusi" spacing="landing" surface="canvas">
      <Reveal>
        <PageContainer className={styles.sectionContent}>
          <LandingSectionHeading
            eyebrow="Solusi yang praktis"
            title="Satu alur untuk mencatat, memeriksa, dan mempertanggungjawabkan"
            description="Data siswa, transaksi, saldo, laporan, dan riwayat perubahan tersedia dalam konteks yang saling terhubung."
          />
          {/* Desktop & Tablet: Unified 5-item layout */}
          <div className={styles.solutionDesktopOnly}>
            <IconTextList
              className={styles.gridFiveBalanced}
              items={solutions}
            />
            <a
              aria-label="Jelajahi fitur Amanah Cash"
              className={styles.solutionAction}
              href="#fitur"
            >
              Jelajahi fitur
            </a>
          </div>
          {/* Mobile/PWA: Panel A (Items 1–3) */}
          <div className={styles.solutionMobileOnly}>
            <IconTextList
              className={styles.gridFiveBalanced}
              items={solutionPanelA}
            />
          </div>
        </PageContainer>
      </Reveal>
    </Section>
  );
}

export function SolutionContinuationSection() {
  return (
    <Section
      className={styles.solutionContinuationSection}
      spacing="landing"
      surface="canvas"
    >
      <Reveal>
        <PageContainer className={styles.sectionContent}>
          <LandingSectionHeading
            eyebrow="Evaluasi & Pertanggungjawaban"
            title="Pelaporan siap tinjau dan jejak perubahan"
            description="Ringkasan laporan dan riwayat tindakan mendukung pemeriksaan serta pertanggungjawaban operasional."
          />
          <IconTextList
            className={styles.gridFiveBalanced}
            items={solutionPanelB}
          />
          <a
            aria-label="Jelajahi fitur Amanah Cash"
            className={styles.solutionAction}
            href="#fitur"
          >
            Jelajahi fitur
          </a>
        </PageContainer>
      </Reveal>
    </Section>
  );
}
