import { loadAuthenticationEnvironment } from "@/auth/environment";
import { createProfilePhotoMediaService } from "@/media/service";
import { SharpProfilePhotoProcessor } from "@/media/processor";
import { createStudentPhotoUpload, type StudentPhotoRepository } from "@/media/student-photo";
import { VercelBlobStorage } from "@/media/vercel-blob-storage";
import { getPrismaClient } from "@/persistence/prisma";

const developmentDiagnostics = process.env.NODE_ENV !== "production";

function logStage(stage: string) {
  if (developmentDiagnostics) console.info(`[student-photo][service] ${stage}`);
}

function logException(error: unknown, origin: string) {
  if (!developmentDiagnostics) return;
  const exception = error instanceof Error ? error : new Error(String(error));
  console.error("[student-photo][service] exception", {
    class: exception.constructor.name,
    message: exception.message,
    stack: exception.stack,
    origin
  });
}

export function studentPhotoUploadService() {
  const prisma = getPrismaClient(loadAuthenticationEnvironment());
  const repository: StudentPhotoRepository = {
    current: (studentId, operatorId) => prisma.student.findFirst({
      where: { id: studentId, operatorId },
      select: { photoObjectKey: true, photoUpdatedAt: true }
    }),
    async replace(input) {
      logStage("Prisma update started");
      try {
        const result = await prisma.student.updateMany({
          where: {
            id: input.studentId,
            operatorId: input.operatorId,
            photoObjectKey: input.previousObjectKey
          },
          data: { photoObjectKey: input.objectKey, photoUpdatedAt: input.updatedAt }
        });
        logStage("Prisma update succeeded");
        return result.count === 1;
      } catch (error) {
        logException(error, "src/media/student-photo-service.ts:StudentPhotoRepository.replace");
        throw error;
      }
    }
  };
  const storage = new VercelBlobStorage(process.env.BLOB_READ_WRITE_TOKEN ?? "");
  const processor = new SharpProfilePhotoProcessor();
  return createStudentPhotoUpload(
    repository,
    createProfilePhotoMediaService({
      async normalize(source) {
        logStage("Sharp processing started");
        try {
          const photo = await processor.normalize(source);
          logStage("validation completed");
          logStage("Sharp processing completed");
          return photo;
        } catch (error) {
          logException(error, "src/media/student-photo-service.ts:ProfilePhotoProcessor.normalize");
          throw error;
        }
      }
    }, storage)
  );
}
