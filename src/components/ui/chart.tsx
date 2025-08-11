"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: Record<string, any>
  }
>(({ className, config, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("h-[350px] w-full", className)}
      {...props}
    />
  )
})
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({ 
  active, 
  payload, 
  label 
}) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border border-amber-400/20 bg-[#1a0f06] p-3 shadow-lg">
      <div className="grid gap-2">
        {label && (
          <div className="font-medium text-amber-50">{label}</div>
        )}
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color || '#ff9900' }}
            />
            <div className="flex items-center justify-between gap-4 w-full">
              <span className="text-amber-100/70 text-sm">
                {item.dataKey}
              </span>
              <span className="font-mono font-medium text-amber-50">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple passthrough - Recharts will handle the tooltip logic
const ChartTooltip = ChartTooltipContent

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
}