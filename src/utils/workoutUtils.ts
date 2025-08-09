import { Workout } from '../types/workout'
import { WorkoutSummary } from '../components/Workout/WorkoutSummaryCard'

export const transformWorkoutToSummary = (workout: Workout): WorkoutSummary => {
  // Calculate completion rate
  const totalSets = workout.exercises?.exercises?.reduce((total, exercise) => 
    total + exercise.sets.length, 0
  ) || 0
  
  const completedSets = workout.exercises?.exercises?.reduce((total, exercise) => 
    total + exercise.sets.filter(set => set.completed).length, 0
  ) || 0
  
  const completionRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  // Calculate total volume (weight × reps for all sets)
  const totalVolume = workout.exercises?.exercises?.reduce((total, exercise) => 
    total + exercise.sets.reduce((exerciseTotal, set) => 
      exerciseTotal + (set.weight * set.reps), 0
    ), 0
  ) || 0

  // Format date and time ago
  const workoutDate = new Date(workout.date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - workoutDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let timeAgo: string
  let dateDisplay: string
  
  if (diffDays === 1) {
    timeAgo = "Today"
    dateDisplay = "Today"
  } else if (diffDays === 2) {
    timeAgo = "Yesterday"
    dateDisplay = "Yesterday"
  } else if (diffDays <= 7) {
    timeAgo = `${diffDays - 1} days ago`
    dateDisplay = workoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } else if (diffDays <= 14) {
    timeAgo = "1 week ago"
    dateDisplay = workoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } else {
    timeAgo = `${Math.floor(diffDays / 7)} weeks ago`
    dateDisplay = workoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Format duration
  const formatDuration = (duration?: number): string => {
    if (!duration) return "0:00"
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Generate workout name from exercises (take first exercise or generic name)
  const workoutName = workout.exercises?.exercises?.[0]?.name?.split(' ')[0] + " Day" || "Workout"

  return {
    id: workout.id,
    date: dateDisplay,
    timeAgo,
    duration: formatDuration(workout.duration),
    exerciseCount: workout.exercises?.exercises?.length || 0,
    totalVolume,
    workoutName,
    completionRate
  }
}

export const calculateWorkoutStats = (workouts: Workout[]) => {
  if (workouts.length === 0) {
    return {
      totalWorkouts: 0,
      currentStreak: 0,
      avgDuration: "0:00",
      totalVolume: 0
    }
  }

  // Calculate total volume
  const totalVolume = workouts.reduce((total, workout) => {
    const workoutVolume = workout.exercises?.exercises?.reduce((exerciseTotal, exercise) => 
      exerciseTotal + exercise.sets.reduce((setTotal, set) => 
        setTotal + (set.weight * set.reps), 0
      ), 0
    ) || 0
    return total + workoutVolume
  }, 0)

  // Calculate average duration
  const totalDuration = workouts.reduce((total, workout) => total + (workout.duration || 0), 0)
  const avgDurationSeconds = totalDuration / workouts.length
  const avgMinutes = Math.floor(avgDurationSeconds / 60)
  const avgSeconds = Math.floor(avgDurationSeconds % 60)
  const avgDuration = `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`

  // Calculate current streak (consecutive days with workouts)
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < sortedWorkouts.length; i++) {
    const workoutDate = new Date(sortedWorkouts[i].date)
    workoutDate.setHours(0, 0, 0, 0)
    
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    
    if (workoutDate.getTime() === expectedDate.getTime()) {
      currentStreak++
    } else {
      break
    }
  }

  return {
    totalWorkouts: workouts.length,
    currentStreak,
    avgDuration,
    totalVolume
  }
}