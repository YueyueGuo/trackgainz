import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Exercise, WorkoutSet, SetType } from '../../types/workout'

interface CreateTemplateFormProps {
  onTemplateCreated: () => void
  onCancel: () => void
  initialExercises?: Exercise[]
}

const SET_TYPE_CONFIG = {
  regular: { symbol: '⚪', label: 'Regular' },
  warmup: { symbol: '🔥', label: 'Warm Up' },
  failure: { symbol: '⚡', label: 'To Failure' }
}

export const CreateTemplateForm: React.FC<CreateTemplateFormProps> = ({ 
  onTemplateCreated, 
  onCancel,
  initialExercises = []
}) => {
  const { user } = useAuth()
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>(
    initialExercises.length > 0 ? initialExercises : []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addExercise = () => {
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
    const updated = exercises.map((exercise, i) => 
      i === exerciseIndex ? { ...exercise, name } : exercise
    )
    setExercises(updated)
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
    const updated = exercises.map((exercise, i) => {
      if (i === exerciseIndex) {
        const updatedSets = exercise.sets.map((set, si) => {
          if (si === setIndex) {
            return { ...set, [field]: value }
          }
          return set
        })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!templateName.trim()) {
      setError('Template name is required')
      return
    }

    if (exercises.length === 0) {
      setError('At least one exercise is required')
      return
    }

    const hasEmptyExercises = exercises.some(ex => !ex.name.trim())
    if (hasEmptyExercises) {
      setError('All exercises must have names')
      return
    }

    setLoading(true)
    setError('')

    try {
      const templateData = {
        user_id: user.id,
        name: templateName.trim().toUpperCase(),
        description: templateDescription.trim() || null,
        exercises: { 
          exercises: exercises.map(exercise => ({
            ...exercise,
            name: exercise.name.trim().toUpperCase()
          }))
        }
      }

      const { error: templateError } = await supabase
        .from('workout_templates')
        .insert(templateData)

      if (templateError) throw templateError

      onTemplateCreated()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-template-form-container">
      <div className="create-template-header">
        <h2>CREATE WORKOUT TEMPLATE</h2>
        <p>Design a reusable workout plan</p>
      </div>

      <form onSubmit={handleSubmit} className="create-template-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="template-basics">
          <div className="form-group">
            <label htmlFor="templateName">TEMPLATE NAME *</label>
            <input
              id="templateName"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="E.G., LEG DAY, PUSH WORKOUT, FULL BODY"
              className="template-name-input"
              disabled={loading}
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="templateDescription">DESCRIPTION (OPTIONAL)</label>
            <textarea
              id="templateDescription"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Brief description of this workout template..."
              className="template-description-input"
              disabled={loading}
              maxLength={200}
              rows={3}
            />
          </div>
        </div>

        {exercises.length === 0 && (
          <div className="empty-template-state">
            <h3>NO EXERCISES YET</h3>
            <p>Add your first exercise to start building your template</p>
          </div>
        )}

        {exercises.map((exercise, exerciseIndex) => (
          <div key={exerciseIndex} className="template-exercise-section">
            <div className="template-exercise-header">
              <input
                type="text"
                value={exercise.name}
                onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                placeholder="EXERCISE NAME (E.G., BENCH PRESS)"
                className="template-exercise-name-input"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => removeExercise(exerciseIndex)}
                className="remove-exercise-btn"
                disabled={loading}
              >
                REMOVE
              </button>
            </div>

            <div className="template-sets-container">
              <div className="template-sets-header">
                <span>SET</span>
                <span>WEIGHT (LBS)</span>
                <span>REPS</span>
                <span>TYPE</span>
              </div>

              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className={`template-set-row type-${set.type}`}>
                  <span className="set-number">{setIndex + 1}</span>
                  
                  <input
                    type="number"
                    value={set.weight || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Number(e.target.value)
                      updateSet(exerciseIndex, setIndex, 'weight', value)
                    }}
                    placeholder="0"
                    disabled={loading}
                    step="0.25"
                    min="0"
                    className="set-input"
                  />
                  
                  <input
                    type="number"
                    value={set.reps || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Number(e.target.value)
                      updateSet(exerciseIndex, setIndex, 'reps', value)
                    }}
                    placeholder="0"
                    disabled={loading}
                    min="0"
                    className="set-input"
                  />
                  
                  <div className="template-set-actions">
                    <button
                      type="button"
                      onClick={() => cycleSetType(exerciseIndex, setIndex)}
                      className={`type-btn type-${set.type}`}
                      disabled={loading}
                      title={SET_TYPE_CONFIG[set.type].label}
                    >
                      {SET_TYPE_CONFIG[set.type].symbol}
                    </button>
                    
                    {exercise.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSet(exerciseIndex, setIndex)}
                        className="remove-set-btn"
                        disabled={loading}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addSet(exerciseIndex)}
                className="add-set-btn"
                disabled={loading}
              >
                + ADD SET
              </button>
            </div>
          </div>
        ))}

        <div className="template-form-actions">
          <button
            type="button"
            onClick={addExercise}
            className="add-exercise-btn"
            disabled={loading}
          >
            + ADD EXERCISE
          </button>

          <div className="action-buttons">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              disabled={loading}
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              className="save-template-btn"
              disabled={loading || !templateName.trim() || exercises.length === 0}
            >
              {loading ? 'SAVING...' : 'SAVE TEMPLATE'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}