import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  MAX_SCROLL_POSITIONS,
  readScrollPositions,
  saveScrollPosition,
  scrollPositionKey
} from "../src/components/app-shell/scroll-position";

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
    get length() { return values.size; }
  } as Storage;
}

test("scroll positions are stored per URL and capped to a bounded history", () => {
  const storage = memoryStorage();
  const key = scrollPositionKey("/operator/students", "?page=2");

  saveScrollPosition(storage, key, { x: 0, y: 640 });
  assert.deepEqual(readScrollPositions(storage)[key], { x: 0, y: 640 });

  for (let index = 0; index < MAX_SCROLL_POSITIONS + 5; index += 1) {
    saveScrollPosition(storage, `/page-${index}`, { x: 0, y: index });
  }

  const stored = readScrollPositions(storage);
  assert.equal(Object.keys(stored).length, MAX_SCROLL_POSITIONS);
  assert.equal(stored[key], undefined);
  assert.deepEqual(stored[`/page-${MAX_SCROLL_POSITIONS + 4}`], { x: 0, y: MAX_SCROLL_POSITIONS + 4 });
});

test("authenticated shell and BackButton opt into scroll restoration", async () => {
  const [layout, backButton, restoration] = await Promise.all([
    readFile("src/app/(app)/layout.tsx", "utf8"),
    readFile("src/components/ui/back-button.tsx", "utf8"),
    readFile("src/components/app-shell/scroll-restoration.tsx", "utf8")
  ]);

  assert.match(layout, /<ScrollRestoration \/>/);
  assert.match(backButton, /<Link href=\{href\} scroll=\{false\}/);
  assert.match(restoration, /history\.scrollRestoration = "manual"/);
  assert.match(restoration, /sessionStorage/);
  assert.match(restoration, /scrollTo\(/);
  assert.match(restoration, /pagehide/);
});
