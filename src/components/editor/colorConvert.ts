// Schema stores colors as rgba(r, g, b, a) strings (metadata.design.colors),
// but the native <input type="color"> control only accepts/emits 6-digit
// hex. These convert between the two so the picker can read/write the real
// schema value without the user ever seeing rgba() syntax.

export function rgbaToHex(rgba: string): string {
  const match = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (!match) return "#000000"
  const [, r, g, b] = match
  const toHex = (n: string) => Number(n).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function hexToRgba(hex: string, alpha = 1): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.slice(0, 2), 16) || 0
  const g = parseInt(clean.slice(2, 4), 16) || 0
  const b = parseInt(clean.slice(4, 6), 16) || 0
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Preserves the original alpha value when converting a new hex selection
// back to rgba, rather than always resetting to fully opaque.
export function extractAlpha(rgba: string): number {
  const match = rgba.match(/rgba?\([^)]+,\s*([\d.]+)\s*\)/i)
  if (match) return Number(match[1])
  return 1
}
