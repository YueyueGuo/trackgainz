import { supabase } from '../lib/supabase'
import { EXERCISE_SEED_DATA } from '../data/exerciseSeedData'

export const migrateExercises = async () => {
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

// Run migration if this file is executed directly
if (require.main === module) {
  migrateExercises()
} 