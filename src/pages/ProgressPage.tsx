import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Trophy, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { progressAnalyticsService, EnhancedProgressStats, ExerciseAnalyticsData, ExerciseDetailData } from '../lib/progressAnalyticsService';
import ProgressStatCard from '../components/Progress/ProgressStatCard';
import ProgressChart from '../components/Progress/ProgressChart';
import ExerciseAnalyticsCard from '../components/Progress/ExerciseAnalyticsCard';
import ExerciseDetailModal from '../components/Progress/ExerciseDetailModal';

export const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EnhancedProgressStats | null>(null);
  const [exerciseAnalytics, setExerciseAnalytics] = useState<ExerciseAnalyticsData[]>([]);
  const [volumeData, setVolumeData] = useState<Array<{date: string, volume: number, workouts: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<ExerciseDetailData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const [statsData, exerciseData, volumeChartData] = await Promise.all([
          progressAnalyticsService.getEnhancedProgressStats(user.id),
          progressAnalyticsService.getExerciseAnalytics(user.id, 5),
          progressAnalyticsService.getWorkoutVolumeChart(user.id, 30)
        ]);

        setStats(statsData);
        setExerciseAnalytics(exerciseData);
        setVolumeData(volumeChartData);
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  const handleViewExerciseDetails = async (exerciseName: string) => {
    if (!user) return;
    
    try {
      const detailData = await progressAnalyticsService.getExerciseDetailData(user.id, exerciseName);
      if (detailData) {
        setSelectedExerciseDetail(detailData);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching exercise details:', error);
    }
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(0)}K`;
    }
    return volume.toLocaleString();
  };

  if (loading) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-background">
        {/* Modern background pattern matching RecordPage */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
          <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.400/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.600/.18),transparent_60%),linear-gradient(180deg,theme(colors.slate.950),theme(colors.slate.900))]" />
          <div className="animate-blob absolute -top-24 -left-16 h-64 w-64 rounded-full bg-brand-500/14 blur-3xl will-change-transform" />
          <div
            className="animate-blob absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-amber-400/14 blur-3xl will-change-transform"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <section className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col px-4 pt-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="bg-gradient-to-r from-brand-300 via-amber-300 to-brand-500 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent">
              Loading Progress...
            </h1>
          </motion.div>
        </section>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-background">
        {/* Modern background pattern */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
          <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.400/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.600/.18),transparent_60%),linear-gradient(180deg,theme(colors.slate.950),theme(colors.slate.900))]" />
          <div className="animate-blob absolute -top-24 -left-16 h-64 w-64 rounded-full bg-brand-500/14 blur-3xl will-change-transform" />
          <div
            className="animate-blob absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-amber-400/14 blur-3xl will-change-transform"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <section className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col px-4 pt-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="bg-gradient-to-r from-brand-300 via-amber-300 to-brand-500 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent">
              Progress Analytics
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">Complete some workouts to see your progress</p>
          </motion.div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* Modern background pattern matching RecordPage */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.400/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.600/.18),transparent_60%),linear-gradient(180deg,theme(colors.slate.950),theme(colors.slate.900))]" />
        <div className="animate-blob absolute -top-24 -left-16 h-64 w-64 rounded-full bg-brand-500/14 blur-3xl will-change-transform" />
        <div
          className="animate-blob absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-amber-400/14 blur-3xl will-change-transform"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <section className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col px-4 pt-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6"
        >
          <h1 className="bg-gradient-to-r from-brand-300 via-amber-300 to-brand-500 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent">
            Progress Analytics
          </h1>
          <p className="text-md text-zinc-600 dark:text-zinc-400">Track your journey and achievements</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <ProgressStatCard
            title="Current Streak"
            value={stats.currentStreak}
            subtitle="days"
            icon={TrendingUp}
            delay={0.1}
          />
          <ProgressStatCard
            title="Total Workouts"
            value={stats.totalWorkouts}
            subtitle="sessions"
            icon={Dumbbell}
            delay={0.15}
          />
          <ProgressStatCard
            title="Avg Time"
            value={`${stats.averageWorkoutTimeMinutes || 45}m`}
            subtitle="per session"
            icon={Clock}
            delay={0.2}
          />
          <ProgressStatCard
            title="Volume"
            value={formatVolume(stats.totalVolumeAllTime)}
            subtitle="lbs total"
            icon={Trophy}
            delay={0.25}
          />
        </div>

        {/* Weekly Progress 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className="mb-6 relative overflow-hidden rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-4 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />
          
          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-400" />
              <h3 className="text-base font-bold uppercase tracking-wide text-amber-50">This Week</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-brand-400">{stats.thisWeekWorkouts}</div>
                <div className="text-sm text-amber-100/80">workouts completed</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-50">{stats.thisMonthWorkouts}</div>
                <div className="text-xs text-amber-100/60">this month</div>
              </div>
            </div>
          </div>
        </motion.div>
        */}

        {/* Volume Chart */}
        {volumeData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
            className="mb-6"
          >
            <ProgressChart
              data={volumeData}
              title="30-Day Volume Trend"
              metric="volume"
            />
          </motion.div>
        )}

        {/* Exercise Analytics */}
        {exerciseAnalytics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            className="mb-6"
          >
            <ExerciseAnalyticsCard
              exercises={exerciseAnalytics}
              delay={0.4}
              onViewDetails={handleViewExerciseDetails}
            />
          </motion.div>
        )}

        {/* Motivational Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            🔥 <span className="font-semibold text-brand-400">{stats.currentStreak}-day streak</span> • 
            {stats.longestStreak > stats.currentStreak && (
              <span> Best: {stats.longestStreak} days • </span>
            )}
            <span className="font-semibold text-brand-400">{stats.totalWorkouts}</span> total workouts
          </p>
        </motion.div>
      </section>

      {/* Exercise Detail Modal */}
      {selectedExerciseDetail && (
        <ExerciseDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          exercise={selectedExerciseDetail}
        />
      )}
    </main>
  );
};