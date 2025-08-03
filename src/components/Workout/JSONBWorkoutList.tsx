import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Workout } from '../../types/workout'

interface JSONBWorkoutListProps {
  refreshTrigger: number
}

export const JSONBWorkoutList: React.FC<JSONBWorkoutListProps> = ({ refreshTrigger }) => {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchWorkouts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error

      setWorkouts(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkouts()
  }, [user, refreshTrigger])

  const deleteWorkout = async (workoutId: string) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)

      if (error) throw error

      setWorkouts(workouts.filter(w => w.id !== workoutId))
    } catch (error: any) {
      setError(error.message)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDuration = (durationInSeconds: number | null | undefined) => {
    if (!durationInSeconds || durationInSeconds <= 0) return 'No time recorded'
    
    const hours = Math.floor(durationInSeconds / 3600)
    const minutes = Math.floor((durationInSeconds % 3600) / 60)
    const seconds = durationInSeconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
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

  if (loading) {
    return (
      <div className="jsonb-workout-list">
        <div className="loading">LOADING WORKOUTS...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="jsonb-workout-list">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="jsonb-workout-list">
        <div className="jsonb-workout-list-header">
          <h2>WORKOUT HISTORY</h2>
          <p>No workouts yet. Complete a workout to see it here!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="jsonb-workout-list">
      <div className="jsonb-workout-list-header">
        <h2>WORKOUT HISTORY</h2>
        <p>{workouts.length} sessions logged</p>
      </div>

      <div className="jsonb-workouts">
        {workouts.map((workout) => (
          <div key={workout.id} className="jsonb-workout-card">
            <div className="jsonb-workout-header">
              <div>
                <h3>{formatDate(workout.date)}</h3>
                <p className="workout-exercises-count">
                  {workout.exercises?.exercises?.length || 0} exercises
                </p>
                <p className="workout-duration">
                  Duration: {formatDuration(workout.duration)}
                </p>
              </div>
              <div className="jsonb-workout-stats">
                <span className="volume">
                  {calculateTotalVolume(workout).toLocaleString()} lbs
                </span>
                <button
                  onClick={() => deleteWorkout(workout.id)}
                  className="delete-btn"
                >
                  DELETE
                </button>
              </div>
            </div>

            {workout.exercises?.exercises && (
              <div className="jsonb-exercises">
                {workout.exercises.exercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} className="jsonb-exercise-item">
                    <div className="jsonb-exercise-name">{exercise.name}</div>
                    <div className="jsonb-sets">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className={`jsonb-set type-${set.type} ${set.completed ? 'completed' : ''}`}>
                          <span className="set-info">
                            {set.weight}lbs × {set.reps} reps
                          </span>
                          <span className="set-badges">
                            {set.type !== 'regular' && (
                              <span className={`type-badge type-${set.type}`}>
                                {set.type === 'warmup' ? '🔥' : '⚡'}
                              </span>
                            )}
                            {set.completed && <span className="completed-badge">✅</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}