"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState, StatusBadge } from "@/components/ui";
import type { StudentStatus } from "@/students/domain";
import type { TransactionHistoryQuery, TransactionHistoryResult } from "@/transactions/read-service";
import { rupiah, transactionDate, transactionPageHref, transactionSign, transactionTypeLabel } from "./presentation";
import { TransactionDialog } from "./transaction-dialog";
import styles from "./transactions.module.css";

export function TransactionExperience({ studentId, studentStatus, result, query }: {
  studentId: string; studentStatus: StudentStatus; result: TransactionHistoryResult; query: TransactionHistoryQuery;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const readOnly = studentStatus !== "ACTIVE";
  const basePath = `/operator/students/${encodeURIComponent(studentId)}`;
  const success = (message: string) => { setNotice(message); router.refresh(); };
  return <section className={styles.experience} aria-labelledby="financial-overview-title">
    <div className={styles.sectionHeading}><div><h2 id="financial-overview-title">Ringkasan keuangan</h2><p>Saldo yang telah dikomit dan aktivitas finansial Siswa.</p></div></div>
    {notice ? <p className={styles.success} role="status" aria-live="polite">{notice}</p> : null}
    {readOnly ? <p className={styles.warning} role="status">Siswa tidak aktif atau telah diarsipkan. Riwayat tetap tersedia, tetapi perubahan finansial dinonaktifkan.</p> : null}
    <div className={styles.overviewGrid}>
      <article className={styles.balanceCard}><span>Saldo saat ini</span><strong>{rupiah(result.balance)}</strong><small>{result.transactionCount === 0 ? "Belum ada transaksi tercatat" : "Saldo tersimpan dari transaksi yang telah dikomit"}</small></article>
      <article className={styles.metric}><span>Terakhir diperbarui</span><strong>{transactionDate(result.lastUpdated)}</strong></article>
      <article className={styles.metric}><span>Aktivitas terbaru</span><strong>{result.recentActivity ? `${transactionTypeLabel[result.recentActivity.type]} · ${transactionDate(result.recentActivity.occurredAt)}` : "Belum ada transaksi tercatat"}</strong></article>
      <article className={styles.metric}><span>Jumlah transaksi</span><strong>{result.transactionCount.toLocaleString("id-ID")}</strong></article>
    </div>
    <div className={styles.primaryActions} aria-label="Aksi transaksi">
      <TransactionDialog kind="DEPOSIT" studentId={studentId} balance={result.balance} disabled={readOnly} onSuccess={success} />
      <TransactionDialog kind="WITHDRAWAL" studentId={studentId} balance={result.balance} disabled={readOnly} onSuccess={success} />
      <TransactionDialog kind="CORRECTION" studentId={studentId} balance={result.balance} disabled={readOnly} onSuccess={success} />
    </div>
    <div className={styles.historyHeading}><div><h2 id="transaction-history-title">Riwayat transaksi</h2><p>Urutan terbaru berdasarkan waktu kejadian.</p></div></div>
    <form className={styles.filters} method="get" aria-label="Filter riwayat transaksi">
      <label className={styles.field}>Cari catatan atau Operator<input className={styles.input} name="search" defaultValue={query.search} /></label>
      <label className={styles.field}>Jenis<select className={styles.select} name="type" defaultValue={query.type ?? ""}><option value="">Semua jenis</option><option value="DEPOSIT">Setoran</option><option value="WITHDRAWAL">Penarikan</option><option value="CORRECTION">Koreksi</option></select></label>
      <label className={styles.field}>Status<select className={styles.select} name="status" defaultValue={query.status ?? ""}><option value="">Semua status</option><option value="ACTIVE">Aktif</option><option value="DELETED">Dihapus sementara</option></select></label>
      <label className={styles.field}>Dari tanggal<input className={styles.input} name="dateFrom" type="date" defaultValue={query.dateFrom} /></label>
      <label className={styles.field}>Sampai tanggal<input className={styles.input} name="dateTo" type="date" defaultValue={query.dateTo} /></label>
      <div className={styles.filterActions}><button className={styles.filterButton} type="submit">Terapkan filter</button><Link className={styles.resetLink} href={basePath}>Reset</Link></div>
    </form>
    {result.items.length === 0 ? <EmptyState kind="transactions" title={result.transactionCount === 0 ? "Belum ada transaksi keuangan" : "Tidak ada hasil yang cocok"} description={result.transactionCount === 0 ? "Belum ada transaksi keuangan yang dicatat untuk Siswa ini. Catat setoran pertama untuk memulai riwayat." : "Tidak ada transaksi yang cocok dengan pencarian atau filter saat ini. Ubah atau reset filter untuk melihat riwayat lainnya."} action={result.transactionCount === 0 && !readOnly ? <TransactionDialog kind="DEPOSIT" studentId={studentId} balance={result.balance} onSuccess={success} /> : undefined} /> : <div className={styles.ledger} aria-labelledby="transaction-history-title">
      {result.items.map((item) => {
        return <article className={`${styles.transactionItem} ${item.type === "CORRECTION" ? styles.correctionItem : ""}`} key={item.id}>
          <header className={styles.transactionTop}><div className={styles.transactionIdentity}><StatusBadge tone={item.type === "DEPOSIT" ? "success" : item.type === "CORRECTION" ? "warning" : "neutral"}>{transactionTypeLabel[item.type]}</StatusBadge>{item.type === "CORRECTION" ? <span className={styles.direction}>{item.correctionDirection === "INCREASE" ? "Tambah saldo" : "Kurangi saldo"}</span> : null}</div><strong className={item.type === "DEPOSIT" ? styles.amountPositive : item.type === "WITHDRAWAL" ? styles.amountNegative : styles.amountCorrection}>{transactionSign(item)} {rupiah(item.amount)}</strong></header>
          <dl className={styles.transactionMeta}><div><dt>Tanggal</dt><dd>{transactionDate(item.occurredAt)}</dd></div><div><dt>Operator</dt><dd>{item.operator}</dd></div><div><dt>Catatan</dt><dd>{item.notes ?? "Tidak ada catatan"}</dd></div>{item.type === "CORRECTION" ? <div><dt>Alasan koreksi</dt><dd>{item.reason}</dd></div> : null}<div><dt>Status</dt><dd><StatusBadge tone={item.deletedAt ? "danger" : "success"}>{item.deletedAt ? "Dihapus sementara" : "Aktif"}</StatusBadge></dd></div></dl>
          <footer className={styles.rowActions}>{item.deletedAt ? <TransactionDialog kind="RESTORE" studentId={studentId} balance={result.balance} item={item} disabled={readOnly} onSuccess={success} /> : <><TransactionDialog kind="EDIT" studentId={studentId} balance={result.balance} item={item} disabled={readOnly} onSuccess={success} /><TransactionDialog kind="DELETE" studentId={studentId} balance={result.balance} item={item} disabled={readOnly} onSuccess={success} /></>}</footer>
        </article>;
      })}
    </div>}
    {result.items.length > 0 ? <nav className={styles.pagination} aria-label="Paginasi transaksi"><span>Menampilkan hingga {result.items.length} dari {result.total} hasil</span><div>{result.hasPrevious ? <Link href={transactionPageHref(basePath, query)}>Kembali ke terbaru</Link> : null}{result.nextCursor ? <Link href={transactionPageHref(basePath, query, result.nextCursor)}>Muat transaksi lama</Link> : null}</div></nav> : null}
  </section>;
}
