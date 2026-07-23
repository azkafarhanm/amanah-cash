import type { TransactionHistoryQuery } from "@/transactions/read-service";
import { rupiah, transactionSign, transactionTypeLabel } from "@/presentation/formatting";

export { rupiah, transactionSign, transactionTypeLabel };

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
