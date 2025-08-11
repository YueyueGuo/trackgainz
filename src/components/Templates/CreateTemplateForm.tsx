import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useUnits } from '../../contexts/UnitContext'
import { Exercise, WorkoutSet, SetType } from '../../types/workout'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { ExerciseCard } from '../Workout/ExerciseCard'
import { ExerciseSelector } from '../Workout/ExerciseSelector'
import { DiscardWorkoutModal } from '../Workout/DiscardWorkoutModal'

interface CreateTemplateFormProps {
  onTemplateCreated: () => void
  onCancel: () => void
  initialExercises?: Exercise[]
}

export const CreateTemplateForm: React.FC<CreateTemplateFormProps> = ({ 
  onTemplateCreated, 
  onCancel,
  initialExercises = []
}) => {
  const { user } = useAuth()
  const { weightUnit } = useUnits()
  const [templateName, setTemplateName] = useState('')
  const [templateNotes, setTemplateNotes] = useState('')
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>(
    initialExercises.length > 0 ? initialExercises : [
      {
        id: '1',
        name: '',
        sets: [
          { id: '1-1', weight: 0, reps: 0, type: 'working', completed: false },
          { id: '1-2', weight: 0, reps: 0, type: 'working', completed: false },
          { id: '1-3', weight: 0, reps: 0, type: 'working', completed: false }
        ],
        note: ''
      },
      {
        id: '2',
        name: '',
        sets: [
          { id: '2-1', weight: 0, reps: 0, type: 'working', completed: false },
          { id: '2-2', weight: 0, reps: 0, type: 'working', completed: false },
          { id: '2-3', weight: 0, reps: 0, type: 'working', completed: false }
        ],
        note: ''
      },
      {
        id: '3',
        name: '',
        sets: [
          { id: '3-1', weight: 0, reps: 0, type: 'working', completed: false },
          { id: '3-2', weight: 0, reps: 0, type: 'working', completed: false },
          { id: '3-3', weight: 0, reps: 0, type: 'working', completed: false }
        ],
        note: ''
      }
    ]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSaveTemplate = async () => {
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
        description: templateNotes.trim() || null,
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

  const handleUpdateExerciseName = (exerciseId: string, newName: string) => {
    setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, name: newName } : ex)))
  }

  const handleUpdateSet = (exerciseId: string, setId: string, updates: any) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) => (set.id === setId ? { ...set, ...updates } : set)),
            }
          : ex,
      ),
    )
  }

  const handleAddNote = (exerciseId: string, note: string) => {
    setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, note } : ex)))
  }

  const handleSelectExercise = (exercise: any) => {
    if (selectedExerciseId) {
      // Update existing exercise
      setExercises((prev) =>
        prev.map((ex) => (ex.id === selectedExerciseId ? { ...ex, name: exercise.name.toUpperCase() } : ex)),
      )
      setSelectedExerciseId(null)
    } else {
      // Add new exercise
      const newExercise = {
        id: Date.now().toString(),
        name: exercise.name.toUpperCase(),
        sets: [
          { id: `${Date.now()}-1`, weight: 0, reps: 0, completed: false, type: 'working' as const },
          { id: `${Date.now()}-2`, weight: 0, reps: 0, completed: false, type: 'working' as const },
          { id: `${Date.now()}-3`, weight: 0, reps: 0, completed: false, type: 'working' as const },
        ],
        note: '',
      }
      setExercises((prev) => [...prev, newExercise])
    }
    setShowExerciseSelector(false)
  }

  const handleOpenExerciseSelector = (exerciseId?: string) => {
    setSelectedExerciseId(exerciseId || null)
    setShowExerciseSelector(true)
  }

  const handleDiscardTemplate = () => {
    onCancel()
  }

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.filter((set) => set.id !== setId),
            }
          : ex,
      ),
    )
  }

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId))
  }

  const handleAddSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const newSet: WorkoutSet = { 
            id: `${ex.id}-${Date.now()}`, 
            weight: 0, 
            reps: 0, 
            type: 'working', 
            completed: false 
          }
          return { ...ex, sets: [...ex.sets, newSet] }
        }
        return ex
      })
    )
  }

  const canSave = templateName.trim().length > 0 && exercises.some((ex) => ex.name.trim().length > 0)

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.400/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.600/.18),transparent_60%),linear-gradient(180deg,theme(colors.slate.950),theme(colors.slate.900))]" />
      </div>

      <section className="relative z-10 mx-auto max-w-lg px-4 pt-6 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-between"
        >
          <Button variant="ghost" size="sm" className="!text-slate-900" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="bg-gradient-to-r from-brand-300 via-amber-300 to-brand-500 bg-clip-text text-xl font-black uppercase tracking-tight text-transparent">
            Create Template
          </h1>
          <Button
            size="sm"
            className="bg-brand-500 hover:bg-brand-600"
            onClick={handleSaveTemplate}
            disabled={!canSave || loading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg bg-red-500/10 border border-red-400/20 p-3 text-center text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Template Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-4 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

          <div className="relative space-y-4">
            {/* Template Name */}
            <div>
              <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide" htmlFor="templateName">
                Template Name
              </Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Push Day, Upper Body, Leg Day"
                className="mt-2 border-[#6b3a0e] bg-[#241307] text-amber-50 placeholder:text-amber-200/60 focus-visible:ring-brand-500"
                disabled={loading}
              />
            </div>

            {/* Template Notes */}
            <div>
              <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide" htmlFor="templateNotes">
                Notes (Optional)
              </Label>
              <Textarea
                id="templateNotes"
                value={templateNotes}
                onChange={(e) => setTemplateNotes(e.target.value)}
                placeholder="Add notes about this template... e.g., 'Heavy bench day - increase weight weekly' or 'Good for morning workouts'"
                className="mt-2 border-[#6b3a0e] bg-[#241307] text-amber-50 placeholder:text-amber-200/60 focus-visible:ring-brand-500"
                rows={3}
                disabled={loading}
              />
              <div className="mt-1 text-xs text-amber-100/60">
                Add context, progression notes, or reminders for when you use this template
              </div>
            </div>
          </div>
        </motion.div>

        {/* Exercises */}
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id || `exercise-${index}`}
              {...exercise}
              loading={loading}
              onUpdateName={(newName) => handleUpdateExerciseName(exercise.id!, newName)}
              onOpenExerciseSelector={() => handleOpenExerciseSelector(exercise.id!)}
              onAddSet={() => handleAddSet(exercise.id!)}
              onUpdateSet={(setId, updates) => handleUpdateSet(exercise.id!, setId, updates)}
              onRemoveSet={(setId) => handleRemoveSet(exercise.id!, setId)}
              onAddNote={(note) => handleAddNote(exercise.id!, note)}
              onRemove={() => handleRemoveExercise(exercise.id!)}
            />
          ))}
        </div>

        {/* Add Exercise */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-8 mb-6">
          <Button
            onClick={() => handleOpenExerciseSelector()}
            size="lg"
            className="group relative h-12 w-full overflow-hidden bg-brand-500 font-bold tracking-wide text-white shadow-[0_20px_40px_-20px_rgba(255,153,0,0.8)] hover:bg-brand-600"
            disabled={loading}
          >
            <span className="relative z-10 flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Add Exercise
            </span>
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] transition-transform duration-1000 group-hover:translate-x-full" />
          </Button>
        </motion.div>

        {/* Bottom Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {/* Save Template Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSaveTemplate}
              disabled={!canSave || loading}
              size="lg"
              className="group relative h-12 w-full overflow-hidden bg-brand-500 font-bold tracking-wide text-white shadow-[0_20px_40px_-20px_rgba(255,153,0,0.8)] hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center">
                <Save className="mr-2 h-5 w-5" />
                {loading ? 'Saving...' : 'Save Template'}
              </span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] transition-transform duration-1000 group-hover:translate-x-full" />
            </Button>
          </motion.div>

          {/* Discard Template Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setShowDiscardModal(true)}
              size="lg"
              variant="outline"
              className="h-12 w-full border-red-400/30 bg-red-500/10 font-bold tracking-wide text-red-300 hover:bg-red-500/20"
              disabled={loading}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Discard Template
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {showExerciseSelector && (
        <ExerciseSelector
          onExerciseSelect={(exerciseName, exerciseId) => {
            // Convert to match our handleSelectExercise signature
            handleSelectExercise({ name: exerciseName, id: exerciseId })
          }}
          onClose={() => {
            setShowExerciseSelector(false)
            setSelectedExerciseId(null)
          }}
        />
      )}

      <DiscardWorkoutModal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirm={handleDiscardTemplate}
      />
    </main>
  )
}