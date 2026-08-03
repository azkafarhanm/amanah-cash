import {
  PROFILE_PHOTO_INPUT_MIME_TYPES,
  type DecodedImageMetadata,
  type ProfilePhotoInputMimeType
} from "@/media/types";

export const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_PROFILE_PHOTO_DIMENSION = 8_192;
export const MAX_PROFILE_PHOTO_PIXELS = 25_000_000;

const allowedMimeTypes = new Set<string>(PROFILE_PHOTO_INPUT_MIME_TYPES);

export type ProfilePhotoValidationCode =
  | "EMPTY_FILE"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_MIME_TYPE"
  | "MIME_TYPE_MISMATCH"
  | "INVALID_DIMENSIONS"
  | "DIMENSIONS_TOO_LARGE"
  | "PIXEL_COUNT_TOO_LARGE"
  | "ANIMATED_IMAGE"
  | "INVALID_IMAGE"
  | "INVALID_CROP";

export class ProfilePhotoValidationError extends Error {
  constructor(public readonly code: ProfilePhotoValidationCode) {
    super(code);
    this.name = "ProfilePhotoValidationError";
  }
}

export function validateProfilePhotoEnvelope(input: {
  byteSize: number;
  declaredMimeType: string;
}): ProfilePhotoInputMimeType {
  if (!Number.isSafeInteger(input.byteSize) || input.byteSize <= 0) {
    throw new ProfilePhotoValidationError("EMPTY_FILE");
  }
  if (input.byteSize > MAX_PROFILE_PHOTO_BYTES) {
    throw new ProfilePhotoValidationError("FILE_TOO_LARGE");
  }
  if (!allowedMimeTypes.has(input.declaredMimeType)) {
    throw new ProfilePhotoValidationError("UNSUPPORTED_MIME_TYPE");
  }
  return input.declaredMimeType as ProfilePhotoInputMimeType;
}

export function validateDecodedProfilePhoto(
  declaredMimeType: ProfilePhotoInputMimeType,
  metadata: DecodedImageMetadata
): DecodedImageMetadata {
  if (metadata.detectedMimeType !== declaredMimeType) {
    throw new ProfilePhotoValidationError("MIME_TYPE_MISMATCH");
  }
  if (
    !Number.isSafeInteger(metadata.width)
    || !Number.isSafeInteger(metadata.height)
    || metadata.width <= 0
    || metadata.height <= 0
  ) {
    throw new ProfilePhotoValidationError("INVALID_DIMENSIONS");
  }
  if (
    metadata.width > MAX_PROFILE_PHOTO_DIMENSION
    || metadata.height > MAX_PROFILE_PHOTO_DIMENSION
  ) {
    throw new ProfilePhotoValidationError("DIMENSIONS_TOO_LARGE");
  }
  if (metadata.width * metadata.height > MAX_PROFILE_PHOTO_PIXELS) {
    throw new ProfilePhotoValidationError("PIXEL_COUNT_TOO_LARGE");
  }
  if (metadata.animated) {
    throw new ProfilePhotoValidationError("ANIMATED_IMAGE");
  }
  return metadata;
}
