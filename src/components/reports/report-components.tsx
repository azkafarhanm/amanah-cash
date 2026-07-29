import Link from "next/link";
import { EmptyState, LoadingSkeleton, Pagination, StatusBadge } from "@/components/ui";
import { StudentStatusBadge } from "@/components/students/presentation";
import { rupiah, transactionSign, transactionTypeLabel } from "@/components/transactions/presentation";
import { exportRegistry } from "@/exports/registry";
import { adminReportKindLabel, correctionDirectionLabel, signedRupiah } from "@/presentation/formatting";
import type { AdminReportResult, NormalizedReportFilters, OperatorReportResult, ReportStudentOption } from "@/reports/types";
import { adminReportExportHref, adminReportHref, operatorReportExportHref, reportDate, reportHref } from "./presentation";
import { ReportFilterForm } from "./report-filter-form";
import { ReportExportActions } from "./report-export-actions";
import styles from "./reports.module.css";

function ReportEmptyIcon({ kind }: { kind: "students" | "search" | "filter" | "records" }) {
  if (kind === "students") return <svg viewBox="0 0 24 24" focusable="false"><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-4 2.3-6 5.5-6s5 2 5.5 6M16 8h5M18.5 5.5v5" /></svg>;
  if (kind === "search") return <svg viewBox="0 0 24 24" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5M7.5 10.5h6" /></svg>;
  if (kind === "filter") return <svg viewBox="0 0 24 24" focusable="false"><path d="M3 5h18l-7 8v5l-4 2v-7Z" /></svg>;
  return <svg viewBox="0 0 24 24" focusable="false"><path d="M6 3h12a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Z" /><path d="M8 8h8M8 12h6" /></svg>;
}

export function ReportFilters({ filters, students, basePath, lockedStudentId }: {
  filters: NormalizedReportFilters;
  students: ReportStudentOption[];
  basePath: string;
  lockedStudentId?: string;
}) {
  const hasActiveFilters = filters.period !== "MONTH" || Boolean(filters.type || filters.status || filters.search || (!lockedStudentId && filters.studentId)) || filters.sort !== "occurredAt" || filters.direction !== "desc";
  return <ReportFilterForm ariaLabel="Filter laporan keuangan" basePath={basePath} hasActiveFilters={hasActiveFilters} initialPeriod={filters.period} initialDateFrom={filters.period === "CUSTOM" ? filters.dateFrom : undefined} initialDateTo={filters.period === "CUSTOM" ? filters.dateTo : undefined} description="Persempit riwayat berdasarkan Siswa, jenis transaksi, periode, status, atau kata kunci.">
    {lockedStudentId ? <input type="hidden" name="studentId" value={lockedStudentId} /> : <label className={styles.field}>Siswa<select name="studentId" defaultValue={filters.studentId ?? ""} disabled={students.length === 0}><option value="">{students.length === 0 ? "Belum ada Siswa ditugaskan" : "Semua Siswa"}</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label>}
    <label className={styles.field}>Jenis transaksi<select name="type" defaultValue={filters.type ?? ""}><option value="">Semua jenis</option><option value="DEPOSIT">Setoran</option><option value="WITHDRAWAL">Penarikan</option><option value="CORRECTION">Koreksi</option></select></label>
    <label className={styles.field}>Periode<select name="period" defaultValue={filters.period}><option value="TODAY">Hari ini</option><option value="WEEK">Minggu ini</option><option value="MONTH">Bulan ini</option><option value="CUSTOM">Rentang khusus</option><option value="ALL">Semua waktu</option></select></label>
    <label className={styles.field}>Status Siswa<select name="status" defaultValue={filters.status ?? ""}><option value="">Semua status</option><option value="ACTIVE">Aktif</option><option value="INACTIVE">Tidak aktif</option><option value="ARCHIVED">Diarsipkan</option></select></label>
    <label className={styles.field}>Pencarian<input type="search" name="search" defaultValue={filters.search} placeholder="Cari nama Siswa, catatan, alasan, atau operator" autoComplete="off" /></label>
  </ReportFilterForm>;
}

function FilterContext({ count, filters, students, periodLabel }: { count: number; filters: NormalizedReportFilters; students: ReportStudentOption[]; periodLabel: string }) {
  const active = [
    periodLabel,
    filters.studentId ? students.find((student) => student.id === filters.studentId)?.name : undefined,
    filters.type ? transactionTypeLabel[filters.type] : undefined,
    filters.status ? filters.status === "ACTIVE" ? "Siswa aktif" : filters.status === "INACTIVE" ? "Siswa tidak aktif" : "Siswa diarsipkan" : undefined,
    filters.search ? `Pencarian: ${filters.search}` : undefined
  ].filter((item): item is string => Boolean(item));
  return <section className={styles.filterContext} aria-labelledby="operator-filter-context-title">
    <div><h2 id="operator-filter-context-title">Konteks laporan</h2><p role="status" aria-live="polite">{count.toLocaleString("id-ID")} transaksi ditemukan</p></div>
    <div><span>Filter aktif:</span><ul>{active.map((item) => <li key={item}>{item}</li>)}</ul></div>
  </section>;
}

export function ReportSummary({ result }: { result: OperatorReportResult }) {
  const summary = result.summary;
  return <section className={styles.summary} aria-labelledby="report-summary-title"><h2 id="report-summary-title">Ringkasan laporan</h2><div className={styles.summaryGrid}>
    <article><span>Pergerakan bersih</span><strong>{signedRupiah(summary.netMovement)}</strong><small>{summary.netMovement === "0" ? "Tidak ada perubahan bersih pada periode ini" : "Setoran dikurangi penarikan dan efek koreksi"}</small></article>
    <article><span>Total setoran</span><strong>{rupiah(summary.deposits)}</strong><small>{summary.deposits === "0" ? "Belum ada setoran pada periode ini" : "Akumulasi setoran pada periode ini"}</small></article>
    <article><span>Total penarikan</span><strong>{rupiah(summary.withdrawals)}</strong><small>{summary.withdrawals === "0" ? "Belum ada penarikan pada periode ini" : "Akumulasi penarikan pada periode ini"}</small></article>
    <article><span>Jumlah transaksi</span><strong>{summary.transactionCount.toLocaleString("id-ID")}</strong><small>{summary.transactionCount === 0 ? "Belum ada transaksi pada periode ini" : "Transaksi aktif dalam hasil laporan"}</small></article>
    <article><span>Siswa aktif</span><strong>{summary.activeStudents.toLocaleString("id-ID")}</strong><small>{summary.activeStudents === 0 ? "Tidak ada Siswa aktif dalam cakupan" : "Siswa aktif dalam cakupan laporan"}</small></article>
    <article><span>Periode</span><strong className={styles.periodValue}>{summary.periodLabel}</strong><small>Zona waktu Asia/Jakarta</small></article>
  </div></section>;
}

function sortLink(basePath: string, filters: NormalizedReportFilters, sort: NormalizedReportFilters["sort"], label: string) {
  const active = filters.sort === sort;
  const direction = active && filters.direction === "desc" ? "asc" : "desc";
  return <Link aria-label={`Urutkan ${label} ${direction === "asc" ? "menaik" : "menurun"}`} href={reportHref(basePath, filters, { sort, direction, page: "1" })} scroll={false}>{label}{active ? filters.direction === "asc" ? " ↑" : " ↓" : ""}</Link>;
}

export function OperatorReportTable({ result, basePath, detailBasePath, lockedStudentId }: { result: OperatorReportResult; basePath: string; detailBasePath: string; lockedStudentId?: string }) {
  if (!result.items.length) {
    const noAssignedStudents = !lockedStudentId && result.students.length === 0;
    const searchEmpty = Boolean(result.filters.search);
    const filteredEmpty = result.filters.period !== "MONTH" || Boolean(result.filters.type || result.filters.status || (!lockedStudentId && result.filters.studentId));
    const clearSearchHref = reportHref(basePath, result.filters, { search: undefined, page: "1" });
    return <EmptyState
      kind="reports"
      icon={<ReportEmptyIcon kind={noAssignedStudents ? "students" : searchEmpty ? "search" : filteredEmpty ? "filter" : "records"} />}
      title={noAssignedStudents ? "Belum ada Siswa yang ditugaskan" : searchEmpty ? "Pencarian tidak menemukan transaksi" : filteredEmpty ? "Tidak ada transaksi setelah difilter" : "Belum ada transaksi bulan ini"}
      description={noAssignedStudents ? "Laporan keuangan akan tersedia setelah Platform Admin menugaskan Siswa kepada Anda." : searchEmpty ? `Tidak ada hasil untuk “${result.filters.search}”. Hapus pencarian untuk kembali ke hasil filter lainnya.` : filteredEmpty ? "Tidak ada transaksi yang cocok dengan filter saat ini. Ubah pilihan atau reset filter untuk mencoba kembali." : "Belum ada transaksi aktif yang dicatat pada bulan ini untuk Siswa yang ditugaskan kepada Anda."}
      action={noAssignedStudents ? <Link className={styles.emptyAction} href="/operator/students">Lihat daftar Siswa</Link> : searchEmpty ? <Link className={styles.emptyAction} href={clearSearchHref}>Hapus pencarian</Link> : filteredEmpty ? <Link className={styles.emptyAction} href={basePath}>Reset filter</Link> : <Link className={styles.emptyAction} href="/operator/students">Buka daftar Siswa</Link>}
    />;
  }
  return <section className={styles.tableSection} aria-labelledby="report-table-title"><header><h2 id="report-table-title">Riwayat transaksi</h2><p>Urutkan hasil melalui judul kolom Waktu, Siswa, atau Jumlah.</p></header><div className={styles.tableWrap}><table className={styles.table}><caption className={styles.visuallyHidden}>Daftar transaksi laporan keuangan</caption><thead><tr><th scope="col" aria-sort={result.filters.sort === "occurredAt" ? result.filters.direction === "asc" ? "ascending" : "descending" : "none"}>{sortLink(basePath, result.filters, "occurredAt", "Waktu")}</th><th scope="col" aria-sort={result.filters.sort === "student" ? result.filters.direction === "asc" ? "ascending" : "descending" : "none"}>{sortLink(basePath, result.filters, "student", "Siswa")}</th><th scope="col">Jenis</th><th scope="col" aria-sort={result.filters.sort === "amount" ? result.filters.direction === "asc" ? "ascending" : "descending" : "none"}>{sortLink(basePath, result.filters, "amount", "Jumlah")}</th><th scope="col">Saldo setelah</th><th scope="col">Detail</th></tr></thead><tbody>{result.items.map((item) => <tr key={item.id} id={item.auditId ? `audit-${item.auditId}` : undefined}>
    <td data-label="Waktu"><time dateTime={item.occurredAt}>{reportDate(item.occurredAt)}</time></td>
    <td data-label="Siswa"><Link href={`${detailBasePath}/${encodeURIComponent(item.studentId)}`}>{item.studentName}</Link><small><StudentStatusBadge status={item.studentStatus} /></small></td>
    <td data-label="Jenis"><StatusBadge tone={item.type === "DEPOSIT" ? "success" : item.type === "CORRECTION" ? "warning" : "neutral"}>{transactionTypeLabel[item.type]}</StatusBadge>{item.correctionDirection ? <small>{correctionDirectionLabel(item.correctionDirection)}</small> : null}</td>
    <td data-label="Jumlah" className={styles.amount}>{transactionSign(item)} {rupiah(item.amount)}</td>
    <td data-label="Saldo setelah">{item.balanceAfter === null ? <span className={styles.unavailable}>Tidak tersimpan untuk revisi ini</span> : rupiah(item.balanceAfter)}</td>
    <td data-label="Detail"><details className={styles.rowDetails}><summary>Detail transaksi</summary><dl><div><dt>Catatan</dt><dd>{item.notes ?? "Tidak ada catatan"}</dd></div>{item.reason ? <div><dt>Alasan</dt><dd>{item.reason}</dd></div> : null}<div><dt>Revisi</dt><dd>Revisi {item.revision}</dd></div><div><dt>Pembaruan</dt><dd>{reportDate(item.updatedAt)} oleh {item.operatorName}</dd></div>{item.auditId ? <div><dt>Audit</dt><dd><a href={`#audit-${item.auditId}`} aria-label={`Bukti audit revisi ${item.revision}`}>Audit {item.auditId.slice(0, 8)}</a></dd></div> : null}</dl></details></td>
  </tr>)}</tbody></table></div><ReportPagination basePath={basePath} result={result} /></section>;
}

export function ReportPagination({ basePath, result }: { basePath: string; result: OperatorReportResult }) {
  return <Pagination ariaLabel="Paginasi laporan" page={result.page} pages={result.pages} totalLabel={`${result.total.toLocaleString("id-ID")} transaksi`} previousHref={result.page > 1 ? reportHref(basePath, result.filters, { page: String(result.page - 1) }) : undefined} nextHref={result.page < result.pages ? reportHref(basePath, result.filters, { page: String(result.page + 1) }) : undefined} scroll={false} />;
}

export function AdminReportFilters({ result, basePath }: { result: AdminReportResult; basePath: string }) {
  const hasActiveFilters = result.query.kind !== "OPERATOR_ACTIVITY" || result.query.period !== "MONTH" || Boolean(result.query.action || result.query.search);
  return <ReportFilterForm ariaLabel="Filter laporan administratif" basePath={basePath} hasActiveFilters={hasActiveFilters} initialPeriod={result.query.period} initialDateFrom={result.query.period === "CUSTOM" ? result.query.dateFrom : undefined} initialDateTo={result.query.period === "CUSTOM" ? result.query.dateTo : undefined} initialKind={result.query.kind} description="Pilih jenis laporan administratif, periode, aksi, atau cari nama dan ringkasan aktivitas."><label className={styles.field}>Jenis laporan<select name="kind" defaultValue={result.query.kind}><option value="OPERATOR_ACTIVITY">Aktivitas Operator</option><option value="STUDENT_ASSIGNMENT">Penugasan Siswa</option><option value="OWNERSHIP_CHANGE">Perubahan kepemilikan</option></select></label><label className={styles.field}>Periode<select name="period" defaultValue={result.query.period}><option value="TODAY">Hari ini</option><option value="WEEK">Minggu ini</option><option value="MONTH">Bulan ini</option><option value="CUSTOM">Rentang khusus</option><option value="ALL">Semua waktu</option></select></label><label className={styles.field}>Aksi Operator<select name="action" defaultValue={result.query.action ?? ""} disabled={result.query.kind !== "OPERATOR_ACTIVITY"}><option value="">Semua aksi</option><option value="CREATED">Dibuat</option><option value="UPDATED">Diubah</option><option value="ACTIVATED">Diaktifkan</option><option value="DEACTIVATED">Dinonaktifkan</option><option value="DELETED">Dihapus</option></select></label><label className={styles.field}>Pencarian<input type="search" name="search" defaultValue={result.query.search} placeholder="Cari nama atau ringkasan aktivitas" autoComplete="off" /></label></ReportFilterForm>;
}

export function AdminReportTable({ result, basePath }: { result: AdminReportResult; basePath: string }) {
  const query = { kind: result.query.kind, period: result.query.period, dateFrom: result.query.dateFrom, dateTo: result.query.dateTo, search: result.query.search, action: result.query.action };
  if (!result.items.length) {
    const searchEmpty = Boolean(result.query.search);
    const filteredEmpty = result.query.kind !== "OPERATOR_ACTIVITY" || result.query.period !== "MONTH" || Boolean(result.query.action);
    const clearSearchHref = adminReportHref(basePath, { ...query, search: undefined }, 1);
    return <EmptyState kind="reports" icon={<ReportEmptyIcon kind={searchEmpty ? "search" : filteredEmpty ? "filter" : "records"} />} title={searchEmpty ? "Pencarian tidak menemukan aktivitas" : filteredEmpty ? "Tidak ada aktivitas setelah difilter" : "Belum ada aktivitas bulan ini"} description={searchEmpty ? `Tidak ada hasil untuk “${result.query.search}”. Hapus pencarian untuk kembali ke hasil filter lainnya.` : filteredEmpty ? "Tidak ada aktivitas administratif yang cocok dengan filter saat ini. Ubah pilihan atau reset filter untuk mencoba kembali." : "Belum ada aktivitas administratif yang tercatat pada bulan ini."} action={searchEmpty ? <Link className={styles.emptyAction} href={clearSearchHref}>Hapus pencarian</Link> : filteredEmpty ? <Link className={styles.emptyAction} href={basePath}>Reset filter</Link> : <Link className={styles.emptyAction} href="/admin/operators">Lihat Operator</Link>} />;
  }
  return <section className={styles.tableSection} aria-labelledby="admin-report-title"><header><h2 id="admin-report-title">Aktivitas administratif</h2><p role="status" aria-live="polite">{result.total.toLocaleString("id-ID")} aktivitas · {result.periodLabel}</p></header><div className={styles.tableWrap}><table className={styles.table}><caption className={styles.visuallyHidden}>Daftar aktivitas administratif</caption><thead><tr><th scope="col">Waktu</th><th scope="col">Kategori</th><th scope="col">Subjek</th><th scope="col">Rincian</th></tr></thead><tbody>{result.items.map((item) => <tr key={item.id}><td data-label="Waktu"><time dateTime={item.occurredAt}>{reportDate(item.occurredAt)}</time></td><td data-label="Kategori"><StatusBadge tone={item.kind === "OWNERSHIP_CHANGE" ? "warning" : item.kind === "STUDENT_ASSIGNMENT" ? "success" : "neutral"}>{adminReportKindLabel(item.kind)}</StatusBadge></td><td data-label="Subjek"><span>{item.href ? <Link href={item.href}>{item.subject}</Link> : item.subject}</span></td><td data-label="Rincian"><span>{item.description}</span></td></tr>)}</tbody></table></div><Pagination ariaLabel="Paginasi laporan administratif" page={result.page} pages={result.pages} totalLabel={`${result.total.toLocaleString("id-ID")} aktivitas`} previousHref={result.page > 1 ? adminReportHref(basePath, query, result.page - 1) : undefined} nextHref={result.page < result.pages ? adminReportHref(basePath, query, result.page + 1) : undefined} /></section>;
}

export function AdminReportFilterContext({ result }: { result: AdminReportResult }) {
  const active = [
    result.periodLabel,
    result.query.kind === "OPERATOR_ACTIVITY" ? "Aktivitas Operator" : result.query.kind === "STUDENT_ASSIGNMENT" ? "Penugasan Siswa" : "Perubahan kepemilikan",
    result.query.action ? `Aksi: ${result.query.action}` : undefined,
    result.query.search ? `Pencarian: ${result.query.search}` : undefined
  ].filter((item): item is string => Boolean(item));
  return <section className={styles.filterContext} aria-labelledby="admin-filter-context-title">
    <div><h2 id="admin-filter-context-title">Konteks laporan</h2><p role="status" aria-live="polite">{result.total.toLocaleString("id-ID")} aktivitas ditemukan</p></div>
    <div><span>Filter aktif:</span><ul>{active.map((item) => <li key={item}>{item}</li>)}</ul></div>
  </section>;
}

export function OperatorReportExport({ result }: { result: OperatorReportResult }) {
  const formats = exportRegistry.availableFormats();
  const actions = formats.map((item) => ({ format: item.format, label: item.label, href: operatorReportExportHref("/api/operator/reports/export", result.filters, item.format) }));
  return <section className={styles.exportBar} aria-labelledby="operator-report-export-title"><div><h2 id="operator-report-export-title">Unduh laporan</h2><p>Export menggunakan seluruh data yang sesuai dengan filter aktif saat tombol ditekan, bukan hanya data pada halaman yang sedang terlihat.</p></div><ReportExportActions key={actions.map((item) => item.href).join("|")} formats={actions} total={result.total} /></section>;
}

export function AdminReportExport({ result }: { result: AdminReportResult }) {
  const formats = exportRegistry.availableFormats();
  const query = { kind: result.query.kind, period: result.query.period, dateFrom: result.query.dateFrom, dateTo: result.query.dateTo, search: result.query.search, action: result.query.action };
  const actions = formats.map((item) => ({ format: item.format, label: item.label, href: adminReportExportHref("/api/admin/reports/export", query, item.format) }));
  return <section className={styles.exportBar} aria-labelledby="admin-report-export-title"><div><h2 id="admin-report-export-title">Unduh laporan</h2><p>Export menggunakan seluruh data yang sesuai dengan filter aktif saat tombol ditekan, bukan hanya data pada halaman yang sedang terlihat.</p></div><ReportExportActions key={actions.map((item) => item.href).join("|")} formats={actions} total={result.total} /></section>;
}

export function OperatorReportFilterContext({ result }: { result: OperatorReportResult }) {
  return <FilterContext count={result.total} filters={result.filters} students={result.students} periodLabel={result.summary.periodLabel} />;
}

export function ReportSkeleton() {
  return <div className={styles.skeleton} aria-busy="true" aria-live="polite"><div><h1>Memuat laporan…</h1><p>Menyiapkan filter, ringkasan, dan riwayat terbaru.</p></div><div className={styles.filterSkeleton} aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <span key={index} />)}</div><LoadingSkeleton variant="cards" lines={6} aria-label="Memuat ringkasan laporan" /><LoadingSkeleton variant="table" lines={8} aria-label="Memuat tabel laporan" /></div>;
}
