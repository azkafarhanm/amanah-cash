import assert from "node:assert/strict";
import { test } from "node:test";
import { STUDENT_PROFILE_PHOTO_UI_ENABLED } from "../src/media/feature";
import { createStudentProfilePhotoObjectKeys } from "../src/media/object-keys";
import {
  MAX_PROFILE_PHOTO_BYTES,
  ProfilePhotoValidationError,
  validateDecodedProfilePhoto,
  validateProfilePhotoEnvelope
} from "../src/media/validation";

test("Profile Photo Phase 2.1 remains internal and UI-disabled", () => {
  assert.equal(STUDENT_PROFILE_PHOTO_UI_ENABLED, false);
});

test("profile photo envelope validation accepts only approved formats and size", () => {
  assert.equal(validateProfilePhotoEnvelope({ byteSize: MAX_PROFILE_PHOTO_BYTES, declaredMimeType: "image/jpeg" }), "image/jpeg");
  assert.equal(validateProfilePhotoEnvelope({ byteSize: 1, declaredMimeType: "image/png" }), "image/png");
  assert.equal(validateProfilePhotoEnvelope({ byteSize: 1, declaredMimeType: "image/webp" }), "image/webp");

  for (const input of [
    { byteSize: 0, declaredMimeType: "image/jpeg", code: "EMPTY_FILE" },
    { byteSize: MAX_PROFILE_PHOTO_BYTES + 1, declaredMimeType: "image/jpeg", code: "FILE_TOO_LARGE" },
    { byteSize: 1, declaredMimeType: "image/svg+xml", code: "UNSUPPORTED_MIME_TYPE" }
  ]) {
    assert.throws(
      () => validateProfilePhotoEnvelope(input),
      (error) => error instanceof ProfilePhotoValidationError && error.code === input.code
    );
  }
});

test("decoded profile photo validation rejects mismatches, animation, and unsafe dimensions", () => {
  assert.deepEqual(
    validateDecodedProfilePhoto("image/webp", {
      detectedMimeType: "image/webp",
      width: 512,
      height: 512,
      animated: false
    }),
    { detectedMimeType: "image/webp", width: 512, height: 512, animated: false }
  );

  const invalid = [
    { metadata: { detectedMimeType: "image/png" as const, width: 512, height: 512, animated: false }, code: "MIME_TYPE_MISMATCH" },
    { metadata: { detectedMimeType: "image/webp" as const, width: 0, height: 512, animated: false }, code: "INVALID_DIMENSIONS" },
    { metadata: { detectedMimeType: "image/webp" as const, width: 8193, height: 1, animated: false }, code: "DIMENSIONS_TOO_LARGE" },
    { metadata: { detectedMimeType: "image/webp" as const, width: 6000, height: 6000, animated: false }, code: "PIXEL_COUNT_TOO_LARGE" },
    { metadata: { detectedMimeType: "image/webp" as const, width: 512, height: 512, animated: true }, code: "ANIMATED_IMAGE" }
  ];
  for (const input of invalid) {
    assert.throws(
      () => validateDecodedProfilePhoto("image/webp", input.metadata),
      (error) => error instanceof ProfilePhotoValidationError && error.code === input.code
    );
  }
});

test("profile photo object keys are immutable, random, and contain no subject data", () => {
  const keys = createStudentProfilePhotoObjectKeys(() => "123e4567-e89b-12d3-a456-426614174000");
  assert.equal(keys.family, "profile-photos/students/123e4567-e89b-12d3-a456-426614174000");
  assert.deepEqual(keys.renditions, {
    64: `${keys.family}/64.webp`,
    96: `${keys.family}/96.webp`,
    128: `${keys.family}/128.webp`,
    512: `${keys.family}/512.webp`
  });
});
