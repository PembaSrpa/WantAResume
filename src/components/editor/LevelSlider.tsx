"use client"
import { Slider } from "@/components/ui/Slider"
export function LevelSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (level: number) => void
}) {
  return (
    <Slider
      min={0}
      max={5}
      step={1}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}
