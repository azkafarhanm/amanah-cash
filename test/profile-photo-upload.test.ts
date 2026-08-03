import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { SharpProfilePhotoProcessor } from "../src/media/processor";
import { createProfilePhotoMediaService } from "../src/media/service";
import { createStudentPhotoUpload, StudentPhotoUploadError } from "../src/media/student-photo";
import type { MediaStorage, StoreMediaObjectInput } from "../src/media/storage";
import type { StudentPhotoRepository } from "../src/media/student-photo";
import { ProfilePhotoValidationError } from "../src/media/validation";
import { VercelBlobStorage } from "../src/media/vercel-blob-storage";

class RecordingStorage implements MediaStorage {
  writes: StoreMediaObjectInput[] = [];
  deleted: string[][] = [];
  async put(input: StoreMediaObjectInput) {
    this.writes.push(input);
    return { key: input.key, contentType: input.contentType, byteSize: input.bytes.byteLength, etag: input.key };
  }
  async get() { return null; }
  async delete(keys: ReadonlyArray<string>) { this.deleted.push([...keys]); }
}

async function jpeg(width = 800, height = 600) {
  return new Uint8Array(await sharp({
    create: { width, height, channels: 3, background: { r: 50, g: 100, b: 150 } }
  }).jpeg().toBuffer());
}

function repository(initialKey: string | null = null) {
  let record = { photoObjectKey: initialKey, photoUpdatedAt: initialKey ? new Date(0) : null };
  const writes: Array<{ previousObjectKey: string | null; objectKey: string; updatedAt: Date }> = [];
  const repo: StudentPhotoRepository = {
    async current(studentId, operatorId) {
      return studentId === "student-1" && operatorId === "operator-1" ? record : null;
    },
    async replace(input) {
      if (record.photoObjectKey !== input.previousObjectKey) return false;
      writes.push(input);
      record = { photoObjectKey: input.objectKey, photoUpdatedAt: input.updatedAt };
      return true;
    }
  };
  return { repo, writes, current: () => record };
}

test("successful Student photo upload normalizes approved renditions and persists only the family key", async () => {
  const storage = new RecordingStorage();
  const state = repository();
  const upload = createStudentPhotoUpload(
    state.repo,
    createProfilePhotoMediaService(new SharpProfilePhotoProcessor(), storage, () => new Date("2026-08-03T02:00:00Z"))
  );
  const result = await upload({
    studentId: "student-1",
    operatorId: "operator-1",
    bytes: await jpeg(),
    declaredMimeType: "image/jpeg",
    crop: { left: 0.125, top: 0, size: 1 }
  });

  assert.equal(storage.writes.length, 4);
  assert.deepEqual(storage.writes.map((write) => write.key.split("/").at(-1)), ["64.webp", "96.webp", "128.webp", "512.webp"]);
  assert.ok(storage.writes.every((write) => write.contentType === "image/webp"));
  assert.equal(state.writes.length, 1);
  assert.equal(state.current().photoObjectKey, result.objectFamilyKey);
  assert.equal(state.current().photoUpdatedAt?.toISOString(), "2026-08-03T02:00:00.000Z");
});

test("server validation rejects MIME mismatch and invalid crop before persistence", async () => {
  const cases = [
    { bytes: await jpeg(), mime: "image/png", crop: { left: 0, top: 0, size: 1 }, code: "MIME_TYPE_MISMATCH" },
    { bytes: await jpeg(), mime: "image/jpeg", crop: { left: -1, top: 0, size: 1 }, code: "INVALID_CROP" }
  ];
  for (const candidate of cases) {
    const storage = new RecordingStorage();
    const state = repository();
    const upload = createStudentPhotoUpload(state.repo, createProfilePhotoMediaService(new SharpProfilePhotoProcessor(), storage));
    await assert.rejects(
      upload({ studentId: "student-1", operatorId: "operator-1", bytes: candidate.bytes, declaredMimeType: candidate.mime, crop: candidate.crop }),
      (error) => error instanceof ProfilePhotoValidationError && error.code === candidate.code
    );
    assert.equal(storage.writes.length, 0);
    assert.equal(state.writes.length, 0);
  }
});

test("replacement writes a new immutable family and does not delete the previous objects", async () => {
  const storage = new RecordingStorage();
  const state = repository("profile-photos/students/old-family");
  const upload = createStudentPhotoUpload(state.repo, createProfilePhotoMediaService(new SharpProfilePhotoProcessor(), storage));
  const result = await upload({
    studentId: "student-1", operatorId: "operator-1", bytes: await jpeg(), declaredMimeType: "image/jpeg",
    crop: { left: 0.125, top: 0, size: 1 }
  });
  assert.notEqual(result.objectFamilyKey, "profile-photos/students/old-family");
  assert.equal(state.writes[0]?.previousObjectKey, "profile-photos/students/old-family");
  assert.deepEqual(storage.deleted, []);
});

test("failed persistence leaves the Student reference unchanged and rolls back newly written objects through MediaStorage", async () => {
  const storage = new RecordingStorage();
  const repo: StudentPhotoRepository = {
    async current() { return { photoObjectKey: null, photoUpdatedAt: null }; },
    async replace() { throw new Error("database unavailable"); }
  };
  const upload = createStudentPhotoUpload(repo, createProfilePhotoMediaService(new SharpProfilePhotoProcessor(), storage));
  await assert.rejects(
    upload({ studentId: "student-1", operatorId: "operator-1", bytes: await jpeg(), declaredMimeType: "image/jpeg", crop: { left: 0.125, top: 0, size: 1 } }),
    (error) => error instanceof StudentPhotoUploadError && error.code === "PERSISTENCE"
  );
  assert.equal(storage.writes.length, 4);
  assert.equal(storage.deleted.length, 1);
  assert.equal(storage.deleted[0]?.length, 4);
});

test("Student photo upload controls exist only in Student Detail and broad avatar integration stays disabled", async () => {
  const fs = await import("node:fs/promises");
  const [detail, upload, feature] = await Promise.all([
    fs.readFile("src/components/students/student-detail.tsx", "utf8"),
    fs.readFile("src/components/students/student-photo-upload.tsx", "utf8"),
    fs.readFile("src/media/feature.ts", "utf8")
  ]);
  assert.match(detail, /StudentPhotoUpload/);
  assert.match(upload, /cropFor/);
  assert.match(upload, /Simpan foto/);
  assert.match(feature, /STUDENT_PROFILE_PHOTO_UI_ENABLED = false/);
  assert.match(feature, /STUDENT_PROFILE_PHOTO_UPLOAD_ENABLED = true/);
});

test("Vercel Blob remains a provider adapter behind the MediaStorage contract", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const request = async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    if (init?.method === "PUT") {
      return Response.json({
        url: "https://private.example.test/profile.webp",
        pathname: "profile-photos/students/family/64.webp"
      });
    }
    if (url.includes("?prefix=")) {
      return Response.json({ blobs: [{
        url: "https://private.example.test/profile.webp",
        pathname: "profile-photos/students/family/64.webp"
      }] });
    }
    return new Response(new Uint8Array([1, 2, 3]), {
      headers: { "content-type": "image/webp", etag: "test-etag" }
    });
  };
  const storage: MediaStorage = new VercelBlobStorage("server-only-token", request as typeof fetch);
  await storage.put({
    key: "profile-photos/students/family/64.webp",
    bytes: new Uint8Array([1, 2, 3]),
    contentType: "image/webp",
    cacheControlMaxAgeSeconds: 31_536_000
  });
  assert.equal(calls[0]?.init?.method, "PUT");
  assert.equal(new Headers(calls[0]?.init?.headers).get("authorization"), "Bearer server-only-token");
  assert.equal(new Headers(calls[0]?.init?.headers).get("x-vercel-blob-access"), "private");
  assert.equal(new Headers(calls[0]?.init?.headers).get("x-add-random-suffix"), "0");
  assert.equal((await storage.get("profile-photos/students/family/64.webp"))?.etag, "test-etag");
});
