"use client";

import { useId } from "react";
import { Button } from "./button";
import { useModalDialog } from "./use-modal-dialog";
import styles from "./confirmation-dialog.module.css";

/*
  `tone` decides whether the confirm button is red, and the rule is narrower
  than it looks: red means the action cannot be undone.

  Every caller used to get red, logout included. Logging out destroys nothing —
  you sign back in — so spending the warning colour on it teaches people to
  ignore red, and then it is worth nothing on the day they are about to delete
  an operator. Reach for "danger" only when the data does not come back.
*/
export type ConfirmationTone = "default" | "danger";

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "default",
  pending = false,
  onConfirm,
  onCancel
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: ConfirmationTone;
  pending?: boolean;
  onConfirm(): void;
  onCancel(): void;
}) {
  const dialog = useModalDialog(open);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialog.current && !pending) onCancel();
      }}
    >
      <div className={styles.surface}>
        <header className={styles.header}>
          <h2 id={titleId}>{title}</h2>
          <button
            className={styles.close}
            type="button"
            disabled={pending}
            onClick={onCancel}
            aria-label={`Tutup ${title.toLocaleLowerCase("id-ID")}`}
          >
            ×
          </button>
        </header>
        <p className={styles.description} id={descriptionId}>{description}</p>
        <footer className={styles.actions}>
          <Button type="button" variant="secondary" disabled={pending} onClick={onCancel}>
            Batal
          </Button>
          <Button type="button" variant={tone === "danger" ? "danger" : "primary"} isLoading={pending} loadingLabel="Memproses…" onClick={onConfirm}>
            {pending ? "Memproses…" : confirmLabel}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
