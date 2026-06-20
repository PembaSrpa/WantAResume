"use client"

import { IconEdit, IconFileText, IconPalette } from "@tabler/icons-react"
import { cn } from "../ui/cn"

export type BottomNavTab = "edit" | "preview" | "design"

export interface BottomNavProps {
  active: BottomNavTab
  onChange?: (tab: BottomNavTab) => void
  className?: string
}

const TABS: { id: BottomNavTab; label: string; icon: typeof IconEdit }[] = [
  { id: "edit", label: "Edit", icon: IconEdit },
  { id: "preview", label: "Preview", icon: IconFileText },
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
