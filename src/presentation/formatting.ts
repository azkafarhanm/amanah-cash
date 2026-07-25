import type { AdminReportKind } from "@/reports/types";
import type { CorrectionDirection, TransactionType } from "@/transactions/domain";

export const transactionTypeLabel: Record<TransactionType, string> = {
  DEPOSIT: "Setoran",
  WITHDRAWAL: "Penarikan",
  CORRECTION: "Koreksi"
};

export function parseNumericValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\D/g, "");
}

export function formatThousand(value: unknown): string {
  const digits = parseNumericValue(value);
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(BigInt(digits));
}

export function rupiah(value: string | number | bigint | null | undefined) {
  if (value === null || value === undefined || value === "") return "Rp\u00a00";
  try {
    const raw = typeof value === "bigint" ? value.toString() : String(value);
    const isNegative = raw.startsWith("-") || raw.startsWith("−");
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "Rp\u00a00";
    const formatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(BigInt(digits));
    return isNegative ? `−${formatted}` : formatted;
  } catch {
    return "Rp\u00a00";
  }
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

export function signedRupiah(value: string | number | bigint | null | undefined) {
  if (value === null || value === undefined || value === "") return rupiah("0");
  const str = typeof value === "bigint" ? value.toString() : String(value);
  const amount = BigInt(str.replace(/[^0-9-]/g, "") || "0");
  if (amount === 0n) return rupiah("0");
  return `${amount < 0n ? "−" : "+"} ${rupiah(amount < 0n ? (-amount).toString() : amount.toString())}`;
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
