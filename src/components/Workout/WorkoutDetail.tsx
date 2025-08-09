import React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Clock, RotateCw, Share } from "lucide-react"
import { Button } from "../ui/button"
import { Workout } from '../../types/workout'

interface WorkoutDetailProps {
  workout: Workout
  onBack: () => void
  onRepeatWorkout?: (workout: Workout) => void
}

export const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ 
  workout, 
  onBack, 
  onRepeatWorkout 
}) => {
  // Calculate completion rate
  const completedSets = workout.exercises?.exercises?.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
    0,
  ) || 0
  const totalSets = workout.exercises?.exercises?.reduce(
    (total, exercise) => total + exercise.sets.length, 
    0
  ) || 0
  const completionRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  // Calculate total volume
  const totalVolume = workout.exercises?.exercises?.reduce((total, exercise) => 
    total + exercise.sets.reduce((exerciseTotal, set) => 
      exerciseTotal + (set.weight * set.reps), 0
    ), 0
  ) || 0

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return "Today, " + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else if (diffDays === 2) {
      return "Yesterday, " + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  // Format duration
  const formatDuration = (duration?: number): string => {
    if (!duration) return "0:00"
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Format time
  const formatTime = (timeString?: string): string => {
    if (!timeString) return "Not recorded"
    const time = new Date(timeString)
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Generate workout name from first exercise
  const workoutName = workout.exercises?.exercises?.[0]?.name?.split(' ')[0] + " Day" || "Workout"

  const handleRepeatWorkout = () => {
    if (onRepeatWorkout) {
      onRepeatWorkout(workout)
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.400/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.600/.18),transparent_60%),linear-gradient(180deg,theme(colors.slate.950),theme(colors.slate.900))]" />
      </div>

      <section className="relative z-10 mx-auto max-w-lg px-4 pt-6 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6 flex items-center justify-between"
        >
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-amber-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button 
              type="button"
              size="sm" 
              variant="outline" 
              onClick={handleRepeatWorkout}
              className="border-brand-400/30 bg-brand-500/10 text-brand-300"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Repeat
            </Button>
            <Button 
              type="button"
              size="sm" 
              variant="outline" 
              className="border-zinc-700/50 bg-zinc-900/50 text-zinc-300"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Workout Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="mb-6 rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-6 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

          <div className="relative">
            <h1 className="mb-2 text-2xl font-black uppercase tracking-tight text-amber-50">
              {workoutName}
            </h1>

            <div className="mb-4 flex items-center gap-4 text-sm text-amber-100/70">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(workout.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {workout.start_time ? formatTime(workout.start_time) : 'Start'} - {workout.end_time ? formatTime(workout.end_time) : 'End'}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-lg bg-[#241307]/60 p-3 text-center">
                <div className="text-lg font-bold text-brand-400">{formatDuration(workout.duration)}</div>
                <div className="text-xs text-amber-100/60">Duration</div>
              </div>
              <div className="rounded-lg bg-[#241307]/60 p-3 text-center">
                <div className="text-lg font-bold text-brand-400">{workout.exercises?.exercises?.length || 0}</div>
                <div className="text-xs text-amber-100/60">Exercises</div>
              </div>
              <div className="rounded-lg bg-[#241307]/60 p-3 text-center">
                <div className="text-lg font-bold text-brand-400">
                  {(totalVolume / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-amber-100/60">Volume</div>
              </div>
              <div className="rounded-lg bg-[#241307]/60 p-3 text-center">
                <div className="text-lg font-bold text-brand-400">{completionRate}%</div>
                <div className="text-xs text-amber-100/60">Complete</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Exercises */}
        {workout.exercises?.exercises && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold uppercase tracking-wide text-amber-50">Exercise Details</h2>

            {workout.exercises.exercises.map((exercise, exerciseIndex) => (
              <motion.div
                key={exerciseIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * exerciseIndex, duration: 0.5, ease: "easeOut" }}
                className="rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]"
              >
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

                {/* Exercise Header */}
                <div className="relative border-b border-[#5a3714]/50 p-4">
                  <h3 className="text-lg font-bold uppercase tracking-wide text-amber-50">{exercise.name}</h3>
                  {exercise.note && <p className="mt-1 text-sm text-amber-100/80 italic">"{exercise.note}"</p>}
                </div>

                {/* Sets */}
                <div className="relative p-4">
                  <div className="mb-2 grid grid-cols-5 gap-2 text-xs font-bold uppercase tracking-wide text-amber-100/80">
                    <div className="text-center">Set</div>
                    <div className="text-center">Weight</div>
                    <div className="text-center">Reps</div>
                    <div className="text-center">Type</div>
                    <div className="text-center">✓</div>
                  </div>

                  <div className="space-y-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className={`grid grid-cols-5 gap-2 rounded-lg p-2 text-sm ${
                          set.completed
                            ? "bg-green-500/10 ring-1 ring-green-500/20"
                            : "bg-red-500/10 ring-1 ring-red-500/20"
                        }`}
                      >
                        <div className="flex justify-center">
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2b1508] text-xs font-bold text-amber-100">
                            {setIndex + 1}
                          </div>
                        </div>
                        <div className="text-center font-semibold text-amber-50">{set.weight || "BW"}</div>
                        <div className="text-center font-semibold text-amber-50">{set.reps}</div>
                        <div className="text-center text-xs text-amber-100/70">
                          {set.type === "regular" ? "Work" : set.type === "warmup" ? "Warm" : set.type}
                        </div>
                        <div className="flex justify-center">
                          {set.completed ? (
                            <div className="h-4 w-4 rounded-full bg-green-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full bg-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </main>
  )
}