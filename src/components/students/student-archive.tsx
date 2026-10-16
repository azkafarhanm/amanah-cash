"use client";

import { useId, useState, useTransition } from "react";
import { Button, ConfirmationDialog } from "@/components/ui";
import { rupiah } from "@/components/transactions/presentation";
import styles from "./students.module.css";

/*
  Bottom-of-page, not in the header: archiving happens about once a year per
  Student, so it sits well away from the controls used every day.

  The confirm button is the ordinary primary one, not danger. Red is reserved
  for actions that cannot be undone, and an archive can be restored in one
  click from the banner this lands on.
*/
export function StudentArchiveSection({
  studentName,
  balance,
  archiveAction
}: {
  studentName: string;
  balance: string;
  archiveAction: () => Promise<void>;
}) {
  const headingId = useId();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const held = balance !== "0";

  return (
    <section className={`${styles.panel} ${styles.archiveSection}`} aria-labelledby={headingId}>
      <div className={styles.archiveCopy}>
        <h2 id={headingId}>Siswa sudah keluar?</h2>
        <p>
          Arsipkan agar tidak muncul lagi di daftar Siswa, pencatatan transaksi, dan dashboard.
          Riwayat transaksinya tetap tersimpan.
        </p>
        {held ? (
          <p className={styles.archiveBlocked}>
            Saldo masih {rupiah(balance)}. Catat penarikan sampai saldo nol sebelum mengarsipkan.
          </p>
        ) : null}
      </div>
      <Button type="button" variant="secondary" disabled={held} onClick={() => setConfirmOpen(true)}>
        Arsipkan siswa
      </Button>
      <ConfirmationDialog
        open={confirmOpen}
        title={`Arsipkan ${studentName}?`}
        description={'Siswa ini tidak akan muncul lagi di daftar siswa, pencatatan transaksi, dan dashboard. Riwayat transaksinya tetap tersimpan dan tetap masuk laporan periode lalu. Anda bisa memulihkannya kapan saja lewat filter "Diarsipkan" di halaman Siswa.'}
        confirmLabel="Arsipkan"
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => startTransition(() => archiveAction())}
      />
    </section>
  );
}

/* Restoring loses nothing, so it is one click with no confirmation. */
export function ArchivedStudentBanner({
  archivedAt,
  restoreAction
}: {
  archivedAt: string | null;
  restoreAction: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const date = archivedAt
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(archivedAt))
    : null;

  return (
    <section className={styles.archivedBanner} role="status">
      <div className={styles.archiveCopy}>
        <strong>{date ? `Siswa ini diarsipkan pada ${date}.` : "Siswa ini diarsipkan."}</strong>
        <p>Tidak muncul di daftar Siswa dan pencatatan transaksi. Riwayatnya tetap tersimpan.</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        isLoading={pending}
        loadingLabel="Memulihkan…"
        onClick={() => startTransition(() => restoreAction())}
      >
        {pending ? "Memulihkan…" : "Pulihkan"}
      </Button>
    </section>
  );
}
