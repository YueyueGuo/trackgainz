import React from 'react'
import { motion } from 'framer-motion'
import { RotateCw, Clock, Dumbbell, Calendar, ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import { Workout } from '../../types/workout'

type RepeatWorkoutCardProps = {
  workout: Workout
  delay?: number
  onRepeat: () => void
}

export const RepeatWorkoutCard: React.FC<RepeatWorkoutCardProps> = ({ workout, delay = 0, onRepeat }) => {
  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k`
    }
    return volume.toString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const workoutDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (workoutDate.getTime() === today.getTime()) {
      return 'Today'
    } else if (workoutDate.getTime() === yesterday.getTime()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays === 1) return '1 day ago'
      if (diffInDays < 7) return `${diffInDays} days ago`
      if (diffInDays < 14) return '1 week ago'
      return `${Math.floor(diffInDays / 7)} weeks ago`
    }
  }

  const formatDuration = (durationInSeconds: number | null | undefined) => {
    if (!durationInSeconds || durationInSeconds <= 0) return '0:00'
    
    const hours = Math.floor(durationInSeconds / 3600)
    const minutes = Math.floor((durationInSeconds % 3600) / 60)
    const seconds = durationInSeconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  const calculateTotalVolume = (workout: Workout) => {
    if (!workout.exercises?.exercises) return 0
    
    return workout.exercises.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.weight * set.reps)
      }, 0)
    }, 0)
  }

  const exercises = workout.exercises?.exercises || []
  const exerciseNames = exercises.map(ex => ex.name)
  const totalVolume = calculateTotalVolume(workout)
  const workoutTitle = formatDate(workout.date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-4 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)] transition-all hover:shadow-[0_25px_80px_-20px_rgba(255,153,0,0.6)]"
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
          <div className="flex-1">
            <h3 className="text-lg font-bold uppercase tracking-wide text-amber-50">{workoutTitle}</h3>
            <div className="flex items-center gap-2 text-sm text-amber-100/70">
              <Calendar className="h-4 w-4" />
              <span>{workoutTitle}</span>
              <span>•</span>
              <span>{formatTimeAgo(workout.date)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-amber-100/60" />
          </div>
        </div>

        {/* Exercise Preview */}
        <div className="mb-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-100/80">
            Exercises ({exercises.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {exerciseNames.slice(0, 3).map((exercise, index) => (
              <span key={index} className="rounded-full bg-brand-500/20 px-2 py-1 text-xs font-medium text-brand-300">
                {exercise}
              </span>
            ))}
            {exerciseNames.length > 3 && (
              <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">
                +{exerciseNames.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#241307]/60 p-2">
            <Clock className="h-4 w-4 text-brand-400" />
            <div>
              <div className="text-sm font-bold text-amber-50">{formatDuration(workout.duration)}</div>
              <div className="text-xs text-amber-100/60">Duration</div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-[#241307]/60 p-2">
            <Dumbbell className="h-4 w-4 text-brand-400" />
            <div>
              <div className="text-sm font-bold text-amber-50">{formatVolume(totalVolume)} lbs</div>
              <div className="text-xs text-amber-100/60">Volume</div>
            </div>
          </div>
        </div>

        {/* Repeat Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onRepeat}
            className="group/button relative w-full overflow-hidden bg-brand-500 font-bold tracking-wide text-white shadow-[0_10px_30px_-10px_rgba(255,153,0,0.7)] transition-colors hover:bg-brand-600"
          >
            <span className="relative z-10 flex items-center justify-center">
              <RotateCw className="mr-2 h-4 w-4" />
              Repeat This Workout
            </span>
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] transition-transform duration-1000 group-hover/button:translate-x-full" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}