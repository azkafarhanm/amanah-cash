import type { ExportDocument, ExportRow, ExportSummaryItem } from "@/exports/types";
import { adminReportKindLabel, correctionDirectionLabel, reportDate, rupiah, signedRupiah, transactionSign, transactionTypeLabel } from "@/presentation/formatting";
import type { AdminReportKind, AdminReportResult, OperatorReportResult } from "@/reports/types";

const OPERATOR_COLUMNS = [
  { key: "occurredAt", label: "Waktu" },
  { key: "student", label: "Siswa" },
  { key: "studentStatus", label: "Status Siswa" },
  { key: "type", label: "Jenis" },
  { key: "correctionDirection", label: "Arah Koreksi" },
  { key: "amount", label: "Jumlah" },
  { key: "balanceAfter", label: "Saldo setelah" },
  { key: "notes", label: "Catatan" },
  { key: "reason", label: "Alasan" },
  { key: "revision", label: "Revisi" },
  { key: "updatedAt", label: "Diperbarui" },
  { key: "operator", label: "Diperbarui oleh" },
  { key: "auditReference", label: "Referensi audit" }
] as const;

const ADMIN_COLUMNS = [
  { key: "occurredAt", label: "Waktu" },
  { key: "category", label: "Kategori" },
  { key: "subject", label: "Subjek" },
  { key: "description", label: "Rincian" }
] as const;

function summary(label: string, value: string): ExportSummaryItem {
  return { label, value };
}

export function operatorExportDocument(result: OperatorReportResult, generatedAt: Date): ExportDocument {
  return {
    title: "Laporan Keuangan",
    generatedAt: reportDate(generatedAt.toISOString()),
    periodLabel: result.summary.periodLabel,
    summary: [
      summary("Total setoran", rupiah(result.summary.deposits)),
      summary("Total penarikan", rupiah(result.summary.withdrawals)),
      summary("Pergerakan bersih", signedRupiah(result.summary.netMovement)),
      summary("Jumlah transaksi", result.summary.transactionCount.toLocaleString("id-ID")),
      summary("Siswa aktif", result.summary.activeStudents.toLocaleString("id-ID"))
    ],
    columns: OPERATOR_COLUMNS,
    rows: result.items.map((item): ExportRow => ({
      occurredAt: reportDate(item.occurredAt),
      student: item.studentName,
      studentStatus: item.studentStatus === "ACTIVE" ? "Aktif" : item.studentStatus === "ARCHIVED" ? "Diarsipkan" : "Tidak aktif",
      type: transactionTypeLabel[item.type],
      correctionDirection: item.correctionDirection ? correctionDirectionLabel(item.correctionDirection) : "",
      amount: `${transactionSign(item)} ${rupiah(item.amount)}`,
      balanceAfter: item.balanceAfter === null ? "Tidak tersimpan untuk revisi ini" : rupiah(item.balanceAfter),
      notes: item.notes ?? "Tidak ada catatan",
      reason: item.reason ?? "",
      revision: String(item.revision),
      updatedAt: reportDate(item.updatedAt),
      operator: item.operatorName,
      auditReference: item.auditId ? `Audit ${item.auditId.slice(0, 8)}` : ""
    }))
  };
}

export function adminExportDocument(result: AdminReportResult, generatedAt: Date): ExportDocument {
  return {
    title: `Laporan Administratif — ${adminReportKindLabel(result.query.kind as AdminReportKind)}`,
    generatedAt: reportDate(generatedAt.toISOString()),
    periodLabel: result.periodLabel,
    summary: [summary("Jumlah aktivitas", result.total.toLocaleString("id-ID"))],
    columns: ADMIN_COLUMNS,
    rows: result.items.map((item): ExportRow => ({
      occurredAt: reportDate(item.occurredAt),
      category: adminReportKindLabel(item.kind),
      subject: item.subject,
      description: item.description
    }))
  };
}
