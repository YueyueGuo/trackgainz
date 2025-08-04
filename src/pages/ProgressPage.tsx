import React from 'react';
import { ProgressChart } from '../components/Charts/ProgressChart';
import { VolumeChart } from '../components/Analytics/VolumeChart';
import { StatsCard } from '../components/Analytics/StatsCard';
import './ProgressPage.css';

export const ProgressPage: React.FC = () => {
  return (
    <div className="progress-page">
      <div className="progress-header">
        <h2>Progress Analytics</h2>
        <p>Track your training volume, consistency, and performance over time</p>
      </div>
      
      <div className="analytics-grid">
        <div className="analytics-section stats-section">
          <StatsCard />
        </div>
        
        <div className="analytics-section volume-section">
          <VolumeChart />
        </div>
        
        <div className="analytics-section progress-section">
          <div className="section-header">
            <h3>Exercise Progress</h3>
            <p>Track strength gains for individual exercises</p>
          </div>
          <ProgressChart />
        </div>
      </div>
    </div>
  );
};