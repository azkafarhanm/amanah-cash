"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { ConfirmationDialog } from "@/components/ui";
import { LOGOUT_REDIRECT } from "./logout-constants";

export { LOGOUT_REDIRECT, RESTORE_CALLBACK_URL } from "./logout-constants";

export function LogoutButton({
  className,
  children = "Keluar",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirmLogout() {
    setPending(true);
    try {
      await signOut({ callbackUrl: LOGOUT_REDIRECT });
    } catch {
      setPending(false);
    }
  }

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={() => setConfirmOpen(true)}
      >
        {children}
      </button>
      <ConfirmationDialog
        open={confirmOpen}
        title="Keluar dari Amanah Cash?"
        description="Sesi Anda akan diakhiri dan Anda perlu masuk kembali untuk menggunakan aplikasi."
        confirmLabel="Keluar"
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void confirmLogout()}
      />
    </>
  );
}
