import type { AdminReportKind } from "@/reports/types";
import type { CorrectionDirection, TransactionType } from "@/transactions/domain";

export const transactionTypeLabel: Record<TransactionType, string> = {
  DEPOSIT: "Setoran",
  WITHDRAWAL: "Penarikan",
  CORRECTION: "Koreksi"
};

export function rupiah(value: string) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(BigInt(value));
}

export function reportDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", hour12: false, timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export function jakartaDateStamp(value: Date) {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Jakarta" }).format(value);
}

export function transactionSign(item: { type: TransactionType; correctionDirection: CorrectionDirection | null }) {
  return item.type === "DEPOSIT" || (item.type === "CORRECTION" && item.correctionDirection === "INCREASE") ? "+" : "−";
}

export function signedRupiah(value: string) {
  const amount = BigInt(value);
  if (amount === 0n) return rupiah("0");
  return `${amount < 0n ? "−" : "+"} ${rupiah(amount < 0n ? (-amount).toString() : value)}`;
}

export function correctionDirectionLabel(direction: CorrectionDirection | null) {
  if (direction === "INCREASE") return "Tambah saldo";
  if (direction === "DECREASE") return "Kurangi saldo";
  return "Tidak berlaku";
}

export function adminReportKindLabel(kind: AdminReportKind) {
  if (kind === "OWNERSHIP_CHANGE") return "Perubahan kepemilikan";
  if (kind === "STUDENT_ASSIGNMENT") return "Penugasan Siswa";
  return "Aktivitas Operator";
}
