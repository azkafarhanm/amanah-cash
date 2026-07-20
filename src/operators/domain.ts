import { normalizeGoogleEmail } from "@/auth/admission";

export const OPERATOR_PAGE_SIZE = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type OperatorStatus = "active" | "inactive";
export type OperatorRecord = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  deletedAt: Date | null;
  assignedStudentCount: number;
};

export type OperatorAuditRecord = {
  action: string;
  summary: string;
  createdAt: Date;
};

export class OperatorManagementError extends Error {
  constructor(
    public readonly code: "VALIDATION" | "DUPLICATE_EMAIL" | "NOT_FOUND" | "ASSIGNED_STUDENTS",
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "OperatorManagementError";
  }
}

export type OperatorRepository = {
  findByEmail(email: string): Promise<{ id: string } | null>;
  create(data: { name: string; email: string }): Promise<OperatorRecord>;
  find(id: string): Promise<OperatorRecord | null>;
  update(id: string, data: { name?: string; isActive?: boolean; deletedAt?: Date }): Promise<OperatorRecord>;
  revokeSessions(id: string): Promise<void>;
  audit(data: { operatorId: string; actorId: string; action: string; summary: string }): Promise<void>;
  audits(id: string): Promise<OperatorAuditRecord[]>;
  list(input: { search: string; status?: OperatorStatus; skip: number; take: number }): Promise<{ items: OperatorRecord[]; total: number }>;
};

function nameValue(value: unknown) {
  if (typeof value !== "string") throw new OperatorManagementError("VALIDATION", "Nama lengkap wajib diisi.", 400);
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 100) {
    throw new OperatorManagementError("VALIDATION", "Nama lengkap harus terdiri dari 2–100 karakter.", 400);
  }
  return name;
}

function emailValue(value: unknown) {
  if (typeof value !== "string") throw new OperatorManagementError("VALIDATION", "Email Google wajib diisi.", 400);
  const email = normalizeGoogleEmail(value);
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw new OperatorManagementError("VALIDATION", "Masukkan alamat email Google yang valid.", 400);
  }
  return email;
}

export function createOperatorManagement(repository: OperatorRepository) {
  async function requireOperator(id: string) {
    if (!id) throw new OperatorManagementError("NOT_FOUND", "Operator tidak ditemukan.", 404);
    const operator = await repository.find(id);
    if (!operator || operator.deletedAt) throw new OperatorManagementError("NOT_FOUND", "Operator tidak ditemukan.", 404);
    return operator;
  }

  return {
    async create(input: { name: unknown; email: unknown }, actorId: string) {
      const name = nameValue(input.name);
      const email = emailValue(input.email);
      if (await repository.findByEmail(email)) {
        throw new OperatorManagementError("DUPLICATE_EMAIL", "Email tersebut sudah terdaftar.", 409);
      }
      const operator = await repository.create({ name, email });
      await repository.audit({ operatorId: operator.id, actorId, action: "CREATED", summary: "Akun operator dibuat dalam status tidak aktif." });
      return operator;
    },

    async edit(id: string, input: { name: unknown; isActive: unknown }, actorId: string) {
      const current = await requireOperator(id);
      const name = nameValue(input.name);
      if (typeof input.isActive !== "boolean") {
        throw new OperatorManagementError("VALIDATION", "Status operator tidak valid.", 400);
      }
      if (!input.isActive && current.assignedStudentCount > 0) {
        throw new OperatorManagementError("ASSIGNED_STUDENTS", `Operator masih menangani ${current.assignedStudentCount} siswa. Pindahkan penugasan sebelum menonaktifkan akun.`, 409);
      }
      const action = current.isActive === input.isActive ? "UPDATED" : input.isActive ? "ACTIVATED" : "DEACTIVATED";
      const updated = await repository.update(id, { name, isActive: input.isActive });
      if (!input.isActive) await repository.revokeSessions(id);
      await repository.audit({ operatorId: id, actorId, action, summary: action === "UPDATED" ? "Nama operator diperbarui." : input.isActive ? "Akun operator diaktifkan." : "Akun operator dinonaktifkan." });
      return updated;
    },

    async remove(id: string, actorId: string) {
      const current = await requireOperator(id);
      if (current.assignedStudentCount > 0) {
        throw new OperatorManagementError("ASSIGNED_STUDENTS", `Operator masih memiliki ${current.assignedStudentCount} siswa. Operator tidak dapat dihapus sebelum seluruh penugasan dipindahkan.`, 409);
      }
      await repository.update(id, { isActive: false, deletedAt: new Date() });
      await repository.revokeSessions(id);
      await repository.audit({ operatorId: id, actorId, action: "DELETED", summary: "Akun operator dihapus secara logis; riwayat audit dipertahankan." });
    },

    detail: requireOperator,
    audits: repository.audits,
    async list(input: { search?: unknown; status?: unknown; page?: unknown }) {
      const search = typeof input.search === "string" ? input.search.trim().slice(0, 100) : "";
      const status = input.status === "active" || input.status === "inactive" ? input.status : undefined;
      const numericPage = typeof input.page === "number" ? input.page : Number(input.page ?? 1);
      const page = Number.isSafeInteger(numericPage) && numericPage > 0 ? numericPage : 1;
      const result = await repository.list({ search, status, skip: (page - 1) * OPERATOR_PAGE_SIZE, take: OPERATOR_PAGE_SIZE });
      return { ...result, page, pages: Math.max(1, Math.ceil(result.total / OPERATOR_PAGE_SIZE)) };
    }
  };
}
