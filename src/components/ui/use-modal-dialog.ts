"use client";

import { useEffect, useRef } from "react";

/**
 * Drives a native <dialog> from a boolean prop.
 *
 * showModal() throws InvalidStateError on an already-open dialog and close()
 * on an already-closed one, so every caller has to check element.open before
 * acting. Returns the ref to spread onto the <dialog>.
 */
export function useModalDialog(open: boolean) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return dialog;
}
