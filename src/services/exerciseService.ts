import { supabase } from '../lib/supabase'
import { DatabaseExercise, MuscleGroup, ExerciseCategory, ExerciseDifficulty } from '../types/workout'

export interface CreateExerciseData {
  name: string
  muscle_groups: MuscleGroup[]
  category: ExerciseCategory
  equipment?: string[]
  difficulty: ExerciseDifficulty
  description?: string
}

export interface SearchFilters {
  muscleGroups?: MuscleGroup[]
  category?: ExerciseCategory
  difficulty?: ExerciseDifficulty
  equipment?: string[]
  searchTerm?: string
}

export class ExerciseService {
  // Fetch all exercises with optional filters
  static async getExercises(filters?: SearchFilters): Promise<DatabaseExercise[]> {
    let query = supabase
      .from('exercises')
      .select('*')
      .order('name')

    if (filters?.muscleGroups && filters.muscleGroups.length > 0) {
      query = query.overlaps('muscle_groups', filters.muscleGroups)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }

    if (filters?.equipment && filters.equipment.length > 0) {
      query = query.overlaps('equipment', filters.equipment)
    }

    if (filters?.searchTerm) {
      query = query.ilike('name', `%${filters.searchTerm}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching exercises:', error)
      throw error
    }

    return data || []
  }

  // Get exercise by ID
  static async getExerciseById(id: string): Promise<DatabaseExercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching exercise:', error)
      throw error
    }

    return data
  }

  // Get exercise by name
  static async getExerciseByName(name: string): Promise<DatabaseExercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('name', name)
      .single()

    if (error) {
      console.error('Error fetching exercise by name:', error)
      return null
    }

    return data
  }

  // Create new exercise
  static async createExercise(exerciseData: CreateExerciseData, userId: string): Promise<DatabaseExercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        ...exerciseData,
        created_by: userId,
        usage_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating exercise:', error)
      throw error
    }

    return data
  }

  // Update exercise usage count
  static async incrementUsageCount(exerciseId: string): Promise<void> {
    // First get current usage count
    const { data: currentExercise } = await supabase
      .from('exercises')
      .select('usage_count')
      .eq('id', exerciseId)
      .single()

    if (!currentExercise) {
      throw new Error('Exercise not found')
    }

    // Then update with incremented value
    const { error } = await supabase
      .from('exercises')
      .update({ 
        usage_count: currentExercise.usage_count + 1,
        last_used: new Date().toISOString()
      })
      .eq('id', exerciseId)

    if (error) {
      console.error('Error updating exercise usage:', error)
      throw error
    }
  }

  // Search exercises by name
  static async searchExercises(searchTerm: string): Promise<DatabaseExercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('name')

    if (error) {
      console.error('Error searching exercises:', error)
      throw error
    }

    return data || []
  }

  // Get exercises by muscle group
  static async getExercisesByMuscleGroup(muscleGroup: MuscleGroup): Promise<DatabaseExercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .contains('muscle_groups', [muscleGroup])
      .order('name')

    if (error) {
      console.error('Error fetching exercises by muscle group:', error)
      throw error
    }

    return data || []
  }

  // Get popular exercises (most used)
  static async getPopularExercises(limit: number = 10): Promise<DatabaseExercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching popular exercises:', error)
      throw error
    }

    return data || []
  }

  // Get recently used exercises
  static async getRecentlyUsedExercises(limit: number = 10): Promise<DatabaseExercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .not('last_used', 'is', null)
      .order('last_used', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recently used exercises:', error)
      throw error
    }

    return data || []
  }
} 