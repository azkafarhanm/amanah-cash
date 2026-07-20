import type { ReactNode } from "react";
import { Card } from "./card";
import styles from "./ui.module.css";

export type EmptyStateKind = "students" | "transactions" | "reports" | "generic";

const COPY: Record<EmptyStateKind, { title: string; description: string }> = {
  students: { title: "Belum ada siswa", description: "Data siswa akan tampil di sini ketika tersedia." },
  transactions: { title: "Belum ada transaksi", description: "Riwayat transaksi akan tampil di sini ketika tersedia." },
  reports: { title: "Belum ada laporan", description: "Laporan yang tersedia akan tampil di sini." },
  generic: { title: "Belum ada data", description: "Konten akan tampil di sini ketika tersedia." }
};

export type EmptyStateProps = {
  kind?: EmptyStateKind;
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ kind = "generic", title, description, action }: EmptyStateProps) {
  const copy = COPY[kind];
  return (
    <Card className={styles.emptyState} role="status">
      <span className={styles.emptyStateIcon} aria-hidden="true">○</span>
      <h2>{title ?? copy.title}</h2>
      <p>{description ?? copy.description}</p>
      {action ? <div>{action}</div> : null}
    </Card>
  );
}
