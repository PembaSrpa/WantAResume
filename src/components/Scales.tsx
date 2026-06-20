export function Scales() {
  return (
    <>
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-5 md:w-10 border-r border-neutral-600 z-[10]"
        style={{
          backgroundImage: 'repeating-linear-gradient(315deg,var(--pattern-fg) 0,var(--pattern-fg) 1px,transparent 0,transparent 50%)',
          backgroundSize: '8px 8px',
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-5 md:w-10 border-l border-neutral-600 z-[10]"
        style={{
          backgroundImage: 'repeating-linear-gradient(315deg,var(--pattern-fg) 0,var(--pattern-fg) 1px,transparent 0,transparent 50%)',
          backgroundSize: '8px 8px',
        }}
      />
    </>
  )
}
