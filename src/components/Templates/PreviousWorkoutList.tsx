import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Workout } from '../../types/workout'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { RepeatWorkoutCard } from '../Workout/RepeatWorkoutCard'

interface PreviousWorkoutListProps {
  onSelectWorkout: (workout: Workout) => void
  refreshTrigger: number
  onBack: () => void
}

export const PreviousWorkoutList: React.FC<PreviousWorkoutListProps> = ({ 
  onSelectWorkout, 
  refreshTrigger,
  onBack
}) => {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all')

  const fetchWorkouts = async () => {
    if (!user) return

    try {
      let query = supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      // Apply time filter
      if (timeFilter === 'week') {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        query = query.gte('date', oneWeekAgo.toISOString())
      } else if (timeFilter === 'month') {
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        query = query.gte('date', oneMonthAgo.toISOString())
      }

      const { data, error } = await query.limit(20)

      if (error) throw error

      // Filter out incomplete workouts - must have BOTH exercises AND duration
      const completeWorkouts = (data || []).filter(workout => {
        const hasExercises = workout.exercises?.exercises && 
                            Array.isArray(workout.exercises.exercises) && 
                            workout.exercises.exercises.length > 0
        const hasDuration = workout.duration && workout.duration > 0
        
        // Must have both exercises AND duration to be a complete workout
        return hasExercises && hasDuration
      })

      setWorkouts(completeWorkouts)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkouts()
  }, [user, refreshTrigger, timeFilter])

  // Filter workouts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredWorkouts(workouts)
    } else {
      const filtered = workouts.filter(workout => {
        const exerciseNames = workout.exercises?.exercises?.map(ex => ex.name.toLowerCase()) || []
        const query = searchQuery.toLowerCase()
        return exerciseNames.some(name => name.includes(query))
      })
      setFilteredWorkouts(filtered)
    }
  }, [workouts, searchQuery])

  const handleRepeatWorkout = (workout: Workout) => {
    onSelectWorkout(workout)
  }

  if (loading) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-background">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
          <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.400/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.600/.18),transparent_60%),linear-gradient(180deg,theme(colors.slate.950),theme(colors.slate.900))]" />
        </div>
        <section className="relative z-10 mx-auto max-w-lg px-4 pt-6 pb-24">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Loading workouts...</p>
          </div>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-background">
        <section className="relative z-10 mx-auto max-w-lg px-4 pt-6 pb-24">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="mb-2 text-xl font-bold text-red-600">Error Loading Workouts</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">{error}</p>
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
          <Button variant="ghost" size="sm" className="text-amber-100" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="bg-gradient-to-r from-brand-300 via-amber-300 to-brand-500 bg-clip-text text-xl font-black uppercase tracking-tight text-transparent">
              Repeat Workout
            </h1>
            <p className="text-xs text-slate-700 dark:text-slate-300">Choose a workout to repeat</p>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-900" />
            <Input
              placeholder="Search workouts by exercise name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-2 border-amber-400 bg-amber-300 pl-10 text-amber-900 placeholder:text-amber-700 focus-visible:ring-amber-500"
            />
          </div>
        </motion.div>

        {/* Time Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
          className="mb-6 flex gap-2 overflow-x-auto pb-2"
        >
          <Button 
            size="sm" 
            className={timeFilter === 'all' ? "shrink-0 bg-brand-500 hover:bg-brand-600 text-white" : "shrink-0 border-brand-400/30 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20"}
            variant={timeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('all')}
          >
            All Time
          </Button>
          <Button
            size="sm"
            className={timeFilter === 'week' ? "shrink-0 bg-brand-500 hover:bg-brand-600 text-white" : "shrink-0 border-brand-400/30 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20"}
            variant={timeFilter === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('week')}
          >
            This Week
          </Button>
          <Button
            size="sm"
            className={timeFilter === 'month' ? "shrink-0 bg-brand-500 hover:bg-brand-600 text-white" : "shrink-0 border-brand-400/30 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20"}
            variant={timeFilter === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('month')}
          >
            This Month
          </Button>
        </motion.div>

        {/* Workouts List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-3"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
              {searchQuery ? 'Search Results' : 'Recent Workouts'}
            </h2>
            <span className="text-xs text-slate-600 dark:text-slate-400">{filteredWorkouts.length} workouts</span>
          </div>

          {filteredWorkouts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="mb-4 text-6xl">💪</div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                {searchQuery ? 'No Matching Workouts' : 'No Workouts Yet'}
              </h3>
              <p className="mb-6 text-sm text-slate-700 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                {searchQuery 
                  ? `No workouts found matching "${searchQuery}". Try a different search term.`
                  : 'Complete your first workout to see it here for repeating later.'
                }
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredWorkouts.map((workout, index) => (
                <RepeatWorkoutCard
                  key={workout.id}
                  workout={workout}
                  delay={0.1 * index}
                  onRepeat={() => handleRepeatWorkout(workout)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </main>
  )
}