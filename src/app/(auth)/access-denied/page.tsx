import Link from "next/link";
import { AlertTriangle, ShieldX } from "lucide-react";

import styles from "../auth.module.css";

const temporaryErrors = new Set([
  "Configuration",
  "OAuthCallback",
  "OAuthSignin",
  "OAuthCreateAccount",
]);

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Terjadi kesalahan sistem",
    description:
      "Layanan autentikasi sedang tidak tersedia. Silakan coba lagi dalam beberapa saat.",
  },
  OAuthCallback: {
    title: "Proses masuk terganggu",
    description:
      "Proses verifikasi Google tidak dapat diselesaikan. Silakan coba lagi.",
  },
  OAuthSignin: {
    title: "Tidak dapat terhubung ke Google",
    description:
      "Layanan Google sedang tidak tersedia. Silakan coba lagi dalam beberapa saat.",
  },
  OAuthCreateAccount: {
    title: "Terjadi kesalahan",
    description:
      "Tidak dapat memproses akun Anda. Silakan hubungi administrator.",
  },
};

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const temporary = Boolean(error && temporaryErrors.has(error));
  const errorInfo = error ? errorMessages[error] : null;

  const title = errorInfo?.title
    ? errorInfo.title
    : temporary
      ? "Terjadi kesalahan"
      : "Akun belum terdaftar";

  const description = errorInfo?.description
    ? errorInfo.description
    : temporary
      ? "Layanan Google sedang tidak tersedia atau proses masuk tidak valid. Silakan coba lagi."
      : "Akun Google Anda belum terdaftar di Amanah Cash. Silakan hubungi administrator untuk mendapatkan akses.";

  return (
    <main className={styles.page}>
      <div aria-hidden="true" className={styles.pageDecoration} />
      <section className={styles.card} aria-labelledby="denied-title">
        <div className={styles.cardHeader}>
          {temporary ? (
            <AlertTriangle
              aria-hidden="true"
              className={styles.errorIcon}
            />
          ) : (
            <ShieldX aria-hidden="true" className={styles.successIcon} />
          )}
          <h1 className={styles.title} id="denied-title">
            {title}
          </h1>
          <p className={styles.description}>{description}</p>
        </div>
        <hr className={styles.divider} />
        <div className={styles.actions}>
          <Link className={styles.primaryLink} href="/login">
            Kembali ke halaman masuk
          </Link>
          {!temporary && (
            <Link className={styles.secondaryLink} href="/">
              Kembali ke beranda
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
