"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Calendar, Target, ChevronDown, BarChart3 } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "../ui/chart"
import { Button } from "../ui/button"

type ExerciseData = {
  name: string
  currentMax: number
  trend: number
  lastWorkout: string
  totalSets: number
  data: Array<{
    date: string
    weight: number
  }>
}

type ExerciseAnalyticsCardProps = {
  exercises: ExerciseData[]
  delay?: number
  onViewDetails: (exerciseName: string) => void
}

export default function ExerciseAnalyticsCard({ exercises, delay = 0, onViewDetails }: ExerciseAnalyticsCardProps) {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  if (!exercises || exercises.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]"
      >
        <div className="relative p-4 text-center">
          <BarChart3 className="mx-auto h-6 w-6 text-brand-400 mb-2" />
          <h3 className="text-base font-bold uppercase tracking-wide text-amber-50 mb-1">Exercise Analytics</h3>
          <p className="text-sm text-amber-100/60">Complete more workouts to see exercise progress</p>
        </div>
      </motion.div>
    )
  }

  const exercise = exercises[0] // Simplified to always show the first exercise for now
  const isImproving = exercise.trend > 0

  const chartData = exercise.data.map((d) => ({ ...d, isProjected: false }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

      <div className="relative p-2.5">
        {/* Compact Header */}
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-brand-400" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-amber-50">Exercise Analytics</h3>
          </div>
          <button
            onClick={() => onViewDetails(exercise.name)}
            className="text-xs font-semibold text-brand-300 hover:text-brand-200"
          >
            View All
          </button>
        </div>

        {/* Compact Exercise Dropdown */}
        <div className="relative mb-2.5">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-[#6b3a0e] bg-[#241307] p-2 text-left text-amber-50 hover:bg-[#2b1508]"
          >
            <span className="text-xs font-semibold">{exercise.name}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-[#6b3a0e] bg-[#241307] shadow-lg"
            >
              {exercises.map((ex, index) => (
                <button
                  key={ex.name}
                  onClick={() => {
                    setSelectedExercise(ex)
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full p-2 text-left text-xs hover:bg-[#2b1508] ${
                    index === 0 ? "rounded-t-lg" : ""
                  } ${index === exercises.length - 1 ? "rounded-b-lg" : ""}`}
                >
                  {ex.name}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Compact Stats Grid */}
        <div className="mb-3 grid grid-cols-4 gap-1.5">
          <div className="rounded-lg bg-[#241307]/60 p-1.5 text-center">
            <div className="text-sm font-bold text-brand-400">{exercise.currentMax}</div>
            <div className="text-xs text-amber-100/60">Max</div>
          </div>
          <div className="rounded-lg bg-[#241307]/60 p-1.5 text-center">
            <div
              className={`flex items-center justify-center gap-0.5 text-sm font-bold ${
                isImproving ? "text-green-400" : "text-red-400"
              }`}
            >
              {isImproving ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              {Math.abs(exercise.trend)}%
            </div>
            <div className="text-xs text-amber-100/60">Trend</div>
          </div>
          <div className="rounded-lg bg-[#241307]/60 p-1.5 text-center">
            <div className="text-sm font-bold text-brand-400">{exercise.totalSets}</div>
            <div className="text-xs text-amber-100/60">Sets</div>
          </div>
          <div className="rounded-lg bg-[#241307]/60 p-1.5 text-center">
            <div className="text-sm font-bold text-brand-400">{exercise.lastWorkout}</div>
            <div className="text-xs text-amber-100/60">Last</div>
          </div>
        </div>

        {/* Compact Chart */}
        <div>
          <ChartContainer
            config={{
              weight: {
                label: "Weight (lbs)",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[100px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#fbbf24", fontSize: 9 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#fbbf24", fontSize: 9 }}
                  domain={["dataMin - 5", "dataMax + 5"]}
                />
                <Tooltip
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: "#1a0f06",
                    border: "1px solid #5a3714",
                    borderRadius: "6px",
                    color: "#fbbf24",
                    fontSize: "11px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#ff9900"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const { payload } = props
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={2}
                        fill="#ff9900"
                        stroke="#ff9900"
                        strokeWidth={1}
                      />
                    )
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </motion.div>
  )
}