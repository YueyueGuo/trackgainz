const { createClient } = require('@supabase/supabase-js')

// Use the same configuration as the main app
const supabaseUrl = 'https://xcejwrnjkoarlymvrtlp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWp3cm5qa29hcmx5bXZydGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjg5MTIsImV4cCI6MjA2OTgwNDkxMn0.Rjtgc8n1EPVWchzHzEJ37CZ5-PjJxWbhtg9Wuq30iBQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Exercise seed data
const EXERCISE_SEED_DATA = [
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
    id: 'lunges',
    name: 'Lunges',
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    category: 'compound',
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    description: 'Unilateral leg exercise'
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
  }
]

const migrateExercises = async () => {
  console.log('Starting exercise migration...')
  
  try {
    // Check if exercises already exist
    const { data: existingExercises, error: checkError } = await supabase
      .from('exercises')
      .select('name')
      .limit(1)

    if (checkError) {
      console.error('Error checking existing exercises:', checkError)
      return
    }

    if (existingExercises && existingExercises.length > 0) {
      console.log('Exercises already exist in database, skipping migration')
      return
    }

    // Prepare exercise data for insertion
    const exerciseData = EXERCISE_SEED_DATA.map(exercise => ({
      name: exercise.name,
      muscle_groups: exercise.muscleGroups,
      category: exercise.category,
      equipment: exercise.equipment || [],
      difficulty: exercise.difficulty,
      description: exercise.description || '',
      is_verified: true, // Seed data is pre-verified
      created_by: null, // System-created exercises
      usage_count: 0,
      last_used: null
    }))

    console.log(`Migrating ${exerciseData.length} exercises...`)

    // Insert exercises in batches to avoid hitting limits
    const batchSize = 50
    for (let i = 0; i < exerciseData.length; i += batchSize) {
      const batch = exerciseData.slice(i, i + batchSize)
      
      const { error: insertError } = await supabase
        .from('exercises')
        .insert(batch)

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError)
        return
      }

      console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} exercises)`)
    }

    console.log('Exercise migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Run migration
migrateExercises()
  .then(() => {
    console.log('Migration completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  }) 