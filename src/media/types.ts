export const PROFILE_PHOTO_INPUT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
] as const;

export type ProfilePhotoInputMimeType = typeof PROFILE_PHOTO_INPUT_MIME_TYPES[number];
export type ProfilePhotoOutputMimeType = "image/webp";

export const PROFILE_PHOTO_RENDITION_WIDTHS = [64, 96, 128, 512] as const;
export type ProfilePhotoRenditionWidth = typeof PROFILE_PHOTO_RENDITION_WIDTHS[number];

export type ProfilePhotoSource = Readonly<{
  bytes: Uint8Array;
  declaredMimeType: string;
}>;

export type DecodedImageMetadata = Readonly<{
  detectedMimeType: ProfilePhotoInputMimeType;
  width: number;
  height: number;
  animated: boolean;
}>;

export type NormalizedProfilePhotoRendition = Readonly<{
  width: ProfilePhotoRenditionWidth;
  height: ProfilePhotoRenditionWidth;
  contentType: ProfilePhotoOutputMimeType;
  bytes: Uint8Array;
}>;

export type NormalizedProfilePhoto = Readonly<{
  source: DecodedImageMetadata & { byteSize: number };
  renditions: ReadonlyArray<NormalizedProfilePhotoRendition>;
}>;

export type StoredProfilePhoto = Readonly<{
  objectFamilyKey: string;
  renditionKeys: Readonly<Record<ProfilePhotoRenditionWidth, string>>;
  storedAt: Date;
}>;
