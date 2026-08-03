import { createHash } from "node:crypto";
import type { MediaStorage, MediaStorageObject, StoreMediaObjectInput } from "@/media/storage";
import { PROFILE_PHOTO_RENDITION_WIDTHS } from "@/media/types";

type BlobWriteResponse = { url?: string; pathname?: string; contentType?: string };
type BlobListResponse = { blobs?: Array<{ url?: string; pathname?: string }> };
const developmentDiagnostics = process.env.NODE_ENV !== "production";

/** Provider adapter; the media application service depends only on MediaStorage. */
export class VercelBlobStorage implements MediaStorage {
  private readonly urls = new Map<string, string>();
  private successfulPuts = 0;

  constructor(
    private readonly token: string,
    private readonly request: typeof fetch = fetch
  ) {
    if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is required for profile photo uploads.");
  }

  async put(input: StoreMediaObjectInput) {
    if (developmentDiagnostics && this.successfulPuts === 0) {
      console.info("[student-photo][vercel-blob] first put() called");
    }
    try {
      const response = await this.request(`https://blob.vercel-storage.com/${input.key}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${this.token}`,
          "content-type": input.contentType,
          "x-content-type": input.contentType,
          "x-vercel-blob-access": "private",
          "x-api-version": "7",
          "x-add-random-suffix": "0",
          "x-cache-control-max-age": String(input.cacheControlMaxAgeSeconds)
        },
        body: input.bytes as BodyInit
      });
      if (!response.ok) {
        const providerResponse = developmentDiagnostics ? await response.text() : "";
        throw new Error(
          `MEDIA_STORAGE_WRITE_FAILED (${response.status} ${response.statusText})${providerResponse ? `: ${providerResponse}` : ""}`
        );
      }
      const result = await response.json() as BlobWriteResponse;
      if (!result.url || result.pathname !== input.key) throw new Error("MEDIA_STORAGE_INVALID_RESPONSE");
      this.urls.set(input.key, result.url);
      this.successfulPuts += 1;
      if (developmentDiagnostics && this.successfulPuts === 1) {
        console.info("[student-photo][vercel-blob] first put() succeeded");
      }
      if (developmentDiagnostics && this.successfulPuts === PROFILE_PHOTO_RENDITION_WIDTHS.length) {
        console.info("[student-photo][vercel-blob] all renditions uploaded");
      }
      return {
        key: input.key,
        contentType: input.contentType,
        byteSize: input.bytes.byteLength,
        etag: createHash("sha256").update(input.bytes).digest("hex")
      };
    } catch (error) {
      if (developmentDiagnostics) {
        const exception = error instanceof Error ? error : new Error(String(error));
        console.error("[student-photo][vercel-blob] exception", {
          class: exception.constructor.name,
          message: exception.message,
          stack: exception.stack,
          origin: "src/media/vercel-blob-storage.ts:VercelBlobStorage.put"
        });
      }
      throw error;
    }
  }

  async get(key: string): Promise<MediaStorageObject | null> {
    const url = await this.resolveUrl(key);
    if (!url) return null;
    const response = await this.request(url, { headers: { authorization: `Bearer ${this.token}` } });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("MEDIA_STORAGE_READ_FAILED");
    const bytes = new Uint8Array(await response.arrayBuffer());
    return {
      key,
      bytes,
      contentType: response.headers.get("content-type") ?? "application/octet-stream",
      etag: response.headers.get("etag") ?? createHash("sha256").update(bytes).digest("hex")
    };
  }

  async delete(keys: ReadonlyArray<string>) {
    const urls = (await Promise.all(keys.map((key) => this.resolveUrl(key))))
      .filter((url): url is string => Boolean(url));
    if (!urls.length) return;
    const response = await this.request("https://blob.vercel-storage.com/delete", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
        "x-api-version": "7"
      },
      body: JSON.stringify({ urls })
    });
    if (!response.ok) throw new Error("MEDIA_STORAGE_DELETE_FAILED");
    keys.forEach((key) => this.urls.delete(key));
  }

  private async resolveUrl(key: string): Promise<string | null> {
    const known = this.urls.get(key);
    if (known) return known;
    const response = await this.request(
      `https://blob.vercel-storage.com?prefix=${encodeURIComponent(key)}&limit=1`,
      { headers: { authorization: `Bearer ${this.token}`, "x-api-version": "7" } }
    );
    if (!response.ok) throw new Error("MEDIA_STORAGE_LIST_FAILED");
    const result = await response.json() as BlobListResponse;
    const match = result.blobs?.find((blob) => blob.pathname === key && blob.url);
    if (!match?.url) return null;
    this.urls.set(key, match.url);
    return match.url;
  }
}
