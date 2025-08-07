import { migrateExercises } from './migrateExercises'

console.log('Starting exercise library migration...')
migrateExercises()
  .then(() => {
    console.log('Migration completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  }) 