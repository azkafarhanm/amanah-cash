import { createHash } from "node:crypto";

export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "CORRECTION";
export type CorrectionDirection = "INCREASE" | "DECREASE";
export type FinancialEventType = "CREATE" | "EDIT" | "DELETE" | "RESTORE";

export type TransactionSnapshot = {
  id: string;
  studentId: string;
  type: TransactionType;
  amount: string;
  correctionDirection: CorrectionDirection | null;
  reason: string | null;
  occurredAt: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  revision: number;
  deletedAt: string | null;
  deletedBy: string | null;
};

export type TransactionResult = {
  transaction: TransactionSnapshot;
  balance: string;
  balanceDelta: string;
  replayed: boolean;
};

export type CreateTransactionInput = {
  actorId: string;
  studentId: string;
  transactionId: unknown;
  commandId: unknown;
  correlationId: unknown;
  type: unknown;
  amount: unknown;
  correctionDirection?: unknown;
  reason?: unknown;
  occurredAt: unknown;
};

export type EditTransactionInput = {
  actorId: string;
  studentId: string;
  transactionId: string;
  commandId: unknown;
  correlationId: unknown;
  expectedRevision: unknown;
  type: unknown;
  amount: unknown;
  correctionDirection?: unknown;
  reason?: unknown;
  occurredAt: unknown;
  editReason: unknown;
};

export type LifecycleTransactionInput = {
  actorId: string;
  studentId: string;
  transactionId: string;
  commandId: unknown;
  correlationId: unknown;
  expectedRevision: unknown;
  reason: unknown;
};

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

const TYPES = new Set<TransactionType>(["DEPOSIT", "WITHDRAWAL", "CORRECTION"]);
const DIRECTIONS = new Set<CorrectionDirection>(["INCREASE", "DECREASE"]);
export const MAX_SIGNED_64 = BigInt("9223372036854775807");

function requiredId(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new TransactionEngineError("VALIDATION", `${label} wajib diisi.`, 400);
  }
  return value.trim();
}

export function commandId(value: unknown) {
  return requiredId(value, "Command ID");
}

export function correlationId(value: unknown) {
  return requiredId(value, "Correlation ID");
}

export function transactionId(value: unknown) {
  return requiredId(value, "Transaction ID");
}

export function amountValue(value: unknown): bigint {
  let amount: bigint;
  try {
    if (typeof value === "bigint") amount = value;
    else if (typeof value === "number" && Number.isSafeInteger(value)) amount = BigInt(value);
    else if (typeof value === "string" && /^[0-9]+$/.test(value)) amount = BigInt(value);
    else throw new Error("invalid");
  } catch {
    throw new TransactionEngineError("VALIDATION", "Jumlah harus berupa Rupiah bulat positif.", 400);
  }
  if (amount <= BigInt(0) || amount > MAX_SIGNED_64) {
    throw new TransactionEngineError("VALIDATION", "Jumlah berada di luar batas Rupiah yang didukung.", 400);
  }
  return amount;
}

export function revisionValue(value: unknown): number {
  const revision = typeof value === "string" && /^[0-9]+$/.test(value) ? Number(value) : value;
  if (typeof revision !== "number" || !Number.isSafeInteger(revision) || revision < 1) {
    throw new TransactionEngineError("VALIDATION", "Revisi Transaction tidak valid.", 400);
  }
  return revision;
}

export function reasonValue(value: unknown, label = "Alasan"): string {
  if (typeof value !== "string") throw new TransactionEngineError("VALIDATION", `${label} wajib diisi.`, 400);
  const reason = value.trim();
  if (!reason || reason.length > 500) {
    throw new TransactionEngineError("VALIDATION", `${label} harus terdiri dari 1–500 karakter.`, 400);
  }
  return reason;
}

export function occurredAtValue(value: unknown): string {
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    throw new TransactionEngineError("VALIDATION", "Waktu kejadian tidak valid.", 400);
  }
  return date.toISOString();
}

export function transactionValues(input: {
  type: unknown;
  amount: unknown;
  correctionDirection?: unknown;
  reason?: unknown;
  occurredAt: unknown;
}) {
  if (typeof input.type !== "string" || !TYPES.has(input.type as TransactionType)) {
    throw new TransactionEngineError("VALIDATION", "Jenis Transaction tidak valid.", 400);
  }
  const type = input.type as TransactionType;
  const amount = amountValue(input.amount);
  const occurredAt = occurredAtValue(input.occurredAt);
  if (type === "CORRECTION") {
    if (typeof input.correctionDirection !== "string" || !DIRECTIONS.has(input.correctionDirection as CorrectionDirection)) {
      throw new TransactionEngineError("VALIDATION", "Arah Correction tidak valid.", 400);
    }
    return { type, amount, occurredAt, correctionDirection: input.correctionDirection as CorrectionDirection, reason: reasonValue(input.reason, "Alasan Correction") };
  }
  if (input.correctionDirection !== undefined && input.correctionDirection !== null && input.correctionDirection !== "") {
    throw new TransactionEngineError("VALIDATION", "Arah Correction hanya boleh digunakan untuk Correction.", 400);
  }
  if (input.reason !== undefined && input.reason !== null && input.reason !== "") {
    throw new TransactionEngineError("VALIDATION", "Alasan ledger hanya boleh digunakan untuk Correction.", 400);
  }
  return { type, amount, occurredAt, correctionDirection: null, reason: null };
}

export function effect(value: { type: TransactionType; amount: bigint; correctionDirection: CorrectionDirection | null }): bigint {
  if (value.type === "DEPOSIT") return value.amount;
  if (value.type === "WITHDRAWAL") return -value.amount;
  if (value.type === "CORRECTION" && value.correctionDirection === "INCREASE") return value.amount;
  if (value.type === "CORRECTION" && value.correctionDirection === "DECREASE") return -value.amount;
  throw new TransactionEngineError("VALIDATION", "Transaction tidak memiliki efek Balance yang dikenal.", 400);
}

export function checkedBalance(balance: bigint, delta: bigint): bigint {
  const proposed = balance + delta;
  if (proposed > MAX_SIGNED_64 || proposed < -MAX_SIGNED_64 - BigInt(1)) {
    throw new TransactionEngineError("VALIDATION", "Perubahan Balance melampaui batas integer yang didukung.", 400);
  }
  if (proposed < BigInt(0)) {
    throw new TransactionEngineError("INSUFFICIENT_BALANCE", "Balance Siswa tidak mencukupi.", 422);
  }
  return proposed;
}

export function stableJson(value: Record<string, unknown>): string {
  return JSON.stringify(value);
}

export function payloadHash(value: Record<string, unknown>): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}
