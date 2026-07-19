import { PageContainer } from "@/components/ui";

import styles from "./hero-section.module.css";

function HeroContent() {
  return (
    <div className={styles.content}>
      <h1
        className={`${styles.title} tablet:[font:var(--landing-hero-title-tablet)] desktop:[font:var(--landing-hero-title-desktop)]`}
      >
        Transaksi keuangan siswa, tercatat lebih jelas
      </h1>
      <p className={styles.subheading}>
        Amanah Cash membantu guru mencatat pemasukan dan pengeluaran, melihat
        saldo, dan menelusuri riwayat transaksi dalam satu alur yang sederhana.
      </p>
      <p className={styles.supportingCopy}>
        Dirancang untuk penggunaan sehari-hari melalui browser di ponsel maupun
        komputer.
      </p>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      className={`${styles.section} tablet:py-[var(--landing-section-padding-tablet)] desktop:py-[var(--landing-section-padding-desktop)]`}
    >
      <PageContainer>
        <HeroContent />
      </PageContainer>
    </section>
  );
}
