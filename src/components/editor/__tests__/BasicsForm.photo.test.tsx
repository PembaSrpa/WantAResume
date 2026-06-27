import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BasicsForm } from "@/components/editor/BasicsForm"
import { useResumeStore } from "@/lib/store/resume"

// The Zustand store is a module-level singleton that leaks state across
// tests within the same file (confirmed directly — it does not auto-reset
// between `it` blocks). resetToDefault() avoids order-dependent flakiness.
beforeEach(() => {
  useResumeStore.getState().resetToDefault()
  vi.clearAllMocks()
})

vi.mock("@/components/editor/resizeImage", () => ({
  fileToResizedDataUrl: vi.fn().mockResolvedValue("data:image/jpeg;base64,fakecompresseddata"),
}))

import { fileToResizedDataUrl } from "@/components/editor/resizeImage"

describe("BasicsForm photo upload", () => {
  it("empty state shows a placeholder icon and an 'Upload photo' button; Picture URL is editable", () => {
    render(<BasicsForm />)

    expect(screen.getByRole("button", { name: /upload photo/i })).toBeInTheDocument()
    expect(screen.queryByRole("img", { name: /selected photo preview/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /remove photo/i })).not.toBeInTheDocument()

    const urlInput = screen.getByLabelText(/^picture url$/i)
    expect(urlInput).not.toBeDisabled()
  })

  it("selecting an image file resizes it and stores the result in picture.url", async () => {
    const user = userEvent.setup()
    render(<BasicsForm />)

    const file = new File(["fake-image-bytes"], "photo.png", { type: "image/png" })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(useResumeStore.getState().data.picture.url).toBe(
        "data:image/jpeg;base64,fakecompresseddata",
      )
    })
    expect(fileToResizedDataUrl).toHaveBeenCalledWith(file)

    // Once a photo is set: thumbnail appears, button becomes "Replace",
    // a Remove button appears, and the URL field locks (can't show raw
    // base64 there) — confirmed via re-render, not assumed.
    expect(await screen.findByRole("img", { name: /selected photo preview/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^replace$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /remove photo/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/^picture url$/i)).toBeDisabled()
    expect(screen.getByLabelText(/^picture url$/i)).toHaveValue("")
  })

  it("selecting a non-image file shows an error and does not touch picture.url", async () => {
    render(<BasicsForm />)

    const file = new File(["not an image"], "resume.pdf", { type: "application/pdf" })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    // userEvent.upload realistically enforces the input's accept="image/*"
    // filter and won't fire change for a mismatched file — matching real
    // browser behavior through the native picker. The defensive check in
    // BasicsForm still matters for OSes/pickers that allow bypassing
    // accept, so fireEvent.change (which skips that filtering) is used
    // here to actually exercise that code path.
    Object.defineProperty(fileInput, "files", { value: [file], configurable: true })
    fireEvent.change(fileInput)

    expect(await screen.findByText(/please choose an image file/i)).toBeInTheDocument()
    expect(useResumeStore.getState().data.picture.url).toBe("")
    expect(fileToResizedDataUrl).not.toHaveBeenCalled()
  })

  it("clicking Remove clears the photo and re-enables the Picture URL field", async () => {
    const user = userEvent.setup()
    render(<BasicsForm />)

    const file = new File(["fake-image-bytes"], "photo.png", { type: "image/png" })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, file)
    await screen.findByRole("button", { name: /remove photo/i })

    await user.click(screen.getByRole("button", { name: /remove photo/i }))

    expect(useResumeStore.getState().data.picture.url).toBe("")
    expect(screen.getByRole("button", { name: /^upload photo$/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /remove photo/i })).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^picture url$/i)).not.toBeDisabled()
  })

  it("typing a link directly into Picture URL still works when no photo is uploaded", async () => {
    const user = userEvent.setup()
    render(<BasicsForm />)

    const urlInput = screen.getByLabelText(/^picture url$/i)
    await user.type(urlInput, "https://example.com/me.jpg")

    expect(useResumeStore.getState().data.picture.url).toBe("https://example.com/me.jpg")
  })
})
