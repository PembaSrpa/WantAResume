// New, app-specific helper for the photo upload feature (not part of the
// ported src/lib foundation layer). Resizes/compresses an image client-side
// before it's stored as a base64 data URL in data.picture.url — there's no
// backend to upload to, and an uncompressed phone photo as base64 could run
// several hundred KB to over 1MB, which adds up fast against localStorage's
// typical 5-10MB per-origin ceiling once combined with the rest of the
// resume's persisted state.

export const MAX_PHOTO_DIMENSION = 480
export const PHOTO_JPEG_QUALITY = 0.8

// Pure and DOM-free on purpose — easy to unit test without mocking
// canvas/Image, unlike the rest of this file.
export function scaledDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height }
  }
  const scale = maxDimension / Math.max(width, height)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load image."))
    img.src = src
  })
}

function drawResized(img: HTMLImageElement): string {
  const { width, height } = scaledDimensions(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    MAX_PHOTO_DIMENSION,
  )
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is not supported in this browser.")
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL("image/jpeg", PHOTO_JPEG_QUALITY)
}

// Reads a File, downscales it to MAX_PHOTO_DIMENSION on its longest side,
// and re-encodes it as a JPEG data URL. The result is small enough to store
// directly in data.picture.url with no backend involved.
export async function fileToResizedDataUrl(file: File): Promise<string> {
  const original = await readFileAsDataUrl(file)
  const img = await loadImage(original)
  return drawResized(img)
}
