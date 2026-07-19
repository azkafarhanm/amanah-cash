import { PageContainer } from "@/components/ui";

import styles from "./landing-footer.module.css";

function FooterIdentity() {
  return (
    <div className={styles.identity}>
      <p className={styles.productName}>Amanah Cash</p>
      <p className={styles.description}>
        Pencatatan transaksi keuangan siswa yang sederhana, jelas, dan mudah
        ditelusuri.
      </p>
    </div>
  );
}

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`${styles.footer} tablet:py-[var(--landing-section-padding-tablet)] desktop:py-[var(--landing-section-padding-desktop)]`}
    >
      <PageContainer className={styles.content}>
        <FooterIdentity />
        <p className={styles.copyright}>
          © {currentYear} Amanah Cash.
        </p>
      </PageContainer>
    </footer>
  );
}
