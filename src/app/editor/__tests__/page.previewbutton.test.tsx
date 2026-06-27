import { describe, it, expect, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import EditorPage from "@/app/editor/page"

const pushMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}))

// Same scoping helper as page.mobilenav.test.tsx — desktop/tablet/mobile
// all render simultaneously, CSS-hidden per breakpoint.
function getMobileBlock() {
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

function getDesktopBlock() {
  const backButtons = screen.getAllByRole("button", { name: /back to homepage/i })
  for (const btn of backButtons) {
    let el: HTMLElement | null = btn
    while (el) {
      if (el.className.includes("lg:flex")) return el
      el = el.parentElement
    }
  }
  throw new Error("Could not locate the desktop layout block")
}

describe("Mobile Design tab Preview button", () => {
  it("tapping Preview in the mobile Design tab navigates to /editor/preview", async () => {
    const user = userEvent.setup()
    render(<EditorPage />)

    const mobileBlock = getMobileBlock()
    await user.click(within(mobileBlock).getByRole("button", { name: /^design$/i }))

    const previewButton = within(mobileBlock).getByRole("button", { name: /preview/i })
    await user.click(previewButton)

    expect(pushMock).toHaveBeenCalledWith("/editor/preview")
  })

  it("desktop's Design tab does not render a second, redundant Preview button (header already has one)", async () => {
    const user = userEvent.setup()
    render(<EditorPage />)

    const desktopBlock = getDesktopBlock()
    await user.click(within(desktopBlock).getByRole("button", { name: /^design$/i }))

    // Exactly one Preview button in the desktop block: the header's.
    const previewButtons = within(desktopBlock).getAllByRole("button", { name: /preview/i })
    expect(previewButtons.length).toBe(1)
  })
})
