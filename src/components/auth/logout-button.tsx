"use client";

import { signOut } from "next-auth/react";

export const LOGOUT_REDIRECT = "/login";

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
      onClick={() => signOut({ callbackUrl: LOGOUT_REDIRECT })}
    >
      {children}
    </button>
  );
}
