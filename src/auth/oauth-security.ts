export type SessionUserResult = { user: { id: string } } | null;

export type SessionUserLookup = (
  sessionToken: string
) => SessionUserResult | PromiseLike<SessionUserResult>;

/**
 * An authenticated visitor may only be forwarded straight into the app when
 * the login page is opened without an OAuth error. When NextAuth bounces the
 * user back to /login with ?error=... the failure must stay visible instead of
 * being masked by a still-valid session of a (possibly different) user.
 */
export function shouldRedirectAuthenticatedVisitor(oauthError: string | undefined): boolean {
  return !oauthError;
}

const OAUTH_LOGIN_ERROR_MESSAGES: Record<string, string> = {
  OAuthCallback:
    "Verifikasi login Google gagal. Ini umumnya terjadi karena alur login dimulai dari URL deployment alih-alih domain utama aplikasi. Buka kembali halaman login dari domain utama, lalu coba lagi.",
  OAuthSignin:
    "Permintaan login ke Google gagal dibuat. Muat ulang halaman login, lalu coba lagi.",
  OAuthAccountNotLinked:
    "Akun Google ini sudah tertaut ke pengguna lain. Hubungi administrator bila ini tidak sesuai.",
  AccessDenied:
    "Akun Google tidak diizinkan masuk. Pastikan akun sudah didaftarkan administrator, atau keluar dari sesi aktif saat ini bila Anda mencoba berganti akun.",
  Configuration:
    "Konfigurasi autentikasi bermasalah. Hubungi administrator.",
  Default:
    "Login gagal. Muat ulang halaman login, lalu coba lagi."
};

export function describeOAuthLoginError(oauthError: string | undefined): string | null {
  if (!oauthError) return null;
  return OAUTH_LOGIN_ERROR_MESSAGES[oauthError] ?? OAUTH_LOGIN_ERROR_MESSAGES.Default;
}

/**
 * NextAuth v4 upgrades an existing session when an OAuth callback arrives with
 * a still-valid session cookie: the fresh Google identity would be linked to
 * the *session* user (core/lib/callback-handler.js), not to the user resolved
 * from the Google email. A Google identity must never attach to an application
 * user merely because that user happens to hold an active session, so sign-in
 * is blocked whenever the session belongs to a different user than the one
 * admitted by email.
 */
export function isCrossUserSessionUpgrade(
  sessionUserId: string | null,
  admittedUserId: string
): boolean {
  return sessionUserId !== null && sessionUserId !== admittedUserId;
}

export async function resolveActiveSessionUserId(
  sessionToken: string | undefined,
  getSessionAndUser: SessionUserLookup
): Promise<string | null> {
  if (!sessionToken) return null;
  const result = await Promise.resolve(getSessionAndUser(sessionToken)).catch(() => null);
  return result?.user?.id ?? null;
}
