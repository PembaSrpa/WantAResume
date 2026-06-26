"use client"

import { IconEdit, IconListDetails, IconPalette } from "@tabler/icons-react"
import { cn } from "../ui/cn"

// Intentionally the exact same vocabulary as EditorTab
// (src/app/editor/page.tsx). With Preview removed from mobile entirely
// (see TASK_MOBILE_AND_DEFAULT_TAB.md), there is no longer any
// BottomNav-only concept that isn't also a real EditorTab — so rather than
// maintain a separate type and a mapping function between the two (the
// earlier source of a real bug), this is just EditorTab's three values.
export type BottomNavTab = "basics" | "sections" | "design"

export interface BottomNavProps {
  active: BottomNavTab
  onChange?: (tab: BottomNavTab) => void
  className?: string
}

const TABS: { id: BottomNavTab; label: string; icon: typeof IconEdit }[] = [
  { id: "basics", label: "Basics", icon: IconEdit },
  { id: "sections", label: "Sections", icon: IconListDetails },
  { id: "design", label: "Design", icon: IconPalette },
]

export function BottomNav({ active, onChange, className }: BottomNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 flex border-t border-neutral-800 bg-neutral-900",
        className
      )}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange?.(id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors",
              isActive ? "text-neutral-100" : "text-neutral-500"
            )}
          >
            <Icon size={20} stroke={1.75} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
