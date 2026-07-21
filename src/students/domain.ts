export const STUDENT_PAGE_SIZE = 10;
export type StudentStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type StudentScope = { kind: "admin" } | { kind: "operator"; operatorId: string };

export type StudentRecord = {
  id: string;
  name: string;
  notes: string | null;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
  operator: { id: string; name: string; email: string };
};

export type StudentOperatorOption = { id: string; name: string; email: string };

export class StudentManagementError extends Error {
  constructor(
    public readonly code: "VALIDATION" | "DUPLICATE_NAME" | "NOT_FOUND" | "INVALID_OPERATOR" | "CONFLICT",
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
  list(input: { search: string; status?: StudentStatus; operatorId?: string; skip: number; take: number }): Promise<{ items: StudentRecord[]; total: number }>;
};

const STATUSES = new Set<StudentStatus>(["ACTIVE", "INACTIVE", "ARCHIVED"]);

function nameValue(value: unknown) {
  if (typeof value !== "string") throw new StudentManagementError("VALIDATION", "Nama lengkap wajib diisi.", 400);
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > 100) throw new StudentManagementError("VALIDATION", "Nama harus terdiri dari 1–100 karakter.", 400);
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
  if (reason.length < 1 || reason.length > 500) {
    throw new StudentManagementError("VALIDATION", "Alasan perpindahan Operator harus terdiri dari 1–500 karakter.", 400);
  }
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

  return {
    activeOperators: repository.activeOperators,
    async create(input: { name: unknown; notes: unknown; status: unknown; operatorId: unknown }) {
      return repository.create({ id: crypto.randomUUID(), ...(await inputValues(input)) });
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
      return repository.update(id, values, current.operator.id, ownershipTransfer);
    },
    async detail(id: string, scope: StudentScope) {
      if (!id) throw new StudentManagementError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
      const student = await repository.find(id, scope.kind === "operator" ? scope.operatorId : undefined);
      if (!student) throw new StudentManagementError("NOT_FOUND", "Siswa tidak ditemukan.", 404);
      return student;
    },
    async list(scope: StudentScope, input: { search?: unknown; status?: unknown; page?: unknown }) {
      const search = typeof input.search === "string" ? input.search.trim().slice(0, 100) : "";
      const status = typeof input.status === "string" && STATUSES.has(input.status as StudentStatus) ? input.status as StudentStatus : undefined;
      const numericPage = typeof input.page === "number" ? input.page : Number(input.page ?? 1);
      const page = Number.isSafeInteger(numericPage) && numericPage > 0 ? numericPage : 1;
      const result = await repository.list({ search, status, operatorId: scope.kind === "operator" ? scope.operatorId : undefined, skip: (page - 1) * STUDENT_PAGE_SIZE, take: STUDENT_PAGE_SIZE });
      return { ...result, page, pages: Math.max(1, Math.ceil(result.total / STUDENT_PAGE_SIZE)) };
    }
  };
}
