import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { BottomNav } from "@/components/mobile/BottomNav"

describe("BottomNav", () => {
  it("renders exactly Basics, Sections, and Design — Preview is not present at all, not just hidden", () => {
    render(<BottomNav active="basics" onChange={vi.fn()} />)

    expect(screen.getByRole("button", { name: /basics/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sections/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /design/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /preview/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/preview/i)).not.toBeInTheDocument()

    // Exactly 3 tabs total, not more with one hidden via CSS.
    expect(screen.getAllByRole("button")).toHaveLength(3)
  })

  it("each of the three tabs is independently selectable via onChange", async () => {
    const onChange = vi.fn()
    const { rerender } = render(<BottomNav active="basics" onChange={onChange} />)

    const basicsBtn = screen.getByRole("button", { name: /basics/i })
    const sectionsBtn = screen.getByRole("button", { name: /sections/i })
    const designBtn = screen.getByRole("button", { name: /design/i })

    sectionsBtn.click()
    expect(onChange).toHaveBeenCalledWith("sections")

    designBtn.click()
    expect(onChange).toHaveBeenCalledWith("design")

    basicsBtn.click()
    expect(onChange).toHaveBeenCalledWith("basics")

    expect(onChange).toHaveBeenCalledTimes(3)

    // Active state reflects whichever tab is passed, independent of click
    // history — confirms the component is a controlled, stateless display
    // of whatever `active` prop it's given.
    rerender(<BottomNav active="sections" onChange={onChange} />)
    expect(sectionsBtn.className).toContain("text-neutral-100")
    expect(basicsBtn.className).not.toContain("text-neutral-100")
  })
})
