import Link from "next/link";

import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { solutions } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";
import { Reveal } from "./reveal";

export function SolutionSection() {
  return (
    <Reveal>
    <Section spacing="landing" surface="canvas">
      <PageContainer className={styles.sectionContent}>
        <LandingSectionHeading
          eyebrow="Solusi yang praktis"
          title="Satu alur untuk mencatat, memeriksa, dan mempertanggungjawabkan"
          description="Data siswa, transaksi, saldo, laporan, dan riwayat perubahan tersedia dalam konteks yang saling terhubung."
        />
        <IconTextList
          className="desktop:grid-cols-2"
          items={solutions}
        />
        <Link
          aria-label="Jelajahi fitur Amanah Cash"
          className={styles.solutionAction}
          href="#fitur"
        >
          Jelajahi fitur
        </Link>
      </PageContainer>
    </Section>
    </Reveal>
  );
}
