import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Image from "next/image";
import { auth } from "@/auth";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import {
  describeOAuthLoginError,
  shouldRedirectAuthenticatedVisitor
} from "@/auth/oauth-security";
import { LogoutButton } from "@/components/auth/logout-button";
import { LoginButton } from "@/components/auth/login-button";
import { LoginExperience } from "@/components/auth/login-experience";

import styles from "../auth.module.css";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: oauthError } = await searchParams;
  let session;
  let environment;
  try {
    environment = loadAuthenticationEnvironment();
    session = await auth();
  } catch {
    redirect("/access-denied?error=Configuration");
  }

  // OAuth must run against the canonical NEXTAUTH_URL origin: the redirect URI
  // registered with Google is fixed to it, so starting the flow from any other
  // origin (e.g. a deployment-specific *.vercel.app URL) strands the state
  // cookie on the wrong origin and the callback fails. Send the visitor to the
  // canonical login page up front instead.
  const requestHost = (await headers()).get("host");
  if (requestHost && requestHost !== new URL(environment.nextAuthUrl).host) {
    redirect(`${environment.nextAuthUrl}/login`);
  }

  // A failed OAuth callback (?error=...) must stay visible. Forwarding a
  // still-valid session straight into the app here would mask the failure and
  // make a rejected sign-in look like a successful login as the session user.
  if (session && shouldRedirectAuthenticatedVisitor(oauthError)) redirect("/app");

  const hasGoogleCredentials = Boolean(
    environment.googleClientId && environment.googleClientSecret
  );
  const errorDescription = describeOAuthLoginError(oauthError);

  return (
    <LoginExperience
      brandMark={
        <svg
          viewBox="0 0 512 512"
          width={48}
          height={48}
          aria-hidden="true"
        >
          {/* Primary A-Frame (#0B2535 light / #F0F7F7 dark) */}
          <path
            fill="var(--color-brand-frame)"
            d="M 256 36 C 264 36 270 41 276 52 L 471 442 C 477 453 475 464 466 470 C 458 475 448 472 441 462 L 378 372 C 358 343 328 322 292 313 C 268 307 244 307 220 313 C 184 322 154 343 134 372 L 71 462 C 64 472 54 475 46 470 C 37 464 35 453 41 442 L 236 52 C 242 41 248 36 256 36 Z M 256 168 L 156 312 C 184 290 219 278 256 278 C 293 278 328 290 356 312 L 256 168 Z"
          />
          {/* Accent Diamond (#00A896 light / #00C4B4 dark) */}
          <path
            fill="var(--color-brand-diamond)"
            d="M 256 324 C 259 324 262 326 265 329 L 325 389 C 329 393 329 399 325 403 L 265 463 C 260 468 252 468 247 463 L 187 403 C 183 399 183 393 187 389 L 247 329 C 250 326 253 324 256 324 Z"
          />
        </svg>
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

      {errorDescription ? (
        <div className={styles.authError} role="alert">
          <p className={styles.authErrorMessage}>{errorDescription}</p>
          {session?.user?.email ? (
            <div className={styles.authErrorSession}>
              <p>
                Sesi aktif saat ini: <strong>{session.user.email}</strong>. Keluar
                dahulu bila Anda ingin masuk dengan akun Google lain.
              </p>
              <LogoutButton className={styles.authErrorLogout}>Keluar dari sesi ini</LogoutButton>
            </div>
          ) : null}
        </div>
      ) : null}

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
