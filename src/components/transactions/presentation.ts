import type { TransactionHistoryItem, TransactionHistoryQuery } from "@/transactions/read-service";

export const transactionTypeLabel = { DEPOSIT: "Setoran", WITHDRAWAL: "Penarikan", CORRECTION: "Koreksi" } as const;

export function rupiah(value: string) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(BigInt(value));
}

export function transactionSign(item: Pick<TransactionHistoryItem, "type" | "correctionDirection">) {
  return item.type === "DEPOSIT" || (item.type === "CORRECTION" && item.correctionDirection === "INCREASE") ? "+" : "−";
}

export function transactionDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", hour12: false }).format(new Date(value));
}

export function transactionPageHref(basePath: string, query: TransactionHistoryQuery, cursor?: string) {
  const params = new URLSearchParams();
  for (const key of ["type", "status", "search", "dateFrom", "dateTo"] as const) {
    const value = query[key];
    if (typeof value === "string" && value) params.set(key, value);
  }
  if (cursor) params.set("cursor", cursor);
  return `${basePath}?${params}`;
}
