export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type PageSizePreference = (typeof PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_PAGE_SIZE: PageSizePreference = 20;
export function isPageSizePreference(value: unknown): value is PageSizePreference {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(numeric) && PAGE_SIZE_OPTIONS.includes(numeric as PageSizePreference);
}

export function resolvePageSize(
  value: unknown,
  fallback: PageSizePreference = DEFAULT_PAGE_SIZE
): PageSizePreference {
  return isPageSizePreference(value) ? Number(value) as PageSizePreference : fallback;
}
