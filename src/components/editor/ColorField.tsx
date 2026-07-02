"use client"
import { rgbaToHex, hexToRgba, extractAlpha } from "./colorConvert"
export function ColorField({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string
  value: string
  onChange: (rgba: string) => void
  onClear?: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">
          {label}
        </span>
        {onClear && value ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-neutral-500 transition-colors hover:text-neutral-300"
          >
            Clear
          </button>
        ) : null}
      </div>
      <input
        type="color"
        value={rgbaToHex(value)}
        onChange={(e) => onChange(hexToRgba(e.target.value, extractAlpha(value)))}
        aria-label={label}
        className="h-9 w-full cursor-pointer rounded-md border border-neutral-700 bg-neutral-800 p-1"
      />
    </div>
  )
}
