/**
 * Mobile Haptic Utility — Amanah Cash Authentication
 * Provides subtle tactile feedback on supported mobile devices.
 */

export function triggerHapticPull(): void {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(8);
    } catch {
      // Ignore unsupported platforms
    }
  }
}

export function triggerHapticIgnition(): void {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(15);
    } catch {
      // Ignore unsupported platforms
    }
  }
}

export function triggerHapticSuccess(): void {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([10, 30, 20]);
    } catch {
      // Ignore unsupported platforms
    }
  }
}
