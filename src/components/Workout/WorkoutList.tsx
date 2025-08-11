import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight: number
}

interface Workout {
  id: string
  name: string
  date: string
  exercises: Exercise[]
}

interface WorkoutListProps {
  refreshTrigger: number
}

export const WorkoutList: React.FC<WorkoutListProps> = ({ refreshTrigger }) => {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchWorkouts = async () => {
    if (!user) return

    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (workoutError) throw workoutError

      const workoutsWithExercises = await Promise.all(
        workoutData.map(async (workout) => {
          const { data: exercises, error: exerciseError } = await supabase
            .from('exercises')
            .select('*')
            .eq('workout_id', workout.id)
            .order('created_at', { ascending: true })

          if (exerciseError) throw exerciseError

          return {
            ...workout,
            exercises: exercises || []
          }
        })
      )

      setWorkouts(workoutsWithExercises)
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

  const calculateTotalVolume = (exercises: Exercise[]) => {
    return exercises.reduce((total, exercise) => {
      return total + (exercise.weight * exercise.sets * exercise.reps)
    }, 0)
  }

  if (loading) {
    return <div className="loading">LOADING WORKOUTS...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (workouts.length === 0) {
    return (
      <div className="empty-state">
        <h3>NO WORKOUTS YET</h3>
        <p>Start logging your training sessions!</p>
      </div>
    )
  }

  return (
    <div className="workout-list">
      <div className="workout-list-header">
        <h2>WORKOUT HISTORY</h2>
        <p>{workouts.length} sessions logged</p>
      </div>

      <div className="workouts">
        {workouts.map((workout) => (
          <div key={workout.id} className="workout-card">
            <div className="workout-header">
              <div>
                <h3>{workout.name}</h3>
                <p className="workout-date">{formatDate(workout.date)}</p>
              </div>
              <div className="workout-stats">
                <span className="volume">
                  {calculateTotalVolume(workout.exercises).toLocaleString()} lbs
                </span>
                <button
                  onClick={() => deleteWorkout(workout.id)}
                  className="btn-brutalist btn-danger px-3 py-2 text-sm"
                >
                  DELETE
                </button>
              </div>
            </div>

            <div className="exercises">
              {workout.exercises.map((exercise) => (
                <div key={exercise.id} className="exercise-item">
                  <div className="exercise-name">{exercise.name}</div>
                  <div className="exercise-details">
                    <span>{exercise.sets} sets</span>
                    <span>{exercise.reps} reps</span>
                    <span>{exercise.weight} lbs</span>
                    <span className="volume">
                      {(exercise.weight * exercise.sets * exercise.reps).toLocaleString()} lbs total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}