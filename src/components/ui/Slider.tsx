import { forwardRef } from "react"
import type { InputHTMLAttributes } from "react"
import { cn } from "./cn"
export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  showValue?: boolean
}
export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, showValue = true, value, ...props }, ref) => {
    return (
      <div className="flex items-center gap-3">
        <input
          ref={ref}
          type="range"
          value={value}
          className={cn(
            "h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-700 accent-orange-700",
            "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-orange-700 [&::-webkit-slider-thumb]:bg-neutral-100",
            className
          )}
          {...props}
        />
        {showValue && (
          <span className="min-w-[2ch] text-right text-sm text-neutral-200">{value}</span>
        )}
      </div>
    )
  }
)
Slider.displayName = "Slider"
