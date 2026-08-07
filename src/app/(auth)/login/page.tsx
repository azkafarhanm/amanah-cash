import { redirect } from "next/navigation";

import Image from "next/image";
import { auth } from "@/auth";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { LoginButton } from "@/components/auth/login-button";
import { LoginExperience } from "@/components/auth/login-experience";

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
    <LoginExperience
      brandMark={
        <Image
          src="/brand/mark-dark.svg"
          alt=""
          width={48}
          height={48}
          priority
          aria-hidden="true"
        />
      }
      brandName="Amanah Cash"
      tagline="Amanah · Transparan · Akuntabel"
    >
      {/* Stagger group 1: Title + description */}
      <div className={styles.cardHeader}>
        <h1 className={styles.title} id="login-title">
          Masuk
        </h1>
        <p className={styles.description}>
          {environment.developmentAuth
            ? "Mode pengembangan aktif."
            : "Masuk menggunakan akun Google yang telah didaftarkan oleh administrator."}
        </p>
      </div>

      {/* Stagger group 2: Divider */}
      <hr className={styles.divider} />

      {/* Stagger group 3: Dev accounts (conditional) */}
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

      {/* Stagger group 4: Google login */}
      {(!environment.developmentAuth || hasGoogleCredentials) && (
        <div className={styles.actions}>
          <LoginButton />
        </div>
      )}

      {/* Stagger group 5: Help text */}
      {!environment.developmentAuth && (
        <div className={styles.helpText}>
          <p>Belum memiliki akses? Hubungi administrator.</p>
        </div>
      )}
    </LoginExperience>
  );
}
