export type ScalesVariant = "spacious" | "compact"
const WIDTH_BY_VARIANT: Record<ScalesVariant, string> = {
  spacious: "w-6 md:w-16",
  compact: "w-5 md:w-10",
}
export function Scales({
  variant = "compact",
}: {
  variant?: ScalesVariant
} = {}) {
  const widthClass = WIDTH_BY_VARIANT[variant]
  return (
    <>
      <div
        className={`pointer-events-none absolute left-0 top-0 h-full ${widthClass} border-r border-neutral-600 z-[10]`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(315deg,var(--pattern-fg) 0,var(--pattern-fg) 1px,transparent 0,transparent 50%)",
          backgroundSize: "8px 8px",
        }}
      />
      <div
        className={`pointer-events-none absolute right-0 top-0 h-full ${widthClass} border-l border-neutral-600 z-[10]`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(315deg,var(--pattern-fg) 0,var(--pattern-fg) 1px,transparent 0,transparent 50%)",
          backgroundSize: "8px 8px",
        }}
      />
    </>
  )
}
