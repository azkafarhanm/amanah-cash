"use client";

import { signOut } from "next-auth/react";

export const LOGOUT_REDIRECT = "/login";

export function LogoutButton() {
  return (
    <button type="button" className="authSecondaryButton" onClick={() => signOut({ callbackUrl: LOGOUT_REDIRECT })}>
      Keluar
    </button>
  );
}
