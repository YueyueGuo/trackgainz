import React from "react"
import { motion } from "framer-motion"
import { ChevronRight, Clock, Dumbbell, Weight, Calendar } from "lucide-react"

type WorkoutSummary = {
  id: string
  date: string
  timeAgo: string
  duration: string
  exerciseCount: number
  totalVolume: number
  workoutName: string
  completionRate: number // 0-100
}

type WorkoutSummaryCardProps = {
  workout: WorkoutSummary
  delay?: number
  onClick: () => void
}

export const WorkoutSummaryCard: React.FC<WorkoutSummaryCardProps> = ({ 
  workout, 
  delay = 0, 
  onClick 
}) => {
  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k`
    }
    return volume.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        onClick={onClick}
        className="group relative overflow-hidden rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-4 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)] transition-all hover:shadow-[0_25px_80px_-20px_rgba(255,153,0,0.6)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400/50"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

        {/* Hover glow effect */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <span className="absolute -inset-1 bg-[radial-gradient(600px_200px_at_50%_0%,rgba(255,200,120,0.08),transparent_60%)]" />
        </span>

        <div className="relative">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold uppercase tracking-wide text-amber-50">{workout.workoutName}</h3>
              <div className="flex items-center gap-2 text-sm text-amber-100/70">
                <Calendar className="h-4 w-4" />
                <span>{workout.date}</span>
                <span>•</span>
                <span>{workout.timeAgo}</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-amber-100/60 transition-transform group-hover:translate-x-1" />
          </div>

          {/* Stats Grid */}
          <div className="mb-3 grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-[#241307]/60 p-2">
              <Clock className="h-4 w-4 text-brand-400" />
              <div>
                <div className="text-sm font-bold text-amber-50">{workout.duration}</div>
                <div className="text-xs text-amber-100/60">Duration</div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-[#241307]/60 p-2">
              <Dumbbell className="h-4 w-4 text-brand-400" />
              <div>
                <div className="text-sm font-bold text-amber-50">{workout.exerciseCount}</div>
                <div className="text-xs text-amber-100/60">Exercises</div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-[#241307]/60 p-2">
              <Weight className="h-4 w-4 text-brand-400" />
              <div>
                <div className="text-sm font-bold text-amber-50">{formatVolume(workout.totalVolume)} lbs</div>
                <div className="text-xs text-amber-100/60">Volume</div>
              </div>
            </div>
          </div>

          {/* Completion Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-amber-100/70">Completion</span>
              <span className="font-semibold text-brand-300">{workout.completionRate}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#241307]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${workout.completionRate}%` }}
                transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-brand-400 to-brand-500"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Export the type for use in other components
export type { WorkoutSummary }