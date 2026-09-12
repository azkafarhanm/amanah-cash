// Crypto-free by design: this is the one part of the transaction domain the
// client bundle also needs (to preview a Balance before the server commits),
// and importing @/transactions/domain would pull in node:crypto.

export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "CORRECTION";
export type CorrectionDirection = "INCREASE" | "DECREASE";

export type TransactionErrorCode =
  | "VALIDATION"
  | "INSUFFICIENT_BALANCE"
  | "READ_ONLY_STUDENT"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "IDEMPOTENCY_CONFLICT"
  | "CONCURRENT_MODIFICATION"
  | "UNAVAILABLE";

export class TransactionEngineError extends Error {
  constructor(
    public readonly code: TransactionErrorCode,
    message: string,
    public readonly status: number,
    public readonly retryable = false
  ) {
    super(message);
    this.name = "TransactionEngineError";
  }
}

export function effect(value: { type: TransactionType; amount: bigint; correctionDirection: CorrectionDirection | null }): bigint {
  if (value.type === "DEPOSIT") return value.amount;
  if (value.type === "WITHDRAWAL") return -value.amount;
  if (value.type === "CORRECTION" && value.correctionDirection === "INCREASE") return value.amount;
  if (value.type === "CORRECTION" && value.correctionDirection === "DECREASE") return -value.amount;
  throw new TransactionEngineError("VALIDATION", "Transaction tidak memiliki efek Balance yang dikenal.", 400);
}
