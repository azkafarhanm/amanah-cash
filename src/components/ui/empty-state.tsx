import type { ReactNode } from "react";
import { Card } from "./card";
import styles from "./ui.module.css";

export type EmptyStateKind = "students" | "transactions" | "reports" | "generic";

const COPY: Record<EmptyStateKind, { title: string; description: string }> = {
  students: { title: "Belum ada siswa", description: "Belum ada siswa yang terdaftar atau ditugaskan pada daftar ini." },
  transactions: { title: "Belum ada transaksi keuangan", description: "Belum ada transaksi keuangan yang dicatat untuk siswa ini." },
  reports: { title: "Belum ada laporan", description: "Belum ada laporan yang dapat ditampilkan untuk periode ini." },
  generic: { title: "Belum ada data", description: "Belum ada data yang tercatat untuk bagian ini." }
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
