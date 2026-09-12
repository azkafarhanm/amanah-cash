export const SCROLL_POSITION_STORAGE_KEY = "amanah-cash-scroll-positions";
export const MAX_SCROLL_POSITIONS = 50;

export type ScrollPosition = {
  x: number;
  y: number;
};

export type ScrollPositionStore = Record<string, ScrollPosition>;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function scrollPositionKey(pathname: string, search = "", hash = ""): string {
  return `${pathname}${search}${hash}`;
}

export function readScrollPositions(storage: StorageLike): ScrollPositionStore {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(SCROLL_POSITION_STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) return false;
        const position = value as Partial<ScrollPosition>;
        return Number.isFinite(position.x) && Number.isFinite(position.y);
      })
    ) as ScrollPositionStore;
  } catch {
    return {};
  }
}

export function saveScrollPosition(
  storage: StorageLike,
  key: string,
  position: ScrollPosition
): void {
  try {
    const entries = Object.entries(readScrollPositions(storage)).filter(([storedKey]) => storedKey !== key);
    entries.push([key, position]);
    storage.setItem(
      SCROLL_POSITION_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(entries.slice(-MAX_SCROLL_POSITIONS)))
    );
  } catch {
    // Scroll restoration is a UX enhancement; private-mode storage failures
    // must never block navigation.
  }
}
