"use client"
import { useResumeStore } from "@/lib/store/resume"
import { fontList } from "@/lib/pdf/fonts"
import type { Metadata } from "@/lib/schema/data"
import { Select } from "@/components/ui/Select"
import { Slider } from "@/components/ui/Slider"
import { Input } from "@/components/ui/Input"
import { ColorField } from "./ColorField"
import { ResetTabButton } from "./ResetTabButton"
type PageFormat = Metadata["page"]["format"]
type LevelType = Metadata["design"]["level"]["type"]
const PAGE_FORMATS: {
  value: PageFormat
  label: string
}[] = [
  { value: "a4", label: "A4" },
  { value: "letter", label: "Letter" },
  { value: "free-form", label: "Free-form" },
]
const LEVEL_TYPES: {
  value: LevelType
  label: string
}[] = [
  { value: "hidden", label: "Hidden" },
  { value: "circle", label: "Circle" },
  { value: "square", label: "Square" },
  { value: "rectangle", label: "Rectangle" },
  { value: "rectangle-full", label: "Rectangle (full)" },
  { value: "progress-bar", label: "Progress bar" },
  { value: "icon", label: "Icon" },
]
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">
      {children}
    </p>
  )
}
export function DesignPanel() {
  const metadata = useResumeStore((state) => state.data.metadata)
  const updateField = useResumeStore((state) => state.updateField)
  const resetTab = useResumeStore((state) => state.resetTab)
  function patchMetadata(patch: Partial<Metadata>) {
    updateField("metadata", { ...metadata, ...patch })
  }
  function patchColors(patch: Partial<Metadata["design"]["colors"]>) {
    patchMetadata({
      design: { ...metadata.design, colors: { ...metadata.design.colors, ...patch } },
    })
  }
  function patchLevel(patch: Partial<Metadata["design"]["level"]>) {
    patchMetadata({
      design: { ...metadata.design, level: { ...metadata.design.level, ...patch } },
    })
  }
  function patchTypography(
    block: "body" | "heading",
    patch: Partial<Metadata["typography"]["body"]>
  ) {
    patchMetadata({
      typography: {
        ...metadata.typography,
        [block]: { ...metadata.typography[block], ...patch },
      },
    })
  }
  function patchPage(patch: Partial<Metadata["page"]>) {
    patchMetadata({ page: { ...metadata.page, ...patch } })
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <ResetTabButton label="Design" onConfirm={() => resetTab("design")} />
      </div>

      <div>
        <SectionLabel>Colors</SectionLabel>
        <div className="mt-2 grid grid-cols-3 gap-2.5">
          <ColorField
            label="Primary"
            value={metadata.design.colors.primary}
            onChange={(rgba) => patchColors({ primary: rgba })}
          />
          <ColorField
            label="Text"
            value={metadata.design.colors.text}
            onChange={(rgba) => patchColors({ text: rgba })}
          />
          <ColorField
            label="Background"
            value={metadata.design.colors.background}
            onChange={(rgba) => patchColors({ background: rgba })}
          />
        </div>
      </div>

      <div className="h-px bg-neutral-800" />

      {(["body", "heading"] as const).map((block) => (
        <div key={block}>
          <SectionLabel>Typography — {block === "body" ? "Body" : "Heading"}</SectionLabel>
          <div className="mt-2 grid grid-cols-[2fr_1fr] gap-2.5">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10.5px] text-neutral-400">Font family</span>
              <Select
                value={metadata.typography[block].fontFamily}
                onChange={(e) => patchTypography(block, { fontFamily: e.target.value })}
              >
                {fontList.map((font) => (
                  <option key={font.family} value={font.family}>
                    {font.family}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10.5px] text-neutral-400">
                Size: {metadata.typography[block].fontSize}pt
              </span>
              <Slider
                min={6}
                max={24}
                step={1}
                showValue={false}
                value={metadata.typography[block].fontSize}
                onChange={(e) => patchTypography(block, { fontSize: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="h-px bg-neutral-800" />

      <div>
        <SectionLabel>Page</SectionLabel>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10.5px] text-neutral-400">
              Margin X: {metadata.page.marginX}pt
            </span>
            <Slider
              min={0}
              max={60}
              step={1}
              showValue={false}
              value={metadata.page.marginX}
              onChange={(e) => patchPage({ marginX: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10.5px] text-neutral-400">
              Margin Y: {metadata.page.marginY}pt
            </span>
            <Slider
              min={0}
              max={60}
              step={1}
              showValue={false}
              value={metadata.page.marginY}
              onChange={(e) => patchPage({ marginY: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          <span className="text-[10.5px] text-neutral-400">Page format</span>
          <div
            className="flex w-fit overflow-hidden rounded-md border border-neutral-700"
            role="group"
            aria-label="Page format"
          >
            {PAGE_FORMATS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => patchPage({ format: value })}
                aria-pressed={metadata.page.format === value}
                className={
                  metadata.page.format === value
                    ? "bg-orange-700 px-3.5 py-1.5 text-[12px] text-neutral-100"
                    : "bg-neutral-800 px-3.5 py-1.5 text-[12px] text-neutral-400 transition-colors hover:text-neutral-200"
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-neutral-800" />

      <div>
        <SectionLabel>Level display</SectionLabel>
        <p className="mt-1 text-[11px] text-neutral-500">
          How proficiency levels (skills, languages) are rendered on the resume.
        </p>
        <div className="mt-2 flex flex-col gap-2.5">
          <Select
            value={metadata.design.level.type}
            onChange={(e) => patchLevel({ type: e.target.value as LevelType })}
          >
            {LEVEL_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          {metadata.design.level.type === "icon" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10.5px] text-neutral-400">Icon name (Phosphor Icons)</span>
              <Input
                value={metadata.design.level.icon}
                onChange={(e) => patchLevel({ icon: e.target.value })}
                placeholder="star"
              />
              <p className="text-[11px] text-neutral-500">
                Must be a valid name from the Phosphor Icons set.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
