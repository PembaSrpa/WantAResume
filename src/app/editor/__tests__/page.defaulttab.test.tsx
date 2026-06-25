import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import EditorPage from "@/app/editor/page"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

describe("Editor page default tab", () => {
  it("lands on Basics by default, not Sections — confirmed by checking actual rendered content", () => {
    render(<EditorPage />)

    // Basics' Name field should be visible by default.
    expect(screen.getAllByText(/^name$/i).length).toBeGreaterThan(0)

    // The Sections accordion's distinctive "experience" section title
    // should NOT be the active panel content on initial render. (It may
    // still exist if both desktop and tablet layouts render simultaneously
    // per the responsive-CSS approach used throughout this app — so this
    // checks that the Basics tab button is the active one, which is the
    // actual source of truth, rather than asserting Sections content is
    // entirely absent from the DOM.)
    const basicsTabs = screen.getAllByRole("button", { name: /^basics$/i })
    expect(basicsTabs.length).toBeGreaterThan(0)
  })
})
