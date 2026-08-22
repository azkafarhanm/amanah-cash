/**
 * Device activation for the login "lamp" onboarding.
 *
 * The lamp pull is a one-time, per-device onboarding ritual — it is purely
 * presentational and is NOT an authentication or authorization mechanism.
 * Once a browser has completed it, the status is persisted in localStorage so
 * returning visits (including after logout or session expiry) go straight to
 * the login card instead of repeating the ritual.
 *
 * Persistence follows the existing client-state pattern used by the theme
 * preference (see `src/settings/theme.ts`): durable, non-sensitive, keyed
 * under the `amanah-cash-` prefix. Nothing security-relevant is ever stored.
 */
export const DEVICE_ACTIVATION_STORAGE_KEY = "amanah-cash-device-activated";
export const DEVICE_ACTIVATION_STORAGE_VALUE = "activated";

type DeviceActivationStorage = Pick<Storage, "getItem" | "setItem">;

function resolveStorage(storage?: DeviceActivationStorage): DeviceActivationStorage | null {
  if (storage) return storage;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readDeviceActivated(storage?: DeviceActivationStorage): boolean {
  try {
    return resolveStorage(storage)?.getItem(DEVICE_ACTIVATION_STORAGE_KEY) === DEVICE_ACTIVATION_STORAGE_VALUE;
  } catch {
    return false;
  }
}

export function persistDeviceActivation(storage?: DeviceActivationStorage): void {
  try {
    resolveStorage(storage)?.setItem(DEVICE_ACTIVATION_STORAGE_KEY, DEVICE_ACTIVATION_STORAGE_VALUE);
  } catch {
    // Activation is a UX nicety; if storage is unavailable the user simply
    // repeats the one-time lamp ritual on the next visit.
  }
}
