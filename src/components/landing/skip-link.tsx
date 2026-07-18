import styles from "./landing-foundation.module.css";

export function SkipLink() {
  return (
    <a className={styles.skipLink} href="#main-content">
      Lewati ke konten utama
    </a>
  );
}
