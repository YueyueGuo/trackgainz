"use client"

import { motion } from "framer-motion"
import { X, TrendingUp, Calendar, Target, Award } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Bar, BarChart, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "../ui/chart"
import { Button } from "../ui/button"

// Remove projection-related types
type ExerciseDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  exercise: {
    name: string
    currentMax: number
    allTimeMax: number
    firstRecorded: string
    totalWorkouts: number
    totalSets: number
    totalVolume: number
    personalRecords: Array<{
      date: string
      weight: number
      reps: number
    }>
    volumeHistory: Array<{
      date: string
      volume: number
    }>
    strengthHistory: Array<{
      date: string
      weight: number
      reps: number
    }>
    // Remove projections field
  }
}

export default function ExerciseDetailModal({ isOpen, onClose, exercise }: ExerciseDetailModalProps) {
  if (!isOpen) return null

  const totalGainSinceStart = exercise.currentMax - (exercise.strengthHistory[0]?.weight || exercise.currentMax)
  const gainPercentage = Math.round(
    ((exercise.currentMax - (exercise.strengthHistory[0]?.weight || exercise.currentMax)) /
      (exercise.strengthHistory[0]?.weight || exercise.currentMax)) *
      100,
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-x-0 bottom-0 mx-auto max-w-lg"
      >
          <div className="relative h-[calc(100dvh-env(safe-area-inset-bottom))] overflow-hidden bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)]">
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#ffb547]/10" />

            {/* Header */}
            <div className="relative border-b border-[#5a3714]/50 bg-brand-500 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-tight text-white">{exercise.name} Analytics</h2>
                <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="relative flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(100dvh - 80px)" }}>
              {/* Key Stats */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#5a3714]/50 bg-[#241307]/60 p-4 text-center">
                  <div className="text-2xl font-bold text-brand-400">{exercise.currentMax} lbs</div>
                  <div className="text-xs uppercase tracking-wide text-amber-100/60">Current Max</div>
                </div>
                <div className="rounded-xl border border-[#5a3714]/50 bg-[#241307]/60 p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">+{totalGainSinceStart} lbs</div>
                  <div className="text-xs uppercase tracking-wide text-amber-100/60">
                    Total Gain ({gainPercentage}%)
                  </div>
                </div>
                <div className="rounded-xl border border-[#5a3714]/50 bg-[#241307]/60 p-4 text-center">
                  <div className="text-2xl font-bold text-brand-400">{exercise.totalWorkouts}</div>
                  <div className="text-xs uppercase tracking-wide text-amber-100/60">Total Sessions</div>
                </div>
                <div className="rounded-xl border border-[#5a3714]/50 bg-[#241307]/60 p-4 text-center">
                  <div className="text-2xl font-bold text-brand-400">{(exercise.totalVolume / 1000).toFixed(0)}k</div>
                  <div className="text-xs uppercase tracking-wide text-amber-100/60">Total Volume</div>
                </div>
              </div>

              {/* Strength Progression Chart */}
              <div className="mb-6 rounded-2xl border border-[#5a3714]/70 bg-[#241307]/30 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold uppercase tracking-wide text-amber-50">
                  <TrendingUp className="h-5 w-5 text-brand-400" />
                  Strength Progression
                </h3>

                <ChartContainer
                  config={{
                    weight: {
                      label: "Max Weight (lbs)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={exercise.strengthHistory}>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#fbbf24", fontSize: 10 }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#fbbf24", fontSize: 10 }} />
                      <Tooltip
                        content={<ChartTooltipContent />}
                        contentStyle={{
                          backgroundColor: "#1a0f06",
                          border: "1px solid #5a3714",
                          borderRadius: "8px",
                          color: "#fbbf24",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#ff9900"
                        strokeWidth={3}
                        dot={{ fill: "#ff9900", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#ff9900" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Volume History */}
              <div className="mb-6 rounded-2xl border border-[#5a3714]/70 bg-[#241307]/30 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold uppercase tracking-wide text-amber-50">
                  <Calendar className="h-5 w-5 text-brand-400" />
                  Volume Trends
                </h3>

                <ChartContainer
                  config={{
                    volume: {
                      label: "Volume (lbs)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[150px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={exercise.volumeHistory}>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#fbbf24", fontSize: 10 }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#fbbf24", fontSize: 10 }} />
                      <Tooltip
                        content={<ChartTooltipContent />}
                        contentStyle={{
                          backgroundColor: "#1a0f06",
                          border: "1px solid #5a3714",
                          borderRadius: "8px",
                          color: "#fbbf24",
                        }}
                      />
                      <Bar dataKey="volume" fill="#fbbf24" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Personal Records */}
              <div className="mb-6 rounded-2xl border border-[#5a3714]/70 bg-[#241307]/30 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold uppercase tracking-wide text-amber-50">
                  <Award className="h-5 w-5 text-brand-400" />
                  Personal Records
                </h3>

                <div className="space-y-2">
                  {exercise.personalRecords.slice(0, 5).map((pr, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg bg-[#2b1508]/60 p-3">
                      <div>
                        <div className="font-semibold text-amber-50">
                          {pr.weight} lbs × {pr.reps}
                        </div>
                        <div className="text-xs text-amber-100/70">{pr.date}</div>
                      </div>
                      <div className="text-2xl">🏆</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remove the entire "Future Projections" section */}
            </div>
          </div>
        </motion.div>
      </motion.div>
  )
}