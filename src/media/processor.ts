import sharp from "sharp";
import type {
  DecodedImageMetadata,
  ProfilePhotoInputMimeType,
  ProfilePhotoRenditionWidth,
  ProfilePhotoSource
} from "@/media/types";
import type { ProfilePhotoProcessor } from "@/media/service";
import { PROFILE_PHOTO_RENDITION_WIDTHS } from "@/media/types";
import {
  ProfilePhotoValidationError,
  validateDecodedProfilePhoto,
  validateProfilePhotoEnvelope
} from "@/media/validation";

const SHARP_MIME: Partial<Record<string, ProfilePhotoInputMimeType>> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp"
};

function cropPixels(crop: ProfilePhotoSource["crop"], width: number, height: number) {
  if (![crop.left, crop.top, crop.size].every(Number.isFinite)
    || crop.left < 0 || crop.top < 0 || crop.size <= 0
    || crop.left > 1 || crop.top > 1 || crop.size > 1) {
    throw new ProfilePhotoValidationError("INVALID_CROP");
  }
  const left = Math.floor(crop.left * width);
  const top = Math.floor(crop.top * height);
  const size = Math.max(1, Math.round(crop.size * Math.min(width, height)));
  if (size <= 0 || left + size > width || top + size > height) {
    throw new ProfilePhotoValidationError("INVALID_CROP");
  }
  return { left, top, width: size, height: size };
}

export class SharpProfilePhotoProcessor implements ProfilePhotoProcessor {
  async normalize(source: ProfilePhotoSource) {
    const declaredMimeType = validateProfilePhotoEnvelope({
      byteSize: source.bytes.byteLength,
      declaredMimeType: source.declaredMimeType
    });
    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(source.bytes, { animated: true, limitInputPixels: false }).metadata();
    } catch {
      throw new ProfilePhotoValidationError("INVALID_IMAGE");
    }
    const detectedMimeType = SHARP_MIME[metadata.format ?? ""];
    if (!detectedMimeType) throw new ProfilePhotoValidationError("UNSUPPORTED_MIME_TYPE");
    const decoded: DecodedImageMetadata = {
      detectedMimeType,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      animated: (metadata.pages ?? 1) > 1
    };
    validateDecodedProfilePhoto(declaredMimeType, decoded);
    let oriented: Buffer;
    try {
      oriented = await sharp(source.bytes, { limitInputPixels: 25_000_000 }).rotate().toBuffer();
    } catch {
      throw new ProfilePhotoValidationError("INVALID_IMAGE");
    }
    const orientedMetadata = await sharp(oriented).metadata();
    const extract = cropPixels(
      source.crop,
      orientedMetadata.width ?? decoded.width,
      orientedMetadata.height ?? decoded.height
    );
    const renditions = await Promise.all(PROFILE_PHOTO_RENDITION_WIDTHS.map(async (width) => ({
      width: width as ProfilePhotoRenditionWidth,
      height: width as ProfilePhotoRenditionWidth,
      contentType: "image/webp" as const,
      bytes: new Uint8Array(await sharp(oriented, { limitInputPixels: 25_000_000 })
        .extract(extract)
        .resize(width, width, { fit: "fill", withoutEnlargement: false })
        .toColourspace("srgb")
        .webp({ quality: 80, effort: 4 })
        .toBuffer())
    })));
    return { source: { ...decoded, byteSize: source.bytes.byteLength }, renditions };
  }
}
