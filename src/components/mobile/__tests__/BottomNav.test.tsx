import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { BottomNav } from "@/components/mobile/BottomNav"

describe("BottomNav", () => {
  it("renders only Edit and Design — Preview is not present at all, not just hidden", () => {
    render(<BottomNav active="edit" onChange={vi.fn()} />)

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /design/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /preview/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/preview/i)).not.toBeInTheDocument()

    // Exactly 2 tabs total, not 3 with one hidden via CSS.
    expect(screen.getAllByRole("button")).toHaveLength(2)
  })
})
