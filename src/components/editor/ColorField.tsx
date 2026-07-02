"use client"

import { rgbaToHex, hexToRgba, extractAlpha } from "./colorConvert"

// Shared rgba color picker: schema stores colors as rgba(r, g, b, a) strings,
// but the native <input type="color"> control only accepts/emits 6-digit
// hex. These convert between the two so the picker can read/write the real
// schema value without the user ever seeing rgba() syntax.
//
// Originally lived only inside DesignPanel.tsx (page colors, which are
// always required and never blank). Extracted here so the generic item
// field system (itemFields.tsx's "icon-color" kind) can reuse it for
// per-item icon colors, which — unlike page colors — are optional: an
// empty string means "use the template default." The optional `onClear`
// prop is what that case uses; DesignPanel's three page-color fields don't
// pass it, so they keep their original always-has-a-value behavior.
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
