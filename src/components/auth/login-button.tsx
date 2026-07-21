"use client";

import { signIn } from "next-auth/react";

export function LoginButton({ provider = "google", email }: { provider?: "google" | "credentials"; email?: string }) {
  return (
    <button
      type="button"
      className="authPrimaryButton"
      onClick={() => signIn(provider, { callbackUrl: "/app", ...(email ? { email } : {}) })}
    >
      {provider === "google" ? "Lanjutkan dengan Google" : `Masuk sebagai ${email}`}
    </button>
  );
}
