import Link from "next/link";

import { PageContainer, Section } from "@/components/ui";

import { IconTextList } from "./icon-text-list";
import { solutions } from "./landing-content";
import styles from "./landing-content.module.css";
import { LandingSectionHeading } from "./landing-section-heading";

export function SolutionSection() {
  return (
    <Section spacing="landing" surface="canvas">
      <PageContainer className={styles.sectionContent}>
        <LandingSectionHeading
          title="Satu alur yang lebih mudah dipahami"
          description="Amanah Cash menyatukan pencatatan, saldo, dan riwayat transaksi agar aktivitas keuangan setiap siswa lebih mudah ditinjau."
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
  );
}
