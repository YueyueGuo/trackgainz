import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, ClipboardList, RotateCw, LogOut } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { EnhancedWorkoutForm } from '../components/Workout/EnhancedWorkoutForm'
import { TemplateList } from '../components/Templates/TemplateList'
import { CreateTemplateForm } from '../components/Templates/CreateTemplateForm'
import { PreviousWorkoutList } from '../components/Templates/PreviousWorkoutList'
import { Exercise, WorkoutTemplate, Workout } from '../types/workout'
import { supabase } from '../lib/supabase'
import ShimmerHeading from '../components/ShimmerHeading'

type RecordPageView = 'options' | 'templates' | 'create-template' | 'previous-workouts' | 'workout'

interface WorkoutStats {
  currentStreak: number
  lastWorkout: string | null
  totalWorkouts: number
}

export const RecordPage: React.FC = () => {
  const { signOut, user } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [currentView, setCurrentView] = useState<RecordPageView>('options')
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([])
  const [workoutSource, setWorkoutSource] = useState<string>('')
  const [hasChosenWorkoutStart, setHasChosenWorkoutStart] = useState<boolean>(false)
  const [isFreshWorkout, setIsFreshWorkout] = useState<boolean>(false)
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
    currentStreak: 0,
    lastWorkout: null,
    totalWorkouts: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // Fetch workout statistics
  const fetchWorkoutStats = async () => {
    if (!user) return

    try {
      setStatsLoading(true)
      
      // Fetch all workouts for the user, ordered by date
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('date, exercises')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error

      if (workouts && workouts.length > 0) {
        // Calculate total workouts
        const totalWorkouts = workouts.length

        // Get last workout info
        const lastWorkout = workouts[0]
        let lastWorkoutName = 'No exercises'
        if (lastWorkout.exercises?.exercises && lastWorkout.exercises.exercises.length > 0) {
          const exerciseNames = lastWorkout.exercises.exercises
            .filter((ex: any) => ex.name && ex.name.trim())
            .map((ex: any) => ex.name)
            .slice(0, 2) // Take first 2 exercise names
          lastWorkoutName = exerciseNames.join(' & ') || 'No exercises'
        }

        // Calculate current streak
        let currentStreak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        let currentDate = new Date(today)
        
        for (let i = 0; i < 365; i++) { // Check up to 1 year back
          const dateStr = currentDate.toISOString().split('T')[0]
          const hasWorkoutOnDate = workouts.some(workout => workout.date === dateStr)
          
          if (hasWorkoutOnDate) {
            currentStreak++
            currentDate.setDate(currentDate.getDate() - 1)
          } else {
            break
          }
        }

        setWorkoutStats({
          currentStreak,
          lastWorkout: lastWorkoutName,
          totalWorkouts
        })
      } else {
        setWorkoutStats({
          currentStreak: 0,
          lastWorkout: null,
          totalWorkouts: 0
        })
      }
    } catch (error) {
      console.error('Error fetching workout stats:', error)
      setWorkoutStats({
        currentStreak: 0,
        lastWorkout: null,
        totalWorkouts: 0
      })
    } finally {
      setStatsLoading(false)
    }
  }

  // Fetch stats on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchWorkoutStats()
  }, [refreshTrigger, user])

  const handleWorkoutAdded = () => {
    setRefreshTrigger(prev => prev + 1)
    // Reset workout state after completion
    setWorkoutExercises([])
    setWorkoutSource('')
    setHasChosenWorkoutStart(false)
    setIsFreshWorkout(false)
    setCurrentView('options')
  }

  const handleTemplateCreated = () => {
    setRefreshTrigger(prev => prev + 1)
    setCurrentView('templates')
  }

  const handleStartFromTemplate = (template: WorkoutTemplate) => {
    if (template.exercises?.exercises) {
      // Reset completion status for all sets
      const resetExercises = template.exercises.exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({ ...set, completed: false }))
      }))
      
      setWorkoutExercises(resetExercises)
      setWorkoutSource(`Template: ${template.name}`)
      setHasChosenWorkoutStart(true)
      setIsFreshWorkout(false)
      setCurrentView('workout')
    }
  }

  const handleStartFromPrevious = (workout: Workout) => {
    if (workout.exercises?.exercises) {
      // Reset completion status for all sets
      const resetExercises = workout.exercises.exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({ ...set, completed: false }))
      }))
      
      setWorkoutExercises(resetExercises)
      const workoutDate = new Date(workout.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      setWorkoutSource(`Previous: ${workoutDate}`)
      setHasChosenWorkoutStart(true)
      setIsFreshWorkout(false)
      setCurrentView('workout')
    }
  }

  const handleStartBlank = () => {
    setWorkoutExercises([])
    setWorkoutSource('')
    setHasChosenWorkoutStart(true)
    setIsFreshWorkout(true)
    setCurrentView('workout')
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const workoutOptions = [
    {
      title: "Fresh Start",
      description: "Build from scratch",
      icon: Dumbbell,
      cta: "Start Fresh",
      delay: 0.1,
      onClick: handleStartBlank
    },
    {
      title: "Use Template",
      description: "See saved routines",
      icon: ClipboardList,
      cta: "Template",
      delay: 0.15,
      onClick: () => setCurrentView('templates')
    },
    {
      title: "Repeat",
      description: "Previous workout",
      icon: RotateCw,
      cta: "Browse History",
      delay: 0.2,
      onClick: () => setCurrentView('previous-workouts')
    },
  ]

  const renderWorkoutOptions = () => (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-transparent">
      {/* Clean adaptive background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
        <div className="animate-blob absolute -top-24 -left-16 h-64 w-64 rounded-full bg-brand-500/14 blur-3xl will-change-transform" />
        <div
          className="animate-blob absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-amber-400/14 blur-3xl will-change-transform"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col px-4 pt-6 pb-24">
        {/* Header with branding and main CTA */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          {/* Top bar with brand and logout */}
          <div className="flex items-center justify-between mb-6">
            <ShimmerHeading text="Track Gainz" className="text-3xl sm:text-4xl" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-zinc-700/50 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800/50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Main call to action */}
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              className="text-xl sm:text-2xl font-black text-zinc-600 dark:text-amber-50 uppercase tracking-wide mb-2"
            >
              Choose Your Workout Style
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-sm text-zinc-500 dark:text-amber-100/70 font-semibold"
            >
              Pick the best way to start your training session
            </motion.p>
          </div>
        </motion.div>

        {/* Three equal workout option cards */}
        <div className="grid gap-4">
          {workoutOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: option.delay, duration: 0.5, ease: "easeOut" }}
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className="group relative overflow-hidden rounded-2xl border border-brand-800/70 bg-gradient-to-b from-brand-950 to-brand-900 p-5 shadow-brand transition-all hover:shadow-[0_25px_80px_-20px_rgba(255,153,0,0.6)] cursor-pointer"
                  onClick={option.onClick}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-brand-400/10" />
                  
                  {/* Hover glow effect */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  >
                    <span className="absolute -inset-1 bg-[radial-gradient(600px_200px_at_50%_0%,rgba(255,200,120,0.08),transparent_60%)]" />
                  </span>

                  <div className="relative flex items-center gap-4">
                    {/* Icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-700/80 bg-brand-950/80 shadow-[0_10px_30px_-10px_rgba(255,153,0,0.4)]">
                      <IconComponent className="h-6 w-6 text-amber-100" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-bold uppercase tracking-wide text-amber-50">
                        {option.title}
                      </h3>
                      <p className="text-sm text-amber-100/80">
                        {option.description}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <div className="shrink-0">
                      <Button
                        size="sm"
                        className="group/button relative overflow-hidden bg-brand-500 font-semibold text-white shadow-[0_10px_30px_-10px_rgba(255,153,0,0.7)] transition-colors hover:bg-brand-600"
                      >
                        <span className="relative z-10 text-xs">{option.cta}</span>
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] transition-transform duration-1000 group-hover/button:translate-x-full" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Stats footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 text-center"
        >
          {statsLoading ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Loading stats...
            </p>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {workoutStats.currentStreak > 0 ? (
                <>
                  🔥 <span className="font-semibold text-brand-400">{workoutStats.currentStreak}-day streak</span>
                  {workoutStats.lastWorkout && (
                    <> • Last: {workoutStats.lastWorkout}</>
                  )}
                  <> • {workoutStats.totalWorkouts} total workouts</>
                </>
              ) : (
                <>
                  {workoutStats.totalWorkouts > 0 ? (
                    <>
                      {workoutStats.lastWorkout && (
                        <>Last: {workoutStats.lastWorkout} • </>
                      )}
                      {workoutStats.totalWorkouts} total workouts
                    </>
                  ) : (
                    <>Start your fitness journey today!</>
                  )}
                </>
              )}
            </p>
          )}
        </motion.div>
      </section>
    </main>
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case 'templates':
        return (
          <div>
            <div className="view-header">
              <button 
                onClick={() => setCurrentView('options')} 
                className="back-btn"
              >
                ← BACK TO OPTIONS
              </button>
            </div>
            <TemplateList
              onSelectTemplate={handleStartFromTemplate}
              onCreateTemplate={() => setCurrentView('create-template')}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )
      
      case 'create-template':
        return (
          <CreateTemplateForm
            onTemplateCreated={handleTemplateCreated}
            onCancel={() => setCurrentView('templates')}
            initialExercises={workoutExercises}
          />
        )
      
      case 'previous-workouts':
        return (
          <PreviousWorkoutList
            onSelectWorkout={handleStartFromPrevious}
            refreshTrigger={refreshTrigger}
            onBack={() => setCurrentView('options')}
          />
        )
      
      case 'workout':
        return (
          <div>
            
            <EnhancedWorkoutForm 
              onWorkoutAdded={handleWorkoutAdded}
              initialExercises={workoutExercises}
              workoutSource={workoutSource}
              isFreshWorkout={isFreshWorkout}
            />
          </div>
        )
      
      case 'options':
      default:
        return renderWorkoutOptions()
    }
  }

  return (
    <div className="main-content">
      {renderCurrentView()}
    </div>
  )
} 