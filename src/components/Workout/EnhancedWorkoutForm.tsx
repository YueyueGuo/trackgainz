import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Exercise, WorkoutSet, SetType } from '../../types/workout'
import { ExerciseSelector } from './ExerciseSelector'

interface EnhancedWorkoutFormProps {
  onWorkoutAdded: () => void
  initialExercises?: Exercise[]
  workoutSource?: string // e.g., "Template: Leg Day" or "Previous: Jan 15, 2025"
  isFreshWorkout?: boolean // true when starting a fresh workout
}

const SET_TYPE_CONFIG = {
  regular: { symbol: 'W/F', label: 'Set Type' },
  warmup: { symbol: 'W', label: 'Warm Up' },
  failure: { symbol: 'F', label: 'To Failure' }
}

export const EnhancedWorkoutForm: React.FC<EnhancedWorkoutFormProps> = ({ 
  onWorkoutAdded, 
  initialExercises = [],
  workoutSource,
  isFreshWorkout = false
}) => {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerState, setTimerState] = useState<'inactive' | 'active' | 'paused'>('inactive')
  const [pausedAt, setPausedAt] = useState<Date | null>(null)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null)

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
    if (!user) return

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

      // Reset form and timer
      setExercises([])
      setWorkoutStartTime(null)
      setElapsedTime(0)
      setTimerState('inactive')
      setPausedAt(null)
      onWorkoutAdded()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Update the status legend to show gray checkmark for incomplete
  const renderStatusLegend = () => (
    <div className="status-legend">
      <div className="legend-item completion-status">
        <div className="legend-symbol default">W/F</div>
        <span className="legend-label">Default</span>
        <span className="legend-separator">|</span>
        <div className="legend-symbol warmup">W</div>
        <span className="legend-label">Warm-up</span>
        <span className="legend-separator">|</span>
        <div className="legend-symbol failure">F</div>
        <span className="legend-label">Failure</span>
      </div>
      <div className="legend-item completion-status">
        <div className="legend-symbol default-checkbox">✓</div>
        <span className="legend-label">Incomplete</span>
        <span className="legend-separator">|</span>
        <div className="legend-symbol completed">✓</div>
        <span className="legend-label">Completed</span>
      </div>
      <div className="legend-note">
        Tap buttons to change set type or mark as completed
      </div>
    </div>
  );

  return (
    <div className="enhanced-workout-form-container">
      {!isFreshWorkout && (
        <div className="enhanced-workout-header">
          <div className="workout-header-info">
            <h2>LOG WORKOUT</h2>
            {workoutSource && (
              <p className="workout-source">Based on: {workoutSource}</p>
            )}
            <p>{workoutStartTime ? 'Workout in progress' : 'Track your sets in real-time'}</p>
          </div>
          
          {exercises.length > 0 && (
            <button
              type="button"
              onClick={saveAsTemplate}
              className="save-template-btn"
              disabled={loading}
            >
              SAVE AS TEMPLATE
            </button>
          )}
        </div>
      )}

      {isFreshWorkout && exercises.length > 0 && (
        <div className="enhanced-workout-header">
          <div className="workout-header-info">
            {workoutStartTime && (
              <p>{workoutStartTime ? 'Workout in progress' : ''}</p>
            )}
          </div>
          
          <button
            type="button"
            onClick={saveAsTemplate}
            className="save-template-btn"
            disabled={loading}
          >
            SAVE AS TEMPLATE
          </button>
        </div>
      )}
        
      {workoutStartTime && (
          <div className="workout-timer">
            <div className="timer-info">
              <span className="timer-label">WORKOUT TIME:</span>
              <span className="timer-display">{formatElapsedTime(elapsedTime)}</span>
              <span className={`timer-status ${timerState}`}>
                {timerState === 'active' ? 'ACTIVE' : timerState === 'paused' ? 'PAUSED' : ''}
              </span>
            </div>
            <div className="timer-controls">
              {timerState === 'active' && (
                <button
                  type="button"
                  onClick={pauseTimer}
                  className="timer-control-btn pause-btn"
                >
                  PAUSE
                </button>
              )}
              {timerState === 'paused' && (
                <>
                  <button
                    type="button"
                    onClick={resumeTimer}
                    className="timer-control-btn resume-btn"
                  >
                    RESUME
                  </button>
                  <button
                    type="button"
                    onClick={cancelWorkout}
                    className="timer-control-btn cancel-btn"
                  >
                    DELETE
                  </button>
                </>
              )}
            </div>
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
          <div className="empty-workout-state">
            <h3>NO EXERCISES ADDED</h3>
            <p>Add your first exercise to start tracking your workout</p>
          </div>
        ) : (
          exercises.map((exercise, exerciseIndex) => (
            <div key={exerciseIndex} className="enhanced-exercise-section">
              <div className="enhanced-exercise-header">
                <input
                  type="text"
                  value={exercise.name.toUpperCase()}
                  onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                  onFocus={() => openExerciseSelector(exerciseIndex)}
                  placeholder="EXERCISE NAME (E.G., BENCH PRESS)"
                  disabled={loading}
                  className="enhanced-exercise-name-input"
                />
                <button
                  type="button"
                  onClick={() => removeExercise(exerciseIndex)}
                  className="enhanced-remove-exercise-btn"
                  disabled={loading}
                  title="Remove Exercise"
                >
                  REMOVE
                </button>
              </div>
              
              <div className="enhanced-sets-container">
                <div className="enhanced-sets-header">
                  <h4>SET</h4>
                  <h4>WEIGHT (LBS)</h4>
                  <h4>REPS</h4>
                  <h4>TYPE & STATUS</h4>
                  <button
                    type="button"
                    onClick={() => setShowHelp(!showHelp)}
                    className="help-btn"
                    title="Help"
                  >
                    ?
                  </button>
                </div>
                
                {showHelp && renderStatusLegend()}
                
                {exercise.sets.map((set, setIndex) => (
                  <div 
                    key={setIndex} 
                    className={`enhanced-set-row type-${set.type} ${set.completed ? 'completed' : ''}`}
                  >
                    <span className="enhanced-set-number">{setIndex + 1}</span>
                    
                    <input
                      type="number"
                      value={set.weight || ''}
                      onChange={(e) => {
                        const rawValue = e.target.value
                        const parsedValue = rawValue === '' ? 0 : Number(rawValue)
                        updateSet(exerciseIndex, setIndex, 'weight', parsedValue)
                      }}
                      placeholder="0"
                      disabled={loading}
                      min="0"
                      className="enhanced-set-input"
                    />
                    
                    <input
                      type="number"
                      value={set.reps || ''}
                      onChange={(e) => {
                        const rawValue = e.target.value
                        const parsedValue = rawValue === '' ? 0 : Number(rawValue)
                        updateSet(exerciseIndex, setIndex, 'reps', parsedValue)
                      }}
                      placeholder="0"
                      disabled={loading}
                      min="0"
                      className="enhanced-set-input"
                    />
                    
                    <div className="enhanced-set-actions">
                      <button
                        type="button"
                        onClick={() => cycleSetType(exerciseIndex, setIndex)}
                        className={`enhanced-type-btn type-${set.type}`}
                        disabled={loading}
                        title={SET_TYPE_CONFIG[set.type].label}
                      >
                        {SET_TYPE_CONFIG[set.type].symbol}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => toggleSetCompletion(exerciseIndex, setIndex)}
                        className={`enhanced-complete-btn ${set.completed ? 'completed' : ''}`}
                        disabled={loading}
                        title={set.completed ? 'Completed' : 'Mark Complete'}
                      >
                        ✓
                      </button>
                      
                      {exercise.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSet(exerciseIndex, setIndex)}
                          className="enhanced-remove-set-btn"
                          disabled={loading}
                          title="Remove Set"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addSet(exerciseIndex)}
                  className="enhanced-add-set-btn"
                  disabled={loading}
                >
                  ADD SET
                </button>
              </div>
            </div>
          ))
        )}
        
        <div className="enhanced-form-actions">
          <button
            type="button"
            onClick={addExercise}
            className="enhanced-add-exercise-btn"
            disabled={loading}
          >
            ADD EXERCISE
          </button>
          
          {exercises.length > 0 && exercises.some(ex => ex.name.trim()) && (
            <button
              type="submit"
              className="enhanced-submit-workout-btn"
              disabled={loading}
            >
              COMPLETE WORKOUT
            </button>
          )}
        </div>
      </form>
      
      {showExerciseSelector && (
        <ExerciseSelector
          onExerciseSelect={handleExerciseSelect}
          onClose={closeExerciseSelector}
          currentExerciseName={editingExerciseIndex !== null ? exercises[editingExerciseIndex]?.name.toUpperCase() : undefined}
        />
      )}
    </div>
  )
}