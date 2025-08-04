import React from 'react'

interface BottomNavProps {
  currentView: 'record' | 'workouts' | 'progress' | 'profile';
  onViewChange: (view: 'record' | 'workouts' | 'progress' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav-item ${currentView === 'record' ? 'active' : ''}`}
        onClick={() => onViewChange('record')}
      >
        <div className="nav-icon">📝</div>
        <span className="nav-label">RECORD</span>
      </button>
      
      <button
        className={`bottom-nav-item ${currentView === 'workouts' ? 'active' : ''}`}
        onClick={() => onViewChange('workouts')}
      >
        <div className="nav-icon">💪</div>
        <span className="nav-label">WORKOUTS</span>
      </button>
      
      <button
        className={`bottom-nav-item ${currentView === 'progress' ? 'active' : ''}`}
        onClick={() => onViewChange('progress')}
      >
        <div className="nav-icon">📊</div>
        <span className="nav-label">PROGRESS</span>
      </button>

      <button
        className={`bottom-nav-item ${currentView === 'profile' ? 'active' : ''}`}
        onClick={() => onViewChange('profile')}
      >
        <div className="nav-icon">👤</div>
        <span className="nav-label">PROFILE</span>
      </button>
    </nav>
  )
} 