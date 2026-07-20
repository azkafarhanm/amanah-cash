"use client";

import { signOut } from "next-auth/react";

export const LOGOUT_REDIRECT = "/login";

export function LogoutButton({ className = "authSecondaryButton" }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => signOut({ callbackUrl: LOGOUT_REDIRECT })}>
      Keluar
    </button>
  );
}
