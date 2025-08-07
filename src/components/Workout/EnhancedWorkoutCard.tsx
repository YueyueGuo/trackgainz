import React from 'react'
import { Workout, MuscleGroup } from '../../types/workout'

interface EnhancedWorkoutCardProps {
  workout: Workout
  onDelete: (workoutId: string) => void
  onClick: (workout: Workout) => void
}

export const EnhancedWorkoutCard: React.FC<EnhancedWorkoutCardProps> = ({ 
  workout, 
  onDelete, 
  onClick 
}) => {
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
    const seconds = durationInSeconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
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

  const getMuscleGroups = (workout: Workout): MuscleGroup[] => {
    if (!workout.exercises?.exercises) return []
    
    const muscleGroups = new Set<MuscleGroup>()
    workout.exercises.exercises.forEach(exercise => {
      if (exercise.muscleGroups) {
        exercise.muscleGroups.forEach(group => muscleGroups.add(group as MuscleGroup))
      }
    })
    
    return Array.from(muscleGroups)
  }

  const getMuscleGroupIcon = (muscleGroup: MuscleGroup): string => {
    const icons: Record<MuscleGroup, string> = {
      chest: '💪',
      back: '🏋️',
      shoulders: '🤲',
      biceps: '💪',
      triceps: '💪',
      forearms: '💪',
      abs: '🎯',
      obliques: '🏋️',
      quads: '🦵',
      hamstrings: '🦵',
      glutes: '🍑',
      calves: '🦵',
      traps: '🏋️',
      lats: '🏋️',
      deltoids: '🤲'
    }
    return icons[muscleGroup] || '🏋️'
  }

  const muscleGroups = getMuscleGroups(workout)
  const totalVolume = calculateTotalVolume(workout)
  const hasRecords = workout.personalRecords && workout.personalRecords.length > 0

  return (
    <div className="enhanced-workout-card" onClick={() => onClick(workout)}>
      <div className="workout-card-header">
        <div className="workout-date-info">
          <h3>{formatDate(workout.date)}</h3>
          <span className="workout-duration">
            {formatDuration(workout.duration)}
          </span>
        </div>
        
        <div className="workout-stats-condensed">
          <span className="condensed-stats">
            {totalVolume.toLocaleString()} lbs • {workout.exercises?.exercises?.length || 0} exercises
          </span>
        </div>
      </div>

      {muscleGroups.length > 0 && (
        <div className="muscle-groups">
          <span className="muscle-groups-label">TARGETED:</span>
          <div className="muscle-group-tags">
            {muscleGroups.map(group => (
              <span key={group} className="muscle-group-tag">
                {getMuscleGroupIcon(group)} {group}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasRecords && (
        <div className="records-badge">
          <span className="records-icon">🏆</span>
          <span className="records-text">
            {workout.personalRecords!.length} NEW RECORD{workout.personalRecords!.length > 1 ? 'S' : ''}
          </span>
        </div>
      )}
    </div>
  )
} 