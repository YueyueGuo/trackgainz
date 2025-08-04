import { supabase } from './supabase';
import { Profile } from '../types/workout';

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile not found, so create it using upsert to avoid duplicate key errors
      const { data: newUserProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert([{ id: userId }], { onConflict: 'id' })
        .select()
        .single();
      
      if (upsertError) {
        console.error('Error creating profile:', upsertError);
        return null;
      }
      return newUserProfile;
    } else if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  },
}; 