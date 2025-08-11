import { supabase } from './supabase';
import { analyticsService, ProgressStats, VolumeData } from './analyticsService';

export interface EnhancedProgressStats extends ProgressStats {
  averageWorkoutTimeMinutes?: number;
  thisWeekWorkouts: number;
  thisMonthWorkouts: number;
  personalRecords: number;
}

// Remove projection-related interfaces
export interface ExerciseAnalyticsData {
  name: string;
  currentMax: number;
  trend: number;
  lastWorkout: string;
  totalSets: number;
  data: Array<{
    date: string;
    weight: number;
  }>;
  // Remove projection and projections fields
}

export interface ExerciseDetailData {
  name: string;
  currentMax: number;
  allTimeMax: number;
  firstRecorded: string;
  totalWorkouts: number;
  totalSets: number;
  totalVolume: number;
  personalRecords: Array<{
    date: string;
    weight: number;
    reps: number;
  }>;
  volumeHistory: Array<{
    date: string;
    volume: number;
  }>;
  strengthHistory: Array<{
    date: string;
    weight: number;
    reps: number;
  }>;
  // Remove projections field
}

// Add this utility function at the top
const filterCompleteWorkouts = (workouts: any[]) => {
  return workouts.filter(workout => {
    const hasExercises = workout.exercises?.exercises && 
                        Array.isArray(workout.exercises.exercises) && 
                        workout.exercises.exercises.length > 0;
    const hasDuration = workout.duration && workout.duration > 0;
    
    // Must have both exercises AND duration to be a complete workout
    return hasExercises && hasDuration;
  });
};

// Add this utility function for proper date comparison
const isDateInRange = (dateString: string, startDate: Date): boolean => {
  // Convert date string (YYYY-MM-DD) to Date object for comparison
  const workoutDate = new Date(dateString + 'T00:00:00');
  return workoutDate >= startDate;
};

export const progressAnalyticsService = {
  async getEnhancedProgressStats(userId: string): Promise<EnhancedProgressStats> {
    // Get base stats from existing service
    const baseStats = await analyticsService.getProgressStats(userId);
    
    // Get workout time data
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('date, created_at, updated_at, exercises, duration')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error || !workouts) {
      console.error('Error fetching enhanced progress stats:', error);
      return {
        ...baseStats,
        averageWorkoutTimeMinutes: 45,
        thisWeekWorkouts: 0,
        thisMonthWorkouts: 0,
        personalRecords: 0
      };
    }

    // Debug logging
    console.log('Total workouts fetched:', workouts.length);
    console.log('Sample workout:', workouts[0]);
    console.log('Workout dates:', workouts.slice(0, 5).map(w => ({ date: w.date, hasExercises: !!w.exercises?.exercises?.length, hasDuration: !!w.duration })));

    // Apply the same filtering as used in PreviousWorkoutList
    const completeWorkouts = filterCompleteWorkouts(workouts);
    console.log('Complete workouts after filtering:', completeWorkouts.length);

    // Calculate average workout time (rough estimate based on created_at vs updated_at)
    let totalWorkoutTime = 0;
    let workoutsWithTime = 0;
    
    completeWorkouts.forEach(workout => {
      if (workout.created_at && workout.updated_at) {
        const start = new Date(workout.created_at);
        const end = new Date(workout.updated_at);
        const duration = Math.max(0, Math.min(180, (end.getTime() - start.getTime()) / (1000 * 60))); // Cap at 3 hours
        if (duration > 5) { // Only count workouts longer than 5 minutes
          totalWorkoutTime += duration;
          workoutsWithTime++;
        }
      }
    });

    const averageWorkoutTimeMinutes = workoutsWithTime > 0 ? Math.round(totalWorkoutTime / workoutsWithTime) : 45; // Default to 45 mins

    // Calculate this week and month workouts using proper date comparison
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Reset time components to start of day for accurate comparison
    oneWeekAgo.setHours(0, 0, 0, 0);
    oneMonthAgo.setHours(0, 0, 0, 0);

    console.log('Current date:', now.toISOString());
    console.log('One week ago:', oneWeekAgo.toISOString());
    console.log('One month ago:', oneMonthAgo.toISOString());

    const thisWeekWorkouts = completeWorkouts.filter(w => {
      const inRange = isDateInRange(w.date, oneWeekAgo);
      console.log(`Workout date ${w.date} in week range: ${inRange}`);
      return inRange;
    }).length;

    const thisMonthWorkouts = completeWorkouts.filter(w => {
      const inRange = isDateInRange(w.date, oneMonthAgo);
      console.log(`Workout date ${w.date} in month range: ${inRange}`);
      return inRange;
    }).length;

    console.log('This week workouts:', thisWeekWorkouts);
    console.log('This month workouts:', thisMonthWorkouts);

    // Count personal records (simplified - count unique exercises with max weights)
    const exerciseMaxes = new Map<string, number>();
    completeWorkouts.forEach(workout => {
      if (workout.exercises?.exercises) {
        workout.exercises.exercises.forEach((exercise: any) => {
          if (exercise.sets && exercise.name) {
            const maxWeight = Math.max(...exercise.sets
              .filter((set: any) => set.completed && set.weight > 0)
              .map((set: any) => set.weight));
            
            if (maxWeight > 0) {
              const currentMax = exerciseMaxes.get(exercise.name) || 0;
              if (maxWeight > currentMax) {
                exerciseMaxes.set(exercise.name, maxWeight);
              }
            }
          }
        });
      }
    });

    return {
      ...baseStats,
      averageWorkoutTimeMinutes,
      thisWeekWorkouts,
      thisMonthWorkouts,
      personalRecords: exerciseMaxes.size
    };
  },

  async getExerciseAnalytics(userId: string, limit: number = 5): Promise<ExerciseAnalyticsData[]> {
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('date, exercises, duration')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error || !workouts) {
      console.error('Error fetching exercise analytics:', error);
      return [];
    }

    // Apply the same filtering as used in PreviousWorkoutList
    const completeWorkouts = filterCompleteWorkouts(workouts);

    // Process exercises and build analytics data
    const exerciseData = new Map<string, {
      dates: string[];
      weights: number[];
      totalSets: number;
      lastWorkout: string;
    }>();

    completeWorkouts.forEach(workout => {
      if (workout.exercises?.exercises) {
        workout.exercises.exercises.forEach((exercise: any) => {
          if (exercise.name && exercise.sets) {
            const maxWeight = Math.max(...exercise.sets
              .filter((set: any) => set.completed && set.weight > 0)
              .map((set: any) => set.weight));
            
            if (maxWeight > 0) {
              const current = exerciseData.get(exercise.name) || {
                dates: [] as string[],
                weights: [] as number[],
                totalSets: 0,
                lastWorkout: workout.date as string
              };
              
              current.dates.push(workout.date);
              current.weights.push(maxWeight);
              current.totalSets += exercise.sets.filter((set: any) => set.completed).length;
              current.lastWorkout = workout.date; // Will be latest due to ordering
              
              exerciseData.set(exercise.name, current);
            }
          }
        });
      }
    });

    // Convert to analytics format and sort by frequency
    const analytics: ExerciseAnalyticsData[] = Array.from(exerciseData.entries())
      .map(([name, data]) => {
        const currentMax = Math.max(...data.weights);
        const previousMax = data.weights.length > 1 ? Math.max(...data.weights.slice(0, -1)) : currentMax;
        const trend = previousMax > 0 ? ((currentMax - previousMax) / previousMax) * 100 : 0;

        // Create chart data
        const chartData = data.dates.map((date, index) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: data.weights[index]
        }));

        return {
          name,
          currentMax,
          trend: Math.round(trend * 10) / 10,
          lastWorkout: new Date(data.lastWorkout).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          totalSets: data.totalSets,
          data: chartData
          // Remove projection and projections fields
        };
      })
      .sort((a, b) => b.totalSets - a.totalSets) // Sort by total sets (frequency)
      .slice(0, limit);

    return analytics;
  },

  async getExerciseDetailData(userId: string, exerciseName: string): Promise<ExerciseDetailData | null> {
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('date, exercises, duration')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error || !workouts) {
      console.error('Error fetching exercise detail data:', error);
      return null;
    }

    // Apply the same filtering as used in PreviousWorkoutList
    const completeWorkouts = filterCompleteWorkouts(workouts);

    const exerciseWorkouts: Array<{
      date: string;
      sets: any[];
    }> = [];

    completeWorkouts.forEach(workout => {
      if (workout.exercises?.exercises) {
        workout.exercises.exercises.forEach((exercise: any) => {
          if (exercise.name === exerciseName && exercise.sets) {
            exerciseWorkouts.push({
              date: workout.date,
              sets: exercise.sets
            });
          }
        });
      }
    });

    if (exerciseWorkouts.length === 0) {
      return null;
    }

    // Calculate stats
    let totalSets = 0;
    let totalVolume = 0;
    let allTimeMax = 0;
    const personalRecords: Array<{ date: string; weight: number; reps: number; }> = [];
    const strengthHistory: Array<{ date: string; weight: number; reps: number; }> = [];
    const volumeHistory: Array<{ date: string; volume: number; }> = [];

    exerciseWorkouts.forEach(workout => {
      const completedSets = workout.sets.filter((set: any) => set.completed && set.weight > 0);
      totalSets += completedSets.length;

      let workoutVolume = 0;
      let maxWeight = 0;
      let maxReps = 0;

      completedSets.forEach((set: any) => {
        workoutVolume += set.weight * set.reps;
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
          maxReps = set.reps;
        }
        if (set.weight > allTimeMax) {
          allTimeMax = set.weight;
          personalRecords.push({
            date: new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weight: set.weight,
            reps: set.reps
          });
        }
      });

      totalVolume += workoutVolume;

      if (maxWeight > 0) {
        strengthHistory.push({
          date: new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: maxWeight,
          reps: maxReps
        });
      }

      if (workoutVolume > 0) {
        volumeHistory.push({
          date: new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          volume: workoutVolume
        });
      }
    });

    return {
      name: exerciseName,
      currentMax: strengthHistory.length > 0 ? strengthHistory[strengthHistory.length - 1].weight : 0,
      allTimeMax,
      firstRecorded: exerciseWorkouts[0].date,
      totalWorkouts: exerciseWorkouts.length,
      totalSets,
      totalVolume,
      personalRecords: personalRecords.slice(-10), // Last 10 PRs
      volumeHistory,
      strengthHistory
      // Remove projections field
    };
  },

  async getWorkoutVolumeChart(userId: string, days: number = 30): Promise<Array<{date: string, volume: number, workouts: number}>> {
    const volumeData = await analyticsService.getVolumeData(userId, days);
    
    return volumeData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: item.totalVolume,
      workouts: item.workoutCount
    }));
  }
};