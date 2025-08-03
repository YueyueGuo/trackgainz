import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcejwrnjkoarlymvrtlp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZWp3cm5qa29hcmx5bXZydGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjg5MTIsImV4cCI6MjA2OTgwNDkxMn0.Rjtgc8n1EPVWchzHzEJ37CZ5-PjJxWbhtg9Wuq30iBQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      workouts: {
        Row: {
          id: string
          user_id: string
          date: string
          start_time?: string
          end_time?: string
          duration?: number
          exercises: any // JSONB
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          start_time?: string
          end_time?: string
          duration?: number
          exercises: any // JSONB
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          start_time?: string
          end_time?: string
          duration?: number
          exercises?: any // JSONB
          created_at?: string
        }
      }
      workout_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description?: string
          exercises: any // JSONB
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          exercises: any // JSONB
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          exercises?: any // JSONB
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}