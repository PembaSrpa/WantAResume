import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import PreviewPage from "@/app/editor/preview/page"

const pushMock = vi.fn()
const replaceMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}))

vi.mock("@/lib/store/resume", () => ({
  useResumeStore: (selector: (state: { data: unknown; template: string }) => unknown) =>
    selector({ data: {}, template: "onyx" }),
}))

vi.mock("@/lib/generate-pdf", () => ({
  generatePdfBlob: vi.fn().mockResolvedValue(new Blob(["fake-pdf"], { type: "application/pdf" })),
}))

describe("Preview page", () => {
  beforeEach(() => {
    pushMock.mockClear()
    replaceMock.mockClear()
  })

  it("generates and renders the preview the same way regardless of viewport — no mobile redirect", async () => {
    render(<PreviewPage />)

    // Used to bounce mobile viewports back to /editor; that guard is gone
    // now that the Design tab has a legitimate in-app path to this route.
    expect(screen.queryByText(/preview works best on a larger screen/i)).not.toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTitle(/resume pdf preview/i)).toBeInTheDocument()
    })

    expect(replaceMock).not.toHaveBeenCalled()
  })

  it("Edit button navigates back to /editor", async () => {
    render(<PreviewPage />)
    await waitFor(() => {
      expect(screen.getByTitle(/resume pdf preview/i)).toBeInTheDocument()
    })

    screen.getByRole("button", { name: /edit/i }).click()
    expect(pushMock).toHaveBeenCalledWith("/editor")
  })
})
