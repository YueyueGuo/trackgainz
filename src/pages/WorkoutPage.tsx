import React, { useState } from 'react'
import { EnhancedWorkoutForm } from '../components/Workout/EnhancedWorkoutForm'
import { JSONBWorkoutList } from '../components/Workout/JSONBWorkoutList'
import { TemplateList } from '../components/Templates/TemplateList'
import { CreateTemplateForm } from '../components/Templates/CreateTemplateForm'
import { PreviousWorkoutList } from '../components/Templates/PreviousWorkoutList'
import { Exercise, WorkoutTemplate, Workout } from '../types/workout'

type WorkoutPageView = 'workout' | 'templates' | 'create-template' | 'previous-workouts'

export const WorkoutPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [currentView, setCurrentView] = useState<WorkoutPageView>('workout')
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([])
  const [workoutSource, setWorkoutSource] = useState<string>('')
  const [hasChosenWorkoutStart, setHasChosenWorkoutStart] = useState<boolean>(false)
  const [isFreshWorkout, setIsFreshWorkout] = useState<boolean>(false)

  const handleWorkoutAdded = () => {
    setRefreshTrigger(prev => prev + 1)
    // Reset workout state after completion
    setWorkoutExercises([])
    setWorkoutSource('')
    setHasChosenWorkoutStart(false)
    setIsFreshWorkout(false)
  }

  const handleTemplateCreated = () => {
    setRefreshTrigger(prev => prev + 1)
    setCurrentView('templates')
  }

  const handleStartFromTemplate = (template: WorkoutTemplate) => {
    if (template.exercises?.exercises) {
      // Reset completion status for all sets
      const resetExercises = template.exercises.exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({ ...set, completed: false }))
      }))
      
      setWorkoutExercises(resetExercises)
      setWorkoutSource(`Template: ${template.name}`)
      setHasChosenWorkoutStart(true)
      setIsFreshWorkout(false)
      setCurrentView('workout')
    }
  }

  const handleStartFromPrevious = (workout: Workout) => {
    if (workout.exercises?.exercises) {
      // Reset completion status for all sets
      const resetExercises = workout.exercises.exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({ ...set, completed: false }))
      }))
      
      setWorkoutExercises(resetExercises)
      const workoutDate = new Date(workout.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      setWorkoutSource(`Previous: ${workoutDate}`)
      setHasChosenWorkoutStart(true)
      setIsFreshWorkout(false)
      setCurrentView('workout')
    }
  }

  const handleStartBlank = () => {
    setWorkoutExercises([])
    setWorkoutSource('')
    setHasChosenWorkoutStart(true)
    setIsFreshWorkout(true)
    setCurrentView('workout')
  }

  const renderWorkoutOptions = () => (
    <div className="workout-options">
      <div className="workout-options-header">
        <h2>START NEW WORKOUT</h2>
        <p>Choose how you'd like to begin your workout session</p>
      </div>
      
      <div className="workout-option-cards">
        <div className="workout-option-card" onClick={handleStartBlank}>
          <div className="option-icon">💪</div>
          <h3>FRESH WORKOUT</h3>
          <p>Start fresh with an empty workout</p>
          <button className="option-btn">START FRESH</button>
        </div>
        
        <div className="workout-option-card" onClick={() => setCurrentView('templates')}>
          <div className="option-icon">📋</div>
          <h3>FROM TEMPLATE</h3>
          <p>Use a saved workout template</p>
          <button className="option-btn">CHOOSE TEMPLATE</button>
        </div>
        
        <div className="workout-option-card" onClick={() => setCurrentView('previous-workouts')}>
          <div className="option-icon">🔄</div>
          <h3>REPEAT PREVIOUS</h3>
          <p>Repeat a previous workout session</p>
          <button className="option-btn">CHOOSE WORKOUT</button>
        </div>
      </div>
    </div>
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case 'templates':
        return (
          <div>
            <div className="view-header">
              <button 
                onClick={() => setCurrentView('workout')} 
                className="back-btn"
              >
                ← BACK TO OPTIONS
              </button>
            </div>
            <TemplateList
              onSelectTemplate={handleStartFromTemplate}
              onCreateTemplate={() => setCurrentView('create-template')}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )
      
      case 'create-template':
        return (
          <CreateTemplateForm
            onTemplateCreated={handleTemplateCreated}
            onCancel={() => setCurrentView('templates')}
            initialExercises={workoutExercises}
          />
        )
      
      case 'previous-workouts':
        return (
          <div>
            <div className="view-header">
              <button 
                onClick={() => setCurrentView('workout')} 
                className="back-btn"
              >
                ← BACK TO OPTIONS
              </button>
            </div>
            <PreviousWorkoutList
              onSelectWorkout={handleStartFromPrevious}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )
      
      case 'workout':
      default:
        return (
          <div>
            {!hasChosenWorkoutStart && (
              <div className="workout-start-options">
                {renderWorkoutOptions()}
              </div>
            )}
            
            {hasChosenWorkoutStart && (
              <div className="view-header">
                <button 
                  onClick={() => {
                    setHasChosenWorkoutStart(false)
                    setWorkoutExercises([])
                    setWorkoutSource('')
                    setIsFreshWorkout(false)
                  }} 
                  className="back-btn"
                >
                  ← CHOOSE DIFFERENT START
                </button>
              </div>
            )}
            
            {hasChosenWorkoutStart && (
              <EnhancedWorkoutForm 
                onWorkoutAdded={handleWorkoutAdded}
                initialExercises={workoutExercises}
                workoutSource={workoutSource}
                isFreshWorkout={isFreshWorkout}
              />
            )}
          </div>
        )
    }
  }

  return (
    <div className="main-content">
      {renderCurrentView()}
      
      {currentView === 'workout' && !hasChosenWorkoutStart && (
        <JSONBWorkoutList refreshTrigger={refreshTrigger} />
      )}
    </div>
  )
}