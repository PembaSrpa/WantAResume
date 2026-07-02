import { forwardRef } from "react"
import type { SelectHTMLAttributes } from "react"
import { IconChevronDown } from "@tabler/icons-react"
import { cn } from "./cn"
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 pr-8 text-[13px] text-neutral-100 outline-none transition-[border-color,box-shadow] duration-150",
            "hover:border-neutral-600",
            "focus:border-orange-700 focus:shadow-[0_0_0_3px_rgba(194,65,12,0.18)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <IconChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-300"
        />
      </div>
    )
  }
)
Select.displayName = "Select"
