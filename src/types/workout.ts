export type SetType = 'regular' | 'warmup' | 'failure'

export interface WorkoutSet {
  weight: number
  reps: number
  type: SetType
  completed: boolean
}

export interface Exercise {
  name: string
  sets: WorkoutSet[]
}

export interface WorkoutData {
  exercises: Exercise[]
}

export interface Workout {
  id: string
  user_id: string
  date: string
  start_time?: string
  end_time?: string
  duration?: number
  exercises: WorkoutData
  created_at: string
}

export interface WorkoutTemplate {
  id: string
  user_id: string
  name: string
  description?: string
  exercises: WorkoutData
  created_at: string
  updated_at: string
}