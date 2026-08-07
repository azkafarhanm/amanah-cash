"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { GoogleIcon } from "./google-icon";
import { authAudio } from "@/lib/auth-audio";
import { triggerHapticSuccess } from "@/lib/haptics";
import styles from "@/app/(auth)/auth.module.css";

export function LoginButton({
  provider = "google",
  email,
}: {
  provider?: "google" | "credentials";
  email?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    triggerHapticSuccess();
    authAudio.play("loginSuccess");
    void signIn(provider, {
      callbackUrl: "/app",
      ...(email ? { email } : {}),
    });
  };

  if (provider === "google") {
    return (
      <button
        aria-label="Lanjutkan dengan Google"
        className={styles.googleButton}
        disabled={loading}
        type="button"
        onClick={handleClick}
      >
        {loading ? (
          <>
            <span className={styles.loadingSpinner} />
            Menghubungkan ke Google...
          </>
        ) : (
          <>
            <GoogleIcon className={styles.googleButtonIcon} />
            Lanjutkan dengan Google
          </>
        )}
      </button>
    );
  }

  return (
    <button
      className={styles.devButton}
      disabled={loading}
      type="button"
      onClick={handleClick}
    >
      {loading ? "Memverifikasi..." : `Masuk sebagai ${email}`}
    </button>
  );
}
