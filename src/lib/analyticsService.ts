import { supabase } from './supabase';
import { Workout, WorkoutData } from '../types/workout';

export interface VolumeData {
  date: string;
  totalVolume: number;
  totalSets: number;
  workoutCount: number;
}

export interface MuscleGroupVolume {
  muscleGroup: string;
  totalVolume: number;
  totalSets: number;
  lastTrained: string;
  daysSinceLastTrained: number;
}

export interface WorkoutFrequency {
  week: string;
  workoutCount: number;
  totalVolume: number;
}

export interface ProgressStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  averageWorkoutsPerWeek: number;
  totalVolumeAllTime: number;
}

export const analyticsService = {
  async getVolumeData(userId: string, days: number = 30): Promise<VolumeData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('date, exercises')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error || !workouts) {
      console.error('Error fetching volume data:', error);
      return [];
    }

    const volumeMap = new Map<string, VolumeData>();

    workouts.forEach(workout => {
      if (!workout.exercises?.exercises) return;

      let dailyVolume = 0;
      let dailySets = 0;

      workout.exercises.exercises.forEach((exercise: any) => {
        if (exercise.sets) {
          exercise.sets.forEach((set: any) => {
            if (set.completed && set.weight > 0 && set.reps > 0) {
              dailyVolume += set.weight * set.reps;
              dailySets += 1;
            }
          });
        }
      });

      const existing = volumeMap.get(workout.date);
      if (existing) {
        existing.totalVolume += dailyVolume;
        existing.totalSets += dailySets;
        existing.workoutCount += 1;
      } else {
        volumeMap.set(workout.date, {
          date: workout.date,
          totalVolume: dailyVolume,
          totalSets: dailySets,
          workoutCount: 1
        });
      }
    });

    return Array.from(volumeMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  },

  async getWorkoutFrequency(userId: string, weeks: number = 12): Promise<WorkoutFrequency[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('date, exercises')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error || !workouts) {
      console.error('Error fetching workout frequency:', error);
      return [];
    }

    const weeklyData = new Map<string, WorkoutFrequency>();

    workouts.forEach(workout => {
      const date = new Date(workout.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];

      let workoutVolume = 0;
      if (workout.exercises?.exercises) {
        workout.exercises.exercises.forEach((exercise: any) => {
          if (exercise.sets) {
            exercise.sets.forEach((set: any) => {
              if (set.completed && set.weight > 0 && set.reps > 0) {
                workoutVolume += set.weight * set.reps;
              }
            });
          }
        });
      }

      const existing = weeklyData.get(weekKey);
      if (existing) {
        existing.workoutCount += 1;
        existing.totalVolume += workoutVolume;
      } else {
        weeklyData.set(weekKey, {
          week: weekKey,
          workoutCount: 1,
          totalVolume: workoutVolume
        });
      }
    });

    return Array.from(weeklyData.values()).sort((a, b) => a.week.localeCompare(b.week));
  },

  async getProgressStats(userId: string): Promise<ProgressStats> {
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('date, exercises')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error || !workouts) {
      console.error('Error fetching progress stats:', error);
      return {
        totalWorkouts: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageWorkoutsPerWeek: 0,
        totalVolumeAllTime: 0
      };
    }

    const totalWorkouts = workouts.length;
    let totalVolumeAllTime = 0;

    // Calculate total volume
    workouts.forEach(workout => {
      if (workout.exercises?.exercises) {
        workout.exercises.exercises.forEach((exercise: any) => {
          if (exercise.sets) {
            exercise.sets.forEach((set: any) => {
              if (set.completed && set.weight > 0 && set.reps > 0) {
                totalVolumeAllTime += set.weight * set.reps;
              }
            });
          }
        });
      }
    });

    // Calculate streaks
    const workoutDates = workouts.map(w => new Date(w.date)).sort((a, b) => a.getTime() - b.getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    if (workoutDates.length > 0) {
      const today = new Date();
      const lastWorkout = workoutDates[workoutDates.length - 1];
      const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
      
      // Current streak (if last workout was within 3 days)
      if (daysSinceLastWorkout <= 3) {
        currentStreak = 1;
        for (let i = workoutDates.length - 2; i >= 0; i--) {
          const daysBetween = Math.floor((workoutDates[i + 1].getTime() - workoutDates[i].getTime()) / (1000 * 60 * 60 * 24));
          if (daysBetween <= 3) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Longest streak
      for (let i = 1; i < workoutDates.length; i++) {
        const daysBetween = Math.floor((workoutDates[i].getTime() - workoutDates[i - 1].getTime()) / (1000 * 60 * 60 * 24));
        if (daysBetween <= 3) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Calculate average workouts per week
    const firstWorkout = workoutDates[0];
    const lastWorkout = workoutDates[workoutDates.length - 1];
    const totalWeeks = workoutDates.length > 0 
      ? Math.max(1, Math.ceil((lastWorkout.getTime() - firstWorkout.getTime()) / (1000 * 60 * 60 * 24 * 7)))
      : 1;
    const averageWorkoutsPerWeek = totalWorkouts / totalWeeks;

    return {
      totalWorkouts,
      currentStreak,
      longestStreak,
      averageWorkoutsPerWeek: Math.round(averageWorkoutsPerWeek * 10) / 10,
      totalVolumeAllTime
    };
  }
}; 