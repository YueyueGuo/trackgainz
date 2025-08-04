import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsService, ProgressStats } from '../../lib/analyticsService';

export const StatsCard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await analyticsService.getProgressStats(user.id);
        setStats(data);
      } catch (error) {
        console.error('Error fetching progress stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toLocaleString();
  };

  if (loading) {
    return (
      <div className="stats-card">
        <div className="loading">Loading stats...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stats-card">
        <div className="no-data">No workout data available</div>
      </div>
    );
  }

  return (
    <div className="stats-card">
      <h3>Progress Overview</h3>
      <div className="stats-grid">
        {/* Row 1: Streak Metrics */}
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.currentStreak}</div>
              <div className="stat-label">Current Streak</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-value">{stats.longestStreak}</div>
              <div className="stat-label">Longest Streak</div>
            </div>
          </div>
        </div>
        
        {/* Row 2: Workout Frequency */}
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-icon">💪</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalWorkouts}</div>
              <div className="stat-label">Total Workouts</div>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.averageWorkoutsPerWeek}</div>
              <div className="stat-label">Workouts/Week</div>
            </div>
          </div>
        </div>
        
        {/* Row 3: Volume Metrics */}
        <div className="stats-row-single">
          <div className="stat-item stat-item-wide">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <div className="stat-value">{formatVolume(stats.totalVolumeAllTime)} lbs</div>
              <div className="stat-label">Total Volume Lifted</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 