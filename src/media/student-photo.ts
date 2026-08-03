import type { ProfilePhotoCrop, ProfilePhotoMediaService, StoredProfilePhoto } from "@/media";

export type StudentPhotoReference = Readonly<{
  photoObjectKey: string | null;
  photoUpdatedAt: Date | null;
}>;

export interface StudentPhotoRepository {
  current(studentId: string, operatorId: string): Promise<StudentPhotoReference | null>;
  replace(input: {
    studentId: string;
    operatorId: string;
    previousObjectKey: string | null;
    objectKey: string;
    updatedAt: Date;
  }): Promise<boolean>;
}

export class StudentPhotoUploadError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "CONFLICT" | "STORAGE" | "PERSISTENCE",
    message: string
  ) {
    super(message);
    this.name = "StudentPhotoUploadError";
  }
}

export function createStudentPhotoUpload(
  repository: StudentPhotoRepository,
  media: ProfilePhotoMediaService & { discard(photo: StoredProfilePhoto): Promise<void> }
) {
  return async (input: {
    studentId: string;
    operatorId: string;
    bytes: Uint8Array;
    declaredMimeType: string;
    crop: ProfilePhotoCrop;
  }) => {
    const current = await repository.current(input.studentId, input.operatorId);
    if (!current) throw new StudentPhotoUploadError("NOT_FOUND", "Siswa tidak ditemukan.");

    const normalized = await media.prepare({
      bytes: input.bytes,
      declaredMimeType: input.declaredMimeType,
      crop: input.crop
    });
    let stored: StoredProfilePhoto;
    try {
      stored = await media.store(normalized);
    } catch {
      throw new StudentPhotoUploadError("STORAGE", "Foto belum dapat disimpan. Silakan coba lagi.");
    }

    try {
      const replaced = await repository.replace({
        studentId: input.studentId,
        operatorId: input.operatorId,
        previousObjectKey: current.photoObjectKey,
        objectKey: stored.objectFamilyKey,
        updatedAt: stored.storedAt
      });
      if (!replaced) {
        await media.discard(stored).catch(() => undefined);
        throw new StudentPhotoUploadError("CONFLICT", "Foto Siswa telah berubah. Muat ulang lalu coba lagi.");
      }
      return stored;
    } catch (error) {
      if (error instanceof StudentPhotoUploadError) throw error;
      await media.discard(stored).catch(() => undefined);
      throw new StudentPhotoUploadError("PERSISTENCE", "Foto belum dapat disimpan. Silakan coba lagi.");
    }
  };
}
