import { supabase } from '../lib/supabase'
import { getExercisesForMigration } from '../data/exerciseSeedData'

export class ExerciseMigration {
  // Populate database with seed data
  static async populateDatabase(): Promise<void> {
    try {
      console.log('Starting exercise database population...')
      
      const seedExercises = getExercisesForMigration()
      
      // Check if exercises already exist
      const { data: existingExercises } = await supabase
        .from('exercises')
        .select('name')
        .limit(1)

      if (existingExercises && existingExercises.length > 0) {
        console.log('Exercises table already has data, skipping population')
        return
      }

      // Insert seed data
      const { data, error } = await supabase
        .from('exercises')
        .insert(seedExercises)
        .select()

      if (error) {
        console.error('Error populating exercise database:', error)
        throw error
      }

      console.log(`Successfully populated database with ${data?.length || 0} exercises`)
    } catch (error) {
      console.error('Failed to populate exercise database:', error)
      throw error
    }
  }

  // Check if database needs population
  static async needsPopulation(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id')
        .limit(1)

      if (error) {
        console.error('Error checking exercise database:', error)
        return false
      }

      return !data || data.length === 0
    } catch (error) {
      console.error('Error checking if database needs population:', error)
      return false
    }
  }

  // Get database status
  static async getDatabaseStatus(): Promise<{
    needsPopulation: boolean
    exerciseCount: number
  }> {
    try {
      const needsPopulation = await this.needsPopulation()
      
      if (needsPopulation) {
        return { needsPopulation: true, exerciseCount: 0 }
      }

      const { count, error } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error getting exercise count:', error)
        return { needsPopulation: false, exerciseCount: 0 }
      }

      return { 
        needsPopulation: false, 
        exerciseCount: count || 0 
      }
    } catch (error) {
      console.error('Error getting database status:', error)
      return { needsPopulation: false, exerciseCount: 0 }
    }
  }

  // Manual population trigger for testing
  static async forcePopulateDatabase(): Promise<void> {
    try {
      console.log('Force populating exercise database...')
      
      const seedExercises = getExercisesForMigration()
      
      // Clear existing data first
      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) {
        console.error('Error clearing exercise database:', deleteError)
      }

      // Insert seed data
      const { data, error } = await supabase
        .from('exercises')
        .insert(seedExercises)
        .select()

      if (error) {
        console.error('Error force populating exercise database:', error)
        throw error
      }

      console.log(`Successfully force populated database with ${data?.length || 0} exercises`)
    } catch (error) {
      console.error('Failed to force populate exercise database:', error)
      throw error
    }
  }
} 