"use client";

import { signOut } from "next-auth/react";

export const LOGOUT_REDIRECT = "/login";
export const LOGOUT_CALLBACK_URL = `${LOGOUT_REDIRECT}?notice=logged-out`;
export const RESTORE_CALLBACK_URL = `${LOGOUT_REDIRECT}?notice=restore-complete`;

export function LogoutButton({
  className,
  children = "Keluar",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      className={className}
      type="button"
      onClick={() => signOut({ callbackUrl: LOGOUT_CALLBACK_URL })}
    >
      {children}
    </button>
  );
}
