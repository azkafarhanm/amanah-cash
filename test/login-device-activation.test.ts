import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  DEVICE_ACTIVATION_STORAGE_KEY,
  DEVICE_ACTIVATION_STORAGE_VALUE,
  persistDeviceActivation,
  readDeviceActivated
} from "../src/components/auth/device-activation";

function inMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.get(key) ?? null;
    },
    key(index) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, value);
    }
  } as Storage;
}

function throwingStorage(): Pick<Storage, "getItem" | "setItem"> {
  return {
    getItem() {
      throw new Error("storage unavailable");
    },
    setItem() {
      throw new Error("storage unavailable");
    }
  };
}

test("device activation is unset until the ritual is completed", () => {
  assert.equal(DEVICE_ACTIVATION_STORAGE_KEY.startsWith("amanah-cash-"), true);
  const storage = inMemoryStorage();
  assert.equal(readDeviceActivated(storage), false);
});

test("persisted device activation is read back and survives storage reopens", () => {
  const storage = inMemoryStorage();
  persistDeviceActivation(storage);
  assert.equal(
    storage.getItem(DEVICE_ACTIVATION_STORAGE_KEY),
    DEVICE_ACTIVATION_STORAGE_VALUE
  );
  assert.equal(readDeviceActivated(storage), true);
});

test("device activation helpers tolerate unavailable storage", () => {
  assert.doesNotThrow(() => persistDeviceActivation(throwingStorage()));
  assert.equal(readDeviceActivated(throwingStorage()), false);
});

test("login experience persists activation and skips the ritual for returning devices", async () => {
  const source = await readFile(
    "src/components/auth/login-experience.tsx",
    "utf8"
  );

  // The first successful illumination marks the device as activated.
  assert.match(source, /persistDeviceActivation\(\)/);
  // Returning devices jump straight to the lit state before first paint.
  assert.match(source, /readDeviceActivated\(\)/);
  assert.match(source, /useBeforePaintEffect/);
  // The lamp itself is told to render illuminated (not just the card).
  assert.match(source, /initiallyIlluminated=\{isReturningDevice\}/);
  // Teardown only reacts to a genuine illuminated -> dark transition so the
  // lamp's initial "dark" mount echo cannot re-sleep a returning device.
  assert.match(source, /previousLampPhase === "illuminated"/);
});

test("hanging lamp adopts the illuminated state for returning devices", async () => {
  const source = await readFile(
    "src/components/auth/hanging-lamp.tsx",
    "utf8"
  );

  assert.match(source, /initiallyIlluminated\?: boolean/);
  // Derived phase — a returning device renders already lit with no effect
  // state cascade; the first real cord pull pins the phase for good.
  assert.match(source, /interactedPhase \?\? \(initiallyIlluminated \? "illuminated" : "dark"\)/);
  assert.doesNotMatch(source, /useLayoutEffect/);
});

test("logout ends the session without clearing device activation storage", async () => {
  const source = await readFile("src/components/auth/logout-button.tsx", "utf8");

  assert.match(source, /signOut\(/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|removeItem|\.clear\(/);
});
