import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import PreviewPage from "@/app/editor/preview/page"

// matchMedia isn't implemented in jsdom by default — provide a controllable
// mock so the mobile/desktop branch can be driven deterministically per test.
function mockMatchMedia(matches: boolean) {
  const listeners: ((e: MediaQueryListEvent) => void)[] = []
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      listeners.push(cb)
    },
    removeEventListener: vi.fn(),
    // motion's internal reduced-motion detection uses the legacy
    // addListener/removeListener API, not addEventListener — both need to
    // exist or mounting any motion.* component throws.
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
  return listeners
}

const pushMock = vi.fn()
const replaceMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}))

vi.mock("@/lib/store/resume", () => ({
  useResumeStore: (selector: (state: { data: unknown; template: string }) => unknown) =>
    selector({ data: {}, template: "onyx" }),
}))

describe("Preview page mobile guard", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    pushMock.mockClear()
    replaceMock.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("shows the mobile message and redirects to /editor after a short delay, on a mobile viewport", async () => {
    mockMatchMedia(true)
    render(<PreviewPage />)

    expect(screen.getByText(/preview works best on a larger screen/i)).toBeInTheDocument()
    expect(replaceMock).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1500)

    expect(replaceMock).toHaveBeenCalledWith("/editor")
  })

  it("does not show the mobile message or redirect on a desktop viewport", async () => {
    mockMatchMedia(false)
    render(<PreviewPage />)

    expect(screen.queryByText(/preview works best on a larger screen/i)).not.toBeInTheDocument()

    await vi.advanceTimersByTimeAsync(2000)
    expect(replaceMock).not.toHaveBeenCalled()
  })
})
