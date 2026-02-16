/**
 * Device capability detection for adaptive model behaviour.
 *
 * Tiers:
 *   'full'       – >=16 GB RAM, not a Dell Latitude or Surface → thinking enabled
 *   'lite'       – <16 GB RAM, or Dell Latitude/Surface         → thinking disabled
 *   'blocked'    – <=8 GB RAM, or phone/tablet                  → cannot run BERI
 */

export type DeviceTier = 'full' | 'lite' | 'blocked'

export interface DeviceInfo {
  tier: DeviceTier
  ramGB: number | null
  isPhone: boolean
  isSurface: boolean
  isDellLatitude: boolean
  thinkingEnabled: boolean
}

/**
 * Detect the device tier based on RAM and user agent.
 *
 * `navigator.deviceMemory` is only available in Chromium-based browsers
 * (Chrome, Edge, Opera). Returns approximate RAM in GB (0.25, 0.5, 1, 2, 4, 8).
 * Note: the API caps at 8 for privacy, so we treat "8" as "8 or more".
 * For devices that report exactly 8 we allow them through (tier 'lite' at worst).
 *
 * If the API is unavailable we assume the device is capable (tier 'full')
 * since the user already passed the WebGPU check.
 */
export function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent

  // ── Phone / tablet detection ───────────────────────────────────────
  const isPhone = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua)

  // ── Specific device families ───────────────────────────────────────
  const isSurface = /Surface/i.test(ua)
  const isDellLatitude = /Dell.*Latitude|Latitude.*Dell/i.test(ua)

  // ── RAM detection ──────────────────────────────────────────────────
  // navigator.deviceMemory is typed as `number | undefined` in newer TS
  // but doesn't exist on all browsers, so we cast via `any`.
  const ramGB: number | null =
    typeof (navigator as Record<string, unknown>).deviceMemory === 'number'
      ? (navigator as Record<string, unknown>).deviceMemory as number
      : null

  // ── Tier logic ─────────────────────────────────────────────────────
  // Blocked: phone/tablet OR RAM known to be <=8 GB
  // Note: navigator.deviceMemory reports <=8 even for machines with more,
  // so we only block when ram is *strictly less than* 8 (i.e. 4, 2, 1, …)
  // OR when the device is a phone.  For ram === 8, we treat it as 'lite'.
  if (isPhone) {
    return { tier: 'blocked', ramGB, isPhone, isSurface, isDellLatitude, thinkingEnabled: false }
  }

  if (ramGB !== null && ramGB < 8) {
    return { tier: 'blocked', ramGB, isPhone, isSurface, isDellLatitude, thinkingEnabled: false }
  }

  // Lite: Surface, Dell Latitude, or RAM < 16 GB (i.e. exactly 8)
  if (isSurface || isDellLatitude || (ramGB !== null && ramGB < 16)) {
    return { tier: 'lite', ramGB, isPhone, isSurface, isDellLatitude, thinkingEnabled: false }
  }

  // Full: RAM >= 16 GB (or unknown — assume capable since WebGPU passed)
  return { tier: 'full', ramGB, isPhone, isSurface, isDellLatitude, thinkingEnabled: true }
}
