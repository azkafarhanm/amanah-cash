import { resolvePageSize } from "@/settings/preferences";
export type StudentStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type StudentScope = { kind: "admin" } | { kind: "operator"; operatorId: string };

export type StudentRecord = {
  id: string;
  name: string;
  notes: string | null;
  status: StudentStatus;
  balance?: string;
  createdAt: Date;
  updatedAt: Date;
  photoObjectKey: string | null;
  photoUpdatedAt: Date | null;
  /** Set when archived through the archive action; null for Students archived before it existed. */
  archivedAt?: Date | null;
  operator: { id: string; name: string; email: string };
};

export type StudentOperatorOption = { id: string; name: string; email: string };

export class StudentManagementError extends Error {
  constructor(
    public readonly code: "VALIDATION" | "DUPLICATE_NAME" | "NOT_FOUND" | "INVALID_OPERATOR" | "CONFLICT" | "BALANCE_NOT_ZERO" | "INVALID_STATE",
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "StudentManagementError";
  }
}

export type StudentRepository = {
  activeOperator(id: string): Promise<StudentOperatorOption | null>;
  activeOperators(): Promise<StudentOperatorOption[]>;
  create(data: { id: string; name: string; notes: string | null; status: StudentStatus; operatorId: string }): Promise<StudentRecord>;
  update(
    id: string,
    data: { name: string; notes: string | null; status: StudentStatus; operatorId: string },
    expectedOperatorId: string,
    ownershipTransfer?: {
      actorId: string;
      reason: string;
      commandId: string;
      correlationId: string;
      oldOperatorId: string;
      newOperatorId: string;
    }
  ): Promise<StudentRecord>;
  find(id: string, operatorId?: string): Promise<StudentRecord | null>;
  /** With no status, every Student except ARCHIVED ones. Archived Students are reachable only by asking for them. */
  list(input: { search: string; status?: StudentStatus; operatorId?: string; skip: number; take: number }): Promise<{ items: StudentRecord[]; total: number }>;
  audit?(data: { operatorId: string; actorId: string; action: string; summary: string }): Promise<void>;
  /**
   * Moves a Student into or out of ARCHIVED and records it, as one atomic step.
   * Archiving must re-check a zero balance in the same statement that changes the
   * status, so a deposit committing in between cannot be hidden behind the archive.
   * Resolves to the updated record, or to the reason nothing changed.
   */
  setArchived(input: { id: string; operatorId: string; actorId: string; archived: boolean }): Promise<
    | { outcome: "UPDATED"; student: StudentRecord }
    | { outcome: "NOT_FOUND" | "BALANCE_NOT_ZERO" | "ALREADY" }
  >;
};

const STATUSES = new Set<StudentStatus>(["ACTIVE", "INACTIVE", "ARCHIVED"]);

function formatRupiah(balance: string | undefined) {
  return `Rp ${BigInt(balance ?? "0").toLocaleString("id-ID")}`;
}

function nameValue(value: unknown) {
  if (typeof value !== "string") throw new StudentManagementError("VALIDATION", "Nama lengkap wajib diisi.", 400);
  const name = value.trim().replace(/\s+/g, " ");
  if (!name) throw new StudentManagementError("VALIDATION", "Nama lengkap wajib diisi.", 400);
  if (name.length > 100) throw new StudentManagementError("VALIDATION", "Nama lengkap maksimal 100 karakter.", 400);
  return name;
}

function notesValue(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new StudentManagementError("VALIDATION", "Catatan tidak valid.", 400);
  const notes = value.trim();
  if (notes.length > 500) throw new StudentManagementError("VALIDATION", "Catatan maksimal 500 karakter.", 400);
  return notes || null;
}

function statusValue(value: unknown): StudentStatus {
  if (typeof value !== "string" || !STATUSES.has(value as StudentStatus)) throw new StudentManagementError("VALIDATION", "Status Siswa tidak valid.", 400);
  return value as StudentStatus;
}

function ownershipTransferReasonValue(value: unknown) {
  if (typeof value !== "string") {
    throw new StudentManagementError("VALIDATION", "Alasan perpindahan Operator wajib diisi.", 400);
  }
  const reason = value.trim();
  if (!reason) throw new StudentManagementError("VALIDATION", "Alasan perpindahan Operator wajib diisi.", 400);
  if (reason.length > 500) throw new StudentManagementError("VALIDATION", "Alasan perpindahan Operator maksimal 500 karakter.", 400);
  return reason;
}

export function createStudentManagement(repository: StudentRepository) {
  async function inputValues(input: { name: unknown; notes: unknown; status: unknown; operatorId: unknown }) {
    const name = nameValue(input.name);
    const notes = notesValue(input.notes);
    const status = statusValue(input.status);
    if (typeof input.operatorId !== "string" || !input.operatorId) throw new StudentManagementError("VALIDATION", "Operator wajib dipilih.", 400);
    const operator = await repository.activeOperator(input.operatorId);
    if (!operator) throw new StudentManagementError("INVALID_OPERATOR", "Pilih Operator aktif yang masih tersedia.", 400);
    return { name, notes, status, operatorId: operator.id };
  }

  /*
    Archiving hides a Student who has left from everyday work: lists, the
    transaction picker, dashboard counts. It never deletes. Transactions and
    financial audit events are append-only by design and enforced by database
    triggers, and past reports must keep reconciling with what was printed.

    The balance must be zero, because a hidden Student with money still held
    is a debt nobody can see. The transaction engine already refuses every
    financial command for a non-ACTIVE Student, so a zero balance stays zero.

    Platform Admin is never shown an amount: Admin has no access to financial
    data, so its message only says the balance is not yet zero.
  */
  async function applyArchive(
    input: { id: string; operatorId: string; actorId: string; archived: boolean; audience: "operator" | "admin" }
  ) {
    const result = await repository.setArchived(input);
    if (result.outcome === "UPDATED") return result.student;
    if (result.outcome === "NOT_FOUND") throw new StudentManagementError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
    if (result.outcome === "ALREADY") {
      throw new StudentManagementError(
        "INVALID_STATE",
        input.archived ? "Siswa sudah diarsipkan." : "Siswa tidak sedang diarsipkan.",
        409
      );
    }
    if (input.audience === "admin") {
      throw new StudentManagementError(
        "BALANCE_NOT_ZERO",
        "Saldo Siswa belum nol. Operator perlu mencatat penarikan sampai saldo nol sebelum Siswa dapat diarsipkan.",
        409
      );
    }
    const current = await repository.find(input.id, input.operatorId);
    throw new StudentManagementError(
      "BALANCE_NOT_ZERO",
      `Saldo Siswa masih ${formatRupiah(current?.balance)}. Catat penarikan sampai saldo nol sebelum mengarsipkan.`,
      409
    );
  }

  return {
    activeOperators: repository.activeOperators,
    async create(input: { name: unknown; notes: unknown; status: unknown; operatorId: unknown }) {
      return repository.create({ id: crypto.randomUUID(), ...(await inputValues(input)) });
    },
    async createByOperator(operatorId: string, input: { name: unknown; kelas?: unknown; notes?: unknown }) {
      if (!operatorId) throw new StudentManagementError("INVALID_OPERATOR", "Operator tidak valid.", 400);
      const operator = await repository.activeOperator(operatorId);
      if (!operator) throw new StudentManagementError("INVALID_OPERATOR", "Operator aktif tidak ditemukan.", 400);
      const name = nameValue(input.name);
      const rawKelas = typeof input.kelas === "string" ? input.kelas.trim() : "";
      const rawNotes = typeof input.notes === "string" ? input.notes.trim() : "";
      const combinedNotes = rawKelas ? (rawNotes ? `${rawKelas} - ${rawNotes}` : rawKelas) : rawNotes;
      const notes = notesValue(combinedNotes);
      const student = await repository.create({ id: crypto.randomUUID(), name, notes, status: "ACTIVE", operatorId: operator.id });
      if (repository.audit) {
        await repository.audit({
          operatorId: operator.id,
          actorId: operator.id,
          action: "STUDENT_CREATE",
          summary: `Menambahkan siswa baru: ${student.name}`
        });
      }
      return student;
    },
    async edit(
      id: string,
      input: { name: unknown; notes: unknown; status: unknown; operatorId: unknown; ownershipTransferReason?: unknown },
      actorId: string
    ) {
      const current = id ? await repository.find(id) : null;
      if (!current) throw new StudentManagementError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
      const values = await inputValues(input);
      const ownershipTransfer = current.operator.id === values.operatorId ? undefined : {
        actorId,
        reason: ownershipTransferReasonValue(input.ownershipTransferReason),
        commandId: crypto.randomUUID(),
        correlationId: crypto.randomUUID(),
        oldOperatorId: current.operator.id,
        newOperatorId: values.operatorId
      };

      // Crossing the ARCHIVED boundary goes through the same guarded, audited
      // step the Operator uses, not through a plain status write.
      const archiving = current.status !== "ARCHIVED" && values.status === "ARCHIVED";
      const restoring = current.status === "ARCHIVED" && values.status !== "ARCHIVED";
      if (archiving) {
        // Checked up front so a refused archive does not leave the other field
        // changes half-applied. setArchived re-checks atomically regardless.
        if (current.balance !== undefined && current.balance !== "0") {
          throw new StudentManagementError(
            "BALANCE_NOT_ZERO",
            "Saldo Siswa belum nol. Operator perlu mencatat penarikan sampai saldo nol sebelum Siswa dapat diarsipkan.",
            409
          );
        }
        const updated = await repository.update(id, { ...values, status: current.status }, current.operator.id, ownershipTransfer);
        return applyArchive({ id, operatorId: updated.operator.id, actorId, archived: true, audience: "admin" });
      }
      if (restoring) {
        await applyArchive({ id, operatorId: current.operator.id, actorId, archived: false, audience: "admin" });
      }
      return repository.update(id, values, current.operator.id, ownershipTransfer);
    },
    async archiveByOperator(operatorId: string, studentId: string) {
      if (!operatorId || !studentId) throw new StudentManagementError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
      return applyArchive({ id: studentId, operatorId, actorId: operatorId, archived: true, audience: "operator" });
    },
    async restoreByOperator(operatorId: string, studentId: string) {
      if (!operatorId || !studentId) throw new StudentManagementError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
      return applyArchive({ id: studentId, operatorId, actorId: operatorId, archived: false, audience: "operator" });
    },
    async detail(id: string, scope: StudentScope) {
      if (!id) throw new StudentManagementError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
      const student = await repository.find(id, scope.kind === "operator" ? scope.operatorId : undefined);
      if (!student) throw new StudentManagementError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
      return student;
    },
    async list(scope: StudentScope, input: { search?: unknown; status?: unknown; page?: unknown; pageSize?: unknown }) {
      const search = typeof input.search === "string" ? input.search.trim().slice(0, 100) : "";
      const status = typeof input.status === "string" && STATUSES.has(input.status as StudentStatus) ? input.status as StudentStatus : undefined;
      const numericPage = typeof input.page === "number" ? input.page : Number(input.page ?? 1);
      const page = Number.isSafeInteger(numericPage) && numericPage > 0 ? numericPage : 1;
      const pageSize = resolvePageSize(input.pageSize);
      const result = await repository.list({ search, status, operatorId: scope.kind === "operator" ? scope.operatorId : undefined, skip: (page - 1) * pageSize, take: pageSize });
      return { ...result, page, pageSize, pages: Math.max(1, Math.ceil(result.total / pageSize)) };
    }
  };
}
