export const MAX_PHOTO_DIMENSION = 480
export const PHOTO_JPEG_QUALITY = 0.8
export function scaledDimensions(
  width: number,
  height: number,
  maxDimension: number
): {
  width: number
  height: number
} {
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
    MAX_PHOTO_DIMENSION
  )
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is not supported in this browser.")
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL("image/jpeg", PHOTO_JPEG_QUALITY)
}
export async function fileToResizedDataUrl(file: File): Promise<string> {
  const original = await readFileAsDataUrl(file)
  const img = await loadImage(original)
  return drawResized(img)
}
