import {
  PROFILE_PHOTO_RENDITION_WIDTHS,
  type ProfilePhotoRenditionWidth
} from "@/media/types";

const PROFILE_PHOTO_PREFIX = "profile-photos/students";

export type ProfilePhotoObjectKeySet = Readonly<{
  family: string;
  renditions: Readonly<Record<ProfilePhotoRenditionWidth, string>>;
}>;

export function createStudentProfilePhotoObjectKeys(
  randomId: () => string = () => crypto.randomUUID()
): ProfilePhotoObjectKeySet {
  const id = randomId();
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new Error("INVALID_MEDIA_OBJECT_ID");
  }
  const family = `${PROFILE_PHOTO_PREFIX}/${id}`;
  const renditions = Object.fromEntries(
    PROFILE_PHOTO_RENDITION_WIDTHS.map((width) => [width, `${family}/${width}.webp`])
  ) as Record<ProfilePhotoRenditionWidth, string>;
  return { family, renditions };
}
