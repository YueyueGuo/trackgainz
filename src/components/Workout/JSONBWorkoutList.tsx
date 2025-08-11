import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Workout } from '../../types/workout'
import { EnhancedWorkoutCard } from './EnhancedWorkoutCard'

interface JSONBWorkoutListProps {
  refreshTrigger: number
}

export const JSONBWorkoutList: React.FC<JSONBWorkoutListProps> = ({ refreshTrigger }) => {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

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
      setFilteredWorkouts(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkouts()
  }, [user, refreshTrigger])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredWorkouts(workouts)
    } else {
      const filtered = workouts.filter(workout => {
        const date = new Date(workout.date).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }).toLowerCase()
        
        const exercises = workout.exercises?.exercises?.map(ex => ex.name).join(' ').toLowerCase() || ''
        
        return date.includes(searchTerm.toLowerCase()) || 
               exercises.includes(searchTerm.toLowerCase())
      })
      setFilteredWorkouts(filtered)
    }
  }, [searchTerm, workouts])

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

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkout(workout)
  }

  const handleBackToList = () => {
    setSelectedWorkout(null)
  }

  if (loading) {
    return (
      <div className="enhanced-workout-list">
        <div className="loading">LOADING WORKOUTS...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="enhanced-workout-list">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="enhanced-workout-list">
        <div className="empty-state">
          <h3>NO WORKOUTS YET</h3>
          <p>Complete your first workout to see it here!</p>
        </div>
      </div>
    )
  }

  // Show detailed workout view
  if (selectedWorkout) {
    return (
      <div className="enhanced-workout-list">
        <div className="workout-detail-view">
          <div className="detail-header">
            <button onClick={handleBackToList} className="back-btn">
              ← BACK TO WORKOUTS
            </button>
            <h2>{new Date(selectedWorkout.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</h2>
          </div>
          
          <div className="workout-detail-content">
            {/* Detailed workout view - we can expand this later */}
            <div className="workout-summary">
              <div className="summary-stats">
                <div className="stat">
                  <span className="stat-label">DURATION</span>
                  <span className="stat-value">
                    {selectedWorkout.duration ? 
                      `${Math.floor(selectedWorkout.duration / 60)}m ${selectedWorkout.duration % 60}s` : 
                      'Not recorded'
                    }
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">EXERCISES</span>
                  <span className="stat-value">
                    {selectedWorkout.exercises?.exercises?.length || 0}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">TOTAL VOLUME</span>
                  <span className="stat-value">
                    {selectedWorkout.exercises?.exercises?.reduce((total, exercise) => 
                      total + exercise.sets.reduce((exerciseTotal, set) => 
                        exerciseTotal + (set.weight * set.reps), 0
                      ), 0
                    ).toLocaleString()} lbs
                  </span>
                </div>
              </div>
            </div>
            
            {selectedWorkout.exercises?.exercises && (
              <div className="exercises-detail">
                {selectedWorkout.exercises.exercises.map((exercise, index) => (
                  <div key={index} className="exercise-detail-item">
                    <h3>{exercise.name}</h3>
                    <div className="sets-detail">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className={`set-detail ${set.type} ${set.completed ? 'completed' : ''}`}>
                          <span className="set-info">
                            Set {setIndex + 1}: {set.weight}lbs × {set.reps} reps
                          </span>
                          <span className="set-badges">
                            {set.type !== 'working' && (
                              <span className={`type-badge ${set.type}`}>
                                {set.type === 'warmup' ? 'W' : 'F'}
                              </span>
                            )}
                            {set.completed && <span className="completed-badge">✓</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show workout list view
  return (
    <div className="enhanced-workout-list">
      <div className="workout-list-header">
        <div className="header-content">
          <h2>WORKOUT HISTORY</h2>
          <p>{workouts.length} sessions logged</p>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="workout-cards">
        {filteredWorkouts.map((workout) => (
          <EnhancedWorkoutCard
            key={workout.id}
            workout={workout}
            onDelete={deleteWorkout}
            onClick={handleWorkoutClick}
          />
        ))}
      </div>

      {filteredWorkouts.length === 0 && searchTerm && (
        <div className="no-results">
          <p>No workouts found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}