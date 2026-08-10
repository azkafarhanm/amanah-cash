import { PageContainer } from "@/components/ui";

import styles from "./landing-footer.module.css";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`${styles.footer} tablet:py-[var(--landing-section-padding-tablet)] desktop:py-[var(--landing-section-padding-desktop)]`}
    >
      <PageContainer className={styles.content}>
        <div className={styles.identity}>
          <p className={styles.productName}>Amanah Cash</p>
          <p className={styles.description}>
            Pengelolaan transaksi keuangan siswa yang jelas dan dapat
            ditelusuri.
          </p>
        </div>
        <nav aria-label="Navigasi footer" className={styles.navigation}>
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#fitur">Fitur</a>
          <a href="#keamanan">Keamanan</a>
          <a href="#tanya-jawab">Tanya jawab</a>
        </nav>
        <p className={styles.copyright}>© {currentYear} Amanah Cash.</p>
      </PageContainer>
    </footer>
  );
}
