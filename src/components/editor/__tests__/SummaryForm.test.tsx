import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SummaryForm } from "@/components/editor/SummaryForm"
import { useResumeStore } from "@/lib/store/resume"

// The Zustand store is a module-level singleton that leaks state across
// tests within the same file (see BasicsForm.photo.test.tsx). Reset it
// before every test to avoid order-dependent flakiness.
beforeEach(() => {
  useResumeStore.getState().resetToDefault()
  vi.clearAllMocks()
})

describe("SummaryForm", () => {
  it("renders the default summary field values", () => {
    render(<SummaryForm />)

    // Title has no hint paragraph inside its <label>, so its accessible
    // name is the exact field label. Icon and Content both render a hint
    // <p> inside the same <label> (matching the itemFields.tsx
    // textarea-rich convention), which gets folded into the accessible
    // name too — so those are matched with a leading-text regex instead
    // of an exact anchor.
    expect(screen.getByLabelText(/^title$/i)).toHaveValue("")
    expect(screen.getByLabelText(/^icon/i)).toHaveValue("article")
    expect(screen.getByLabelText(/^content/i)).toHaveValue("")
    expect(screen.getByRole("switch", { name: /toggle summary visibility/i })).toHaveAttribute(
      "aria-checked",
      "true",
    )
  })

  it("writes content to data.summary.content, not data.sections", async () => {
    const user = userEvent.setup()
    render(<SummaryForm />)

    const contentField = screen.getByLabelText(/^content/i)
    await user.type(contentField, "<p>Hi</p>")

    expect(useResumeStore.getState().data.summary.content).toBe("<p>Hi</p>")
    // Confirm this didn't accidentally land in the sections map instead.
    expect(useResumeStore.getState().data.sections).not.toHaveProperty("summary")
  })

  it("writes title and icon to data.summary", async () => {
    const user = userEvent.setup()
    render(<SummaryForm />)

    const titleField = screen.getByLabelText(/^title$/i)
    await user.type(titleField, "About Me")
    expect(useResumeStore.getState().data.summary.title).toBe("About Me")

    const iconField = screen.getByLabelText(/^icon/i)
    await user.clear(iconField)
    await user.type(iconField, "user")
    expect(useResumeStore.getState().data.summary.icon).toBe("user")
  })

  it("toggling Hidden writes the inverse to data.summary.hidden", async () => {
    const user = userEvent.setup()
    render(<SummaryForm />)

    const toggle = screen.getByRole("switch", { name: /toggle summary visibility/i })
    expect(useResumeStore.getState().data.summary.hidden).toBe(false)

    await user.click(toggle)
    expect(useResumeStore.getState().data.summary.hidden).toBe(true)

    await user.click(toggle)
    expect(useResumeStore.getState().data.summary.hidden).toBe(false)
  })

  it("resetTab('sections') resets data.summary back to defaults", () => {
    useResumeStore.getState().updateField("summary", {
      title: "Custom",
      icon: "user",
      columns: 1,
      hidden: true,
      content: "<p>changed</p>",
    })

    useResumeStore.getState().resetTab("sections")

    expect(useResumeStore.getState().data.summary).toEqual({
      title: "",
      icon: "article",
      columns: 1,
      hidden: false,
      content: "",
    })
  })
})
