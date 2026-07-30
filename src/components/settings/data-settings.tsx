"use client";

import { useRef, useState } from "react";
import { signOut } from "next-auth/react";
import styles from "./settings-sections.module.css";

type BackupMetadata = {
  applicationVersion: string;
  schemaVersion: string;
  createdAt: string;
};

export function DataSettings() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [artifact, setArtifact] = useState<File>();
  const [metadata, setMetadata] = useState<BackupMetadata>();
  const [status, setStatus] = useState<
    "idle" | "backing-up" | "validating" | "ready" | "restoring" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function downloadBackup() {
    setStatus("backing-up");
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings/backup", {
        cache: "no-store"
      });
      if (!response.ok) throw new Error("BACKUP_FAILED");
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "amanah-cash-backup.acbackup";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus("idle");
      setMessage("Backup siap. Unduhan dimulai.");
    } catch {
      setStatus("error");
      setMessage("Backup belum dapat dibuat. Coba lagi.");
    }
  }

  async function validateArtifact(file: File) {
    setArtifact(file);
    setMetadata(undefined);
    setStatus("validating");
    setMessage("");
    const body = new FormData();
    body.set("artifact", file);
    try {
      const response = await fetch("/api/admin/settings/restore", {
        method: "POST",
        body
      });
      const result = await response.json() as { metadata?: BackupMetadata };
      if (!response.ok || !result.metadata) throw new Error("INVALID_BACKUP");
      setMetadata(result.metadata);
      setStatus("ready");
    } catch {
      setStatus("error");
      setMessage("File bukan backup Amanah Cash yang valid atau kompatibel.");
    }
  }

  async function restore() {
    if (!artifact || status !== "ready") return;
    if (!window.confirm(
      "Pulihkan backup ini? Semua data aplikasi saat ini akan diganti dan seluruh pengguna harus masuk kembali."
    )) return;

    setStatus("restoring");
    setMessage("Memulihkan data… Jangan tutup halaman ini.");
    const body = new FormData();
    body.set("artifact", artifact);
    try {
      const response = await fetch("/api/admin/settings/restore", {
        method: "PUT",
        body
      });
      if (!response.ok) throw new Error("RESTORE_FAILED");
      await signOut({ callbackUrl: "/login" });
    } catch {
      setStatus("error");
      setMessage("Restore gagal. Data saat ini tidak diubah.");
    }
  }

  return (
    <section className={styles.section} aria-labelledby="settings-data-title">
      <header className={styles.header}>
        <h2 id="settings-data-title">Data</h2>
        <p>Cadangkan atau pulihkan seluruh data operasional Amanah Cash.</p>
      </header>

      <div className={styles.row}>
        <div>
          <h3>Backup</h3>
          <p>Unduh satu file sensitif. Simpan di lokasi yang aman.</p>
        </div>
        <button
          className={styles.secondaryButton}
          type="button"
          disabled={status === "backing-up" || status === "restoring"}
          onClick={() => void downloadBackup()}
        >
          {status === "backing-up" ? "Menyiapkan…" : "Unduh backup"}
        </button>
      </div>

      <div className={styles.row}>
        <div>
          <h3>Restore</h3>
          <p>Mengganti seluruh data saat ini dari backup yang tervalidasi.</p>
          {metadata ? (
            <dl className={styles.metadata}>
              <div><dt>Dibuat</dt><dd>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(metadata.createdAt))}</dd></div>
              <div><dt>Versi aplikasi</dt><dd>{metadata.applicationVersion}</dd></div>
              <div><dt>Versi skema</dt><dd>{metadata.schemaVersion}</dd></div>
            </dl>
          ) : null}
        </div>
        <div className={styles.restoreActions}>
          <input
            ref={fileInput}
            className={styles.fileInput}
            type="file"
            accept=".acbackup,application/vnd.amanah-cash.backup+json"
            disabled={status === "restoring"}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void validateArtifact(file);
            }}
          />
          {status === "ready" ? (
            <button className={styles.dangerButton} type="button" onClick={() => void restore()}>
              Pulihkan backup
            </button>
          ) : null}
        </div>
      </div>

      <p className={styles.status} role={status === "error" ? "alert" : "status"} aria-live="polite">
        {status === "validating" ? "Memvalidasi backup…" : message}
      </p>
    </section>
  );
}
