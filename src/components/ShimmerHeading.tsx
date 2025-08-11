"use client"

import { motion } from "framer-motion"
import { cn } from "../lib/utils"

type Props = {
  text?: string
  className?: string
}

const letters = (t: string) => t.split("")

export default function ShimmerHeading({ text = "Track Gainz", className }: Props) {
  const chars = letters(text)

  return (
    <div className="relative">
      {/* Depth/back layer for a bold outline look */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 select-none font-black tracking-[-0.02em] leading-none text-transparent",
          "[text-shadow:0_2px_0_rgba(0,0,0,0.75),2px_0_0_rgba(0,0,0,0.75),0_-2px_0_rgba(0,0,0,0.75),-2px_0_0_rgba(0,0,0,0.75),2px_2px_0_rgba(0,0,0,0.75)]",
          "dark:[text-shadow:0_2px_0_rgba(0,0,0,1),2px_0_0_rgba(0,0,0,1),0_-2px_0_rgba(0,0,0,1),-2px_0_0_rgba(0,0,0,1),2px_2px_0_rgba(0,0,0,1)]",
          className
        )}
      >
        {text}
      </div>

      {/* Foreground: animated gradient + per-letter spring + "impact thud" on mount */}
      <motion.h1
        aria-label={text}
        initial={{ opacity: 0, y: 10, scale: 0.92 }}
        animate={{
          opacity: 1,
          y: [10, -2, 0],
          scale: [0.92, 1.08, 1],
          rotate: [0, -0.3, 0],
        }}
        transition={{ duration: 0.65, ease: "easeOut", times: [0, 0.5, 1] }}
        className={cn(
          "select-none font-black tracking-[-0.02em] leading-none",
          "bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-[length:220%_100%] bg-clip-text text-transparent animate-gradient-x",
          "drop-shadow-[0_1px_0_rgba(255,255,255,0.3)] dark:drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]",
          className
        )}
      >
        {chars.map((c, i) => (
          <motion.span
            key={`${c}-${i}`}
            initial={{ y: 12, opacity: 0, rotate: 2 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.015 * i, type: "spring", stiffness: 520, damping: 24 }}
            className="inline-block"
          >
            {c === " " ? "\u00A0" : c}
          </motion.span>
        ))}
      </motion.h1>

      {/* Shimmer sweep overlay clipped to text */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.55)_30%,transparent_60%)] [mask-image:linear-gradient(#000,transparent)] animate-shimmer"
      />
      {/* Subtle shockwave glow timed with thud */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded blur-[14px] bg-brand-500/30"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: [0, 0.5, 0], scale: [0.95, 1.15, 1.08] }}
        transition={{ duration: 0.8, times: [0, 0.35, 1], ease: "easeOut" }}
      />
    </div>
  )
}