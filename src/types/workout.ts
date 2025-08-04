export type SetType = 'regular' | 'warmup' | 'failure'

export interface WorkoutSet {
  weight: number
  reps: number
  type: SetType
  completed: boolean
}

export interface Exercise {
  name: string
  exerciseId?: string // Reference to exercise database
  sets: WorkoutSet[]
  muscleGroups?: MuscleGroup[] // Auto-populated from exercise database
}

export interface WorkoutData {
  exercises: Exercise[]
}

export interface PersonalRecord {
  exercise: string
  exerciseId?: string
  weight: number
  reps: number
  date: string
  type: 'weight' | 'reps' | 'volume' // type of record
}

export interface Workout {
  id: string
  user_id: string
  date: string
  start_time?: string
  end_time?: string
  duration?: number
  exercises: WorkoutData
  personalRecords?: PersonalRecord[] // records achieved in this workout
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

// Database exercise types
export interface DatabaseExercise {
  id: string
  name: string
  muscle_groups: MuscleGroup[]
  category: 'compound' | 'isolation' | 'cardio' | 'bodyweight'
  equipment?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description?: string
  is_verified: boolean
  created_by?: string | null
  created_at: string
  usage_count: number
  last_used?: string | null
}

// Helper types for muscle groups
export type MuscleGroup = 
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' 
  | 'forearms' | 'abs' | 'obliques' | 'quads' | 'hamstrings' 
  | 'glutes' | 'calves' | 'traps' | 'lats' | 'deltoids'

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'forearms', 'abs', 'obliques', 'quads', 'hamstrings',
  'glutes', 'calves', 'traps', 'lats', 'deltoids'
]

// Exercise categories
export type ExerciseCategory = 'compound' | 'isolation' | 'cardio' | 'bodyweight'
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type PrimaryGoal = 'strength' | 'hypertrophy' | 'endurance' | 'general_fitness';
export type UnitSystem = 'metric' | 'imperial';

export interface Profile {
  id: string;
  name?: string;
  birthday?: string; // Stored as ISO 8601 string (YYYY-MM-DD)
  gender?: string;
  experience_level?: ExperienceLevel;
  primary_goal?: PrimaryGoal;
  unit_system?: UnitSystem; // 'metric' (kg/cm) or 'imperial' (lbs/ft+in)
  height?: number; // in cm for metric, inches for imperial
  weight?: number; // in kg for metric, lbs for imperial
  created_at: string;
  updated_at: string;
}