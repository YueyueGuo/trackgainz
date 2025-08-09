"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Check } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DatabaseExercise, MuscleGroup } from '../../types/workout'
import { ExerciseService } from '../../services/exerciseService'
import { EXERCISE_SEED_DATA } from '../../data/exerciseSeedData'
import { useAuth } from '../../contexts/AuthContext'

type MuscleGroupOption = {
  id: MuscleGroup
  name: string
  selected: boolean
}

interface ExerciseSelectorProps {
  onExerciseSelect: (exerciseName: string, exerciseId: string) => void
  onClose: () => void
  currentExerciseName?: string
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  onExerciseSelect,
  onClose,
  currentExerciseName
}) => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [exercises, setExercises] = useState<DatabaseExercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<DatabaseExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [useDatabase, setUseDatabase] = useState(true)
  const [creatingExercise, setCreatingExercise] = useState(false)

  // Custom exercise form state
  const [exerciseName, setExerciseName] = useState("")
  const [category, setCategory] = useState<'compound' | 'isolation' | 'cardio' | 'bodyweight'>("compound")
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroupOption[]>([
    { id: "chest", name: "Chest", selected: false },
    { id: "back", name: "Back", selected: false },
    { id: "shoulders", name: "Shoulders", selected: false },
    { id: "biceps", name: "Biceps", selected: false },
    { id: "triceps", name: "Triceps", selected: false },
    { id: "forearms", name: "Forearms", selected: false },
    { id: "abs", name: "Abs", selected: false },
    { id: "obliques", name: "Obliques", selected: false },
    { id: "quads", name: "Quads", selected: false },
    { id: "hamstrings", name: "Hamstrings", selected: false },
    { id: "glutes", name: "Glutes", selected: false },
    { id: "calves", name: "Calves", selected: false },
    { id: "traps", name: "Traps", selected: false },
    { id: "lats", name: "Lats", selected: false },
    { id: "deltoids", name: "Deltoids", selected: false },
  ])

  const showCreateForm = searchQuery.length > 0 && filteredExercises.length === 0

  // Auto-populate exercise name when no results found
  useEffect(() => {
    if (showCreateForm) {
      setExerciseName(searchQuery.toUpperCase())
    }
  }, [showCreateForm, searchQuery])

  useEffect(() => {
    loadExercises()
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string, allExercises: DatabaseExercise[]) => {
      let searchResults = allExercises

      if (searchTerm.trim()) {
        searchResults = rankSearchResults(allExercises, searchTerm.trim())
      }

      setFilteredExercises(searchResults)
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(searchQuery, exercises)
  }, [searchQuery, exercises, debouncedSearch])

  const loadExercises = async () => {
    try {
      setLoading(true)
      
      // Try to load from database first
      if (useDatabase) {
        const dbExercises = await ExerciseService.getExercises()
        if (dbExercises.length > 0) {
          setExercises(dbExercises)
          setFilteredExercises(dbExercises)
          setLoading(false)
          return
        }
      }
      
      // Fallback to seed data
      const seedExercises: DatabaseExercise[] = EXERCISE_SEED_DATA.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        muscle_groups: exercise.muscleGroups,
        category: exercise.category,
        equipment: exercise.equipment || [],
        difficulty: exercise.difficulty,
        description: exercise.description || '',
        is_verified: true,
        created_by: null,
        created_at: new Date().toISOString(),
        usage_count: 0,
        last_used: null
      }))
      
      setExercises(seedExercises)
      setFilteredExercises(seedExercises)
      setUseDatabase(false)
    } catch (error) {
      console.error('Error loading exercises:', error)
      // Fallback to seed data on error
      const seedExercises: DatabaseExercise[] = EXERCISE_SEED_DATA.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        muscle_groups: exercise.muscleGroups,
        category: exercise.category,
        equipment: exercise.equipment || [],
        difficulty: exercise.difficulty,
        description: exercise.description || '',
        is_verified: true,
        created_by: null,
        created_at: new Date().toISOString(),
        usage_count: 0,
        last_used: null
      }))
      
      setExercises(seedExercises)
      setFilteredExercises(seedExercises)
      setUseDatabase(false)
    } finally {
      setLoading(false)
    }
  }

  // Search ranking algorithm
  const rankSearchResults = (exercises: DatabaseExercise[], searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    
    const ranked = exercises.map(exercise => {
      const name = exercise.name.toLowerCase()
      let score = 0
      
      // Exact prefix match (highest priority)
      if (name.startsWith(term)) {
        score += 100
      }
      // Word boundary match (e.g., "dead" in "deadlift")
      else if (name.includes(` ${term}`) || name.includes(`-${term}`)) {
        score += 50
      }
      // Contains match (lowest priority)
      else if (name.includes(term)) {
        score += 10
      }
      
      return { exercise, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.exercise)
    
    return ranked
  }

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  const handleExerciseSelect = async (exercise: DatabaseExercise) => {
    try {
      // Increment usage count if using database
      if (useDatabase) {
        await ExerciseService.incrementUsageCount(exercise.id)
      }
    } catch (error) {
      console.error('Error updating exercise usage:', error)
    }

    onExerciseSelect(exercise.name.toUpperCase(), exercise.id)
    onClose()
  }

  const toggleMuscleGroup = (id: MuscleGroup) => {
    setMuscleGroups((prev) => prev.map((group) => 
      group.id === id ? { ...group, selected: !group.selected } : group
    ))
  }

  const handleCreateExercise = async () => {
    if (!user || !exerciseName.trim()) return

    const selectedMuscleGroups = muscleGroups.filter((group) => group.selected).map((group) => group.id)

    if (selectedMuscleGroups.length === 0) return

    setCreatingExercise(true)
    try {
      const newExercise = await ExerciseService.createExercise({
        name: exerciseName.trim(),
        muscle_groups: selectedMuscleGroups,
        category: category,
        equipment: [],
        difficulty: 'beginner',
        description: ''
      }, user.id)

      // Add to local exercises list
      setExercises(prev => [newExercise, ...prev])
      setFilteredExercises(prev => [newExercise, ...prev])

      // Select the new exercise
      onExerciseSelect(newExercise.name.toUpperCase(), newExercise.id)
      onClose()

      // Reset form
      setSearchQuery("")
      setExerciseName("")
      setCategory("compound")
      setMuscleGroups((prev) => prev.map((group) => ({ ...group, selected: false })))
    } catch (error) {
      console.error('Error creating custom exercise:', error)
      alert('Failed to create custom exercise. Please try again.')
    } finally {
      setCreatingExercise(false)
    }
  }

  const selectedCount = muscleGroups.filter((group) => group.selected).length
  const canCreate = exerciseName.trim().length > 0 && selectedCount > 0

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg"
        >
          <div className="relative h-[calc(100dvh-env(safe-area-inset-bottom))] overflow-hidden bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)]">
            <div className="flex items-center justify-center h-full">
              <div className="text-amber-100 text-lg font-semibold">Loading exercises...</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg"
        >
          <div className="relative h-[calc(100dvh-env(safe-area-inset-bottom))] overflow-hidden bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)]">
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#ffb547]/10" />

            {/* Header */}
            <div className="relative border-b border-[#5a3714]/50 bg-brand-500 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-tight text-white">Select Exercise</h2>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={onClose} 
                  className="text-white hover:bg-white/10 border-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-900" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises..."
                  className="border-2 border-amber-400 bg-amber-300 pl-10 text-amber-900 placeholder:text-amber-700 focus-visible:ring-amber-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Content */}
            <div className="relative flex-1 overflow-y-auto px-4 pb-6" style={{ maxHeight: "calc(100dvh - 140px)" }}>
              {showCreateForm ? (
                /* Create New Exercise Form */
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-md font-bold uppercase tracking-wide text-amber-50">
                      No Results Found. Want to Add New Exercise?
                    </h3>
                  </div>

                  {/* Exercise Name */}
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-amber-100">
                      Exercise Name
                    </label>
                    <Input
                      value={exerciseName}
                      onChange={(e) => setExerciseName(e.target.value.toUpperCase())}
                      className="border-[#6b3a0e] bg-[#241307] text-amber-50 placeholder:text-amber-200/60 focus-visible:ring-brand-500"
                    />
                  </div>

                  {/* Muscle Groups */}
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-amber-100">
                      Muscle Groups
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {muscleGroups.map((group) => (
                        <motion.button
                          key={group.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleMuscleGroup(group.id)}
                          className={`relative overflow-hidden rounded-lg border p-2 text-xs font-semibold transition-all ${
                            group.selected
                              ? "border-brand-400/50 bg-brand-500/20 text-brand-300"
                              : "border-[#6b3a0e]/50 bg-[#241307]/50 text-amber-100/70 hover:bg-[#241307]"
                          }`}
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            {group.selected && <Check className="mr-1 h-3 w-3" />}
                            {group.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-amber-100">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full rounded-lg border border-[#6b3a0e] bg-[#241307] p-3 text-amber-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="compound">Compound</option>
                      <option value="isolation">Isolation</option>
                      <option value="bodyweight">Bodyweight</option>
                      <option value="cardio">Cardio</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <Button
                      type="button"
                      onClick={handleCreateExercise}
                      disabled={!canCreate || creatingExercise}
                      size="lg"
                      className={`h-12 w-full font-bold uppercase tracking-wide ${
                        canCreate && !creatingExercise
                          ? "bg-brand-500 text-gray-800 hover:bg-brand-400"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {creatingExercise ? 'Creating...' : 'Create Exercise'}
                    </Button>
                    <Button
                      type="button"
                      onClick={onClose}
                      size="lg"
                      className="h-12 w-full bg-red-500 font-bold uppercase tracking-wide text-white hover:bg-red-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : filteredExercises.length > 0 ? (
                /* Search Results */
                <div className="space-y-2">
                  {filteredExercises.map((exercise) => (
                    <motion.button
                      key={exercise.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExerciseSelect(exercise)}
                      className="w-full rounded-lg border border-[#6b3a0e]/50 bg-[#241307]/50 p-4 text-left transition-all hover:bg-[#241307] hover:ring-1 hover:ring-brand-400/30"
                    >
                      <div className="font-semibold text-amber-50">{exercise.name}</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {exercise.muscle_groups.map((group) => (
                          <span
                            key={group}
                            className="rounded-full bg-brand-500/20 px-2 py-1 text-xs font-medium text-brand-300"
                          >
                            {group}
                          </span>
                        ))}
                        <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">
                          {exercise.category}
                        </span>
                        {exercise.usage_count > 0 && (
                          <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-300">
                            {exercise.usage_count} uses
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                /* Default State */
                <div className="space-y-2">
                  <div className="mb-3 text-xs font-bold uppercase tracking-wide text-amber-100/60">
                    Popular Exercises
                  </div>
                  {exercises.slice(0, 10).map((exercise) => (
                    <motion.button
                      key={exercise.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExerciseSelect(exercise)}
                      className="w-full rounded-lg border border-[#6b3a0e]/50 bg-[#241307]/50 p-4 text-left transition-all hover:bg-[#241307] hover:ring-1 hover:ring-brand-400/30"
                    >
                      <div className="font-semibold text-amber-50">{exercise.name}</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {exercise.muscle_groups.map((group) => (
                          <span
                            key={group}
                            className="rounded-full bg-brand-500/20 px-2 py-1 text-xs font-medium text-brand-300"
                          >
                            {group}
                          </span>
                        ))}
                        <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">
                          {exercise.category}
                        </span>
                        {exercise.usage_count > 0 && (
                          <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-300">
                            {exercise.usage_count} uses
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
    </>
  )
}