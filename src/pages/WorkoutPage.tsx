import React, { useState, useEffect } from 'react'
import { WorkoutHistory } from '../components/Workout/WorkoutHistory'
import { WorkoutDetail } from '../components/Workout/WorkoutDetail'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Workout } from '../types/workout'

export const WorkoutPage: React.FC = () => {
  const { user } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [currentView, setCurrentView] = useState<'history' | 'detail'>('history')
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch specific workout for detail view
  const fetchWorkout = async (workoutId: string) => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      setSelectedWorkout(data)
      setCurrentView('detail')
    } catch (error: any) {
      console.error('Error fetching workout:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle workout selection from history
  const handleWorkoutSelect = (workoutId: string) => {
    setSelectedWorkoutId(workoutId)
    fetchWorkout(workoutId)
  }

  // Handle back navigation from detail to history
  const handleBackToHistory = () => {
    setCurrentView('history')
    setSelectedWorkoutId(null)
    setSelectedWorkout(null)
  }

  // Handle repeat workout functionality
  const handleRepeatWorkout = (workout: Workout) => {
    // TODO: Implement repeat workout logic
    // This could navigate to record workout page with pre-filled exercises
    console.log('Repeat workout:', workout)
  }

  // Show loading state when fetching workout details
  if (loading && currentView === 'detail') {
    return (
      <div className="main-content">
        <div className="flex items-center justify-center h-64">
          <div className="text-amber-100 text-lg font-semibold">Loading workout...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      {currentView === 'history' ? (
        <WorkoutHistory 
          onWorkoutSelect={handleWorkoutSelect}
          refreshTrigger={refreshTrigger} 
        />
      ) : (
        selectedWorkout && (
          <WorkoutDetail
            workout={selectedWorkout}
            onBack={handleBackToHistory}
            onRepeatWorkout={handleRepeatWorkout}
          />
        )
      )}
    </div>
  )
}