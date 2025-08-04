import { MuscleGroup } from '../types/workout'

export interface ExerciseDefinition {
  id: string
  name: string
  muscleGroups: MuscleGroup[]
  category: 'compound' | 'isolation' | 'cardio' | 'bodyweight'
  equipment?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description?: string
}

export const EXERCISE_SEED_DATA: ExerciseDefinition[] = [
  // Chest Exercises
  {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    category: 'compound',
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    description: 'Classic compound movement for chest development'
  },
  {
    id: 'incline-bench-press',
    name: 'Incline Bench Press',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    category: 'compound',
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    description: 'Upper chest focused bench press variation'
  },
  {
    id: 'decline-bench-press',
    name: 'Decline Bench Press',
    muscleGroups: ['chest', 'triceps'],
    category: 'compound',
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    description: 'Lower chest focused bench press variation'
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    category: 'compound',
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
    description: 'Dumbbell variation of bench press'
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    category: 'bodyweight',
    equipment: [],
    difficulty: 'beginner',
    description: 'Classic bodyweight chest exercise'
  },
  {
    id: 'dips',
    name: 'Dips',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    category: 'bodyweight',
    equipment: ['dip bars'],
    difficulty: 'intermediate',
    description: 'Bodyweight exercise targeting chest and triceps'
  },
  {
    id: 'chest-flyes',
    name: 'Chest Flyes',
    muscleGroups: ['chest'],
    category: 'isolation',
    equipment: ['dumbbells', 'bench'],
    difficulty: 'beginner',
    description: 'Isolation exercise for chest muscles'
  },

  // Back Exercises
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    muscleGroups: ['back', 'biceps'],
    category: 'bodyweight',
    equipment: ['pull-up bar'],
    difficulty: 'intermediate',
    description: 'Upper body pulling exercise'
  },
  {
    id: 'barbell-rows',
    name: 'Barbell Rows',
    muscleGroups: ['back', 'biceps'],
    category: 'compound',
    equipment: ['barbell'],
    difficulty: 'intermediate',
    description: 'Compound back exercise'
  },
  {
    id: 'dumbbell-rows',
    name: 'Dumbbell Rows',
    muscleGroups: ['back', 'biceps'],
    category: 'compound',
    equipment: ['dumbbells', 'bench'],
    difficulty: 'beginner',
    description: 'Single-arm rowing exercise'
  },
  {
    id: 'lat-pulldowns',
    name: 'Lat Pulldowns',
    muscleGroups: ['back', 'biceps'],
    category: 'compound',
    equipment: ['cable machine'],
    difficulty: 'beginner',
    description: 'Machine-based back exercise'
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    muscleGroups: ['back', 'shoulders'],
    category: 'isolation',
    equipment: ['cable machine'],
    difficulty: 'beginner',
    description: 'Rear delt and upper back exercise'
  },

  // Shoulder Exercises
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    muscleGroups: ['shoulders', 'triceps'],
    category: 'compound',
    equipment: ['barbell'],
    difficulty: 'intermediate',
    description: 'Compound shoulder press'
  },
  {
    id: 'dumbbell-press',
    name: 'Dumbbell Press',
    muscleGroups: ['shoulders', 'triceps'],
    category: 'compound',
    equipment: ['dumbbells'],
    difficulty: 'intermediate',
    description: 'Dumbbell shoulder press'
  },
  {
    id: 'lateral-raises',
    name: 'Lateral Raises',
    muscleGroups: ['shoulders'],
    category: 'isolation',
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    description: 'Isolation exercise for lateral deltoids'
  },
  {
    id: 'rear-delt-flyes',
    name: 'Rear Delt Flyes',
    muscleGroups: ['shoulders'],
    category: 'isolation',
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    description: 'Isolation exercise for rear deltoids'
  },

  // Bicep Exercises
  {
    id: 'barbell-curls',
    name: 'Barbell Curls',
    muscleGroups: ['biceps'],
    category: 'isolation',
    equipment: ['barbell'],
    difficulty: 'beginner',
    description: 'Classic bicep curl'
  },
  {
    id: 'dumbbell-curls',
    name: 'Dumbbell Curls',
    muscleGroups: ['biceps'],
    category: 'isolation',
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    description: 'Dumbbell bicep curl'
  },
  {
    id: 'hammer-curls',
    name: 'Hammer Curls',
    muscleGroups: ['biceps', 'forearms'],
    category: 'isolation',
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    description: 'Bicep curl with neutral grip'
  },
  {
    id: 'preacher-curls',
    name: 'Preacher Curls',
    muscleGroups: ['biceps'],
    category: 'isolation',
    equipment: ['barbell', 'preacher bench'],
    difficulty: 'intermediate',
    description: 'Isolated bicep curl on preacher bench'
  },

  // Tricep Exercises
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    muscleGroups: ['triceps'],
    category: 'bodyweight',
    equipment: ['dip bars'],
    difficulty: 'intermediate',
    description: 'Bodyweight tricep exercise'
  },
  {
    id: 'skull-crushers',
    name: 'Skull Crushers',
    muscleGroups: ['triceps'],
    category: 'isolation',
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    description: 'Lying tricep extension'
  },
  {
    id: 'tricep-pushdowns',
    name: 'Tricep Pushdowns',
    muscleGroups: ['triceps'],
    category: 'isolation',
    equipment: ['cable machine'],
    difficulty: 'beginner',
    description: 'Cable tricep exercise'
  },

  // Leg Exercises
  {
    id: 'squats',
    name: 'Squats',
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    category: 'compound',
    equipment: ['barbell'],
    difficulty: 'intermediate',
    description: 'King of leg exercises'
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroups: ['back', 'glutes', 'hamstrings'],
    category: 'compound',
    equipment: ['barbell'],
    difficulty: 'advanced',
    description: 'Full body compound movement'
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    category: 'compound',
    equipment: ['leg press machine'],
    difficulty: 'beginner',
    description: 'Machine-based leg exercise'
  },
  {
    id: 'lunges',
    name: 'Lunges',
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    category: 'compound',
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    description: 'Unilateral leg exercise'
  },
  {
    id: 'leg-curls',
    name: 'Leg Curls',
    muscleGroups: ['hamstrings'],
    category: 'isolation',
    equipment: ['leg curl machine'],
    difficulty: 'beginner',
    description: 'Isolation exercise for hamstrings'
  },
  {
    id: 'leg-extensions',
    name: 'Leg Extensions',
    muscleGroups: ['quads'],
    category: 'isolation',
    equipment: ['leg extension machine'],
    difficulty: 'beginner',
    description: 'Isolation exercise for quadriceps'
  },
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    muscleGroups: ['calves'],
    category: 'isolation',
    equipment: ['calf raise machine'],
    difficulty: 'beginner',
    description: 'Isolation exercise for calves'
  },

  // Core Exercises
  {
    id: 'planks',
    name: 'Planks',
    muscleGroups: ['abs'],
    category: 'bodyweight',
    equipment: [],
    difficulty: 'beginner',
    description: 'Isometric core exercise'
  },
  {
    id: 'crunches',
    name: 'Crunches',
    muscleGroups: ['abs'],
    category: 'bodyweight',
    equipment: [],
    difficulty: 'beginner',
    description: 'Basic abdominal exercise'
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists',
    muscleGroups: ['abs', 'obliques'],
    category: 'bodyweight',
    equipment: [],
    difficulty: 'intermediate',
    description: 'Rotational core exercise'
  },

  // Cardio Exercises
  {
    id: 'running',
    name: 'Running',
    muscleGroups: ['quads', 'calves'],
    category: 'cardio',
    equipment: [],
    difficulty: 'beginner',
    description: 'Basic cardiovascular exercise'
  },
  {
    id: 'cycling',
    name: 'Cycling',
    muscleGroups: ['quads', 'calves'],
    category: 'cardio',
    equipment: ['bicycle'],
    difficulty: 'beginner',
    description: 'Low-impact cardio exercise'
  },
  {
    id: 'rowing',
    name: 'Rowing',
    muscleGroups: ['back', 'biceps', 'quads'],
    category: 'cardio',
    equipment: ['rowing machine'],
    difficulty: 'intermediate',
    description: 'Full body cardio exercise'
  }
]

// Helper functions for migration
export const getExercisesForMigration = () => {
  return EXERCISE_SEED_DATA.map(exercise => ({
    name: exercise.name,
    muscle_groups: exercise.muscleGroups,
    category: exercise.category,
    equipment: exercise.equipment || [],
    difficulty: exercise.difficulty,
    description: exercise.description || '',
    is_verified: true // Seed data is pre-verified
  }))
} 