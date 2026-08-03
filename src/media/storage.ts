export type MediaStorageObject = Readonly<{
  key: string;
  bytes: Uint8Array;
  contentType: string;
  etag: string;
}>;

export type StoreMediaObjectInput = Readonly<{
  key: string;
  bytes: Uint8Array;
  contentType: string;
  cacheControlMaxAgeSeconds: number;
}>;

export type StoredMediaObjectMetadata = Readonly<{
  key: string;
  contentType: string;
  byteSize: number;
  etag: string;
}>;

/** Provider-neutral private object-storage port. */
export interface MediaStorage {
  put(input: StoreMediaObjectInput): Promise<StoredMediaObjectMetadata>;
  get(key: string): Promise<MediaStorageObject | null>;
  delete(keys: ReadonlyArray<string>): Promise<void>;
}
