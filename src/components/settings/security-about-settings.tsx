import Link from "next/link";
import styles from "./settings-sections.module.css";

export function SecuritySettings() {
  return (
    <section className={styles.section} aria-labelledby="settings-security-title">
      <header className={styles.header}>
        <h2 id="settings-security-title">Keamanan</h2>
        <p>Kredensial masuk Amanah Cash dikelola oleh Google.</p>
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
        <h2 id="settings-about-title">Tentang</h2>
        <p>Informasi versi dan perubahan Amanah Cash.</p>
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
