import Database from "better-sqlite3";
import { loadAuthenticationEnvironment } from "@/auth/environment";
import { getPrismaClient } from "@/persistence/prisma";
import type { PrismaClient } from "@/generated/prisma/client";
import {
  checkedBalance,
  commandId,
  correlationId,
  effect,
  payloadHash,
  reasonValue,
  revisionValue,
  stableJson,
  transactionId,
  transactionValues,
  TransactionEngineError,
  type CreateTransactionInput,
  type EditTransactionInput,
  type FinancialEventType,
  type LifecycleTransactionInput,
  type TransactionResult,
  type TransactionSnapshot
} from "@/transactions/domain";

type StudentRow = { id: string; status: string; balance: bigint; financial_version: bigint; operator_id: string };
type ActorRow = { id: string; role: string; is_active: bigint; deleted_at: string | null };
type TransactionRow = {
  id: string; student_id: string; type: "DEPOSIT" | "WITHDRAWAL" | "CORRECTION"; amount: bigint;
  correction_direction: "INCREASE" | "DECREASE" | null; reason: string | null; notes: string | null; occurred_at: string;
  created_at: string; created_by: string; updated_at: string; updated_by: string; revision: bigint;
  deleted_at: string | null; deleted_by: string | null;
};
type AuditRow = { command_payload_hash: string; after_snapshot: string; balance_after: bigint; balance_delta: bigint; transaction_revision: bigint };

export type TransactionEngineDatabase = Database.Database;

function snapshot(row: TransactionRow): TransactionSnapshot {
  return {
    id: row.id, studentId: row.student_id, type: row.type, amount: row.amount.toString(),
    correctionDirection: row.correction_direction, reason: row.reason, notes: row.notes, occurredAt: row.occurred_at,
    createdAt: row.created_at, createdBy: row.created_by, updatedAt: row.updated_at, updatedBy: row.updated_by,
    revision: Number(row.revision), deletedAt: row.deleted_at, deletedBy: row.deleted_by
  };
}

function snapshotFromPrisma(row: {
  id: string;
  studentId: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "CORRECTION";
  amount: bigint;
  correctionDirection: "INCREASE" | "DECREASE" | null;
  reason: string | null;
  notes: string | null;
  occurredAt: Date;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  revision: number;
  deletedAt: Date | null;
  deletedBy: string | null;
}): TransactionSnapshot {
  return {
    id: row.id,
    studentId: row.studentId,
    type: row.type,
    amount: row.amount.toString(),
    correctionDirection: row.correctionDirection,
    reason: row.reason,
    notes: row.notes,
    occurredAt: row.occurredAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
    revision: row.revision,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    deletedBy: row.deletedBy
  };
}

function isBusy(error: unknown) {
  return error instanceof Error && /SQLITE_BUSY|database is locked|database is busy/i.test(error.message);
}

function nowIso(now: () => Date) {
  return now().toISOString();
}

export function createTransactionEngine(database: TransactionEngineDatabase, now: () => Date = () => new Date()) {
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
  database.defaultSafeIntegers(true);

  function execute(input: { actorId: string; studentId: string; commandId: string; correlationId: string; hash: string }, mutation: (context: { student: StudentRow; timestamp: string }) => Omit<TransactionResult, "replayed">): TransactionResult {
    try {
      database.exec("BEGIN IMMEDIATE");
      try {
        const actor = database.prepare("SELECT id, role, is_active, deleted_at FROM users WHERE id = ?").get(input.actorId) as ActorRow | undefined;
        if (!actor || actor.is_active !== BigInt(1) || actor.deleted_at !== null) throw new TransactionEngineError("UNAUTHORIZED", "Sesi Operator tidak lagi aktif.", 401);
        if (actor.role !== "OPERATOR") throw new TransactionEngineError("FORBIDDEN", "Platform Admin tidak dapat mengakses data finansial.", 403);

        const student = database.prepare("SELECT id, status, balance, financial_version, operator_id FROM students WHERE id = ? AND operator_id = ?").get(input.studentId, input.actorId) as StudentRow | undefined;
        if (!student) throw new TransactionEngineError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
        if (student.status !== "ACTIVE") throw new TransactionEngineError("READ_ONLY_STUDENT", "Siswa tidak aktif atau telah diarsipkan dan bersifat read-only.", 409);

        const prior = database.prepare("SELECT command_payload_hash, after_snapshot, balance_after, balance_delta, transaction_revision FROM financial_audit_events WHERE command_id = ?").get(input.commandId) as AuditRow | undefined;
        if (prior) {
          if (prior.command_payload_hash !== input.hash) throw new TransactionEngineError("IDEMPOTENCY_CONFLICT", "Command ID telah digunakan untuk payload berbeda.", 409);
          const recorded = JSON.parse(prior.after_snapshot) as TransactionSnapshot & { notes?: string | null };
          const transaction: TransactionSnapshot = { ...recorded, notes: recorded.notes ?? null };
          database.exec("COMMIT");
          return { transaction, balance: prior.balance_after.toString(), balanceDelta: prior.balance_delta.toString(), replayed: true };
        }

        const result = mutation({ student, timestamp: nowIso(now) });
        database.exec("COMMIT");
        return { ...result, replayed: false };
      } catch (error) {
        if (database.inTransaction) database.exec("ROLLBACK");
        throw error;
      }
    } catch (error) {
      if (error instanceof TransactionEngineError) throw error;
      if (isBusy(error)) throw new TransactionEngineError("UNAVAILABLE", "Database sedang sibuk. Coba lagi dengan Command ID yang sama.", 503, true);
      throw error;
    }
  }

  function updateBalance(student: StudentRow, delta: bigint) {
    const balanceAfter = checkedBalance(student.balance, delta);
    const update = database.prepare("UPDATE students SET balance = ?, financial_version = financial_version + 1 WHERE id = ? AND financial_version = ?").run(balanceAfter, student.id, student.financial_version);
    if (Number(update.changes) !== 1) throw new TransactionEngineError("CONCURRENT_MODIFICATION", "Data finansial berubah secara bersamaan. Muat ulang lalu coba lagi.", 409, true);
    return { balanceAfter };
  }

  function appendAudit(input: { commandId: string; hash: string; eventType: FinancialEventType; actorId: string; studentId: string; transactionId: string; revision: number; reason: string | null; before: TransactionSnapshot | null; after: TransactionSnapshot; balanceBefore: bigint; balanceAfter: bigint; delta: bigint; timestamp: string; correlationId: string }) {
    database.prepare(`INSERT INTO financial_audit_events
      (id, command_id, command_payload_hash, event_type, actor_id, actor_role, student_id, transaction_id,
       transaction_revision, reason, before_snapshot, after_snapshot, balance_before, balance_after,
       balance_delta, occurred_at, schema_version, correlation_id)
      VALUES (?, ?, ?, ?, ?, 'OPERATOR', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`)
      .run(crypto.randomUUID(), input.commandId, input.hash, input.eventType, input.actorId, input.studentId,
        input.transactionId, input.revision, input.reason, input.before ? stableJson(input.before as unknown as Record<string, unknown>) : null,
        stableJson(input.after as unknown as Record<string, unknown>), input.balanceBefore, input.balanceAfter, input.delta,
        input.timestamp, input.correlationId);
  }

  function create(input: CreateTransactionInput): TransactionResult {
    const values = transactionValues(input);
    const normalized = {
      operation: "CREATE", actorId: input.actorId, studentId: input.studentId,
      transactionId: transactionId(input.transactionId), commandId: commandId(input.commandId),
      type: values.type, amount: values.amount.toString(), correctionDirection: values.correctionDirection,
      reason: values.reason, notes: values.notes, occurredAt: values.occurredAt
    };
    const safeCorrelationId = correlationId(input.correlationId);
    const hash = payloadHash(normalized);
    return execute({ actorId: input.actorId, studentId: input.studentId, commandId: normalized.commandId, correlationId: safeCorrelationId, hash }, ({ student, timestamp }) => {
      const delta = effect(values);
      checkedBalance(student.balance, delta);
      try {
        database.prepare(`INSERT INTO transactions
          (id, student_id, type, amount, correction_direction, reason, notes, occurred_at, created_at, created_by, updated_at, updated_by, revision)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`)
          .run(normalized.transactionId, student.id, values.type, values.amount, values.correctionDirection, values.reason, values.notes,
            values.occurredAt, timestamp, input.actorId, timestamp, input.actorId);
      } catch (error) {
        if (error instanceof Error && /UNIQUE constraint failed: transactions\.id/.test(error.message)) {
          throw new TransactionEngineError("CONFLICT", "Transaction ID telah digunakan.", 409);
        }
        throw error;
      }
      const { balanceAfter } = updateBalance(student, delta);
      const row = database.prepare("SELECT * FROM transactions WHERE id = ? AND student_id = ?").get(normalized.transactionId, student.id) as TransactionRow;
      const after = snapshot(row);
      appendAudit({ commandId: normalized.commandId, hash, eventType: "CREATE", actorId: input.actorId, studentId: student.id, transactionId: row.id, revision: 1, reason: values.reason, before: null, after, balanceBefore: student.balance, balanceAfter, delta, timestamp, correlationId: safeCorrelationId });
      return { transaction: after, balance: balanceAfter.toString(), balanceDelta: delta.toString() };
    });
  }

  function edit(input: EditTransactionInput): TransactionResult {
    const values = transactionValues(input);
    const expectedRevision = revisionValue(input.expectedRevision);
    const editReason = reasonValue(input.editReason, "Alasan edit");
    const normalized = {
      operation: "EDIT", actorId: input.actorId, studentId: input.studentId, transactionId: transactionId(input.transactionId),
      commandId: commandId(input.commandId), expectedRevision, type: values.type, amount: values.amount.toString(),
      correctionDirection: values.correctionDirection, reason: values.reason, notes: values.notes, occurredAt: values.occurredAt, editReason
    };
    const safeCorrelationId = correlationId(input.correlationId);
    const hash = payloadHash(normalized);
    return execute({ actorId: input.actorId, studentId: input.studentId, commandId: normalized.commandId, correlationId: safeCorrelationId, hash }, ({ student, timestamp }) => {
      const row = database.prepare("SELECT * FROM transactions WHERE id = ? AND student_id = ?").get(normalized.transactionId, student.id) as TransactionRow | undefined;
      if (!row) throw new TransactionEngineError("NOT_FOUND", "Transaction tidak ditemukan.", 404);
      if (row.deleted_at) throw new TransactionEngineError("CONFLICT", "Transaction yang dihapus harus dipulihkan sebelum diedit.", 409);
      if (Number(row.revision) !== expectedRevision) throw new TransactionEngineError("CONFLICT", "Revisi Transaction sudah berubah.", 409);
      const before = snapshot(row);
      const delta = effect(values) - effect({ type: row.type, amount: row.amount, correctionDirection: row.correction_direction });
      checkedBalance(student.balance, delta);
      const transactionUpdate = database.prepare(`UPDATE transactions SET type = ?, amount = ?, correction_direction = ?, reason = ?, notes = ?, occurred_at = ?,
        updated_at = ?, updated_by = ?, revision = revision + 1 WHERE id = ? AND student_id = ? AND revision = ? AND deleted_at IS NULL`)
        .run(values.type, values.amount, values.correctionDirection, values.reason, values.notes, values.occurredAt, timestamp, input.actorId,
          row.id, student.id, row.revision);
      if (Number(transactionUpdate.changes) !== 1) throw new TransactionEngineError("CONCURRENT_MODIFICATION", "Transaction berubah secara bersamaan.", 409, true);
      const { balanceAfter } = updateBalance(student, delta);
      const updated = database.prepare("SELECT * FROM transactions WHERE id = ?").get(row.id) as TransactionRow;
      const after = snapshot(updated);
      appendAudit({ commandId: normalized.commandId, hash, eventType: "EDIT", actorId: input.actorId, studentId: student.id, transactionId: row.id, revision: after.revision, reason: editReason, before, after, balanceBefore: student.balance, balanceAfter, delta, timestamp, correlationId: safeCorrelationId });
      return { transaction: after, balance: balanceAfter.toString(), balanceDelta: delta.toString() };
    });
  }

  function lifecycle(eventType: "DELETE" | "RESTORE", input: LifecycleTransactionInput): TransactionResult {
    const normalized = { operation: eventType, actorId: input.actorId, studentId: input.studentId, transactionId: transactionId(input.transactionId), commandId: commandId(input.commandId), expectedRevision: revisionValue(input.expectedRevision), reason: reasonValue(input.reason) };
    const safeCorrelationId = correlationId(input.correlationId);
    const hash = payloadHash(normalized);
    return execute({ actorId: input.actorId, studentId: input.studentId, commandId: normalized.commandId, correlationId: safeCorrelationId, hash }, ({ student, timestamp }) => {
      const row = database.prepare("SELECT * FROM transactions WHERE id = ? AND student_id = ?").get(normalized.transactionId, student.id) as TransactionRow | undefined;
      if (!row) throw new TransactionEngineError("NOT_FOUND", "Transaction tidak ditemukan.", 404);
      if (Number(row.revision) !== normalized.expectedRevision) throw new TransactionEngineError("CONFLICT", "Revisi Transaction sudah berubah.", 409);
      if (eventType === "DELETE" && row.deleted_at) throw new TransactionEngineError("CONFLICT", "Transaction sudah dihapus.", 409);
      if (eventType === "RESTORE" && !row.deleted_at) throw new TransactionEngineError("CONFLICT", "Transaction masih aktif.", 409);
      const before = snapshot(row);
      const currentEffect = effect({ type: row.type, amount: row.amount, correctionDirection: row.correction_direction });
      const delta = eventType === "DELETE" ? -currentEffect : currentEffect;
      checkedBalance(student.balance, delta);
      let transactionUpdate: Database.RunResult;
      if (eventType === "DELETE") {
        transactionUpdate = database.prepare("UPDATE transactions SET deleted_at = ?, deleted_by = ?, updated_at = ?, updated_by = ?, revision = revision + 1 WHERE id = ? AND revision = ? AND deleted_at IS NULL")
          .run(timestamp, input.actorId, timestamp, input.actorId, row.id, row.revision);
      } else {
        transactionUpdate = database.prepare("UPDATE transactions SET deleted_at = NULL, deleted_by = NULL, updated_at = ?, updated_by = ?, revision = revision + 1 WHERE id = ? AND revision = ? AND deleted_at IS NOT NULL")
          .run(timestamp, input.actorId, row.id, row.revision);
      }
      if (Number(transactionUpdate.changes) !== 1) throw new TransactionEngineError("CONCURRENT_MODIFICATION", "Transaction berubah secara bersamaan.", 409, true);
      const { balanceAfter } = updateBalance(student, delta);
      const updated = database.prepare("SELECT * FROM transactions WHERE id = ?").get(row.id) as TransactionRow;
      const after = snapshot(updated);
      appendAudit({ commandId: normalized.commandId, hash, eventType, actorId: input.actorId, studentId: student.id, transactionId: row.id, revision: after.revision, reason: normalized.reason, before, after, balanceBefore: student.balance, balanceAfter, delta, timestamp, correlationId: safeCorrelationId });
      return { transaction: after, balance: balanceAfter.toString(), balanceDelta: delta.toString() };
    });
  }

  return { create, edit, remove: (input: LifecycleTransactionInput) => lifecycle("DELETE", input), restore: (input: LifecycleTransactionInput) => lifecycle("RESTORE", input) };
}

export function createPrismaTransactionEngine(prisma: PrismaClient, now: () => Date = () => new Date()) {
  async function execute(
    input: { actorId: string; studentId: string; commandId: string; correlationId: string; hash: string },
    mutation: (context: {
      tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
      student: { id: string; status: string; balance: bigint; financialVersion: number; operatorId: string };
      timestamp: Date;
    }) => Promise<Omit<TransactionResult, "replayed">>
  ): Promise<TransactionResult> {
    try {
      return await prisma.$transaction(async (tx) => {
        const actor = await tx.user.findFirst({
          where: { id: input.actorId },
          select: { id: true, role: true, isActive: true, deletedAt: true }
        });
        if (!actor || !actor.isActive || actor.deletedAt !== null) {
          throw new TransactionEngineError("UNAUTHORIZED", "Sesi Operator tidak lagi aktif.", 401);
        }
        if (actor.role !== "OPERATOR") {
          throw new TransactionEngineError("FORBIDDEN", "Platform Admin tidak dapat mengakses data finansial.", 403);
        }

        const student = await tx.student.findFirst({
          where: { id: input.studentId, operatorId: input.actorId },
          select: { id: true, status: true, balance: true, financialVersion: true, operatorId: true }
        });
        if (!student) {
          throw new TransactionEngineError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
        }
        if (student.status !== "ACTIVE") {
          throw new TransactionEngineError("READ_ONLY_STUDENT", "Siswa tidak aktif atau telah diarsipkan dan bersifat read-only.", 409);
        }

        const prior = await tx.financialAuditEvent.findUnique({
          where: { commandId: input.commandId },
          select: {
            commandPayloadHash: true,
            afterSnapshot: true,
            balanceAfter: true,
            balanceDelta: true,
            transactionRevision: true
          }
        });
        if (prior) {
          if (prior.commandPayloadHash !== input.hash) {
            throw new TransactionEngineError("IDEMPOTENCY_CONFLICT", "Command ID telah digunakan untuk payload berbeda.", 409);
          }
          const recorded = JSON.parse(prior.afterSnapshot ?? "{}") as TransactionSnapshot & { notes?: string | null };
          const transaction: TransactionSnapshot = { ...recorded, notes: recorded.notes ?? null };
          return {
            transaction,
            balance: (prior.balanceAfter ?? 0n).toString(),
            balanceDelta: (prior.balanceDelta ?? 0n).toString(),
            replayed: true
          };
        }

        const timestamp = now();
        const result = await mutation({ tx, student, timestamp });
        return { ...result, replayed: false };
      });
    } catch (error) {
      if (error instanceof TransactionEngineError) throw error;
      if (isBusy(error)) {
        throw new TransactionEngineError("UNAVAILABLE", "Database sedang sibuk. Coba lagi dengan Command ID yang sama.", 503, true);
      }
      throw error;
    }
  }

  async function updateBalance(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    student: { id: string; balance: bigint; financialVersion: number },
    delta: bigint
  ) {
    const balanceAfter = checkedBalance(student.balance, delta);
    const update = await tx.student.updateMany({
      where: { id: student.id, financialVersion: student.financialVersion },
      data: { balance: balanceAfter, financialVersion: { increment: 1 } }
    });
    if (update.count !== 1) {
      throw new TransactionEngineError("CONCURRENT_MODIFICATION", "Data finansial berubah secara bersamaan. Muat ulang lalu coba lagi.", 409, true);
    }
    return { balanceAfter };
  }

  async function appendAudit(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    input: {
      commandId: string;
      hash: string;
      eventType: FinancialEventType;
      actorId: string;
      studentId: string;
      transactionId: string;
      revision: number;
      reason: string | null;
      before: TransactionSnapshot | null;
      after: TransactionSnapshot;
      balanceBefore: bigint;
      balanceAfter: bigint;
      delta: bigint;
      timestamp: Date;
      correlationId: string;
    }
  ) {
    await tx.financialAuditEvent.create({
      data: {
        id: crypto.randomUUID(),
        commandId: input.commandId,
        commandPayloadHash: input.hash,
        eventType: input.eventType,
        actorId: input.actorId,
        actorRole: "OPERATOR",
        studentId: input.studentId,
        transactionId: input.transactionId,
        transactionRevision: input.revision,
        reason: input.reason,
        beforeSnapshot: input.before ? stableJson(input.before as unknown as Record<string, unknown>) : null,
        afterSnapshot: stableJson(input.after as unknown as Record<string, unknown>),
        balanceBefore: input.balanceBefore,
        balanceAfter: input.balanceAfter,
        balanceDelta: input.delta,
        occurredAt: input.timestamp,
        schemaVersion: 1,
        correlationId: input.correlationId
      }
    });
  }

  async function create(input: CreateTransactionInput): Promise<TransactionResult> {
    const values = transactionValues(input);
    const normalized = {
      operation: "CREATE", actorId: input.actorId, studentId: input.studentId,
      transactionId: transactionId(input.transactionId), commandId: commandId(input.commandId),
      type: values.type, amount: values.amount.toString(), correctionDirection: values.correctionDirection,
      reason: values.reason, notes: values.notes, occurredAt: values.occurredAt
    };
    const safeCorrelationId = correlationId(input.correlationId);
    const hash = payloadHash(normalized);
    return execute({ actorId: input.actorId, studentId: input.studentId, commandId: normalized.commandId, correlationId: safeCorrelationId, hash }, async ({ tx, student, timestamp }) => {
      const delta = effect(values);
      checkedBalance(student.balance, delta);
      try {
        await tx.transaction.create({
          data: {
            id: normalized.transactionId,
            studentId: student.id,
            type: values.type,
            amount: values.amount,
            correctionDirection: values.correctionDirection,
            reason: values.reason,
            notes: values.notes,
            occurredAt: new Date(values.occurredAt),
            createdAt: timestamp,
            createdBy: input.actorId,
            updatedAt: timestamp,
            updatedBy: input.actorId,
            revision: 1
          }
        });
      } catch (error) {
        if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
          throw new TransactionEngineError("CONFLICT", "Transaction ID telah digunakan.", 409);
        }
        throw error;
      }
      const { balanceAfter } = await updateBalance(tx, student, delta);
      const row = await tx.transaction.findUnique({
        where: { id: normalized.transactionId }
      });
      if (!row) throw new TransactionEngineError("NOT_FOUND", "Transaction tidak ditemukan.", 404);
      const after = snapshotFromPrisma(row);
      await appendAudit(tx, {
        commandId: normalized.commandId, hash, eventType: "CREATE", actorId: input.actorId,
        studentId: student.id, transactionId: row.id, revision: 1, reason: values.reason,
        before: null, after, balanceBefore: student.balance, balanceAfter, delta,
        timestamp, correlationId: safeCorrelationId
      });
      return { transaction: after, balance: balanceAfter.toString(), balanceDelta: delta.toString() };
    });
  }

  async function edit(input: EditTransactionInput): Promise<TransactionResult> {
    const values = transactionValues(input);
    const expectedRevision = revisionValue(input.expectedRevision);
    const editReason = reasonValue(input.editReason, "Alasan edit");
    const normalized = {
      operation: "EDIT", actorId: input.actorId, studentId: input.studentId, transactionId: transactionId(input.transactionId),
      commandId: commandId(input.commandId), expectedRevision, type: values.type, amount: values.amount.toString(),
      correctionDirection: values.correctionDirection, reason: values.reason, notes: values.notes, occurredAt: values.occurredAt, editReason
    };
    const safeCorrelationId = correlationId(input.correlationId);
    const hash = payloadHash(normalized);
    return execute({ actorId: input.actorId, studentId: input.studentId, commandId: normalized.commandId, correlationId: safeCorrelationId, hash }, async ({ tx, student, timestamp }) => {
      const row = await tx.transaction.findFirst({
        where: { id: normalized.transactionId, studentId: student.id }
      });
      if (!row) throw new TransactionEngineError("NOT_FOUND", "Transaction tidak ditemukan.", 404);
      if (row.deletedAt) throw new TransactionEngineError("CONFLICT", "Transaction yang dihapus harus dipulihkan sebelum diedit.", 409);
      if (row.revision !== expectedRevision) throw new TransactionEngineError("CONFLICT", "Revisi Transaction sudah berubah.", 409);
      const before = snapshotFromPrisma(row);
      const delta = effect(values) - effect({ type: row.type, amount: row.amount, correctionDirection: row.correctionDirection });
      checkedBalance(student.balance, delta);
      const updateResult = await tx.transaction.updateMany({
        where: { id: row.id, studentId: student.id, revision: row.revision, deletedAt: null },
        data: {
          type: values.type,
          amount: values.amount,
          correctionDirection: values.correctionDirection,
          reason: values.reason,
          notes: values.notes,
          occurredAt: new Date(values.occurredAt),
          updatedAt: timestamp,
          updatedBy: input.actorId,
          revision: { increment: 1 }
        }
      });
      if (updateResult.count !== 1) throw new TransactionEngineError("CONCURRENT_MODIFICATION", "Transaction berubah secara bersamaan.", 409, true);
      const { balanceAfter } = await updateBalance(tx, student, delta);
      const updated = await tx.transaction.findUnique({ where: { id: row.id } });
      if (!updated) throw new TransactionEngineError("NOT_FOUND", "Transaction tidak ditemukan.", 404);
      const after = snapshotFromPrisma(updated);
      await appendAudit(tx, {
        commandId: normalized.commandId, hash, eventType: "EDIT", actorId: input.actorId,
        studentId: student.id, transactionId: row.id, revision: after.revision,
        reason: editReason, before, after, balanceBefore: student.balance, balanceAfter, delta,
        timestamp, correlationId: safeCorrelationId
      });
      return { transaction: after, balance: balanceAfter.toString(), balanceDelta: delta.toString() };
    });
  }

  async function lifecycle(eventType: "DELETE" | "RESTORE", input: LifecycleTransactionInput): Promise<TransactionResult> {
    const normalized = { operation: eventType, actorId: input.actorId, studentId: input.studentId, transactionId: transactionId(input.transactionId), commandId: commandId(input.commandId), expectedRevision: revisionValue(input.expectedRevision), reason: reasonValue(input.reason) };
    const safeCorrelationId = correlationId(input.correlationId);
    const hash = payloadHash(normalized);
    return execute({ actorId: input.actorId, studentId: input.studentId, commandId: normalized.commandId, correlationId: safeCorrelationId, hash }, async ({ tx, student, timestamp }) => {
      const row = await tx.transaction.findFirst({
        where: { id: normalized.transactionId, studentId: student.id }
      });
      if (!row) throw new TransactionEngineError("NOT_FOUND", "Transaction tidak ditemukan.", 404);
      if (row.revision !== normalized.expectedRevision) throw new TransactionEngineError("CONFLICT", "Revisi Transaction sudah berubah.", 409);
      if (eventType === "DELETE" && row.deletedAt) throw new TransactionEngineError("CONFLICT", "Transaction sudah dihapus.", 409);
      if (eventType === "RESTORE" && !row.deletedAt) throw new TransactionEngineError("CONFLICT", "Transaction masih aktif.", 409);
      const before = snapshotFromPrisma(row);
      const currentEffect = effect({ type: row.type, amount: row.amount, correctionDirection: row.correctionDirection });
      const delta = eventType === "DELETE" ? -currentEffect : currentEffect;
      checkedBalance(student.balance, delta);
      let updateResult;
      if (eventType === "DELETE") {
        updateResult = await tx.transaction.updateMany({
          where: { id: row.id, revision: row.revision, deletedAt: null },
          data: {
            deletedAt: timestamp,
            deletedBy: input.actorId,
            updatedAt: timestamp,
            updatedBy: input.actorId,
            revision: { increment: 1 }
          }
        });
      } else {
        updateResult = await tx.transaction.updateMany({
          where: { id: row.id, revision: row.revision, deletedAt: { not: null } },
          data: {
            deletedAt: null,
            deletedBy: null,
            updatedAt: timestamp,
            updatedBy: input.actorId,
            revision: { increment: 1 }
          }
        });
      }
      if (updateResult.count !== 1) throw new TransactionEngineError("CONCURRENT_MODIFICATION", "Transaction berubah secara bersamaan.", 409, true);
      const { balanceAfter } = await updateBalance(tx, student, delta);
      const updated = await tx.transaction.findUnique({ where: { id: row.id } });
      if (!updated) throw new TransactionEngineError("NOT_FOUND", "Transaction tidak ditemukan.", 404);
      const after = snapshotFromPrisma(updated);
      await appendAudit(tx, {
        commandId: normalized.commandId, hash, eventType, actorId: input.actorId,
        studentId: student.id, transactionId: row.id, revision: after.revision,
        reason: normalized.reason, before, after, balanceBefore: student.balance, balanceAfter, delta,
        timestamp, correlationId: safeCorrelationId
      });
      return { transaction: after, balance: balanceAfter.toString(), balanceDelta: delta.toString() };
    });
  }

  return {
    create,
    edit,
    remove: (input: LifecycleTransactionInput) => lifecycle("DELETE", input),
    restore: (input: LifecycleTransactionInput) => lifecycle("RESTORE", input)
  };
}

function databasePath(databaseUrl: string) {
  return decodeURIComponent(databaseUrl.slice("file:".length).split("?")[0]);
}

const globalFinancial = globalThis as typeof globalThis & { amanahCashFinancialDatabase?: TransactionEngineDatabase; amanahCashFinancialDatabaseUrl?: string };

export function transactionEngine() {
  const environment = loadAuthenticationEnvironment();
  const isPostgres =
    environment.databaseUrl.startsWith("postgres://") ||
    environment.databaseUrl.startsWith("postgresql://");

  if (isPostgres) {
    const prisma = getPrismaClient(environment);
    return createPrismaTransactionEngine(prisma);
  }

  if (!globalFinancial.amanahCashFinancialDatabase || globalFinancial.amanahCashFinancialDatabaseUrl !== environment.databaseUrl) {
    globalFinancial.amanahCashFinancialDatabase?.close();
    globalFinancial.amanahCashFinancialDatabase = new Database(databasePath(environment.databaseUrl));
    globalFinancial.amanahCashFinancialDatabaseUrl = environment.databaseUrl;
  }
  return createTransactionEngine(globalFinancial.amanahCashFinancialDatabase);
}

