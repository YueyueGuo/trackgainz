import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Workout } from '../../types/workout'

interface PreviousWorkoutListProps {
  onSelectWorkout: (workout: Workout) => void
  refreshTrigger: number
}

export const PreviousWorkoutList: React.FC<PreviousWorkoutListProps> = ({ 
  onSelectWorkout, 
  refreshTrigger 
}) => {
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
        .limit(10) // Show last 10 workouts

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
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m`
    } else {
      return `${durationInSeconds}s`
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
      <div className="previous-workout-list">
        <div className="loading">LOADING RECENT WORKOUTS...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="previous-workout-list">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="previous-workout-list">
      <div className="previous-workout-list-header">
        <h3>REPEAT PREVIOUS WORKOUT</h3>
        <p>Start a new workout based on a previous session</p>
      </div>

      {workouts.length === 0 ? (
        <div className="empty-workouts-state">
          <p>No previous workouts found. Complete a workout first!</p>
        </div>
      ) : (
        <div className="previous-workouts-grid">
          {workouts.map((workout) => (
            <div key={workout.id} className="previous-workout-card">
              <div className="workout-header">
                <h4>{formatDate(workout.date)}</h4>
                <div className="workout-stats">
                  <span className="exercise-count">
                    {workout.exercises?.exercises?.length || 0} exercises
                  </span>
                  <span className="workout-duration">
                    {formatDuration(workout.duration)}
                  </span>
                  <span className="workout-volume">
                    {calculateTotalVolume(workout).toLocaleString()} lbs
                  </span>
                </div>
              </div>

              <div className="workout-exercises-preview">
                {workout.exercises?.exercises?.slice(0, 4).map((exercise, index) => (
                  <div key={index} className="exercise-preview">
                    <span className="exercise-name">{exercise.name}</span>
                    <span className="exercise-sets">{exercise.sets.length} sets</span>
                  </div>
                ))}
                {workout.exercises?.exercises?.length > 4 && (
                  <div className="exercise-preview more">
                    +{workout.exercises.exercises.length - 4} more exercises
                  </div>
                )}
              </div>

              <div className="workout-actions">
                <button
                  onClick={() => onSelectWorkout(workout)}
                  className="repeat-workout-btn"
                >
                  REPEAT WORKOUT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}