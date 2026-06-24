import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { Scales } from "@/components/Scales"

describe("Scales variant widths", () => {
  it("defaults to compact width when no variant is passed", () => {
    const { container } = render(<Scales />)
    const [left] = container.querySelectorAll("div")
    expect(left.className).toContain("w-5")
    expect(left.className).toContain("md:w-10")
    expect(left.className).not.toContain("md:w-16")
  })

  it("renders the compact width explicitly", () => {
    const { container } = render(<Scales variant="compact" />)
    const [left, right] = container.querySelectorAll("div")
    expect(left.className).toContain("w-5")
    expect(left.className).toContain("md:w-10")
    expect(right.className).toContain("w-5")
    expect(right.className).toContain("md:w-10")
  })

  it("renders the spacious width on both left and right strips", () => {
    const { container } = render(<Scales variant="spacious" />)
    const [left, right] = container.querySelectorAll("div")
    expect(left.className).toContain("w-6")
    expect(left.className).toContain("md:w-16")
    expect(right.className).toContain("w-6")
    expect(right.className).toContain("md:w-16")
  })

  it("keeps the border on the correct sides regardless of variant", () => {
    const { container } = render(<Scales variant="spacious" />)
    const [left, right] = container.querySelectorAll("div")
    expect(left.className).toContain("border-r")
    expect(right.className).toContain("border-l")
  })
})
