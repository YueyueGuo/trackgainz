import React, { useState, useEffect, useCallback } from 'react'
import { DatabaseExercise, MuscleGroup } from '../../types/workout'
import { ExerciseService } from '../../services/exerciseService'
import { EXERCISE_SEED_DATA } from '../../data/exerciseSeedData'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'all'>('all')
  const [exercises, setExercises] = useState<DatabaseExercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<DatabaseExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [useDatabase, setUseDatabase] = useState(true)

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      setLoading(true)
      console.log('Loading exercises...')
      
      // Try to load from database first
      if (useDatabase) {
        console.log('Attempting to load from database...')
        const dbExercises = await ExerciseService.getExercises()
        console.log('Database exercises loaded:', dbExercises.length)
        if (dbExercises.length > 0) {
          setExercises(dbExercises)
          setFilteredExercises(dbExercises)
          setLoading(false)
          return
        }
      }
      
      // Fallback to seed data
      console.log('Using seed data fallback...')
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
      
      console.log('Seed exercises loaded:', seedExercises.length)
      setExercises(seedExercises)
      setFilteredExercises(seedExercises)
      setUseDatabase(false)
    } catch (error) {
      console.error('Error loading exercises:', error)
      // Fallback to seed data on error
      console.log('Using seed data due to error...')
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

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string, muscleGroup: MuscleGroup | 'all', allExercises: DatabaseExercise[]) => {
      console.log('Search triggered:', { searchTerm, muscleGroup, totalExercises: allExercises.length })
      let searchResults = allExercises

      // First, apply search (independent of muscle group filter)
      if (searchTerm.trim()) {
        searchResults = rankSearchResults(allExercises, searchTerm.trim())
        console.log('Search results after ranking:', searchResults.length)
      }

      // Then, apply muscle group filter to search results
      if (muscleGroup !== 'all') {
        searchResults = searchResults.filter(exercise =>
          exercise.muscle_groups.includes(muscleGroup)
        )
        console.log('Search results after muscle group filter:', searchResults.length)
      }

      console.log('Final filtered exercises:', searchResults.length)
      setFilteredExercises(searchResults)
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(searchTerm, selectedMuscleGroup, exercises)
  }, [searchTerm, selectedMuscleGroup, exercises, debouncedSearch])

  // Search ranking algorithm
  const rankSearchResults = (exercises: DatabaseExercise[], searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    console.log('Ranking exercises for term:', term)
    
    const ranked = exercises.map(exercise => {
      const name = exercise.name.toLowerCase()
      let score = 0
      
      // Exact prefix match (highest priority)
      if (name.startsWith(term)) {
        score += 100
        console.log(`Prefix match: ${exercise.name} (score: ${score})`)
      }
      // Word boundary match (e.g., "dead" in "deadlift")
      else if (name.includes(` ${term}`) || name.includes(`-${term}`)) {
        score += 50
        console.log(`Word boundary match: ${exercise.name} (score: ${score})`)
      }
      // Contains match (lowest priority)
      else if (name.includes(term)) {
        score += 10
        console.log(`Contains match: ${exercise.name} (score: ${score})`)
      }
      
      return { exercise, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.exercise)
    
    console.log('Ranked results:', ranked.length, 'exercises')
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

  const muscleGroups: (MuscleGroup | 'all')[] = [
    'all', 'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'forearms', 'abs', 'obliques', 'quads', 'hamstrings',
    'glutes', 'calves', 'traps', 'lats', 'deltoids'
  ]

  if (loading) {
    return (
      <div className="exercise-selector-overlay">
        <div className="exercise-selector">
          <div className="loading">Loading exercises...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="exercise-selector-overlay" onClick={onClose}>
      <div className="exercise-selector" onClick={(e) => e.stopPropagation()}>
        <div className="exercise-selector-header">
          <h3>Select Exercise</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="exercise-selector-search">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            autoFocus
          />
        </div>

        <div className="exercise-selector-filters">
          <select
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value as MuscleGroup | 'all')}
            className="muscle-group-filter"
          >
            {muscleGroups.map(group => (
              <option key={group} value={group}>
                {group === 'all' ? 'All Muscle Groups' : group.charAt(0).toUpperCase() + group.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="exercise-list">
          {filteredExercises.length === 0 ? (
            <div className="no-exercises">
              <p>No exercises found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedMuscleGroup('all')
                }}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredExercises.map(exercise => (
              <div
                key={exercise.id}
                className="exercise-item"
                onClick={() => handleExerciseSelect(exercise)}
              >
                <div className="exercise-info">
                  <h4>{exercise.name.toUpperCase()}</h4>
                  <div className="exercise-details">
                    <span className="muscle-groups">
                      {exercise.muscle_groups.join(', ')}
                    </span>
                    <span className="category">{exercise.category}</span>
                  </div>
                  {exercise.description && (
                    <p className="description">{exercise.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="exercise-selector-footer">
          <button 
            className="add-custom-exercise-btn"
            onClick={() => {
              // TODO: Implement custom exercise creation
              console.log('Add custom exercise functionality')
            }}
          >
            + Add Custom Exercise
          </button>
        </div>
      </div>
    </div>
  )
} 