"use client";

import { signIn } from "next-auth/react";

export function LoginButton() {
  return (
    <button type="button" className="authPrimaryButton" onClick={() => signIn("google", { callbackUrl: "/app" })}>
      Lanjutkan dengan Google
    </button>
  );
}
