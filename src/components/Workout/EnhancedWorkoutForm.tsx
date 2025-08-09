import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '../ui/button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useUnits } from '../../contexts/UnitContext'
import { Exercise, WorkoutSet, SetType } from '../../types/workout'
import { ExerciseSelector } from './ExerciseSelector'
import { WorkoutTimer } from './WorkoutTimer'
import { WorkoutCelebration } from './WorkoutCelebration'
import { ExerciseCard } from './ExerciseCard'

interface EnhancedWorkoutFormProps {
  onWorkoutAdded: () => void
  initialExercises?: Exercise[]
  workoutSource?: string // e.g., "Template: Leg Day" or "Previous: Jan 15, 2025"
  isFreshWorkout?: boolean // true when starting a fresh workout
}


export const EnhancedWorkoutForm: React.FC<EnhancedWorkoutFormProps> = ({ 
  onWorkoutAdded, 
  initialExercises = [],
  workoutSource,
  isFreshWorkout = false
}) => {
  const { user } = useAuth()
  const { weightUnit } = useUnits()
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerState, setTimerState] = useState<'inactive' | 'active' | 'paused'>('inactive')
  const [pausedAt, setPausedAt] = useState<Date | null>(null)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  // Auto-add empty exercise for fresh workouts
  React.useEffect(() => {
    if (isFreshWorkout && exercises.length === 0) {
      const newExercise: Exercise = {
        name: '',
        sets: [
          { weight: 0, reps: 0, type: 'regular', completed: false },
          { weight: 0, reps: 0, type: 'regular', completed: false },
          { weight: 0, reps: 0, type: 'regular', completed: false }
        ]
      }
      setExercises([newExercise])
    }
  }, [isFreshWorkout, exercises.length])

  // Timer effect - updates every second when workout is active
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (timerState === 'active' && workoutStartTime && !loading) {
      interval = setInterval(() => {
        const now = new Date()
        let elapsed = Math.floor((now.getTime() - workoutStartTime.getTime()) / 1000)
        
        // If we were paused, subtract the paused duration
        if (pausedAt) {
          const pausedDuration = Math.floor((new Date().getTime() - pausedAt.getTime()) / 1000)
          elapsed -= pausedDuration
        }
        
        setElapsedTime(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerState, workoutStartTime, pausedAt, loading])

  // Auto-start timer function
  const startTimerIfNeeded = () => {
    if (timerState === 'inactive') {
      const startTime = new Date()
      setWorkoutStartTime(startTime)
      setTimerState('active')
      setPausedAt(null)
      console.log('Workout timer started at:', startTime)
    }
  }

  // Pause timer function
  const pauseTimer = () => {
    if (timerState === 'active') {
      setTimerState('paused')
      setPausedAt(new Date())
      console.log('Workout timer paused at:', elapsedTime, 'seconds')
    }
  }

  // Resume timer function
  const resumeTimer = () => {
    if (timerState === 'paused' && workoutStartTime && pausedAt) {
      // Adjust start time to account for paused duration
      const pausedDuration = new Date().getTime() - pausedAt.getTime()
      const newStartTime = new Date(workoutStartTime.getTime() + pausedDuration)
      setWorkoutStartTime(newStartTime)
      setTimerState('active')
      setPausedAt(null)
      console.log('Workout timer resumed')
    }
  }

  // Delete/Cancel workout function
  const cancelWorkout = () => {
    if (window.confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
      setExercises([])
      setWorkoutStartTime(null)
      setElapsedTime(0)
      setTimerState('inactive')
      setPausedAt(null)
      setError('')
      console.log('Workout cancelled')
    }
  }

  // Create template from current workout
  const saveAsTemplate = () => {
    if (exercises.length === 0 || exercises.every(ex => !ex.name.trim())) {
      setError('Add exercises before saving as template')
      return
    }

    const templateName = window.prompt('Enter template name:', 'My Workout Template')
    if (!templateName) return

    const saveTemplate = async () => {
      try {
        const templateData = {
          user_id: user?.id,
          name: templateName.trim().toUpperCase(),
          exercises: { 
            exercises: exercises.map(exercise => ({
              ...exercise,
              name: exercise.name.trim().toUpperCase()
            }))
          }
        }

        const { error } = await supabase
          .from('workout_templates')
          .insert(templateData)

        if (error) throw error

        alert('Template saved successfully!')
      } catch (error: any) {
        setError(error.message)
      }
    }

    saveTemplate()
  }

  // Format elapsed time as MM:SS
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle back navigation
  const handleBack = () => {
    if (window.confirm('Are you sure you want to go back? Your workout progress will be lost.')) {
      // Navigate back to workout selection
      window.history.back()
    }
  }

  // Handle timer toggle
  const handleTimerToggle = () => {
    if (timerState === 'active') {
      pauseTimer()
    } else if (timerState === 'paused') {
      resumeTimer()
    }
  }

  // Handle celebration completion
  const handleCelebrationComplete = () => {
    setShowCelebration(false)
    // Reset form and timer
    setExercises([])
    setWorkoutStartTime(null)
    setElapsedTime(0)
    setTimerState('inactive')
    setPausedAt(null)
    onWorkoutAdded()
  }

  // Calculate workout stats for celebration
  const getWorkoutStats = () => {
    const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
    const totalVolume = exercises.reduce((acc, ex) => 
      acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0), 0
    ) / 1000 // Convert to thousands

    return {
      duration: formatElapsedTime(elapsedTime),
      exercises: exercises.filter(ex => ex.name.trim()).length,
      totalSets,
      totalVolume: Math.round(totalVolume * 10) / 10 // Round to 1 decimal
    }
  }

  const addExercise = () => {
    // Auto-start timer when first exercise is added
    startTimerIfNeeded()
    const newExercise: Exercise = {
      name: '',
      sets: [
        { weight: 0, reps: 0, type: 'regular', completed: false },
        { weight: 0, reps: 0, type: 'regular', completed: false },
        { weight: 0, reps: 0, type: 'regular', completed: false }
      ]
    }
    setExercises([...exercises, newExercise])
  }

  const removeExercise = (exerciseIndex: number) => {
    setExercises(exercises.filter((_, i) => i !== exerciseIndex))
  }

  const moveExercise = (exerciseIndex: number, direction: 'up' | 'down') => {
    if (direction === 'up' && exerciseIndex > 0) {
      const newExercises = [...exercises]
      const temp = newExercises[exerciseIndex]
      newExercises[exerciseIndex] = newExercises[exerciseIndex - 1]
      newExercises[exerciseIndex - 1] = temp
      setExercises(newExercises)
    } else if (direction === 'down' && exerciseIndex < exercises.length - 1) {
      const newExercises = [...exercises]
      const temp = newExercises[exerciseIndex]
      newExercises[exerciseIndex] = newExercises[exerciseIndex + 1]
      newExercises[exerciseIndex + 1] = temp
      setExercises(newExercises)
    }
  }

  const updateExerciseNote = (exerciseIndex: number, note: string) => {
    const updatedExercises = [...exercises]
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      note: note.trim()
    }
    setExercises(updatedExercises)
  }

  const updateExerciseName = (exerciseIndex: number, name: string) => {
    // Auto-start timer when user starts typing exercise name
    if (name.trim() && !workoutStartTime) {
      startTimerIfNeeded()
    }

    const updatedExercises = [...exercises]
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      name: name.toUpperCase()
    }
    setExercises(updatedExercises)
  }

  const openExerciseSelector = (exerciseIndex: number) => {
    setEditingExerciseIndex(exerciseIndex)
    setShowExerciseSelector(true)
  }

  const handleExerciseSelect = (exerciseName: string, exerciseId: string) => {
    if (editingExerciseIndex !== null) {
      updateExerciseName(editingExerciseIndex, exerciseName)
      setEditingExerciseIndex(null)
    }
    setShowExerciseSelector(false)
  }

  const closeExerciseSelector = () => {
    setShowExerciseSelector(false)
    setEditingExerciseIndex(null)
  }

  const addSet = (exerciseIndex: number) => {
    const updated = exercises.map((exercise, i) => {
      if (i === exerciseIndex) {
        const newSet: WorkoutSet = { weight: 0, reps: 0, type: 'regular', completed: false }
        return { ...exercise, sets: [...exercise.sets, newSet] }
      }
      return exercise
    })
    setExercises(updated)
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = exercises.map((exercise, i) => {
      if (i === exerciseIndex && exercise.sets.length > 1) {
        return { ...exercise, sets: exercise.sets.filter((_, si) => si !== setIndex) }
      }
      return exercise
    })
    setExercises(updated)
  }

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: number | SetType | boolean) => {
    // Auto-start timer when user starts entering weight/reps data
    if ((field === 'weight' || field === 'reps') && typeof value === 'number' && value > 0 && !workoutStartTime) {
      startTimerIfNeeded()
    }
    
    const updated = exercises.map((exercise, i) => {
      if (i === exerciseIndex) {
        const updatedSets = exercise.sets.map((set, si) => {
          if (si === setIndex) {
            return { ...set, [field]: value }
          }
          return set
        })

        // Fixed auto-cascade logic: only if updating weight or reps and current set is not completed
        if ((field === 'weight' || field === 'reps') && !exercise.sets[setIndex].completed) {
          const cascadeValue = value as number
          console.log('Cascade attempt - field:', field, 'value:', value, 'cascadeValue:', cascadeValue)
          // Only cascade if the value is greater than 0 and is a valid number
          if (cascadeValue > 0 && !isNaN(cascadeValue) && isFinite(cascadeValue)) {
            console.log('Cascading value:', cascadeValue, 'to sets below index', setIndex)
            for (let i = setIndex + 1; i < updatedSets.length; i++) {
              // Only cascade to incomplete sets (regardless of current value)
              if (!updatedSets[i].completed) {
                console.log(`Cascading to set ${i}: ${field} = ${cascadeValue}`)
                updatedSets[i] = { ...updatedSets[i], [field]: cascadeValue }
              } else {
                console.log(`Skipping set ${i}: completed=${updatedSets[i].completed}, ${field}=${updatedSets[i][field]}`)
              }
            }
          } else {
            console.log('Not cascading - invalid value:', cascadeValue)
          }
        }

        return { ...exercise, sets: updatedSets }
      }
      return exercise
    })
    setExercises(updated)
  }

  const cycleSetType = (exerciseIndex: number, setIndex: number) => {
    const currentType = exercises[exerciseIndex].sets[setIndex].type
    const typeOrder: SetType[] = ['regular', 'warmup', 'failure']
    const currentIndex = typeOrder.indexOf(currentType)
    const nextType = typeOrder[(currentIndex + 1) % typeOrder.length]
    
    updateSet(exerciseIndex, setIndex, 'type', nextType)
  }

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    const currentCompleted = exercises[exerciseIndex].sets[setIndex].completed
    updateSet(exerciseIndex, setIndex, 'completed', !currentCompleted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || loading || showCelebration) return

    setLoading(true)
    setError('')

    try {
      const endTime = new Date()
      const startTime = workoutStartTime || endTime // fallback if timer wasn't started
      const durationInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      
      console.log('Workout completed - Duration:', durationInSeconds, 'seconds')

      const workoutData = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration: durationInSeconds,
        exercises: { exercises: exercises.filter(ex => ex.name.trim()) }
      }

      const { error: workoutError } = await supabase
        .from('workouts')
        .insert(workoutData)

      if (workoutError) throw workoutError

      // Show celebration before completing
      setShowCelebration(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }


  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-transparent">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
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
          className="mb-4 flex items-center justify-between"
        >
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation()
              handleBack()
            }} 
            className="text-amber-100 border-brand-700/50 bg-brand-500/10 hover:bg-brand-500/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="bg-gradient-to-r from-brand-300 via-amber-300 to-brand-500 bg-clip-text text-xl font-black uppercase tracking-tight text-transparent">
            {isFreshWorkout ? 'Fresh Workout' : (workoutSource ? 'Workout Active' : 'Log Workout')}
          </h1>
          <Button 
            size="sm" 
            className="bg-brand-500 hover:bg-brand-600" 
            onClick={(e) => {
              e.stopPropagation()
              if (!loading && !showCelebration) {
                handleSubmit(e)
              }
            }} 
            disabled={loading || exercises.length === 0 || showCelebration}
          >
            <Save className="mr-2 h-4 w-4" />
            Finish
          </Button>
        </motion.div>

        {/* Timer */}
        {workoutStartTime && (
          <div className="mb-6">
            <WorkoutTimer 
              seconds={elapsedTime}
              isActive={timerState === 'active'}
              onToggle={handleTimerToggle}
            />
          </div>
        )}

      <form onSubmit={handleSubmit} className="enhanced-workout-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {exercises.length === 0 && !isFreshWorkout && (
          <div className="empty-workout-state">
            <h3>READY TO LIFT?</h3>
            <p>Start by adding your first exercise</p>
          </div>
        )}

        {exercises.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-brand-800/50 bg-gradient-to-b from-brand-950/80 to-brand-900/80 p-8 text-center"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-brand-400/10" />
            <h3 className="mb-2 bg-gradient-to-r from-brand-300 to-amber-300 bg-clip-text text-lg font-black uppercase tracking-tight text-transparent">
              NO EXERCISES ADDED
            </h3>
            <p className="text-amber-100/60">Add your first exercise to start tracking your workout</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise, exerciseIndex) => (
              <ExerciseCard
                key={exerciseIndex}
                exerciseIndex={exerciseIndex}
                name={exercise.name}
                sets={exercise.sets}
                note={exercise.note}
                loading={loading}
                isFirst={exerciseIndex === 0}
                isLast={exerciseIndex === exercises.length - 1}
                onReorder={(direction) => moveExercise(exerciseIndex, direction)}
                onRemove={() => removeExercise(exerciseIndex)}
                onUpdateSet={(setIndex, field, value) => updateSet(exerciseIndex, setIndex, field, value)}
                onAddSet={() => addSet(exerciseIndex)}
                onAddNote={(note) => updateExerciseNote(exerciseIndex, note)}
                onUpdateName={(name) => updateExerciseName(exerciseIndex, name)}
                onRemoveSet={(setIndex) => removeSet(exerciseIndex, setIndex)}
                onCycleSetType={(setIndex) => cycleSetType(exerciseIndex, setIndex)}
                onToggleSetCompletion={(setIndex) => toggleSetCompletion(exerciseIndex, setIndex)}
                onOpenExerciseSelector={() => openExerciseSelector(exerciseIndex)}
              />
            ))}
          </div>
        )}
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 space-y-4"
        >
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              addExercise()
            }}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3"
            disabled={loading}
          >
            ADD EXERCISE
          </Button>
        </motion.div>
      </form>
      
      {showExerciseSelector && (
        <ExerciseSelector
          onExerciseSelect={handleExerciseSelect}
          onClose={closeExerciseSelector}
          currentExerciseName={editingExerciseIndex !== null ? exercises[editingExerciseIndex]?.name.toUpperCase() : undefined}
        />
      )}
      </section>

      <WorkoutCelebration
        show={showCelebration}
        onComplete={handleCelebrationComplete}
        workoutStats={getWorkoutStats()}
      />
    </main>
  )
}