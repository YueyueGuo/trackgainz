"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

type ProgressStatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  delay?: number
}

export default function ProgressStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  delay = 0,
}: ProgressStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-4 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#6b3a0e]/80 bg-[#2b1508] shadow-[0_10px_30px_-10px_rgba(255,153,0,0.4)]">
            <Icon className="h-5 w-5 text-brand-400" />
          </div>
          {trend && (
            <div
              className={`rounded-full px-2 py-1 text-xs font-bold ${
                trend.isPositive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}% {trend.label}
            </div>
          )}
        </div>

        <div className="text-2xl font-black text-amber-50">{value}</div>
        <div className="text-sm font-semibold uppercase tracking-wide text-brand-400">{title}</div>
        {subtitle && <div className="text-xs text-amber-100/60">{subtitle}</div>}
      </div>
    </motion.div>
  )
}