import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageContainer, Section } from "@/components/ui";

import styles from "./landing-content.module.css";
import { Reveal } from "./reveal";

export function FinalCTASection() {
  return (
    <Section className={styles.finalCtaSection} spacing="landing" surface="subtle">
      <Reveal>
        <PageContainer>
          <div className={styles.finalCta}>
            <div className={styles.finalCtaCopy}>
              <p className={styles.eyebrow}>Siap digunakan</p>
              <h2>Kelola transaksi siswa dengan alur yang lebih jelas</h2>
              <p>
                Catat aktivitas keuangan, tinjau saldo dan laporan, serta jaga
                riwayat yang dapat ditelusuri.
              </p>
            </div>
            <div className={styles.finalCtaActions}>
              <Link className={styles.primaryAction} href="/login">
                Mulai menggunakan
                <ArrowRight aria-hidden="true" />
              </Link>
              <a className={styles.secondaryAction} href="#cara-kerja">
                Kembali ke cara kerja
              </a>
            </div>
          </div>
        </PageContainer>
      </Reveal>
    </Section>
  );
}
