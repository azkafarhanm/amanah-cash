import type {
  NormalizedProfilePhoto,
  ProfilePhotoSource,
  StoredProfilePhoto
} from "@/media/types";
import type { MediaStorage } from "@/media/storage";
import { createStudentProfilePhotoObjectKeys } from "@/media/object-keys";

/** Image-decoder/normalizer port. A concrete processor is deferred to Phase 2.2. */
export interface ProfilePhotoProcessor {
  normalize(source: ProfilePhotoSource): Promise<NormalizedProfilePhoto>;
}

/**
 * Internal application boundary for future Student photo workflows.
 * No route, UI, persistence implementation, or storage adapter is connected in Phase 2.1.
 */
export interface ProfilePhotoMediaService {
  prepare(source: ProfilePhotoSource): Promise<NormalizedProfilePhoto>;
  store(photo: NormalizedProfilePhoto): Promise<StoredProfilePhoto>;
}

export function createProfilePhotoMediaService(
  processor: ProfilePhotoProcessor,
  storage: MediaStorage,
  now: () => Date = () => new Date()
): ProfilePhotoMediaService & { discard(photo: StoredProfilePhoto): Promise<void> } {
  return {
    prepare: (source) => processor.normalize(source),
    async store(photo) {
      const keys = createStudentProfilePhotoObjectKeys();
      const written: string[] = [];
      try {
        for (const rendition of photo.renditions) {
          const key = keys.renditions[rendition.width];
          await storage.put({
            key,
            bytes: rendition.bytes,
            contentType: rendition.contentType,
            cacheControlMaxAgeSeconds: 31_536_000
          });
          written.push(key);
        }
      } catch (error) {
        if (written.length) await storage.delete(written).catch(() => undefined);
        throw error;
      }
      return { objectFamilyKey: keys.family, renditionKeys: keys.renditions, storedAt: now() };
    },
    async discard(photo) {
      await storage.delete(Object.values(photo.renditionKeys));
    }
  };
}
