import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SectionAccordion } from "@/components/editor/SectionAccordion"

describe("SectionAccordion default state", () => {
  it("no section is expanded on first render — Experience used to open by default, which was a dev-era leftover", () => {
    render(<SectionAccordion />)

    // If any section (e.g. Experience) were open by default, its "Add
    // item" button would already be in the DOM without any click.
    expect(screen.queryByRole("button", { name: /^add item$/i })).not.toBeInTheDocument()
  })
})
