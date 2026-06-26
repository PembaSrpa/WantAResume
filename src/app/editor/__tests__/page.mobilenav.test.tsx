import { describe, it, expect, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import EditorPage from "@/app/editor/page"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

// The mobile bottom-nav content is the third of the page's three responsive
// layout blocks (desktop/tablet/mobile all render simultaneously, CSS-hidden
// per breakpoint — see the earlier DndDescribedBy hydration-bug history in
// this project). Scoping queries to the mobile block specifically, rather
// than asserting on text/role globally, avoids false matches against the
// desktop/tablet copies that are also in the DOM.
function getMobileBlock() {
  // All three responsive layouts render a "Back to homepage" button; find
  // the one that's actually inside the md:hidden wrapper, since getByRole
  // (singular) would throw on finding 3 matches.
  const backButtons = screen.getAllByRole("button", { name: /back to homepage/i })
  for (const btn of backButtons) {
    let el: HTMLElement | null = btn
    while (el) {
      if (el.className.includes("md:hidden")) return el
      el = el.parentElement
    }
  }
  throw new Error("Could not locate the mobile layout block")
}

describe("Mobile bottom nav reaches all three tabs", () => {
  it("Basics, Sections, and Design are all independently reachable from the mobile nav — the real bug this task fixes", async () => {
    const user = userEvent.setup()
    render(<EditorPage />)

    const mobileBlock = getMobileBlock()

    // Starts on Basics per the default-tab fix.
    expect(within(mobileBlock).getAllByText(/^name$/i).length).toBeGreaterThan(0)

    // Tap Sections — previously impossible from "Edit", since "Edit" only
    // ever returned to lastEditorTab with no way to explicitly choose
    // Sections. Now Sections is a first-class nav tab.
    await user.click(within(mobileBlock).getByRole("button", { name: /^sections$/i }))
    expect(within(mobileBlock).queryByText(/^name$/i)).not.toBeInTheDocument()
    // SectionAccordion renders real section titles; "experience" is one.
    expect(within(mobileBlock).getAllByTitle(/^experience —/i).length).toBeGreaterThan(0)

    // Tap Design.
    await user.click(within(mobileBlock).getByRole("button", { name: /^design$/i }))
    expect(within(mobileBlock).queryByTitle(/^experience —/i)).not.toBeInTheDocument()
    expect(within(mobileBlock).getByText(/template/i)).toBeInTheDocument()

    // And back to Basics — confirms the path isn't one-directional.
    await user.click(within(mobileBlock).getByRole("button", { name: /^basics$/i }))
    expect(within(mobileBlock).getAllByText(/^name$/i).length).toBeGreaterThan(0)
  })

  it("the Change Template select is reachable from mobile's Design tab", async () => {
    const user = userEvent.setup()
    render(<EditorPage />)

    const mobileBlock = getMobileBlock()
    await user.click(within(mobileBlock).getByRole("button", { name: /^design$/i }))

    const select = within(mobileBlock).getByRole("combobox")
    expect(select).toBeInTheDocument()
  })
})
