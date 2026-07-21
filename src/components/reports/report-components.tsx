import Link from "next/link";
import { EmptyState, LoadingSkeleton, StatusBadge } from "@/components/ui";
import { StudentStatusBadge } from "@/components/students/presentation";
import { rupiah, transactionSign, transactionTypeLabel } from "@/components/transactions/presentation";
import type { AdminReportResult, NormalizedReportFilters, OperatorReportResult, ReportStudentOption } from "@/reports/types";
import { adminReportHref, reportDate, reportHref } from "./presentation";
import { ReportFilterForm } from "./report-filter-form";
import styles from "./reports.module.css";

export function ReportFilters({ filters, students, basePath, lockedStudentId }: {
  filters: NormalizedReportFilters;
  students: ReportStudentOption[];
  basePath: string;
  lockedStudentId?: string;
}) {
  const hasActiveFilters = filters.period !== "MONTH" || Boolean(filters.type || filters.status || filters.search || (!lockedStudentId && filters.studentId)) || filters.sort !== "occurredAt" || filters.direction !== "desc";
  return <ReportFilterForm ariaLabel="Filter laporan keuangan" basePath={basePath} hasActiveFilters={hasActiveFilters} initialPeriod={filters.period} initialDateFrom={filters.period === "CUSTOM" ? filters.dateFrom : undefined} initialDateTo={filters.period === "CUSTOM" ? filters.dateTo : undefined} description="Persempit riwayat berdasarkan Siswa, jenis transaksi, periode, status, atau kata kunci.">
    {lockedStudentId ? <input type="hidden" name="studentId" value={lockedStudentId} /> : <label className={styles.field}>Siswa<select name="studentId" defaultValue={filters.studentId ?? ""}><option value="">Semua Siswa</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label>}
    <label className={styles.field}>Jenis transaksi<select name="type" defaultValue={filters.type ?? ""}><option value="">Semua jenis</option><option value="DEPOSIT">Setoran</option><option value="WITHDRAWAL">Penarikan</option><option value="CORRECTION">Koreksi</option></select></label>
    <label className={styles.field}>Periode<select name="period" defaultValue={filters.period}><option value="TODAY">Hari ini</option><option value="WEEK">Minggu ini</option><option value="MONTH">Bulan ini</option><option value="CUSTOM">Rentang khusus</option><option value="ALL">Semua waktu</option></select></label>
    <label className={styles.field}>Status Siswa<select name="status" defaultValue={filters.status ?? ""}><option value="">Semua status</option><option value="ACTIVE">Aktif</option><option value="INACTIVE">Tidak aktif</option><option value="ARCHIVED">Diarsipkan</option></select></label>
    <label className={`${styles.field} ${styles.searchField}`}>Pencarian<input type="search" name="search" defaultValue={filters.search} placeholder="Cari nama Siswa, catatan, atau alasan" autoComplete="off" /></label>
    <label className={styles.field}>Urutkan berdasarkan<select name="sort" defaultValue={filters.sort}><option value="occurredAt">Waktu</option><option value="student">Nama Siswa</option><option value="amount">Jumlah</option></select></label>
    <label className={styles.field}>Arah urutan<select name="direction" defaultValue={filters.direction}><option value="desc">Menurun</option><option value="asc">Menaik</option></select></label>
  </ReportFilterForm>;
}

export function ReportSummary({ result }: { result: OperatorReportResult }) {
  const summary = result.summary;
  const netMovement = BigInt(summary.netMovement);
  return <section className={styles.summary} aria-labelledby="report-summary-title"><h2 id="report-summary-title">Ringkasan laporan</h2><div className={styles.summaryGrid}>
    <article><span>Total setoran</span><strong>{rupiah(summary.deposits)}</strong><small>{summary.deposits === "0" ? "Belum ada setoran pada periode ini" : "Akumulasi setoran pada periode ini"}</small></article>
    <article><span>Total penarikan</span><strong>{rupiah(summary.withdrawals)}</strong><small>{summary.withdrawals === "0" ? "Belum ada penarikan pada periode ini" : "Akumulasi penarikan pada periode ini"}</small></article>
    <article><span>Pergerakan bersih</span><strong>{netMovement === 0n ? rupiah("0") : <>{netMovement < 0n ? "−" : "+"} {rupiah(netMovement < 0n ? (-netMovement).toString() : summary.netMovement)}</>}</strong><small>{netMovement === 0n ? "Tidak ada perubahan bersih pada periode ini" : "Setoran dikurangi penarikan dan efek koreksi"}</small></article>
    <article><span>Jumlah transaksi</span><strong>{summary.transactionCount.toLocaleString("id-ID")}</strong><small>{summary.transactionCount === 0 ? "Belum ada transaksi pada periode ini" : "Transaksi aktif dalam hasil laporan"}</small></article>
    <article><span>Siswa aktif</span><strong>{summary.activeStudents.toLocaleString("id-ID")}</strong><small>{summary.activeStudents === 0 ? "Tidak ada Siswa aktif dalam cakupan" : "Siswa aktif dalam cakupan laporan"}</small></article>
    <article><span>Periode</span><strong className={styles.periodValue}>{summary.periodLabel}</strong><small>Zona waktu Asia/Jakarta</small></article>
  </div></section>;
}

function sortLink(basePath: string, filters: NormalizedReportFilters, sort: NormalizedReportFilters["sort"], label: string) {
  const active = filters.sort === sort;
  const direction = active && filters.direction === "desc" ? "asc" : "desc";
  return <Link aria-label={`Urutkan ${label} ${direction === "asc" ? "menaik" : "menurun"}`} href={reportHref(basePath, filters, { sort, direction, page: "1" })}>{label}{active ? filters.direction === "asc" ? " ↑" : " ↓" : ""}</Link>;
}

export function OperatorReportTable({ result, basePath, detailBasePath, lockedStudentId }: { result: OperatorReportResult; basePath: string; detailBasePath: string; lockedStudentId?: string }) {
  if (!result.items.length) {
    const searchEmpty = Boolean(result.filters.search);
    const filteredEmpty = result.filters.period !== "MONTH" || Boolean(result.filters.type || result.filters.status || (!lockedStudentId && result.filters.studentId));
    return <EmptyState kind="reports" title={searchEmpty ? "Pencarian tidak menemukan transaksi" : filteredEmpty ? "Tidak ada transaksi setelah difilter" : "Belum ada transaksi bulan ini"} description={searchEmpty ? `Tidak ada hasil untuk “${result.filters.search}”. Periksa kata kunci atau reset filter untuk melihat semua transaksi bulan ini.` : filteredEmpty ? "Tidak ada transaksi yang cocok dengan filter saat ini. Ubah pilihan atau reset filter untuk mencoba kembali." : "Belum ada transaksi aktif yang dicatat pada bulan ini untuk Siswa yang ditugaskan kepada Anda."} action={(searchEmpty || filteredEmpty) ? <Link className={styles.emptyAction} href={basePath}>Reset filter</Link> : null} />;
  }
  return <section className={styles.tableSection} aria-labelledby="report-table-title"><header><h2 id="report-table-title">Riwayat transaksi</h2><p>{result.total.toLocaleString("id-ID")} transaksi aktif cocok dengan filter saat ini.</p></header><div className={styles.tableWrap}><table className={styles.table}><caption className={styles.visuallyHidden}>Daftar transaksi laporan keuangan</caption><thead><tr><th scope="col" aria-sort={result.filters.sort === "occurredAt" ? result.filters.direction === "asc" ? "ascending" : "descending" : "none"}>{sortLink(basePath, result.filters, "occurredAt", "Waktu")}</th><th scope="col" aria-sort={result.filters.sort === "student" ? result.filters.direction === "asc" ? "ascending" : "descending" : "none"}>{sortLink(basePath, result.filters, "student", "Siswa")}</th><th scope="col">Jenis</th><th scope="col" aria-sort={result.filters.sort === "amount" ? result.filters.direction === "asc" ? "ascending" : "descending" : "none"}>{sortLink(basePath, result.filters, "amount", "Jumlah")}</th><th scope="col">Saldo setelah</th><th scope="col">Catatan</th><th scope="col">Revisi</th></tr></thead><tbody>{result.items.map((item) => <tr key={item.id} id={item.auditId ? `audit-${item.auditId}` : undefined}>
    <td data-label="Waktu"><time dateTime={item.occurredAt}>{reportDate(item.occurredAt)}</time></td>
    <td data-label="Siswa"><Link href={`${detailBasePath}/${encodeURIComponent(item.studentId)}`}>{item.studentName}</Link><small><StudentStatusBadge status={item.studentStatus} /></small></td>
    <td data-label="Jenis"><StatusBadge tone={item.type === "DEPOSIT" ? "success" : item.type === "CORRECTION" ? "warning" : "neutral"}>{transactionTypeLabel[item.type]}</StatusBadge>{item.correctionDirection ? <small>{item.correctionDirection === "INCREASE" ? "Tambah saldo" : "Kurangi saldo"}</small> : null}</td>
    <td data-label="Jumlah" className={styles.amount}>{transactionSign(item)} {rupiah(item.amount)}</td>
    <td data-label="Saldo setelah">{item.balanceAfter === null ? <span className={styles.unavailable}>Tidak tersimpan untuk revisi ini</span> : rupiah(item.balanceAfter)}</td>
    <td data-label="Catatan"><span>{item.notes ?? "Tidak ada catatan"}</span>{item.reason ? <small>Alasan: {item.reason}</small> : null}</td>
    <td data-label="Revisi"><span>Revisi {item.revision}</span><small>Diperbarui {reportDate(item.updatedAt)} oleh {item.operatorName}</small>{item.auditId ? <a href={`#audit-${item.auditId}`} aria-label={`Bukti audit revisi ${item.revision}`}>Audit {item.auditId.slice(0, 8)}</a> : null}</td>
  </tr>)}</tbody></table></div><ReportPagination basePath={basePath} result={result} /></section>;
}

export function ReportPagination({ basePath, result }: { basePath: string; result: OperatorReportResult }) {
  return <nav className={styles.pagination} aria-label="Paginasi laporan"><span>Halaman {result.page} dari {result.pages} · {result.total.toLocaleString("id-ID")} transaksi</span><div>{result.page > 1 ? <Link href={reportHref(basePath, result.filters, { page: String(result.page - 1) })}>Sebelumnya</Link> : <span className={styles.paginationDisabled} aria-disabled="true">Sebelumnya</span>}{result.page < result.pages ? <Link href={reportHref(basePath, result.filters, { page: String(result.page + 1) })}>Berikutnya</Link> : <span className={styles.paginationDisabled} aria-disabled="true">Berikutnya</span>}</div></nav>;
}

export function AdminReportFilters({ result, basePath }: { result: AdminReportResult; basePath: string }) {
  const hasActiveFilters = result.query.kind !== "OPERATOR_ACTIVITY" || result.query.period !== "MONTH" || Boolean(result.query.action || result.query.search);
  return <ReportFilterForm ariaLabel="Filter laporan administratif" basePath={basePath} hasActiveFilters={hasActiveFilters} initialPeriod={result.query.period} initialDateFrom={result.query.period === "CUSTOM" ? result.query.dateFrom : undefined} initialDateTo={result.query.period === "CUSTOM" ? result.query.dateTo : undefined} initialKind={result.query.kind} description="Pilih jenis laporan administratif, periode, aksi, atau cari nama dan ringkasan aktivitas."><label className={styles.field}>Jenis laporan<select name="kind" defaultValue={result.query.kind}><option value="OPERATOR_ACTIVITY">Aktivitas Operator</option><option value="STUDENT_ASSIGNMENT">Penugasan Siswa</option><option value="OWNERSHIP_CHANGE">Perubahan kepemilikan</option></select></label><label className={styles.field}>Periode<select name="period" defaultValue={result.query.period}><option value="TODAY">Hari ini</option><option value="WEEK">Minggu ini</option><option value="MONTH">Bulan ini</option><option value="CUSTOM">Rentang khusus</option><option value="ALL">Semua waktu</option></select></label><label className={styles.field}>Aksi Operator<select name="action" defaultValue={result.query.action ?? ""} disabled={result.query.kind !== "OPERATOR_ACTIVITY"}><option value="">Semua aksi</option><option value="CREATED">Dibuat</option><option value="UPDATED">Diubah</option><option value="ACTIVATED">Diaktifkan</option><option value="DEACTIVATED">Dinonaktifkan</option><option value="DELETED">Dihapus</option></select></label><label className={styles.field}>Pencarian<input type="search" name="search" defaultValue={result.query.search} placeholder="Cari nama atau ringkasan aktivitas" autoComplete="off" /></label></ReportFilterForm>;
}

export function AdminReportTable({ result, basePath }: { result: AdminReportResult; basePath: string }) {
  if (!result.items.length) {
    const searchEmpty = Boolean(result.query.search);
    const filteredEmpty = result.query.kind !== "OPERATOR_ACTIVITY" || result.query.period !== "MONTH" || Boolean(result.query.action);
    return <EmptyState kind="reports" title={searchEmpty ? "Pencarian tidak menemukan aktivitas" : filteredEmpty ? "Tidak ada aktivitas setelah difilter" : "Belum ada aktivitas bulan ini"} description={searchEmpty ? `Tidak ada hasil untuk “${result.query.search}”. Periksa kata kunci atau reset filter untuk melihat aktivitas bulan ini.` : filteredEmpty ? "Tidak ada aktivitas administratif yang cocok dengan filter saat ini. Ubah pilihan atau reset filter untuk mencoba kembali." : "Belum ada aktivitas administratif yang tercatat pada bulan ini."} action={(searchEmpty || filteredEmpty) ? <Link className={styles.emptyAction} href={basePath}>Reset filter</Link> : null} />;
  }
  const query = { kind: result.query.kind, period: result.query.period, dateFrom: result.query.dateFrom, dateTo: result.query.dateTo, search: result.query.search, action: result.query.action };
  return <section className={styles.tableSection} aria-labelledby="admin-report-title"><header><h2 id="admin-report-title">Aktivitas administratif</h2><p>{result.total.toLocaleString("id-ID")} aktivitas · {result.periodLabel}</p></header><div className={styles.tableWrap}><table className={styles.table}><caption className={styles.visuallyHidden}>Daftar aktivitas administratif</caption><thead><tr><th scope="col">Waktu</th><th scope="col">Kategori</th><th scope="col">Subjek</th><th scope="col">Rincian</th></tr></thead><tbody>{result.items.map((item) => <tr key={item.id}><td data-label="Waktu"><time dateTime={item.occurredAt}>{reportDate(item.occurredAt)}</time></td><td data-label="Kategori"><StatusBadge tone={item.kind === "OWNERSHIP_CHANGE" ? "warning" : item.kind === "STUDENT_ASSIGNMENT" ? "success" : "neutral"}>{item.kind === "OPERATOR_ACTIVITY" ? "Aktivitas Operator" : item.kind === "OWNERSHIP_CHANGE" ? "Kepemilikan" : "Penugasan Siswa"}</StatusBadge></td><td data-label="Subjek"><span>{item.href ? <Link href={item.href}>{item.subject}</Link> : item.subject}</span></td><td data-label="Rincian"><span>{item.description}</span></td></tr>)}</tbody></table></div><nav className={styles.pagination} aria-label="Paginasi laporan administratif"><span>Halaman {result.page} dari {result.pages} · {result.total.toLocaleString("id-ID")} aktivitas</span><div>{result.page > 1 ? <Link href={adminReportHref(basePath, query, result.page - 1)}>Sebelumnya</Link> : <span className={styles.paginationDisabled} aria-disabled="true">Sebelumnya</span>}{result.page < result.pages ? <Link href={adminReportHref(basePath, query, result.page + 1)}>Berikutnya</Link> : <span className={styles.paginationDisabled} aria-disabled="true">Berikutnya</span>}</div></nav></section>;
}

export function ReportSkeleton() {
  return <div className={styles.skeleton} aria-busy="true" aria-live="polite"><div><h1>Memuat laporan…</h1><p>Menyiapkan filter, ringkasan, dan riwayat terbaru.</p></div><div className={styles.filterSkeleton} aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <span key={index} />)}</div><LoadingSkeleton variant="cards" lines={6} aria-label="Memuat ringkasan laporan" /><LoadingSkeleton variant="table" lines={8} aria-label="Memuat tabel laporan" /></div>;
}
