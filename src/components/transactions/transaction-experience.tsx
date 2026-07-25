"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { EmptyState } from "@/components/ui";
import type { StudentStatus } from "@/students/domain";
import type { TransactionHistoryQuery, TransactionHistoryResult } from "@/transactions/read-service";
import { StudentTimeline } from "./student-timeline";
import { rupiah, transactionDate, transactionPageHref, transactionTypeLabel } from "./presentation";
import { TransactionDialog } from "./transaction-dialog";
import styles from "./transactions.module.css";

export function TransactionExperience({ studentId, studentStatus, result, query }: {
  studentId: string; studentStatus: StudentStatus; result: TransactionHistoryResult; query: TransactionHistoryQuery;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState("");

  const [prevQuery, setPrevQuery] = useState(query);
  const [searchValue, setSearchValue] = useState(query.search ?? "");
  const [typeValue, setTypeValue] = useState(query.type ?? "");
  const [statusValue, setStatusValue] = useState(query.status ?? "");
  const [dateFromValue, setDateFromValue] = useState(query.dateFrom ?? "");
  const [dateToValue, setDateToValue] = useState(query.dateTo ?? "");
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  if (
    query.search !== prevQuery.search ||
    query.type !== prevQuery.type ||
    query.status !== prevQuery.status ||
    query.dateFrom !== prevQuery.dateFrom ||
    query.dateTo !== prevQuery.dateTo
  ) {
    setPrevQuery(query);
    setSearchValue(query.search ?? "");
    setTypeValue(query.type ?? "");
    setStatusValue(query.status ?? "");
    setDateFromValue(query.dateFrom ?? "");
    setDateToValue(query.dateTo ?? "");
  }

  const readOnly = studentStatus !== "ACTIVE";
  const basePath = `/operator/students/${encodeURIComponent(studentId)}`;
  const success = (message: string) => { setNotice(message); router.refresh(); };

  function applyFilters(overrides?: {
    search?: string;
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const s = overrides?.search !== undefined ? overrides.search : searchValue;
    const t = overrides?.type !== undefined ? overrides.type : typeValue;
    const st = overrides?.status !== undefined ? overrides.status : statusValue;
    const df = overrides?.dateFrom !== undefined ? overrides.dateFrom : dateFromValue;
    const dt = overrides?.dateTo !== undefined ? overrides.dateTo : dateToValue;

    const params = new URLSearchParams();
    if (s.trim()) params.set("search", s.trim());
    if (t) params.set("type", t);
    if (st) params.set("status", st);
    if (df) params.set("dateFrom", df);
    if (dt) params.set("dateTo", dt);

    const queryString = params.toString();
    const targetUrl = queryString ? `${basePath}?${queryString}` : basePath;
    router.replace(targetUrl, { scroll: false });
  }

  function handleSearchChange(text: string) {
    setSearchValue(text);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (text === "") {
      applyFilters({ search: "" });
    } else {
      searchTimerRef.current = setTimeout(() => {
        applyFilters({ search: text });
      }, 350);
    }
  }

  function handleReset() {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    setSearchValue("");
    setTypeValue("");
    setStatusValue("");
    setDateFromValue("");
    setDateToValue("");
    router.replace(basePath, { scroll: false });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    applyFilters();
  }

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
    <form className={styles.filters} method="get" aria-label="Filter riwayat transaksi" onSubmit={handleSubmit}>
      <label className={styles.field}>
        Pencarian
        <input
          className={styles.input}
          name="search"
          value={searchValue}
          placeholder="Cari nominal, catatan, atau operator..."
          onChange={(e) => handleSearchChange(e.target.value)}
          autoComplete="off"
        />
      </label>
      <label className={styles.field}>
        Jenis
        <select
          className={styles.select}
          name="type"
          value={typeValue}
          onChange={(e) => {
            const val = e.target.value;
            setTypeValue(val);
            applyFilters({ type: val });
          }}
        >
          <option value="">Semua jenis</option>
          <option value="DEPOSIT">Setoran</option>
          <option value="WITHDRAWAL">Penarikan</option>
          <option value="CORRECTION">Koreksi</option>
        </select>
      </label>
      <label className={styles.field}>
        Status
        <select
          className={styles.select}
          name="status"
          value={statusValue}
          onChange={(e) => {
            const val = e.target.value;
            setStatusValue(val);
            applyFilters({ status: val });
          }}
        >
          <option value="">Semua status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="DELETED">Dihapus sementara</option>
        </select>
      </label>
      <label className={styles.field}>
        Dari tanggal
        <input
          className={styles.input}
          name="dateFrom"
          type="date"
          value={dateFromValue}
          onChange={(e) => setDateFromValue(e.target.value)}
        />
      </label>
      <label className={styles.field}>
        Sampai tanggal
        <input
          className={styles.input}
          name="dateTo"
          type="date"
          value={dateToValue}
          onChange={(e) => setDateToValue(e.target.value)}
        />
      </label>
      <div className={styles.filterActions}>
        <button className={styles.filterButton} type="submit">Terapkan filter</button>
        <button className={styles.resetLink} type="button" onClick={handleReset}>Reset</button>
      </div>
    </form>
    {result.items.length === 0 ? <EmptyState kind="transactions" title={result.transactionCount === 0 ? "Belum ada transaksi keuangan" : "Tidak ada hasil yang cocok"} description={result.transactionCount === 0 ? "Belum ada transaksi keuangan yang dicatat untuk Siswa ini. Catat setoran pertama untuk memulai riwayat." : "Tidak ada transaksi yang cocok dengan pencarian atau filter saat ini. Ubah atau reset filter untuk melihat riwayat lainnya."} action={result.transactionCount === 0 && !readOnly ? <TransactionDialog kind="DEPOSIT" studentId={studentId} balance={result.balance} onSuccess={success} /> : undefined} /> : <StudentTimeline items={result.items} studentId={studentId} balance={result.balance} readOnly={readOnly} onSuccess={success} />}
    {result.items.length > 0 ? <nav className={styles.pagination} aria-label="Paginasi transaksi"><span>Menampilkan hingga {result.items.length} dari {result.total} hasil</span><div>{result.hasPrevious ? <Link href={transactionPageHref(basePath, query)}>Kembali ke terbaru</Link> : null}{result.nextCursor ? <Link href={transactionPageHref(basePath, query, result.nextCursor)}>Muat transaksi lama</Link> : null}</div></nav> : null}
  </section>;
}
