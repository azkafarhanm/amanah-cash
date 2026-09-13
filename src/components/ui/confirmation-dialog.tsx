"use client";

import { useId } from "react";
import { Button } from "./button";
import { useModalDialog } from "./use-modal-dialog";
import styles from "./confirmation-dialog.module.css";

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  pending = false,
  onConfirm,
  onCancel
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
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
          <Button type="button" className={styles.confirm} isLoading={pending} loadingLabel="Memproses…" onClick={onConfirm}>
            {pending ? "Memproses…" : confirmLabel}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
