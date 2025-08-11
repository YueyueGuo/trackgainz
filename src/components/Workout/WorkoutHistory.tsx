import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { History, Filter, Search } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { WorkoutSummaryCard } from "./WorkoutSummaryCard"
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Workout, Exercise } from '../../types/workout'
import { transformWorkoutToSummary, calculateWorkoutStats } from '../../utils/workoutUtils'

interface WorkoutHistoryProps {
  onWorkoutSelect: (workoutId: string) => void
  refreshTrigger?: number
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ 
  onWorkoutSelect,
  refreshTrigger = 0
}) => {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [offset, setOffset] = useState(0)
  const LIMIT = 10

  const cleanupIncompleteWorkouts = async () => {
    if (!user) return

    try {
      // Get all workouts to identify incomplete ones
      const { data: allWorkouts, error: fetchError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)

      if (fetchError) throw fetchError

      // Identify incomplete workouts (zero duration + no exercises, or empty exercises array)
      const incompleteWorkouts = (allWorkouts || []).filter(workout => {
        const hasNoExercises = !workout.exercises?.exercises || 
                               !Array.isArray(workout.exercises.exercises) || 
                               workout.exercises.exercises.length === 0
        const hasZeroDuration = !workout.duration || workout.duration === 0
        
        return hasNoExercises && hasZeroDuration
      })

      // Delete incomplete workouts
      if (incompleteWorkouts.length > 0) {
        console.log(`Cleaning up ${incompleteWorkouts.length} incomplete workout sessions`)
        const workoutIds = incompleteWorkouts.map(w => w.id)
        
        const { error: deleteError } = await supabase
          .from('workouts')
          .delete()
          .in('id', workoutIds)

        if (deleteError) throw deleteError
        console.log('Successfully cleaned up incomplete workouts')
      }
    } catch (error) {
      console.error('Error cleaning up incomplete workouts:', error)
    }
  }

  const fetchWorkouts = async (reset = true) => {
    if (!user) return

    try {
      if (reset) {
        setLoading(true)
        setOffset(0)
        
        // Clean up incomplete workouts before fetching
        await cleanupIncompleteWorkouts()
      } else {
        setLoadingMore(true)
      }

      // Get total count after cleanup
      const { count, error: countError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) throw countError
      setTotalWorkouts(count || 0)

      // Then get the workouts with pagination
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .range(reset ? 0 : offset, reset ? LIMIT - 1 : offset + LIMIT - 1)

      if (error) throw error

      // Filter: Only show workouts that have actual exercises
      const validWorkouts = (data || []).filter(workout => 
        workout.exercises?.exercises && 
        Array.isArray(workout.exercises.exercises) && 
        workout.exercises.exercises.length > 0
      )

      if (reset) {
        setWorkouts(validWorkouts)
        setFilteredWorkouts(validWorkouts)
        setOffset(LIMIT)
      } else {
        const newWorkouts = [...workouts, ...validWorkouts]
        setWorkouts(newWorkouts)
        setFilteredWorkouts(newWorkouts)
        setOffset(offset + LIMIT)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchWorkouts()
  }, [user, refreshTrigger]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    fetchWorkouts(false)
  }

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredWorkouts(workouts)
    } else {
      const filtered = workouts.filter(workout => {
        const date = new Date(workout.date).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }).toLowerCase()
        
        const exercises = workout.exercises?.exercises?.map(ex => ex.name).join(' ').toLowerCase() || ''
        
        return date.includes(searchTerm.toLowerCase()) || 
               exercises.includes(searchTerm.toLowerCase())
      })
      setFilteredWorkouts(filtered)
    }
  }, [searchTerm, workouts])

  // Calculate stats from real data
  const stats = calculateWorkoutStats(workouts)

  if (loading) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-background">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
          <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.400/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.600/.18),transparent_60%),linear-gradient(180deg,theme(colors.slate.950),theme(colors.slate.900))]" />
        </div>
        <section className="relative z-10 mx-auto max-w-lg px-4 pt-6 pb-24">
          <div className="flex items-center justify-center h-64">
            <div className="text-amber-100 text-lg font-semibold">Loading workouts...</div>
          </div>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-background">
        <section className="relative z-10 mx-auto max-w-lg px-4 pt-6 pb-24">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400 text-lg font-semibold">Error: {error}</div>
          </div>
        </section>
      </main>
    )
  }

  if (workouts.length === 0) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-background">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
          <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.400/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.600/.18),transparent_60%),linear-gradient(180deg,theme(colors.slate.950),theme(colors.slate.900))]" />
        </div>
        <section className="relative z-10 mx-auto max-w-lg px-4 pt-6 pb-24">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h3 className="text-xl font-bold text-amber-50 mb-2">No Workouts Yet</h3>
            <p className="text-amber-100/70">Complete your first workout to see it here!</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.400/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.600/.18),transparent_60%),linear-gradient(180deg,theme(colors.slate.950),theme(colors.slate.900))]" />
        <div className="animate-blob absolute -top-24 -left-16 h-64 w-64 rounded-full bg-brand-500/14 blur-3xl will-change-transform" />
        <div
          className="animate-blob absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-amber-400/14 blur-3xl will-change-transform"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <section className="relative z-10 mx-auto max-w-lg px-4 pt-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#6b3a0e]/80 bg-[#2b1508] shadow-[0_10px_30px_-10px_rgba(255,153,0,0.4)]">
              <History className="h-5 w-5 text-amber-100" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-brand-300 via-amber-300 to-brand-500 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent">
                History
              </h1>
              <p className="text-md text-zinc-600 dark:text-zinc-400">View your workout history</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="mb-6 grid grid-cols-2 gap-3"
        >
          <div className="rounded-xl border border-[#5a3714]/50 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-3">
            <div className="text-2xl font-bold text-brand-400">{stats.totalWorkouts}</div>
            <div className="text-xs uppercase tracking-wide text-amber-100/60">Total Workouts</div>
          </div>
          <div className="rounded-xl border border-[#5a3714]/50 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-3">
            <div className="text-2xl font-bold text-brand-400">{stats.currentStreak}</div>
            <div className="text-xs uppercase tracking-wide text-amber-100/60">Day Streak 🔥</div>
          </div>
          <div className="rounded-xl border border-[#5a3714]/50 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-3">
            <div className="text-2xl font-bold text-brand-400">{stats.avgDuration}</div>
            <div className="text-xs uppercase tracking-wide text-amber-100/60">Avg Duration</div>
          </div>
          <div className="rounded-xl border border-[#5a3714]/50 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-3">
            <div className="text-2xl font-bold text-brand-400">{(stats.totalVolume / 1000).toFixed(0)}k</div>
            <div className="text-xs uppercase tracking-wide text-amber-100/60">Total Volume</div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!border-slate-300 !bg-slate-50 !text-slate-900 placeholder:!text-slate-500 border-2 pl-10 focus-visible:!ring-slate-400 focus-visible:!border-slate-400"
            />
          </div>
        </motion.div>

        {/* Recent Workouts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold uppercase tracking-wide text-amber-400">Recent Workouts</h2>

          {filteredWorkouts.length === 0 && searchTerm ? (
            <div className="text-center py-8">
              <p className="text-amber-100/70">No workouts found matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorkouts.map((workout, index) => (
                <WorkoutSummaryCard 
                  key={workout.id} 
                  workout={transformWorkoutToSummary(workout)} 
                  delay={0.1 * index}
                  onClick={() => onWorkoutSelect(workout.id)}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Load More - only show if there are more workouts available */}
        {!searchTerm && workouts.length < totalWorkouts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="border-brand-400/30 !bg-brand-500 !text-white hover:bg-brand-500/20 disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load More Workouts'}
            </Button>
            <p className="mt-2 text-xs text-amber-100/50">
              Showing {workouts.length} of {totalWorkouts} workouts
            </p>
          </motion.div>
        )}
      </section>
    </main>
  )
}