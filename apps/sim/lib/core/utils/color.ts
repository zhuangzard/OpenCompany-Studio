/**
 * Converts a hex color string to an rgba string with the specified alpha.
 * @param hex - Hex color string (e.g., '#FF0000')
 * @param alpha - Alpha value between 0 and 1
 * @returns An rgba color string (e.g., 'rgba(255,0,0,0.5)')
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
