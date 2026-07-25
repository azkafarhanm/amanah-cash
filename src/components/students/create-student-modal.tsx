"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import styles from "./students.module.css";
import dialogStyles from "@/components/transactions/transactions.module.css";

export function CreateStudentModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function openModal() {
    setError("");
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const kelas = String(formData.get("kelas") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();

    if (!name) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/operator/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, kelas, notes })
      });

      const data = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) {
        setError(data.error?.message ?? "Gagal menambahkan siswa.");
        return;
      }

      form.reset();
      closeModal();
      router.refresh();
    } catch {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button variant="primary" onClick={openModal} aria-haspopup="dialog">
        + Tambah Student
      </Button>

      <dialog ref={dialogRef} className={dialogStyles.dialog} aria-labelledby="create-student-dialog-title">
        <form className={dialogStyles.dialogForm} onSubmit={handleSubmit}>
          <header className={dialogStyles.dialogHeader}>
            <div>
              <h2 id="create-student-dialog-title">Tambah Student Baru</h2>
              <p>Siswa baru akan otomatis ditugaskan kepada akun Operator Anda.</p>
            </div>
            <button className={dialogStyles.closeButton} type="button" onClick={closeModal} aria-label="Tutup modal">
              ×
            </button>
          </header>

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <label className={styles.field}>
            Nama lengkap
            <input className={styles.input} name="name" required maxLength={100} placeholder="Contoh: Ahmad Zaky" autoFocus />
          </label>

          <label className={styles.field}>
            Kelas
            <input className={styles.input} name="kelas" maxLength={100} placeholder="Contoh: 10A" />
          </label>

          <label className={styles.field}>
            Catatan (opsional)
            <textarea className={styles.textarea} name="notes" maxLength={500} placeholder="Catatan tambahan mengenai siswa..." />
          </label>

          <footer className={dialogStyles.dialogActions}>
            <Button type="button" variant="secondary" disabled={pending} onClick={closeModal}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={pending} loadingLabel="Menyimpan...">
              {pending ? "Menyimpan…" : "Buat Student"}
            </Button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
