import Link from "next/link";
import styles from "./settings-sections.module.css";

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function SecuritySettings() {
  return (
    <section className={styles.section} aria-labelledby="settings-security-title">
      <header className={styles.header}>
        <div className={styles.headerTitleRow}>
          <span className={styles.sectionSymbol}>
            <ShieldIcon />
          </span>
          <div>
            <h2 id="settings-security-title">Keamanan</h2>
            <p>Kredensial masuk Amanah Cash dikelola oleh Google.</p>
          </div>
        </div>
      </header>
      <div className={styles.row}>
        <div>
          <h3>Kata sandi dan keamanan akun</h3>
          <p>Amanah Cash tidak menyimpan atau mengubah kata sandi Google Anda.</p>
        </div>
        <a
          className={styles.secondaryButton}
          href="https://myaccount.google.com/security"
          target="_blank"
          rel="noreferrer"
        >
          Buka Keamanan Google
          <span className={styles.visuallyHidden}> (membuka tab baru)</span>
        </a>
      </div>
    </section>
  );
}

export function AboutSettings({ version }: { version: string }) {
  return (
    <section className={styles.section} aria-labelledby="settings-about-title">
      <header className={styles.header}>
        <div className={styles.headerTitleRow}>
          <span className={styles.sectionSymbol}>
            <InfoIcon />
          </span>
          <div>
            <h2 id="settings-about-title">Tentang</h2>
            <p>Informasi versi dan perubahan Amanah Cash.</p>
          </div>
        </div>
      </header>
      <div className={styles.row}>
        <div>
          <h3>Versi aplikasi</h3>
          <p>{version}</p>
        </div>
        <Link className={styles.secondaryButton} href="/changelog">
          Lihat perubahan
        </Link>
      </div>
    </section>
  );
}
