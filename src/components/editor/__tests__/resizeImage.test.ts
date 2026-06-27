import { describe, it, expect } from "vitest"
import { scaledDimensions, MAX_PHOTO_DIMENSION } from "@/components/editor/resizeImage"

describe("scaledDimensions", () => {
  it("leaves an image unchanged if both dimensions are already under the max", () => {
    expect(scaledDimensions(200, 150, 480)).toEqual({ width: 200, height: 150 })
  })

  it("leaves an image unchanged if a dimension is exactly at the max", () => {
    expect(scaledDimensions(480, 300, 480)).toEqual({ width: 480, height: 300 })
  })

  it("scales down a landscape image, preserving aspect ratio, capping the longest side", () => {
    // 2000x1000 -> longest side (width) capped at 480, height scales proportionally.
    expect(scaledDimensions(2000, 1000, 480)).toEqual({ width: 480, height: 240 })
  })

  it("scales down a portrait image, preserving aspect ratio, capping the longest side", () => {
    // 1000x2000 -> longest side (height) capped at 480, width scales proportionally.
    expect(scaledDimensions(1000, 2000, 480)).toEqual({ width: 240, height: 480 })
  })

  it("scales down a square image to a square", () => {
    expect(scaledDimensions(3000, 3000, 480)).toEqual({ width: 480, height: 480 })
  })

  it("never produces a zero dimension for an extreme aspect ratio", () => {
    const result = scaledDimensions(10000, 1, 480)
    expect(result.width).toBe(480)
    expect(result.height).toBeGreaterThanOrEqual(1)
  })

  it("uses MAX_PHOTO_DIMENSION as the real default cap used by the upload flow", () => {
    expect(MAX_PHOTO_DIMENSION).toBeGreaterThan(0)
    expect(scaledDimensions(5000, 5000, MAX_PHOTO_DIMENSION)).toEqual({
      width: MAX_PHOTO_DIMENSION,
      height: MAX_PHOTO_DIMENSION,
    })
  })
})
