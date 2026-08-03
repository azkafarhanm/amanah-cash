import type {
  NormalizedProfilePhoto,
  ProfilePhotoSource,
  StoredProfilePhoto
} from "@/media/types";

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
