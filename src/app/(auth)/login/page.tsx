import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { LoginButton } from "@/components/auth/login-button";

import styles from "../auth.module.css";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let session;
  let environment;
  try {
    environment = loadAuthenticationEnvironment();
    session = await auth();
  } catch {
    redirect("/access-denied?error=Configuration");
  }
  if (session) redirect("/app");

  const hasGoogleCredentials = Boolean(
    environment.googleClientId && environment.googleClientSecret
  );

  return (
    <main className={styles.page}>
      <div aria-hidden="true" className={styles.pageDecoration} />
      <section className={styles.card} aria-labelledby="login-title">
        <div className={styles.cardHeader}>
          <Link className={styles.brand} href="/">
            <ShieldCheck aria-hidden="true" className={styles.brandIcon} />
            Amanah Cash
          </Link>
          <h1 className={styles.title} id="login-title">
            Masuk
          </h1>
          <p className={styles.description}>
            {environment.developmentAuth
              ? "Mode pengembangan aktif."
              : "Masuk menggunakan akun Google yang telah didaftarkan oleh administrator."}
          </p>
        </div>
        <hr className={styles.divider} />
        {environment.developmentAuth && (
          <>
            <div className={styles.devSection}>
              <p className={styles.devLabel}>Akun pengembangan</p>
              <div className={styles.actions}>
                <LoginButton
                  provider="credentials"
                  email={environment.developmentAdminEmail!}
                />
                <LoginButton
                  provider="credentials"
                  email={environment.developmentOperatorEmail!}
                />
              </div>
            </div>
            {hasGoogleCredentials && <hr className={styles.divider} />}
          </>
        )}
        {(!environment.developmentAuth || hasGoogleCredentials) && (
          <div className={styles.actions}>
            <LoginButton />
          </div>
        )}
        {!environment.developmentAuth && (
          <div className={styles.helpText}>
            <p>Belum memiliki akses? Hubungi administrator.</p>
          </div>
        )}
        <Link className={styles.returnLink} href="/">
          <ArrowLeft aria-hidden="true" size={16} />
          Kembali ke beranda
        </Link>
      </section>
    </main>
  );
}
