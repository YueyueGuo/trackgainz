import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useUnits } from '../../contexts/UnitContext'

interface Exercise {
  name: string
  sets: number
  reps: number
  weight: number
}

interface WorkoutFormProps {
  onWorkoutAdded: () => void
}

export const WorkoutForm: React.FC<WorkoutFormProps> = ({ onWorkoutAdded }) => {
  const { user } = useAuth()
  const { weightUnit } = useUnits()
  const [workoutName, setWorkoutName] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: '', sets: 1, reps: 1, weight: 0 }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 1, reps: 1, weight: 0 }])
  }

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index))
    }
  }

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = exercises.map((exercise, i) => 
      i === index ? { ...exercise, [field]: value } : exercise
    )
    setExercises(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: workoutName,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      const exerciseData = exercises
        .filter(ex => ex.name.trim())
        .map(exercise => ({
          workout_id: workout.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight
        }))

      if (exerciseData.length > 0) {
        const { error: exerciseError } = await supabase
          .from('exercises')
          .insert(exerciseData)

        if (exerciseError) throw exerciseError
      }

      setWorkoutName('')
      setExercises([{ name: '', sets: 1, reps: 1, weight: 0 }])
      onWorkoutAdded()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="workout-form-container">
      <div className="workout-form-header">
        <h2>ADD WORKOUT</h2>
        <p>Log your training session</p>
      </div>

      <form onSubmit={handleSubmit} className="workout-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="workoutName">WORKOUT NAME</label>
          <input
            id="workoutName"
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g., Push Day, Leg Day"
            required
            disabled={loading}
          />
        </div>

        <div className="exercises-section">
          <h3>EXERCISES</h3>
          {exercises.map((exercise, index) => (
            <div key={index} className="exercise-row">
              <div className="exercise-inputs">
                <div className="form-group">
                  <label>EXERCISE</label>
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, 'name', e.target.value)}
                    placeholder="e.g., Bench Press"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>SETS</label>
                  <input
                    type="number"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                    min="1"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>REPS</label>
                  <input
                    type="number"
                    value={exercise.reps}
                    onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 1)}
                    min="1"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>WEIGHT ({weightUnit.toUpperCase()})</label>
                  <input
                    type="number"
                    value={exercise.weight}
                    onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.25"
                    disabled={loading}
                  />
                </div>
              </div>

              {exercises.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  className="remove-exercise-btn"
                  disabled={loading}
                >
                  REMOVE
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addExercise}
            className="add-exercise-btn"
            disabled={loading}
          >
            + ADD EXERCISE
          </button>
        </div>

        <button 
          type="submit" 
          className="submit-workout-btn"
          disabled={loading || !workoutName.trim()}
        >
          {loading ? 'SAVING...' : 'SAVE WORKOUT'}
        </button>
      </form>
    </div>
  )
}